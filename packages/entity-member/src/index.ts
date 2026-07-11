/**
 * ─── @repo/entity-member — Barrel Export ─────────────────────
 * Philippine Cooperative Member Management.
 *
 * Import to register:
 *   import '@repo/entity-member'
 */

// Self-registers on import
export { MemberEntity } from './member.entity'

// Types
export type { Member, MemberDependent, MembershipStatus, MembershipType, CivilStatus, Gender, EducationLevel } from './member.schema'

// Schemas
export {
  CreateMemberSchema,
  UpdateMemberSchema,
  MemberQuerySchema,
  CreateDependentSchema,
  MembershipStatusSchema,
  MembershipTypeSchema,
  CivilStatusSchema,
  GenderSchema,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_COLORS,
  MEMBERSHIP_TYPE_LABELS,
  CIVIL_STATUS_LABELS,
} from './member.schema'

// Service
export { MemberService } from './member.service'

// Policies
export { MemberPolicies, evaluatePolicies } from './member.policies'
export type { PolicyAction, PolicyContext, PolicyRule } from './member.policies'

// Hooks
export { MemberHooks } from './member.hooks'

// UI Config
export { MemberUIConfig } from './member.ui'
export type { ColumnDef, FormFieldDef, DetailSectionDef } from './member.ui'
