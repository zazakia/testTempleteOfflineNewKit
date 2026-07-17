/**
 * ─── Driving School RBAC Policies ─────────────────────────────
 * Permission rules for all driving school entities.
 *
 * Roles used:
 *  - admin                   — Full access
 *  - driving_school_admin    — Admin of this driving school branch
 *  - driving_school_manager  — Branch manager: manage staff, view reports
 *  - instructor              — Manage own sessions, record attendance/grades
 *  - enrollment_officer      — Handle student registration and enrollment
 *  - cashier                 — Process payments only
 *  - lto_liaison             — Handle LTO submissions and compliance
 */

export type PolicyAction = 'create' | 'read' | 'update' | 'delete' | '*'

export interface PolicyContext {
  userId: string
  tenantId: string
  roles: string[]
  permissions: string[]
}

export interface Policy {
  effect: 'allow' | 'deny'
  action: PolicyAction
  conditions?: (ctx: PolicyContext) => boolean
  priority?: number
}

/** Driving Student RBAC */
export const DrivingStudentPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor', 'lto_liaison'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Driving Instructor RBAC */
export const DrivingInstructorPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor', 'lto_liaison'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('driving_school_manager'), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.includes('driving_school_manager'), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Driving Course RBAC */
export const DrivingCoursePolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('driving_school_manager'), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.includes('driving_school_manager'), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Driving Enrollment RBAC */
export const DrivingEnrollmentPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor', 'cashier', 'lto_liaison'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Driving Schedule RBAC */
export const DrivingSchedulePolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'instructor'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'instructor'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Driving Payment RBAC */
export const DrivingPaymentPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'enrollment_officer', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'cashier'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'cashier'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Driving Vehicle RBAC */
export const DrivingVehiclePolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('driving_school_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'instructor'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['driving_school_manager', 'instructor'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('driving_school_manager'), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]
