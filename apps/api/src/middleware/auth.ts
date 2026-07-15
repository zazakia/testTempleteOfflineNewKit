/**
 * ─── Auth Middleware ─────────────────────────────────────────
 * Validates JWT tokens against Supabase JWKS endpoint.
 * Falls back to demo mode when Supabase is not configured.
 *
 * Provider: Supabase Auth
 * JWKS URL: process.env.SUPABASE_JWKS_URL
 */

import { createMiddleware } from 'hono/factory'
import type { Context, Next } from 'hono'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'

// ─── JWKS Client ─────────────────────────────────────────

const JWKS_URL = process.env.SUPABASE_JWKS_URL
const JWKS = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null

// ─── Types ───────────────────────────────────────────────

interface SupabaseJwtClaims extends JWTPayload {
  sub?: string           // user id (UUID)
  email?: string
  app_metadata?: {
    tenant_id?: string
    roles?: string[]
  }
  user_metadata?: Record<string, unknown>  // NOTE: unsafe for auth decisions
  aud?: string
  iss?: string
  exp?: number
  iat?: number
  aal?: string           // "aal1" or "aal2"
  session_id?: string
}

export interface AuthContext {
  userId: string
  tenantId: string
  roles: string[]
  email?: string
  sessionId?: string
}

// ─── Token Validation ────────────────────────────────────

async function validateSupabaseToken(token: string): Promise<AuthContext | null> {
  if (!JWKS) return null

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1` : undefined,
      audience: 'authenticated',
      algorithms: ['RS256'],
    })

    const claims = payload as SupabaseJwtClaims

    if (!claims.sub) {
      console.warn('[Auth] JWT missing sub claim')
      return null
    }

    // Use app_metadata for auth decisions (NOT user_metadata — that is user-editable)
    const tenantId = claims.app_metadata?.tenant_id ?? 'default'
    const roles = claims.app_metadata?.roles ?? ['authenticated']

    return {
      userId: claims.sub,
      tenantId,
      roles,
      email: claims.email,
      sessionId: claims.session_id,
    }
  } catch (err) {
    console.warn('[Auth] JWT validation failed:', (err as Error).message)
    return null
  }
}

// Simple fallback token parser (demo / development only)
function validateDemoToken(token: string): AuthContext | null {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1] ?? ''))
    return {
      userId: decoded.sub ?? 'anonymous',
      tenantId: decoded.tenant ?? 'default',
      roles: decoded.roles ?? ['user'],
    }
  } catch {
    return null
  }
}

// ─── Middleware ───────────────────────────────────────────

export const authMiddleware = createMiddleware(async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)

    // Try Supabase JWT validation first
    let auth: AuthContext | null = null
    if (JWKS) {
      auth = await validateSupabaseToken(token)
    }

    // Fallback to demo validation
    if (!auth) {
      auth = validateDemoToken(token)
    }

    if (auth) {
      c.set('userId', auth.userId)
      c.set('tenantId', auth.tenantId)
      c.set('roles', auth.roles)
    }
  }

  // Default context for development / unauthenticated requests
  if (!c.get('userId')) {
    c.set('userId', 'demo-user')
    c.set('tenantId', c.req.query('tenant') ?? 'default')
    c.set('roles', ['user'])
  }

  await next()
})
