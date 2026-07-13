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

/**
 * Evaluate policies for a given action and context.
 */
export function evaluatePolicies(
  action: PolicyAction,
  context: PolicyContext,
  policies: PolicyRule[] = LoanPolicies,
): { allowed: boolean; reason?: string } {
  // Sort by priority (highest first)
  const sorted = [...policies].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  for (const policy of sorted) {
    // Skip policies that don't apply to this action
    if (policy.action !== '*' && policy.action !== action) continue

    // Check conditions
    const conditionsMet = policy.conditions ? policy.conditions(context) : true

    if (conditionsMet) {
      if (policy.effect === 'deny') {
        return { allowed: false, reason: `${action} on loan/application is denied` }
      }
      return { allowed: true }
    }
  }

  // Default deny
  return { allowed: false, reason: `No policy allows ${action} on loan/application` }
}
