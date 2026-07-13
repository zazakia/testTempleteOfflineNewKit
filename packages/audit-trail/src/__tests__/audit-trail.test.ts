import { describe, it, expect, beforeEach } from 'vitest'
import { getAuditStore, createAuditMiddleware, exportAuditTrail, gdprDeleteUser } from '../index'
import type { MiddlewareContext } from '@repo/core'

describe('Audit Trail System', () => {
  const store = getAuditStore()

  beforeEach(() => {
    // Reset/clear the in-memory audit store since it is a singleton
    ;(store as any).entries = []
    ;(store as any).lastHash = undefined
  })

  describe('append and query', () => {
    it('should append audit entries and compute SHA-256 hashes forming a chain', async () => {
      await store.append({
        id: 'entry-1',
        tenantId: 'tenant-a',
        entityType: 'customer',
        entityId: 'cust-1',
        action: 'create',
        performedBy: 'user-1',
        performedAt: 1000,
        newValues: { name: 'Alice' },
      })

      await store.append({
        id: 'entry-2',
        tenantId: 'tenant-a',
        entityType: 'customer',
        entityId: 'cust-1',
        action: 'update',
        performedBy: 'user-1',
        performedAt: 2000,
        previousValues: { name: 'Alice' },
        newValues: { name: 'Alicia' },
      })

      const entries = await store.query({ tenantId: 'tenant-a' })
      expect(entries).toHaveLength(2)

      // Query returns in descending order of performedAt (latest first)
      const latest = entries[0]
      const oldest = entries[1]
      expect(latest).toBeDefined()
      expect(oldest).toBeDefined()
      expect(latest!.id).toBe('entry-2')
      expect(oldest!.id).toBe('entry-1')

      // Verify hash chaining
      expect(oldest!.previousHash).toBeUndefined()
      expect(oldest!.hash).toBeDefined()
      expect(latest!.previousHash).toBe(oldest!.hash)
      expect(latest!.hash).toBeDefined()

      const verification = await store.verifyChain()
      expect(verification.valid).toBe(true)
    })

    it('should detect when the hash chain is broken or tampered with', async () => {
      await store.append({
        id: 'entry-1',
        tenantId: 'tenant-a',
        entityType: 'customer',
        entityId: 'cust-1',
        action: 'create',
        performedBy: 'user-1',
        performedAt: 1000,
      })

      await store.append({
        id: 'entry-2',
        tenantId: 'tenant-a',
        entityType: 'customer',
        entityId: 'cust-1',
        action: 'update',
        performedBy: 'user-1',
        performedAt: 2000,
      })

      const entries = await store.query({ tenantId: 'tenant-a' })
      expect(entries[1]).toBeDefined()
      // Tamper with the first entry's data
      entries[1]!.newValues = { tampered: true }

      const verification = await store.verifyChain()
      expect(verification.valid).toBe(false)
      // Since entries are traversed in order, it detects hash discrepancy at entry-1
      expect(verification.brokenAt).toBe('entry-1')
    })
  })

  describe('middleware integration', () => {
    it('should automatically append audit logs via middleware hooks', async () => {
      const middleware = createAuditMiddleware('customer')
      const context: MiddlewareContext = {
        tenantId: 'tenant-b',
        userId: 'user-2',
        timestamp: 5000,
        entityName: 'customer',
        operation: 'create',
      }

      // Test afterCreate hook
      await middleware.afterCreate!({ id: 'cust-10', name: 'Bob' } as any, context)
      // Test afterUpdate hook
      await middleware.afterUpdate!({ id: 'cust-10', name: 'Robert' } as any, context)
      // Test afterDelete hook
      await middleware.afterDelete!({ id: 'cust-10' } as any, context)

      const entries = await store.query({ tenantId: 'tenant-b' })
      expect(entries).toHaveLength(3)

      const deleteLog = entries.find(e => e.action === 'delete')
      const updateLog = entries.find(e => e.action === 'update')
      const createLog = entries.find(e => e.action === 'create')

      expect(deleteLog?.entityId).toBe('cust-10')
      expect(updateLog?.newValues?.name).toBe('Robert')
      expect(createLog?.newValues?.name).toBe('Bob')
      expect(createLog?.performedBy).toBe('user-2')
    })
  })

  describe('export and GDPR redact', () => {
    it('should export audit trail as a formatted JSON string', async () => {
      await store.append({
        id: 'entry-1',
        tenantId: 'tenant-c',
        entityType: 'customer',
        entityId: 'cust-20',
        action: 'create',
        performedBy: 'user-3',
        performedAt: 6000,
      })

      const jsonStr = await exportAuditTrail({ tenantId: 'tenant-c' })
      const exported = JSON.parse(jsonStr)
      expect(exported).toHaveLength(1)
      expect(exported[0].id).toBe('entry-1')
    })

    it('should redact and pseudonymize user records under GDPR request', async () => {
      await store.append({
        id: 'entry-1',
        tenantId: 'tenant-d',
        entityType: 'customer',
        entityId: 'cust-30',
        action: 'create',
        performedBy: 'user-to-redact',
        performedAt: 7000,
      })

      const count = await gdprDeleteUser('user-to-redact')
      expect(count).toBe(1)

      const entries = await store.query({ tenantId: 'tenant-d' })
      expect(entries[0]).toBeDefined()
      expect(entries[0]!.performedBy).toBe('REDACTED')
      expect(entries[0]!.metadata?.redacted).toBe(true)
    })
  })
})
