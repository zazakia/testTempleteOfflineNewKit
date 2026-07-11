/**
 * ─── Member RBAC Policies ───────────────────────────────────
 * Permission rules for Member operations.
 */

export interface PolicyContext {
  userId: string
  tenantId: string
  roles: string[]
  permissions: string[]
  resource?: { createdBy?: string; membershipType?: string }
  metadata?: Record<string, unknown>
}

export type PolicyAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'bulk_import' | 'approve' | 'terminate' | '*'

export interface PolicyRule {
  effect: 'allow' | 'deny'
  action: PolicyAction
  conditions?: (ctx: PolicyContext) => boolean
  priority?: number
}

export const MemberPolicies: PolicyRule[] = [
  // Admins can do everything
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin'), priority: 100 },
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('manager'), priority: 90 },

  // Officers can manage members
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('officer'), priority: 80 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.includes('officer'), priority: 80 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.includes('officer'), priority: 80 },

  // Encoders can create and read
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('encoder'), priority: 70 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.includes('encoder'), priority: 70 },

  // Only admins/managers can delete, approve, terminate
  { effect: 'deny', action: 'delete', priority: 50 },
  { effect: 'deny', action: 'approve', priority: 50 },
  { effect: 'deny', action: 'terminate', priority: 50 },
  { effect: 'deny', action: 'bulk_import', priority: 50 },
]

/**
 * Evaluate policies for a given action and context.
 */
export function evaluatePolicies(
  action: PolicyAction,
  context: PolicyContext,
  policies: PolicyRule[] = MemberPolicies,
): { allowed: boolean; reason?: string } {
  const sorted = [...policies].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  for (const policy of sorted) {
    if (policy.action !== '*' && policy.action !== action) continue
    const conditionsMet = policy.conditions ? policy.conditions(context) : true
    if (conditionsMet) {
      if (policy.effect === 'deny') {
        return { allowed: false, reason: `${action} on member is denied` }
      }
      return { allowed: true }
    }
  }

  return { allowed: false, reason: `No policy allows ${action} on member` }
}
