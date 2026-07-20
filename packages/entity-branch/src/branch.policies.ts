/**
 * ─── Branch Policies ─────────────────────────────────────────
 * Role-Based Access Control for branches.
 */

export interface PolicyContext {
  userId: string
  tenantId: string
  roles: string[]
  branchId?: string
}

export interface PolicyRule {
  effect: 'allow' | 'deny'
  action: string | string[]
  conditions?: (ctx: PolicyContext) => boolean
  priority: number
}

/**
 * Branch RBAC policies.
 *
 * Roles:
 *  - superadmin         — Full access to all branches
 *  - admin              — Full access within tenant
 *  - branch_manager     — Manage own branch only
 *  - encoder            — Read-only branch access
 *  - collector          — View assigned branch
 *  - member             — No branch management access
 */
export const BranchPolicies: PolicyRule[] = [
  {
    effect: 'allow',
    action: '*',
    conditions: (ctx) =>
      ctx.roles.includes('superadmin') || ctx.roles.includes('admin'),
    priority: 100,
  },
  {
    effect: 'allow',
    action: ['read', 'update'],
    conditions: (ctx) => ctx.roles.includes('branch_manager'),
    priority: 80,
  },
  {
    effect: 'allow',
    action: 'read',
    conditions: (ctx) =>
      ctx.roles.some((r) =>
        ['encoder', 'collector', 'accountant', 'cashier'].includes(r),
      ),
    priority: 60,
  },
  {
    effect: 'deny',
    action: ['create', 'delete'],
    conditions: (ctx) =>
      !ctx.roles.some((r) => ['superadmin', 'admin'].includes(r)),
    priority: 50,
  },
]

/**
 * Check if a user can perform an action on a branch.
 */
export function canManageBranch(
  action: string,
  ctx: PolicyContext,
): boolean {
  const applicablePolicies = BranchPolicies.filter(
    (p) =>
      p.action === '*' ||
      p.action === action ||
      (Array.isArray(p.action) && p.action.includes(action)),
  )

  // Sort by priority (highest first)
  applicablePolicies.sort((a, b) => b.priority - a.priority)

  for (const policy of applicablePolicies) {
    if (!policy.conditions || policy.conditions(ctx)) {
      return policy.effect === 'allow'
    }
  }

  // Default: deny
  return false
}
