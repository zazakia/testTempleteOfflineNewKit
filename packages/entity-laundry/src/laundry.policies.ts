/**
 * ─── Laundry RBAC Policies ────────────────────────────────────
 * Permission rules for all laundry entities.
 *
 * Roles used:
 *  - admin              — Full access
 *  - laundry_admin      — Admin of this laundry branch (all laundry ops)
 *  - laundry_manager    — Branch manager: manage staff, view reports, approve discounts
 *  - counter_staff      — Front counter: create customers, drop-off, accept payments
 *  - washer_operator    — Back-end: update order process status, manage inventory
 *  - delivery_rider     — View assigned deliveries, update delivery status
 *  - cashier            — View and process payments only
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

/** Laundry Customer RBAC */
export const LaundryCustomerPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('laundry_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Laundry Service Catalog RBAC */
export const LaundryServicePolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('laundry_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('laundry_manager'), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.includes('laundry_manager'), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Laundry Order RBAC */
export const LaundryOrderPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('laundry_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff', 'washer_operator', 'delivery_rider', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff', 'washer_operator', 'delivery_rider'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Laundry Payment RBAC */
export const LaundryPaymentPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('laundry_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'counter_staff', 'cashier'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.some(r => ['counter_staff', 'cashier'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'cashier'].includes(r)), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]

/** Laundry Inventory RBAC */
export const LaundryInventoryPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin') || ctx.roles.includes('laundry_admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'washer_operator'].includes(r)), priority: 80 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.some(r => ['laundry_manager', 'washer_operator'].includes(r)), priority: 70 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('laundry_manager'), priority: 70 },
  { effect: 'deny', action: 'delete', priority: 50 },
]
