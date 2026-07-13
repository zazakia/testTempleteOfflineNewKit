/**
 * ─── Clinic RBAC Policies ─────────────────────────────────────
 * Permission rules for all clinic entities.
 *
 * Roles used:
 *  - admin        — Full access
 *  - clinic_admin — Admin of this clinic branch (all clinic ops)
 *  - doctor       — Can read patients and write their own consultation records
 *  - nurse        — Can manage appointments, take vitals, update records
 *  - receptionist — Can manage appointments and billing only
 *  - cashier      — Can view and update billing only
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

/** Shared clinic RBAC policies */
export const ClinicPatientPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('clinic_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse', 'receptionist'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['nurse', 'receptionist'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

export const ClinicDoctorPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('clinic_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse', 'receptionist'].includes(r)), priority: 80 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

export const ClinicAppointmentPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('clinic_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse', 'receptionist'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['nurse', 'receptionist'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse', 'receptionist'].includes(r)), priority: 70 },
]

export const ClinicRecordPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('clinic_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.includes('doctor'), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

export const ClinicBillingPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('clinic_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['doctor', 'nurse', 'receptionist', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['receptionist', 'cashier'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['receptionist', 'cashier'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]
