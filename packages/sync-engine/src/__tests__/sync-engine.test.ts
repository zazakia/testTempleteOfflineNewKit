import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { OfflineSyncEngine } from '../sync-engine'
import type { ChangeLogEntry, BaseEntity, Repository, EntityDefinition } from '@repo/core'

// ─── Setup Browser/Fetch Mocks in Node Environment ─────────────────────

const originalNavigator = globalThis.navigator
const originalWindow = globalThis.window
const originalFetch = globalThis.fetch

class MockRepository implements Repository<any> {
  public items: any[] = []

  async findById(id: string): Promise<any | null> {
    return this.items.find((item) => item.id === id) || null
  }

  async findMany(query: any): Promise<any> {
    let result = [...this.items]
    if (query.filter) {
      for (const filter of query.filter) {
        if (filter.field === 'status') {
          result = result.filter((item) => item.status === filter.value)
        }
      }
    }
    return { items: result, total: result.length }
  }

  async create(input: any): Promise<any> {
    const item = { id: input.id || `mock-${Date.now()}`, version: 1, ...input }
    this.items.push(item)
    return item
  }

  async update(id: string, input: any): Promise<any> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('Not found')
    this.items[index] = { ...this.items[index], ...input, version: (this.items[index].version || 1) + 1 }
    return this.items[index]
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
  }

  async count(query: any): Promise<number> {
    let result = [...this.items]
    if (query && query.filter) {
      for (const filter of query.filter) {
        if (filter.field === 'status') {
          result = result.filter((item) => item.status === filter.value)
        }
      }
    }
    return result.length
  }
}

describe('OfflineSyncEngine', () => {
  let changeLogRepo: MockRepository
  let customerRepo: MockRepository
  let mockFetch: any
  let engine: OfflineSyncEngine
  let entityDefinitions: EntityDefinition[]

  beforeEach(() => {
    // Mock navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      writable: true,
      configurable: true,
    })

    // Mock window
    Object.defineProperty(globalThis, 'window', {
      value: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    })

    // Mock fetch
    mockFetch = vi.fn()
    globalThis.fetch = mockFetch

    changeLogRepo = new MockRepository()
    customerRepo = new MockRepository()

    entityDefinitions = [
      {
        name: 'customer',
        primaryKey: 'id',
        fields: [],
        sync: {
          enabled: true,
          conflictStrategy: 'lww',
        },
      },
    ] as unknown as EntityDefinition[]

    engine = new OfflineSyncEngine({
      apiBaseUrl: 'http://localhost:3001',
      pollIntervalMs: 60000,
      getEntityDefinitions: () => entityDefinitions,
      changeLogRepo: changeLogRepo as any,
      getRepository: (name) => {
        if (name === 'customer') return customerRepo as any
        throw new Error(`Repo not found: ${name}`)
      },
    })
  })

  afterEach(() => {
    if (engine) {
      engine.destroy()
    }
  })

  describe('Initialization and status', () => {
    it('should initialize with correct online status and defaults', () => {
      const status = engine.getStatus()
      expect(status.online).toBe(true)
      expect(status.pendingChanges).toBe(0)
      expect(status.lastSyncStatus).toBe('success')
    })
  })

  describe('push', () => {
    it('should return successfully with no pending changes', async () => {
      const result = await engine.push()
      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(0)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should push pending change log entries and mark them synced', async () => {
      // Setup: a pending change
      const change: Partial<ChangeLogEntry & BaseEntity> = {
        id: 'change-1',
        entityType: 'customer',
        entityId: 'cust-1',
        operation: 'create',
        status: 'pending',
        timestamp: Date.now(),
        data: { name: 'Alice' },
      }
      await changeLogRepo.create(change)

      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          syncedCount: 1,
          failedCount: 0,
          conflicts: [],
          errors: [],
        }),
      })

      const result = await engine.push()
      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(1)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      const updatedChange = await changeLogRepo.findById('change-1')
      expect(updatedChange.status).toBe('synced')

      const status = engine.getStatus()
      expect(status.pendingChanges).toBe(0)
    })

    it('should handle push error list and move to failed status', async () => {
      const change: Partial<ChangeLogEntry & BaseEntity> = {
        id: 'change-2',
        entityType: 'customer',
        entityId: 'cust-2',
        operation: 'create',
        status: 'pending',
        timestamp: Date.now(),
        retryCount: 0,
        data: { name: 'Bob' },
      }
      await changeLogRepo.create(change)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          syncedCount: 0,
          failedCount: 1,
          conflicts: [],
          errors: [{ id: 'change-2', error: 'Database constraint failed' }],
        }),
      })

      const result = await engine.push()
      expect(result.success).toBe(true)
      expect(result.syncedCount).toBe(0)
      expect(result.failedCount).toBe(1)

      const updatedChange = await changeLogRepo.findById('change-2')
      expect(updatedChange.status).toBe('failed')
      expect(updatedChange.errorMessage).toBe('Database constraint failed')
      expect(updatedChange.retryCount).toBe(1)
    })
  })

  describe('pull', () => {
    it('should pull remote changes and apply them locally', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          changes: [
            {
              id: 'server-change-1',
              entityType: 'customer',
              entityId: 'cust-3',
              operation: 'create',
              timestamp: Date.now(),
              data: { id: 'cust-3', name: 'Charlie', updatedAt: Date.now() },
            },
          ],
          serverTime: 1234567890,
        }),
      })

      const result = await engine.pull()
      expect(result.success).toBe(true)
      expect(result.changesReceived).toBe(1)
      expect(result.changesApplied).toBe(1)

      const localCust = await customerRepo.findById('cust-3')
      expect(localCust).toBeDefined()
      expect(localCust.name).toBe('Charlie')

      const status = engine.getStatus()
      expect(status.lastSyncAt).toBe(1234567890)
    })

    it('should resolve conflict using last-write-wins', async () => {
      // Local exists, version = 1
      await customerRepo.create({ id: 'cust-4', name: 'Local Dave', updatedAt: 1000 })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          changes: [
            {
              id: 'server-change-2',
              entityType: 'customer',
              entityId: 'cust-4',
              operation: 'update',
              timestamp: 2000,
              data: { id: 'cust-4', name: 'Server Dave', version: 2, updatedAt: 2000 },
            },
          ],
          serverTime: 1234567890,
        }),
      })

      const result = await engine.pull()
      expect(result.success).toBe(true)
      expect(result.changesApplied).toBe(1)

      const localCust = await customerRepo.findById('cust-4')
      expect(localCust.name).toBe('Server Dave')
    })
  })
})
