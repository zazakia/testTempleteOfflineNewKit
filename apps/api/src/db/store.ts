/**
 * ─── Server-Side Data Store ─────────────────────────────────
 * Uses Supabase PostgreSQL when configured, falls back to in-memory.
 */

import type { ChangeLogEntry, EntityId, TimestampMillis } from '@repo/core'
import { supabaseAdmin, isSupabaseConfigured } from './supabase'

export interface ServerEntity {
  id: string
  tenantId: string
  type: string
  data: Record<string, unknown>
  version: number
  createdAt: TimestampMillis
  updatedAt: TimestampMillis
  deletedAt: TimestampMillis | null
}

// ─── In-Memory Fallback ──────────────────────────────────

class InMemoryStore {
  private entities = new Map<string, ServerEntity>()
  private changeLog: ChangeLogEntry[] = []

  upsertEntity(type: string, data: Record<string, unknown>, tenantId: string): ServerEntity {
    const id = data.id as string
    const existing = this.entities.get(id)

    const now = Date.now()
    const entity: ServerEntity = existing ?? {
      id,
      tenantId,
      type,
      data: {},
      version: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }

    entity.data = { ...entity.data, ...data }
    entity.version++
    entity.updatedAt = now
    if (data.deletedAt) {
      entity.deletedAt = data.deletedAt as number
    }
    this.entities.set(id, entity)
    return entity
  }

  getEntity(id: string): ServerEntity | undefined {
    return this.entities.get(id)
  }

  getChangesSince(since: TimestampMillis, tenantId: string): ChangeLogEntry[] {
    return this.changeLog
      .filter((c) => c.timestamp > since && c.tenantId === tenantId)
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  appendChangeLog(entry: ChangeLogEntry): void {
    this.changeLog.push(entry)
    if (this.changeLog.length > 10000) {
      this.changeLog.splice(0, this.changeLog.length - 10000)
    }
  }

  getServerTime(): TimestampMillis {
    return Date.now()
  }

  getHealth() {
    return {
      backend: 'in-memory',
      status: 'healthy',
      entities: this.entities.size,
      changeLogEntries: this.changeLog.length,
      uptime: process.uptime(),
    }
  }
}

// ─── Supabase-Backed Store ───────────────────────────────

class SupabaseStore {
  async upsertEntity(
    type: string,
    data: Record<string, unknown>,
    tenantId: string,
  ): Promise<ServerEntity> {
    const id = data.id as string
    const now = Date.now()

    // Try to find existing
    const { data: existing } = await supabaseAdmin!
      .from('sync_entities')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    const entity = {
      id,
      tenant_id: tenantId,
      entity_type: type,
      data: { ...(existing?.data ?? {}), ...data },
      version: (existing?.version ?? 0) + 1,
      created_at: existing?.created_at ?? new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
      deleted_at: data.deletedAt ? new Date(data.deletedAt as number).toISOString() : null,
    }

    const { error } = await supabaseAdmin!
      .from('sync_entities')
      .upsert(entity, { onConflict: 'id' })

    if (error) {
      console.error('[SupabaseStore] upsert failed:', error.message)
      throw error
    }

    return {
      id: entity.id,
      tenantId: entity.tenant_id,
      type: entity.entity_type,
      data: entity.data as Record<string, unknown>,
      version: entity.version,
      createdAt: new Date(entity.created_at).getTime(),
      updatedAt: now,
      deletedAt: entity.deleted_at ? new Date(entity.deleted_at).getTime() : null,
    }
  }

  async getEntity(id: string): Promise<ServerEntity | undefined> {
    const { data, error } = await supabaseAdmin!
      .from('sync_entities')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error || !data) return undefined

    return {
      id: data.id,
      tenantId: data.tenant_id,
      type: data.entity_type,
      data: data.data as Record<string, unknown>,
      version: data.version,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      deletedAt: data.deleted_at ? new Date(data.deleted_at).getTime() : null,
    }
  }

  async getChangesSince(
    since: TimestampMillis,
    tenantId: string,
  ): Promise<ChangeLogEntry[]> {
    const { data, error } = await supabaseAdmin!
      .from('change_log')
      .select('*')
      .eq('tenant_id', tenantId)
      .gt('timestamp', new Date(since).toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('[SupabaseStore] getChangesSince failed:', error.message)
      return []
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      data: row.data,
      previousData: row.previous_data,
      timestamp: new Date(row.timestamp).getTime(),
      clientId: row.client_id,
      performedBy: row.performed_by,
      status: row.status ?? 'synced',
      retryCount: row.retry_count ?? 0,
    }))
  }

  async appendChangeLog(entry: ChangeLogEntry): Promise<void> {
    const { error } = await supabaseAdmin!.from('change_log').insert({
      id: entry.id,
      tenant_id: entry.tenantId,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      operation: entry.operation,
      data: entry.data,
      previous_data: entry.previousData ?? null,
      timestamp: new Date(entry.timestamp).toISOString(),
      client_id: entry.clientId,
      performed_by: entry.performedBy,
      status: 'synced',
    })

    if (error) {
      console.error('[SupabaseStore] appendChangeLog failed:', error.message)
    }
  }

  getServerTime(): TimestampMillis {
    return Date.now()
  }

  async getHealth() {
    try {
      const { count } = await supabaseAdmin!
        .from('sync_entities')
        .select('*', { count: 'exact', head: true })

      return {
        backend: 'supabase',
        status: 'healthy',
        entities: count ?? 0,
        uptime: process.uptime(),
      }
    } catch (err) {
      return {
        backend: 'supabase',
        status: 'degraded',
        error: String(err),
        uptime: process.uptime(),
      }
    }
  }
}

// ─── Unified Store ───────────────────────────────────────

const inMemory = new InMemoryStore()
const supabaseStore = isSupabaseConfigured() ? new SupabaseStore() : null

export const serverStore = {
  async upsertEntity(
    type: string,
    data: Record<string, unknown>,
    tenantId: string,
  ): Promise<ServerEntity> {
    if (supabaseStore) return supabaseStore.upsertEntity(type, data, tenantId)
    return inMemory.upsertEntity(type, data, tenantId)
  },

  async getEntity(id: string): Promise<ServerEntity | undefined> {
    if (supabaseStore) return supabaseStore.getEntity(id)
    return inMemory.getEntity(id)
  },

  async getChangesSince(
    since: TimestampMillis,
    tenantId: string,
  ): Promise<ChangeLogEntry[]> {
    if (supabaseStore) return supabaseStore.getChangesSince(since, tenantId)
    return inMemory.getChangesSince(since, tenantId)
  },

  async appendChangeLog(entry: ChangeLogEntry): Promise<void> {
    if (supabaseStore) return supabaseStore.appendChangeLog(entry)
    return inMemory.appendChangeLog(entry)
  },

  getServerTime(): TimestampMillis {
    return Date.now()
  },

  async getHealth() {
    if (supabaseStore) return supabaseStore.getHealth()
    return inMemory.getHealth()
  },

  /** Whether Supabase is the active backend */
  isSupabaseBacked(): boolean {
    return supabaseStore !== null
  },
}

// Also export the standalone stores for direct access
export { inMemory as inMemoryStore, supabaseStore }
