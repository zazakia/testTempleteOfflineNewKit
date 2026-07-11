/**
 * ─── Multi-Tenancy ───────────────────────────────────────────
 * Data isolation, tenant context, cross-tenant operations.
 * Every entity has tenantId. All queries auto-filter by tenant.
 */

import type { Middleware, MiddlewareContext, BaseEntity } from '@repo/core'
import { TenantMismatchError } from '@repo/core'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
  features: string[]
  settings: Record<string, unknown>
  createdAt: number
}

export interface TenantContext {
  tenantId: string
  tenant?: Tenant
  features?: string[]
}

/**
 * Create a tenant isolation middleware.
 * Ensures every query and mutation is scoped to the user's tenant.
 */
export function createTenantMiddleware(entityName: string): Middleware {
  return {
    name: `${entityName}-tenant`,

    beforeCreate: async (input: Record<string, unknown>, ctx: MiddlewareContext) => {
      input.tenantId = ctx.tenantId
      return input
    },

    beforeUpdate: async (_id: string, input: Record<string, unknown>, ctx: MiddlewareContext) => {
      // Prevent changing tenantId
      if (input.tenantId && input.tenantId !== ctx.tenantId) {
        throw new TenantMismatchError(entityName, _id, ctx.tenantId)
      }
      return input
    },

    beforeDelete: async (_id: string, ctx: MiddlewareContext) => {
      // Tenant check happens at repository level
    },

    beforeRead: async (_id: string, ctx: MiddlewareContext) => {
      // Tenant check happens at repository level
    },

    beforeQuery: async (query: Record<string, unknown>, ctx: MiddlewareContext) => {
      const filters = (query.filter as any[]) ?? []
      filters.push({ field: 'tenantId', operator: 'eq', value: ctx.tenantId })
      query.filter = filters
      return query
    },
  }
}

/**
 * Check if a user has access to a specific tenant.
 */
export function canAccessTenant(
  userTenantId: string,
  resourceTenantId: string,
  roles: string[],
): boolean {
  if (roles.includes('admin') || roles.includes('superadmin')) return true
  return userTenantId === resourceTenantId
}

/**
 * Get the tenant context from session/user.
 */
export function getTenantContext(userId: string, tenantId: string, roles: string[]): TenantContext {
  return {
    tenantId,
    features: roles.includes('enterprise') ? ['audit', 'export', 'bulk-ops'] : ['basic'],
  }
}

// ─── Metadata Store & Resolver ──────────────────────────────

export { TenantMetadataStore } from './metadata-store'
export type { TenantMetadataRepository } from './metadata-store'
export { MetadataResolver } from './metadata-resolver'
export type {
  InterestFormulaConfig,
  LoanLimitsConfig,
  SavingsConfig,
  CustomFieldDef,
  UIConfig,
  ApprovalStep,
  ApprovalWorkflow,
} from './metadata-resolver'
export {
  DEFAULT_INTEREST_FORMULAS,
  DEFAULT_LOAN_LIMITS,
  DEFAULT_SAVINGS_CONFIG,
  DEFAULT_UI_CONFIG,
  DEFAULT_APPROVAL_WORKFLOW,
} from './metadata-resolver'
