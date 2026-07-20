/**
 * ─── Supabase Sync Engine ────────────────────────────────────
 * Connects the offline-first Dexie DB to Supabase PostgreSQL.
 * Push: reads Dexie change_log → POST /api/sync/push → Supabase
 * Pull: GET /api/sync/pull?since=&clientId= → applies to Dexie
 *
 * Supports: delta sync, client-aware pull (no self-replay),
 * real-time Supabase Realtime channel, proper Repository contracts.
 *
 * To enable: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { OfflineSyncEngine } from '@repo/sync-engine'
import type { SyncEngineConfig } from '@repo/sync-engine'
import { EntityRegistry } from '@repo/core'
import { getDatabase } from '@repo/db-dexie'
import type { Repository, BaseEntity, ChangeLogEntry, OffsetResult, CursorResult } from '@repo/core'

// ─── Supabase Client ───────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ─── Persistent Client ID ──────────────────────────────────

function getClientId(): string {
  try {
    const stored = localStorage.getItem('cooperp_client_id')
    if (stored) return stored
    const id = crypto.randomUUID()
    localStorage.setItem('cooperp_client_id', id)
    return id
  } catch {
    return 'web-client'
  }
}

// ─── Sync Engine ───────────────────────────────────────────

let syncEngine: OfflineSyncEngine | null = null
let realtimeChannel: RealtimeChannel | null = null

/**
 * Build a proper Repository<ChangeLogEntry & BaseEntity> backed by Dexie.
 * Satisfies the full Repository interface including OffsetResult shape.
 */
function buildChangeLogRepo(): Repository<ChangeLogEntry & BaseEntity> {
  const db = getDatabase()

  return {
    async findById(id: string): Promise<(ChangeLogEntry & BaseEntity) | null> {
      const row = await db.changeLog.get(id)
      if (!row) return null
      return row as unknown as ChangeLogEntry & BaseEntity
    },

    async findMany(query: any): Promise<OffsetResult<ChangeLogEntry & BaseEntity> | CursorResult<ChangeLogEntry & BaseEntity>> {
      const all = await db.changeLog.toArray() as unknown as (ChangeLogEntry & BaseEntity)[]

      // Apply filters
      let filtered = all
      if (query.filter) {
        for (const rule of query.filter) {
          if (rule.operator === 'eq') {
            filtered = filtered.filter((item: any) => item[rule.field] === rule.value)
          }
        }
      }

      // Apply sort
      if (query.sort) {
        for (const rule of query.sort) {
          filtered = [...filtered].sort((a: any, b: any) => {
            const aVal = a[rule.field]
            const bVal = b[rule.field]
            if (aVal == null && bVal == null) return 0
            if (aVal == null) return 1
            if (bVal == null) return -1
            return rule.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
          })
        }
      }

      const total = filtered.length

      // Paginate
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 50
      const offset = (page - 1) * pageSize
      const items = filtered.slice(offset, offset + pageSize)

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    },

    async create(input: any): Promise<ChangeLogEntry & BaseEntity> {
      await db.changeLog.add(input as any)
      return input as ChangeLogEntry & BaseEntity
    },

    async update(id: string, input: any): Promise<ChangeLogEntry & BaseEntity> {
      const existing = await db.changeLog.get(id)
      if (!existing) throw new Error(`ChangeLog entry ${id} not found`)
      const updated = { ...existing, ...input }
      await db.changeLog.put(updated as any)
      return updated as unknown as ChangeLogEntry & BaseEntity
    },

    async delete(id: string): Promise<void> {
      await db.changeLog.delete(id)
    },

    async count(query: any): Promise<number> {
      return db.changeLog.count()
    },
  }
}

/**
 * Build a proper Repository<T> backed by a Dexie table for any entity.
 */
function buildEntityRepo<T extends BaseEntity>(entityName: string): Repository<T> {
  const db = getDatabase()
  const table = db.table<T, string>(entityName)

  return {
    async findById(id: string): Promise<T | null> {
      const row = await table.get(id)
      return row ?? null
    },

    async findMany(query: any): Promise<OffsetResult<T> | CursorResult<T>> {
      const all = await table.toArray()

      // Apply filters
      let filtered = all
      if (query.filter) {
        for (const rule of query.filter) {
          if (rule.operator === 'eq') {
            filtered = filtered.filter((item: any) => item[rule.field] === rule.value)
          }
        }
      }

      // Apply search
      if (query.search) {
        const searchLower = query.search.toLowerCase()
        filtered = filtered.filter((item: any) =>
          (item.name && String(item.name).toLowerCase().includes(searchLower)) ||
          (item.email && String(item.email).toLowerCase().includes(searchLower))
        )
      }

      // Apply sort
      if (query.sort && query.sort.length > 0) {
        filtered = [...filtered].sort((a: any, b: any) => {
          for (const rule of query.sort) {
            const aVal = a[rule.field]
            const bVal = b[rule.field]
            if (aVal == null && bVal == null) continue
            if (aVal == null) return 1
            if (bVal == null) return -1
            if (aVal < bVal) return rule.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return rule.direction === 'asc' ? 1 : -1
          }
          return 0
        })
      }

      filtered = filtered.filter((item) => item.deletedAt === null)

      const total = filtered.length
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 50
      const offset = (page - 1) * pageSize
      const items = filtered.slice(offset, offset + pageSize)

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    },

    async create(input: any): Promise<T> {
      await table.add(input as any)
      return input as T
    },

    async update(id: string, input: any): Promise<T> {
      const existing = await table.get(id)
      if (!existing) throw new Error(`${entityName} ${id} not found`)
      const updated = { ...existing, ...input }
      await table.put(updated as any)
      return updated as T
    },

    async delete(id: string): Promise<void> {
      await table.delete(id)
    },

    async count(query: any): Promise<number> {
      return table.count()
    },
  }
}

// ─── Realtime Sync ─────────────────────────────────────────

/**
 * Subscribe to Supabase Realtime for instant sync when another
 * client pushes changes. This eliminates the polling delay.
 */
function startRealtimeSync(engine: OfflineSyncEngine): RealtimeChannel | null {
  if (!supabase) return null

  const clientId = getClientId()
  const channel = supabase
    .channel('sync-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'change_log',
      },
      (payload) => {
        const newRow = payload.new as Record<string, unknown> | null
        if (!newRow) return

        // Don't react to our own changes
        if (newRow.client_id === clientId) return

        console.log('[Realtime] Remote change detected, triggering pull...')
        // Trigger an immediate pull (non-blocking)
        engine.pull().catch((err) => {
          console.warn('[Realtime] Pull after notification failed:', err)
        })
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] Subscribed to sync changes channel')
      }
    })

  return channel
}

// ─── Start / Stop ──────────────────────────────────────────

/** Start the sync engine and realtime. Call once on app startup. */
export function startSyncEngine(): OfflineSyncEngine | null {
  if (syncEngine) return syncEngine
  if (!supabase) {
    console.warn('[Sync] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
    return null
  }

  const clientId = getClientId()

  const config: SyncEngineConfig = {
    apiBaseUrl: supabaseUrl!,
    pollIntervalMs: 30000,
    batchSize: 100,
    clientId,
    getAuthToken: async () => {
      const { data } = await supabase!.auth.getSession()
      return data.session?.access_token ?? null
    },
    getEntityDefinitions: () => EntityRegistry.getAll(),
    changeLogRepo: buildChangeLogRepo(),
    getRepository: (entityName: string) => buildEntityRepo(entityName),
  }

  syncEngine = new OfflineSyncEngine(config)
  console.log('[Sync] Engine started. Polling every 30s. Client ID:', clientId)

  // Start realtime (Gap 7)
  realtimeChannel = startRealtimeSync(syncEngine)

  return syncEngine
}

/** Stop the sync engine and realtime. */
export function stopSyncEngine(): void {
  if (realtimeChannel) {
    supabase?.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
  syncEngine?.destroy()
  syncEngine = null
}

/** Get current sync status */
export function getSyncStatus() {
  return syncEngine?.getStatus() ?? {
    online: navigator.onLine,
    pendingChanges: 0,
    lastSyncAt: null,
    lastPushAt: null,
    lastSyncStatus: 'success' as const,
    conflicts: 0,
    failedChanges: 0,
  }
}

/** Subscribe to sync status changes */
export function onSyncStatusChange(cb: (status: any) => void) {
  return syncEngine?.onStatusChange(cb)
}
