import { describe, it, expect } from 'vitest'
import {
  createMockBase,
  createFactory,
  createMockRepository,
  waitFor,
} from '../index'
import type { BaseEntity } from '@repo/core'

// ─── Test Entity ──────────────────────────────────────────────

interface TestEntity extends BaseEntity {
  name: string
  status: string
}

// ─── createMockBase ───────────────────────────────────────────

describe('createMockBase', () => {
  it('returns a base entity with all required fields', () => {
    const base = createMockBase()

    expect(base.id).toBeDefined()
    expect(base.id.length).toBeGreaterThan(0)
    expect(base.tenantId).toBe('test-tenant')
    expect(base.createdAt).toBeGreaterThan(0)
    expect(base.updatedAt).toBeGreaterThan(0)
    expect(base.deletedAt).toBeNull()
    expect(base.version).toBe(1)
    expect(base.createdBy).toBe('test-user')
    expect(base.updatedBy).toBe('test-user')
  })

  it('accepts overrides', () => {
    const base = createMockBase({
      tenantId: 'custom-tenant',
      version: 5,
      deletedAt: Date.now(),
    })

    expect(base.tenantId).toBe('custom-tenant')
    expect(base.version).toBe(5)
    expect(base.deletedAt).not.toBeNull()
  })

  it('generates unique IDs for each call', () => {
    const a = createMockBase()
    const b = createMockBase()
    expect(a.id).not.toBe(b.id)
  })

  it('uses current timestamp for createdAt/updatedAt by default', () => {
    const before = Date.now()
    const base = createMockBase()
    const after = Date.now()

    expect(base.createdAt).toBeGreaterThanOrEqual(before)
    expect(base.createdAt).toBeLessThanOrEqual(after)
  })
})

// ─── createFactory ────────────────────────────────────────────

describe('createFactory', () => {
  const testFactory = createFactory<TestEntity>(() => ({
    name: 'Default Name',
    status: 'active',
  }))

  it('returns an entity with base fields and defaults', () => {
    const entity = testFactory()

    expect(entity.id).toBeDefined()
    expect(entity.tenantId).toBe('test-tenant')
    expect(entity.name).toBe('Default Name')
    expect(entity.status).toBe('active')
    expect(entity.deletedAt).toBeNull()
  })

  it('allows overriding defaults', () => {
    const entity = testFactory({ name: 'Custom', status: 'inactive' })

    expect(entity.name).toBe('Custom')
    expect(entity.status).toBe('inactive')
  })

  it('allows overriding base fields', () => {
    const id = 'predefined-id'
    const entity = testFactory({ id } as Partial<TestEntity>)

    expect(entity.id).toBe(id)
  })

  it('generates unique IDs when no override', () => {
    const a = testFactory()
    const b = testFactory()
    expect(a.id).not.toBe(b.id)
  })
})

// ─── createMockRepository ─────────────────────────────────────

describe('createMockRepository', () => {
  it('creates entities', async () => {
    const repo = createMockRepository<TestEntity>()
    const entity = await repo.create({ name: 'Test', status: 'active' })

    expect(entity.id).toBeDefined()
    expect(entity.name).toBe('Test')
    expect(entity.status).toBe('active')
  })

  it('finds entities by id', async () => {
    const repo = createMockRepository<TestEntity>()
    const created = await repo.create({ name: 'FindMe' })
    const found = await repo.findById(created.id)

    expect(found).not.toBeNull()
    expect(found!.name).toBe('FindMe')
  })

  it('returns null for non-existent id', async () => {
    const repo = createMockRepository<TestEntity>()
    const found = await repo.findById('nonexistent')
    expect(found).toBeNull()
  })

  it('updates entities with version bump', async () => {
    const repo = createMockRepository<TestEntity>()
    const created = await repo.create({ name: 'Original' })
    const updated = await repo.update(created.id, { name: 'Updated', version: 1 })

    expect(updated.name).toBe('Updated')
    expect(updated.version).toBe(2)
  })

  it('throws on update of non-existent entity', async () => {
    const repo = createMockRepository<TestEntity>()
    await expect(repo.update('nonexistent', {})).rejects.toThrow('Not found')
  })

  it('soft-deletes entities', async () => {
    const repo = createMockRepository<TestEntity>()
    const created = await repo.create({ name: 'DeleteMe' })
    await repo.delete(created.id)

    const found = await repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.deletedAt).not.toBeNull()
  })

  it('does not return soft-deleted items in findMany', async () => {
    const repo = createMockRepository<TestEntity>()
    await repo.create({ name: 'Keep' })
    const toDelete = await repo.create({ name: 'Remove' })
    await repo.delete(toDelete.id)

    const result = await repo.findMany({ page: 1, pageSize: 10 })
    expect(result.items.length).toBe(1)
    expect(result.items[0].name).toBe('Keep')
  })

  it('supports pagination in findMany', async () => {
    const repo = createMockRepository<TestEntity>()
    for (let i = 0; i < 15; i++) {
      await repo.create({ name: `Item ${i}` })
    }

    const page1 = await repo.findMany({ page: 1, pageSize: 10 })
    expect(page1.items.length).toBe(10)
    expect(page1.totalPages).toBe(2)

    const page2 = await repo.findMany({ page: 2, pageSize: 10 })
    expect(page2.items.length).toBe(5)
  })

  it('counts entities', async () => {
    const repo = createMockRepository<TestEntity>()
    expect(await repo.count()).toBe(0)

    await repo.create({ name: 'A' })
    await repo.create({ name: 'B' })
    expect(await repo.count()).toBe(2)
  })

  it('delete on non-existent entity is a no-op', async () => {
    const repo = createMockRepository<TestEntity>()
    await expect(repo.delete('nonexistent')).resolves.toBeUndefined()
  })
})

// ─── waitFor ──────────────────────────────────────────────────

describe('waitFor', () => {
  it('resolves immediately when condition is already true', async () => {
    const start = Date.now()
    await waitFor(() => true)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(100) // should be near-immediate
  })

  it('waits until condition becomes true', async () => {
    let flag = false
    setTimeout(() => { flag = true }, 50)

    const start = Date.now()
    await waitFor(() => flag)
    const elapsed = Date.now() - start

    expect(elapsed).toBeGreaterThanOrEqual(40)
    expect(flag).toBe(true)
  })

  it('supports async condition', async () => {
    let flag = false
    setTimeout(() => { flag = true }, 50)

    await waitFor(async () => flag)
    expect(flag).toBe(true)
  })

  it('throws on timeout', async () => {
    await expect(waitFor(() => false, 100, 10)).rejects.toThrow('waitFor timed out')
  })

  it('uses default timeout and interval', async () => {
    let count = 0
    // Will be true after 3 intervals (300ms)
    const start = Date.now()
    await waitFor(() => {
      count++
      return count >= 3
    })
    expect(count).toBe(3)
  })
})
