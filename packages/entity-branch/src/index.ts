/**
 * ─── Entity Branch — Barrel Export ──────────────────────────
 * Multi-branch management for cooperatives.
 *
 * Importing this module automatically:
 *  1. Registers Branch entity with the Entity Registry
 *  2. Adds "Branches" to the sidebar nav under "Administration"
 *  3. Enables sync, audit, and RBAC for the branches table
 */

// Self-register entity (runs on import)
export { BranchEntity } from './branch.entity'

// Types
export type { Branch, BranchStatus } from './branch.schema'

// Schemas
export {
  CreateBranchSchema,
  UpdateBranchSchema,
  BranchQuerySchema,
  BranchStatusSchema,
  BRANCH_STATUS_LABELS,
  BRANCH_STATUS_COLORS,
} from './branch.schema'

// Business logic
export { BranchService } from './branch.service'
export type { BranchValidationResult } from './branch.service'

// RBAC
export { BranchPolicies, canManageBranch } from './branch.policies'
export type { PolicyContext, PolicyRule } from './branch.policies'

// Hooks
export { BranchHooks } from './branch.hooks'
