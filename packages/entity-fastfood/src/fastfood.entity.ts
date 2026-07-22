/**
 * ─── Fast Food Entity Definitions ────────────────────────────
 * Self-registers all 5 Fast Food entities on import.
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { MenuItem, Order, OrderItem, InventoryItem, DailySales } from './fastfood.schema'

/**
 * Menu Item entity — the product catalog for Fast Food.
 */
export const MenuItemEntity: EntityDefinition<MenuItem> = {
  name: 'ck_menu_items',
  ui: {
    label: 'Menu Item',
    labelPlural: 'Menu',
    icon: 'UtensilsCrossed',
    routePath: 'fastfood/menu',
    color: 'yellow',
    showInNav: true,
    navOrder: 10,
    navGroup: 'Fast Food',
  },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true },
  rbac: { enabled: true, permissionPrefix: 'fastfood_menu' },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

/**
 * Order entity — customer orders (dine-in, takeout, delivery).
 */
export const OrderEntity: EntityDefinition<Order> = {
  name: 'ck_orders',
  ui: {
    label: 'Order',
    labelPlural: 'Orders',
    icon: 'ClipboardList',
    routePath: 'fastfood/orders',
    color: 'green',
    showInNav: true,
    navOrder: 20,
    navGroup: 'Fast Food',
  },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'critical' },
  audit: { enabled: true },
  rbac: { enabled: true, permissionPrefix: 'fastfood_order' },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

/**
 * Order Item entity — line items within an order.
 */
export const OrderItemEntity: EntityDefinition<OrderItem> = {
  name: 'ck_order_items',
  ui: {
    label: 'Order Item',
    labelPlural: 'Order Items',
    icon: 'List',
    routePath: 'fastfood/order-items',
    color: 'blue',
    showInNav: false, // Accessed from within orders
    navOrder: 25,
    navGroup: 'Fast Food',
  },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'critical' },
  audit: { enabled: true },
  rbac: { enabled: true, permissionPrefix: 'fastfood_order' },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

/**
 * Inventory entity — branch-level ingredient and stock tracking.
 */
export const InventoryItemEntity: EntityDefinition<InventoryItem> = {
  name: 'ck_inventory',
  ui: {
    label: 'Inventory',
    labelPlural: 'Inventory',
    icon: 'Package',
    routePath: 'fastfood/inventory',
    color: 'purple',
    showInNav: true,
    navOrder: 30,
    navGroup: 'Fast Food',
  },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true },
  rbac: { enabled: true, permissionPrefix: 'fastfood_inventory' },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

/**
 * Daily Sales entity — end-of-day branch sales summary.
 */
export const DailySalesEntity: EntityDefinition<DailySales> = {
  name: 'ck_daily_sales',
  ui: {
    label: 'Daily Sales',
    labelPlural: 'Daily Sales',
    icon: 'BarChart3',
    routePath: 'fastfood/daily-sales',
    color: 'blue',
    showInNav: true,
    navOrder: 40,
    navGroup: 'Fast Food',
  },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'background' },
  audit: { enabled: true, excludeFields: ['version'] },
  rbac: { enabled: true, permissionPrefix: 'fastfood_sales' },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

// ─── Self-Register All ──────────────────────────────────────

EntityRegistry.register(MenuItemEntity)
EntityRegistry.register(OrderEntity)
EntityRegistry.register(OrderItemEntity)
EntityRegistry.register(InventoryItemEntity)
EntityRegistry.register(DailySalesEntity)
