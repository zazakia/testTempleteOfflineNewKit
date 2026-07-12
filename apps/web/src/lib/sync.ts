/**
 * ─── Supabase Sync Engine ────────────────────────────────────
 * Connects the offline-first Dexie DB to Supabase PostgreSQL.
 * Push: reads Dexie change_log → POST /api/sync/push → Supabase
 * Pull: GET /api/sync/pull?since= → applies to Dexie
 *
 * Auto-starts when online. Handles retry, conflict resolution.
 *
 * To enable: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { createClient } from '@supabase/supabase-js'
import { OfflineSyncEngine } from '@repo/sync-engine'
import type { SyncEngineConfig } from '@repo/sync-engine'
import { EntityRegistry } from '@repo/core'
import { getDatabase } from '@repo/db-dexie'
import type { Repository, BaseEntity, ChangeLogEntry } from '@repo/core'

// ─── Supabase Client ───────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ─── Sync Engine ───────────────────────────────────────────

let syncEngine: OfflineSyncEngine | null = null

/** Start the sync engine. Call once on app startup. */
export function startSyncEngine(): OfflineSyncEngine | null {
  if (syncEngine) return syncEngine
  if (!supabase) {
    console.warn('[Sync] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
    // Return a stub that logs but doesn't sync
    return null
  }

  const db = getDatabase()
  const changeLogRepo: Repository<ChangeLogEntry & BaseEntity> = {
    findById: (id: string) => db.changeLog.get(id) as any,
    findMany: (query: any) => db.changeLog.toArray().then(items => ({ items, total: items.length })),
    create: (input: any) => db.changeLog.add(input as any).then(() => input as any),
    update: (id: string, input: any) => db.changeLog.update(id, input as any).then(() => input as any),
    delete: (id: string) => db.changeLog.delete(id).then(() => {}),
    count: (query: any) => db.changeLog.count(),
  }

  const config: SyncEngineConfig = {
    apiBaseUrl: supabaseUrl!,
    pollIntervalMs: 30000,
    batchSize: 100,
    getAuthToken: async () => {
      const { data } = await supabase!.auth.getSession()
      return data.session?.access_token ?? null
    },
    getEntityDefinitions: () => EntityRegistry.getAll(),
    changeLogRepo,
    getRepository: (entityName: string) => {
      const table = db.table(entityName)
      return {
        findById: (id: string) => table.get(id) as any,
        findMany: (query: any) => table.toArray().then(items => ({ items, total: items.length })),
        create: (input: any) => table.add(input as any).then(() => input as any),
        update: (id: string, input: any) => table.update(id, input as any).then(() => input as any),
        delete: (id: string) => table.delete(id).then(() => {}),
        count: (query: any) => table.count(),
      }
    },
  }

  syncEngine = new OfflineSyncEngine(config)
  console.log('[Sync] Engine started. Polling every 30s.')
  return syncEngine
}

/** Get current sync status */
export function getSyncStatus() {
  return syncEngine?.getStatus() ?? {
    online: navigator.onLine,
    pendingChanges: 0, lastSyncAt: null, lastSyncStatus: 'success' as const,
    conflicts: 0, failedChanges: 0,
  }
}

/** Subscribe to sync status changes */
export function onSyncStatusChange(cb: (status: any) => void) {
  return syncEngine?.onStatusChange(cb)
}
