import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../index'
import { serverStore } from '../db/store'

describe('Sync API Routes', () => {
  beforeEach(() => {
    // Clear/reset the serverStore in-memory data for clean tests
    ;(serverStore as any).entities = new Map()
    ;(serverStore as any).changeLog = []
  })

  describe('GET /sync/health', () => {
    it('should return health status', async () => {
      const res = await app.request('/sync/health')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.status).toBe('healthy')
    })
  })

  describe('POST /sync/push & GET /sync/pull', () => {
    it('should successfully push a new entity and then pull it back', async () => {
      // 1. Push a change
      const changePayload = {
        changes: [
          {
            id: 'change-push-1',
            entityType: 'customer',
            entityId: 'cust-abc',
            operation: 'create',
            data: { id: 'cust-abc', name: 'John Doe', version: 1 },
            timestamp: Date.now(),
            clientId: 'client-1',
            tenantId: 'default',
            performedBy: 'user-1',
            status: 'pending',
            retryCount: 0,
          },
        ],
      }

      const pushRes = await app.request('/sync/push?tenant=default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changePayload),
      })

      expect(pushRes.status).toBe(200)
      const pushJson = await pushRes.json()
      expect(pushJson.success).toBe(true)
      expect(pushJson.syncedCount).toBe(1)
      expect(pushJson.errors).toHaveLength(0)

      // Verify serverStore has the entity
      const savedEntity = serverStore.getEntity('cust-abc')
      expect(savedEntity).toBeDefined()
      expect(savedEntity!.data.name).toBe('John Doe')

      // 2. Pull changes
      const pullRes = await app.request('/sync/pull?tenant=default&since=0')
      expect(pullRes.status).toBe(200)
      const pullJson = await pullRes.json()
      expect(pullJson.changes).toHaveLength(1)
      expect(pullJson.changes[0].entityId).toBe('cust-abc')
      expect(pullJson.changes[0].data.name).toBe('John Doe')
    })

    it('should detect tenant mismatch on push and reject with error', async () => {
      const changePayload = {
        changes: [
          {
            id: 'change-push-2',
            entityType: 'customer',
            entityId: 'cust-def',
            operation: 'create',
            data: { id: 'cust-def', name: 'Wrong Tenant' },
            timestamp: Date.now(),
            clientId: 'client-1',
            tenantId: 'tenant-wrong', // doesn't match c.var.tenantId (default)
            performedBy: 'user-1',
            status: 'pending',
            retryCount: 0,
          },
        ],
      }

      const res = await app.request('/sync/push?tenant=default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changePayload),
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.syncedCount).toBe(0)
      expect(json.failedCount).toBe(1)
      expect(json.errors[0].error).toBe('Tenant mismatch')
    })
  })
})
