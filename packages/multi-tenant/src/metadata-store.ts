/**
 * ─── Tenant Metadata Store ────────────────────────────────────
 * Stores and retrieves per-tenant JSON/JSONB metadata.
 * Drives runtime customization: interest formulas, custom fields,
 * approval workflows, UI themes — without hardcoding.
 *
 * Data flow:
 *   TenantMetadataStore (this file)
 *     ↓ Dexie (IndexedDB) — always available offline
 *     ↓ Sync engine → Supabase — when online
 *
 * Usage:
 *   const store = new TenantMetadataStore(db)
 *   await store.set('tenant-1', { loan: { maxAmount: 500000 } })
 *   const maxAmount = await store.getField<number>('tenant-1', 'loan.maxAmount')
 */

import type { TenantMetadata } from '@repo/core'

// ─── Dependency Injection (decoupled from Dexie directly) ─────

export interface TenantMetadataRepository {
  get(tenantId: string): Promise<TenantMetadata | undefined>
  put(record: TenantMetadata): Promise<void>
}

// ─── Dot-Path Utilities ──────────────────────────────────────

/**
 * Get a deeply nested value from an object using dot notation.
 *   getByPath({ a: { b: 1 } }, 'a.b') → 1
 *   getByPath({ a: { b: 1 } }, 'a.c') → undefined
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: any = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return current
}

/**
 * Set a deeply nested value using dot notation.
 *   setByPath({}, 'a.b', 1) → { a: { b: 1 } }
 */
function setByPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const result: Record<string, unknown> = { ...obj }
  let current = result
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    const next = current[key]
    if (next == null || typeof next !== 'object' || Array.isArray(next)) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  const lastKey = keys[keys.length - 1]!
  current[lastKey] = value
  return result
}

// ─── Store ───────────────────────────────────────────────────

export class TenantMetadataStore {
  constructor(private repo: TenantMetadataRepository) {}

  /** Get full metadata blob for a tenant */
  async get(tenantId: string): Promise<Record<string, unknown>> {
    const record = await this.repo.get(tenantId)
    return record?.metadata ?? {}
  }

  /** Replace entire metadata blob (creates if not exists) */
  async set(tenantId: string, metadata: Record<string, unknown>): Promise<void> {
    const existing = await this.repo.get(tenantId)
    await this.repo.put({
      tenantId,
      metadata,
      version: (existing?.version ?? 0) + 1,
      updatedAt: Date.now(),
    })
  }

  /** Get a single field via dot notation */
  async getField<T = unknown>(tenantId: string, path: string): Promise<T | undefined> {
    const metadata = await this.get(tenantId)
    return getByPath(metadata, path) as T | undefined
  }

  /** Set a single field via dot notation (merges into existing) */
  async setField(tenantId: string, path: string, value: unknown): Promise<void> {
    const existing = await this.get(tenantId)
    const updated = setByPath(existing, path, value)
    await this.set(tenantId, updated)
  }

  /** Check if metadata exists for a tenant */
  async exists(tenantId: string): Promise<boolean> {
    const record = await this.repo.get(tenantId)
    return record != null
  }

  /** Delete all metadata for a tenant (dangerous — use with care) */
  async delete(tenantId: string): Promise<void> {
    const existing = await this.repo.get(tenantId)
    if (existing) {
      await this.repo.put({
        tenantId,
        metadata: {},
        version: existing.version + 1,
        updatedAt: Date.now(),
      })
    }
  }
}
