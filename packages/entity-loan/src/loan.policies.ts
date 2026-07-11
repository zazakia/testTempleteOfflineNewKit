/**
 * ─── Loan RBAC Policies ─────────────────────────────────────
 */

export interface PolicyContext {
  userId: string
  tenantId: string
  roles: string[]
  permissions: string[]
  resource?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export type PolicyAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'write_off' | 'disburse' | '*'

export interface PolicyRule {
  effect: 'allow' | 'deny'
  action: PolicyAction
  conditions?: (ctx: PolicyContext) => boolean
  priority?: number
}

export const LoanPolicies: PolicyRule[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin'), priority: 100 },
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('manager'), priority: 90 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('loan_encoder'), priority: 80 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.includes('loan_encoder') || ctx.roles.includes('collector'), priority: 80 },
  { effect: 'deny', action: 'delete', priority: 50 },
  { effect: 'deny', action: 'approve', priority: 50 },
  { effect: 'deny', action: 'write_off', priority: 50 },
]

export const LOAN_APPLICATION_POLICIES: PolicyRule[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin'), priority: 100 },
  { effect: 'allow', action: 'approve', conditions: (ctx) => ctx.roles.includes('manager') || ctx.roles.includes('credit_committee'), priority: 90 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.includes('loan_encoder') || ctx.roles.includes('manager'), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('loan_encoder'), priority: 80 },
  { effect: 'deny', action: 'delete', priority: 50 },
]
