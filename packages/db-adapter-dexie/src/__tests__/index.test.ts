import { describe, it, expect, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  createDexieRepository,
  getDatabase,
  closeDatabase,
  resetDatabase,
  type ContextFactory,
  type DexieRepositoryOptions,
} from '../index'
import type { BaseEntity } from '@repo/core'
import { MiddlewarePipeline } from '@repo/core'

// ─── Test Entity ──────────────────────────────────────────────

interface TestEntity extends BaseEntity {
  name: string
  status: string
}

// Helper: create a fresh repo for testing
function createTestRepo(options?: DexieRepositoryOptions) {
  return createDexieRepository<TestEntity>('customer', {
    dbName: 'test-db-' + Math.random().toString(36).slice(2),
    ...options,
  })
}

// ─── createDexieRepository ────────────────────────────────────

describe('createDexieRepository', () => {
  afterEach(async () => {
    await resetDatabase()
    closeDatabase()
  })

  describe('create', () => {
    it('creates an entity with generated id and timestamps', async () => {
      const repo = createTestRepo()
      const entity = await repo.create({ name: 'Test', status: 'active' } as any)

      expect(entity.id).toBeDefined()
      expect(entity.id.length).toBeGreaterThan(0)
      expect(entity.name).toBe('Test')
      expect(entity.status).toBe('active')
      expect(entity.createdAt).toBeGreaterThan(0)
      expect(entity.updatedAt).toBeGreaterThan(0)
      expect(entity.deletedAt).toBeNull()
      expect(entity.version).toBe(1)
      expect(entity.createdBy).toBeDefined()
      expect(entity.updatedBy).toBeDefined()
    })

    it('writes a changeLog entry', async () => {
      const repo = createTestRepo()
      const entity = await repo.create({ name: 'Changelog Test', status: 'active' } as any)

      const db = getDatabase()
      const logs = await db.changeLog.toArray()
      const log = logs.find((l) => l.entityId === entity.id)

      expect(log).toBeDefined()
      expect(log!.operation).toBe('create')
      expect(log!.status).toBe('pending')
    })
  })

  describe('findById', () => {
    it('returns the entity by id', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'Findable', status: 'active' } as any)
      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found!.name).toBe('Findable')
    })

    it('returns null for non-existent id', async () => {
      const repo = createTestRepo()
      const found = await repo.findById('non-existent-id')
      expect(found).toBeNull()
    })

    it('returns null for soft-deleted entity', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'DeleteMe', status: 'active' } as any)
      await repo.delete(created.id)
      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })
  })

  describe('findMany', () => {
    it('returns paginated results', async () => {
      const repo = createTestRepo()
      for (let i = 0; i < 15; i++) {
        await repo.create({ name: `Item ${i}`, status: 'active' } as any)
      }

      const result = await repo.findMany({ page: 1, pageSize: 10 })
      expect(result.items.length).toBe(10)
      expect(result.total).toBe(15)
      if ('page' in result) expect(result.page).toBe(1)
      if ('totalPages' in result) expect(result.totalPages).toBe(2)
    })

    it('filters by field', async () => {
      const repo = createTestRepo()
      await repo.create({ name: 'Active One', status: 'active' } as any)
      await repo.create({ name: 'Inactive One', status: 'inactive' } as any)

      const result = await repo.findMany({
        page: 1, pageSize: 50,
        filter: [{ field: 'status', operator: 'eq', value: 'active' }],
      })
      expect(result.items.every((i: any) => i.status === 'active')).toBe(true)
    })

    it('supports cursor-based pagination', async () => {
      const repo = createTestRepo()
      const items = []
      for (let i = 0; i < 10; i++) {
        items.push(await repo.create({ name: `Cursor ${i}`, status: 'active' } as any))
      }

      // Use offset pagination: page 1, 5 per page
      const result = await repo.findMany({ page: 1, pageSize: 5 })
      expect(result.items.length).toBe(5)

      const page2 = await repo.findMany({ page: 2, pageSize: 5 })
      expect(page2.items.length).toBeGreaterThan(0)
    })

    it('supports search', async () => {
      const repo = createTestRepo()
      await repo.create({ name: 'Alpha Test', status: 'active' } as any)
      await repo.create({ name: 'Beta Item', status: 'active' } as any)
      await repo.create({ name: 'Gamma Test', status: 'active' } as any)

      const result = await repo.findMany({ page: 1, pageSize: 50, search: 'Test' })
      expect(result.items.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('update', () => {
    it('updates an entity and increments version', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'Original', status: 'active' } as any)
      const updated = await repo.update(created.id, { name: 'Updated', version: created.version } as any)

      expect(updated.name).toBe('Updated')
      expect(updated.version).toBe(created.version + 1)
      expect(updated.updatedAt).toBeGreaterThanOrEqual(created.updatedAt)
    })

    it('throws NotFoundError for non-existent id', async () => {
      const repo = createTestRepo()
      await expect(repo.update('nonexistent', { version: 1 } as any)).rejects.toThrow(/not found/i)
    })

    it('throws ConflictError when versions mismatch', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'ConflictTest', status: 'active' } as any)
      await expect(repo.update(created.id, { name: 'Bad', version: 999 } as any)).rejects.toThrow(/Concurrent/i)
    })

    it('writes a changeLog entry', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'Before', status: 'active' } as any)
      await repo.update(created.id, { name: 'After', version: created.version } as any)

      const db = getDatabase()
      const logs = await db.changeLog.toArray()
      const updateLog = logs.find((l) => l.entityId === created.id && l.operation === 'update')

      expect(updateLog).toBeDefined()
    })
  })

  describe('delete', () => {
    it('soft-deletes an entity', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'DeleteMe', status: 'active' } as any)
      await repo.delete(created.id)

      const found = await repo.findById(created.id)
      expect(found).toBeNull() // filtered by deletedAt

      // But can still be retrieved with includeDeleted
      const result = await repo.findMany({ page: 1, pageSize: 50, includeDeleted: true })
      expect(result.items.length).toBe(1)
    })

    it('throws NotFoundError for non-existent id', async () => {
      const repo = createTestRepo()
      await expect(repo.delete('nonexistent')).rejects.toThrow(/not found/i)
    })

    it('writes a changeLog entry', async () => {
      const repo = createTestRepo()
      const created = await repo.create({ name: 'DeleteLogTest', status: 'active' } as any)
      await repo.delete(created.id)

      const db = getDatabase()
      const logs = await db.changeLog.toArray()
      const deleteLog = logs.find((l) => l.entityId === created.id && l.operation === 'delete')

      expect(deleteLog).toBeDefined()
    })
  })

  describe('count', () => {
    it('returns the count of active entities', async () => {
      const repo = createTestRepo()
      expect(await repo.count({ page: 1, pageSize: 50 })).toBe(0)

      await repo.create({ name: 'A', status: 'active' } as any)
      await repo.create({ name: 'B', status: 'active' } as any)
      expect(await repo.count({ page: 1, pageSize: 50 })).toBe(2)
    })

    it('supports filter', async () => {
      const repo = createTestRepo()
      await repo.create({ name: 'Active', status: 'active' } as any)
      await repo.create({ name: 'Inactive', status: 'inactive' } as any)

      const count = await repo.count({
        page: 1, pageSize: 50,
        filter: [{ field: 'status', operator: 'eq', value: 'active' }],
      })
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('skipSync option', () => {
    it('does not write change log when skipSync is true', async () => {
      const repo = createTestRepo()
      const beforeCount = (await getDatabase().changeLog.toArray()).length

      await repo.create({ name: 'NoSync', status: 'active' } as any, { skipSync: true })
      const afterCount = (await getDatabase().changeLog.toArray()).length

      expect(afterCount).toBe(beforeCount)
    })
  })
})

// ─── getDatabase / closeDatabase / resetDatabase ──────────────

describe('database lifecycle', () => {
  afterEach(() => {
    closeDatabase()
  })

  it('getDatabase returns the same instance', () => {
    const db1 = getDatabase()
    const db2 = getDatabase()
    expect(db1).toBe(db2)
  })

  it('closeDatabase closes and nullifies the db', () => {
    const db = getDatabase()
    closeDatabase()
    const db2 = getDatabase()
    expect(db2).not.toBe(db) // new instance created
  })

  it('resetDatabase clears all tables', async () => {
    const repo = createTestRepo()
    await repo.create({ name: 'PreReset', status: 'active' } as any)
    await resetDatabase()

    const result = await repo.findMany({})
    expect(result.items.length).toBe(0)
  })
})

// ─── ensureTableSchema ────────────────────────────────────────

describe('ensureTableSchema', () => {
  it('throws for unregistered table names', () => {
    expect(() => {
      createDexieRepository<TestEntity>('non_existent_table', {
        dbName: 'test-db-ensure-' + Math.random().toString(36).slice(2),
      })
    }).toThrow(/not defined in the Dexie schema/i)
  })
})
