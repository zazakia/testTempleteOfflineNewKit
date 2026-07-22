import { describe, it, expect } from 'vitest'
import { EntityRegistry } from '@repo/core'

// Import triggers self-registration
import '../fastfood.entity'

describe('Fast Food Entities', () => {
  it('registers MenuItemEntity', () => {
    expect(EntityRegistry.has('ck_menu_items')).toBe(true)
    const def = EntityRegistry.get('ck_menu_items')
    expect(def.ui.navGroup).toBe('Fast Food')
    expect(def.ui.labelPlural).toBe('Menu')
    expect(def.rbac.permissionPrefix).toBe('fastfood_menu')
    expect(def.sync.enabled).toBe(true)
  })

  it('registers OrderEntity with critical sync priority', () => {
    expect(EntityRegistry.has('ck_orders')).toBe(true)
    const def = EntityRegistry.get('ck_orders')
    expect(def.sync.priority).toBe('critical')
    expect(def.rbac.permissionPrefix).toBe('fastfood_order')
  })

  it('registers OrderItemEntity (hidden from nav)', () => {
    expect(EntityRegistry.has('ck_order_items')).toBe(true)
    const def = EntityRegistry.get('ck_order_items')
    expect(def.ui.showInNav).toBe(false)
    expect(def.rbac.permissionPrefix).toBe('fastfood_order') // shares with order
  })

  it('registers InventoryItemEntity', () => {
    expect(EntityRegistry.has('ck_inventory')).toBe(true)
    const def = EntityRegistry.get('ck_inventory')
    expect(def.ui.labelPlural).toBe('Inventory')
    expect(def.rbac.permissionPrefix).toBe('fastfood_inventory')
  })

  it('registers DailySalesEntity with background sync', () => {
    expect(EntityRegistry.has('ck_daily_sales')).toBe(true)
    const def = EntityRegistry.get('ck_daily_sales')
    expect(def.sync.priority).toBe('background')
    expect(def.rbac.permissionPrefix).toBe('fastfood_sales')
  })

  it('all fastfood entities have tenant isolation and soft delete', () => {
    const names = [
      'ck_menu_items', 'ck_orders', 'ck_order_items',
      'ck_inventory', 'ck_daily_sales',
    ]
    for (const name of names) {
      const def = EntityRegistry.get(name)
      expect(def.tenant.enabled).toBe(true)
      expect(def.softDelete.enabled).toBe(true)
    }
  })
})
