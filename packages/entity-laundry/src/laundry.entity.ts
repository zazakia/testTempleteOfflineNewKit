/**
 * ─── Laundry Entity Definitions ───────────────────────────────
 * All laundry entities self-register with the Entity Registry on import.
 *
 * Importing '@repo/entity-laundry' is enough to wire up:
 *  - Navigation menu items (under "Laundry" group)
 *  - Sync configuration per entity
 *  - RBAC permission prefixes
 *  - Audit trail settings
 *  - Soft delete configuration
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type {
  LaundryCustomer,
  LaundryService,
  LaundryOrder,
  LaundryPayment,
  LaundryInventory,
} from './laundry.schema'

// ─── Customer Entity ───────────────────────────────────────

export const LaundryCustomerEntity: EntityDefinition<LaundryCustomer> = {
  name: 'laundry_customers',
  ui: {
    label: 'Customer',
    labelPlural: 'Customers',
    icon: 'Users',
    routePath: 'laundry/customers',
    color: 'blue',
    showInNav: true,
    navOrder: 10,
    navGroup: 'Laundry',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
    excludeFields: [],
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'laundry_customer',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(LaundryCustomerEntity)

// ─── Service Catalog Entity ─────────────────────────────────

export const LaundryServiceEntity: EntityDefinition<LaundryService> = {
  name: 'laundry_services',
  ui: {
    label: 'Service',
    labelPlural: 'Services',
    icon: 'Shirt',
    routePath: 'laundry/services',
    color: 'purple',
    showInNav: true,
    navOrder: 20,
    navGroup: 'Laundry',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'laundry_service',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(LaundryServiceEntity)

// ─── Order / Work Order Entity ──────────────────────────────

export const LaundryOrderEntity: EntityDefinition<LaundryOrder> = {
  name: 'laundry_orders',
  ui: {
    label: 'Order',
    labelPlural: 'Orders',
    icon: 'ScrollText',
    routePath: 'laundry/orders',
    color: 'green',
    showInNav: true,
    navOrder: 30,
    navGroup: 'Laundry',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'critical',   // orders are time-sensitive, sync first
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'laundry_order',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(LaundryOrderEntity)

// ─── Payment Entity ─────────────────────────────────────────

export const LaundryPaymentEntity: EntityDefinition<LaundryPayment> = {
  name: 'laundry_payments',
  ui: {
    label: 'Payment',
    labelPlural: 'Payments',
    icon: 'Receipt',
    routePath: 'laundry/payments',
    color: 'yellow',
    showInNav: true,
    navOrder: 40,
    navGroup: 'Laundry',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'laundry_payment',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(LaundryPaymentEntity)

// ─── Inventory Entity ───────────────────────────────────────

export const LaundryInventoryEntity: EntityDefinition<LaundryInventory> = {
  name: 'laundry_inventory',
  ui: {
    label: 'Inventory',
    labelPlural: 'Inventory Items',
    icon: 'Package',
    routePath: 'laundry/inventory',
    color: 'red',
    showInNav: true,
    navOrder: 50,
    navGroup: 'Laundry',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'background',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'laundry_inventory',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(LaundryInventoryEntity)
