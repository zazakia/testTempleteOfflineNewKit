import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

describe('Auth Middleware', () => {
  it('should set default credentials when no auth header is present', async () => {
    const app = new Hono()
    app.use('*', authMiddleware)
    app.get('/test', (c) => {
      return c.json({
        userId: c.get('userId'),
        tenantId: c.get('tenantId'),
        roles: c.get('roles'),
      })
    })

    const res = await app.request('/test?tenant=tenant-xyz')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.userId).toBe('demo-user')
    expect(json.tenantId).toBe('tenant-xyz')
    expect(json.roles).toContain('user')
  })

  it('should parse valid JWT token from Authorization header', async () => {
    const app = new Hono()
    app.use('*', authMiddleware)
    app.get('/test', (c) => {
      return c.json({
        userId: c.get('userId'),
        tenantId: c.get('tenantId'),
        roles: c.get('roles'),
      })
    })

    // Construct a simple mock JWT token: header.payload.signature
    // We only care about payload (atob decoding).
    const payloadObj = {
      sub: 'user-789',
      tenant: 'tenant-custom',
      roles: ['admin', 'manager'],
    }
    const payloadBase64 = btoa(JSON.stringify(payloadObj))
    const mockToken = `header.${payloadBase64}.signature`

    const res = await app.request('/test', {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.userId).toBe('user-789')
    expect(json.tenantId).toBe('tenant-custom')
    expect(json.roles).toContain('admin')
    expect(json.roles).toContain('manager')
  })

  it('should fall back to defaults if token is malformed', async () => {
    const app = new Hono()
    app.use('*', authMiddleware)
    app.get('/test', (c) => {
      return c.json({
        userId: c.get('userId'),
      })
    })

    const res = await app.request('/test', {
      headers: {
        Authorization: 'Bearer invalidtokenhere',
      },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.userId).toBe('demo-user')
  })
})
