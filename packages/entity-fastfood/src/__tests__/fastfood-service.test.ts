import { describe, it, expect } from 'vitest'
import { FastFoodService } from '../fastfood.service'
import type {
  MenuItem, Order, OrderItem, InventoryItem,
  MenuCategory, OrderStatus, PaymentMethod,
} from '../fastfood.schema'

// ─── Helpers ──────────────────────────────────────────────────

function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'm1',
    tenantId: 't1',
    itemCode: 'CJ-1PC',
    name: '1-Piece Chicken Joy',
    category: 'chicken' as MenuCategory,
    price: 99,
    status: 'available',
    sortOrder: 0,
    isFeatured: false,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    version: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
    ...overrides,
  }
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'o1',
    tenantId: 't1',
    branchId: 'b1',
    orderNumber: 'CK-MAIN-0001',
    orderType: 'dine_in',
    status: 'completed' as OrderStatus,
    subtotal: 500,
    discountAmount: 0,
    vatAmount: 60,
    totalAmount: 560,
    amountTendered: 600,
    changeAmount: 40,
    paymentMethod: 'cash' as PaymentMethod,
    orderedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    version: 1,
    createdBy: 'cashier',
    updatedBy: 'cashier',
    ...overrides,
  }
}

function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'oi1',
    tenantId: 't1',
    branchId: 'b1',
    orderId: 'o1',
    menuItemId: 'm1',
    menuItemName: 'Chicken',
    menuItemCode: 'CJ-1PC',
    quantity: 2,
    unitPrice: 99,
    totalPrice: 198,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    version: 1,
    createdBy: 'cashier',
    updatedBy: 'cashier',
    ...overrides,
  }
}

function makeInventoryItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'i1',
    tenantId: 't1',
    branchId: 'b1',
    name: 'Chicken Thigh',
    category: 'meat',
    unit: 'kg',
    quantityOnHand: 50,
    reorderPoint: 10,
    maxStock: 100,
    status: 'in_stock',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    version: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
    ...overrides,
  }
}

// ─── Menu ─────────────────────────────────────────────────────

describe('getProfitMargin', () => {
  it('calculates margin when cost price is set', () => {
    const item = makeMenuItem({ price: 100, costPrice: 60 })
    const margin = FastFoodService.getProfitMargin(item)
    expect(margin).toBeCloseTo(40, 0)
  })

  it('returns null when no cost price', () => {
    const item = makeMenuItem({ costPrice: undefined })
    expect(FastFoodService.getProfitMargin(item)).toBeNull()
  })

  it('returns null when cost price is 0', () => {
    const item = makeMenuItem({ costPrice: 0 })
    expect(FastFoodService.getProfitMargin(item)).toBeNull()
  })
})

describe('sortMenu', () => {
  it('sorts by category order then sortOrder', () => {
    const items = [
      makeMenuItem({ id: '1', category: 'drinks', sortOrder: 0 }),
      makeMenuItem({ id: '2', category: 'chicken', sortOrder: 1 }),
      makeMenuItem({ id: '3', category: 'chicken', sortOrder: 0 }),
    ]
    const sorted = FastFoodService.sortMenu(items)
    expect(sorted[0]!.category).toBe('chicken')
    expect(sorted[0]!.sortOrder).toBe(0)
    expect(sorted[1]!.category).toBe('chicken')
    expect(sorted[1]!.sortOrder).toBe(1)
    expect(sorted[2]!.category).toBe('drinks')
  })
})

describe('groupByCategory', () => {
  it('groups items by category', () => {
    const items = [
      makeMenuItem({ id: '1', category: 'chicken' }),
      makeMenuItem({ id: '2', category: 'chicken' }),
      makeMenuItem({ id: '3', category: 'drinks' }),
    ]
    const groups = FastFoodService.groupByCategory(items)
    expect(groups.get('chicken')?.length).toBe(2)
    expect(groups.get('drinks')?.length).toBe(1)
  })

  it('handles empty array', () => {
    const groups = FastFoodService.groupByCategory([])
    expect(groups.size).toBe(0)
  })
})

// ─── Orders ───────────────────────────────────────────────────

describe('generateOrderNumber', () => {
  it('generates first order for a branch', () => {
    const num = FastFoodService.generateOrderNumber('MAIN')
    expect(num).toBe('CK-MAIN-0001')
  })

  it('increments from last order', () => {
    const num = FastFoodService.generateOrderNumber('MAIN', 'CK-MAIN-0042')
    expect(num).toBe('CK-MAIN-0043')
  })

  it('handles missing lastOrderNumber', () => {
    const num = FastFoodService.generateOrderNumber('BR1', undefined)
    expect(num).toBe('CK-BR1-0001')
  })

  it('handles different prefix gracefully', () => {
    // If lastOrderNumber has a different prefix, start from 1
    const num = FastFoodService.generateOrderNumber('MAIN', 'CK-OTHER-0099')
    expect(num).toBe('CK-MAIN-0001')
  })
})

describe('computeOrderTotals', () => {
  it('computes subtotal from items', () => {
    const items = [
      { quantity: 2, unitPrice: 99 },
      { quantity: 1, unitPrice: 150 },
    ]
    const result = FastFoodService.computeOrderTotals(items)
    expect(result.subtotal).toBe(348)
  })

  it('applies discount', () => {
    const items = [{ quantity: 1, unitPrice: 100 }]
    const result = FastFoodService.computeOrderTotals(items, 20) // 20% discount
    expect(result.subtotal).toBe(100)
    expect(result.discountAmount).toBe(20)
    expect(result.totalAmount).toBeGreaterThan(0)
  })

  it('computes VAT at 12% by default', () => {
    const items = [{ quantity: 1, unitPrice: 100 }]
    const result = FastFoodService.computeOrderTotals(items, 0, true)
    expect(result.vatAmount).toBe(12) // 100 * 0.12
    expect(result.totalAmount).toBe(112)
  })

  it('skips VAT when not vatable', () => {
    const items = [{ quantity: 1, unitPrice: 100 }]
    const result = FastFoodService.computeOrderTotals(items, 0, false)
    expect(result.vatAmount).toBe(0)
    expect(result.totalAmount).toBe(100)
  })
})

describe('computeChange', () => {
  it('computes change correctly', () => {
    expect(FastFoodService.computeChange(600, 560)).toBe(40)
  })

  it('returns 0 when tendered is less than total', () => {
    expect(FastFoodService.computeChange(500, 560)).toBe(0)
  })

  it('returns 0 for exact amount', () => {
    expect(FastFoodService.computeChange(560, 560)).toBe(0)
  })
})

describe('canTransition', () => {
  it('allows pending -> preparing', () => {
    expect(FastFoodService.canTransition('pending', 'preparing')).toBe(true)
  })

  it('allows pending -> cancelled', () => {
    expect(FastFoodService.canTransition('pending', 'cancelled')).toBe(true)
  })

  it('denies pending -> completed', () => {
    expect(FastFoodService.canTransition('pending', 'completed')).toBe(false)
  })

  it('denies any transition from completed', () => {
    expect(FastFoodService.canTransition('completed', 'pending')).toBe(false)
    expect(FastFoodService.canTransition('completed', 'preparing')).toBe(false)
  })

  it('denies any transition from cancelled', () => {
    expect(FastFoodService.canTransition('cancelled', 'pending')).toBe(false)
  })

  it('allows preparing -> ready', () => {
    expect(FastFoodService.canTransition('preparing', 'ready')).toBe(true)
  })

  it('allows served -> completed', () => {
    expect(FastFoodService.canTransition('served', 'completed')).toBe(true)
  })
})

// ─── Inventory ────────────────────────────────────────────────

describe('getStockStatus', () => {
  it('returns out_of_stock when quantity is 0', () => {
    expect(FastFoodService.getStockStatus(0, 10)).toBe('out_of_stock')
  })

  it('returns out_of_stock when negative', () => {
    expect(FastFoodService.getStockStatus(-5, 10)).toBe('out_of_stock')
  })

  it('returns low_stock when at reorder point', () => {
    expect(FastFoodService.getStockStatus(10, 10)).toBe('low_stock')
  })

  it('returns low_stock when below reorder point', () => {
    expect(FastFoodService.getStockStatus(5, 10)).toBe('low_stock')
  })

  it('returns in_stock when above reorder point', () => {
    expect(FastFoodService.getStockStatus(50, 10)).toBe('in_stock')
  })
})

describe('computeInventoryDeductions', () => {
  it('returns a map of deductions', () => {
    const orderItems = [makeOrderItem({ quantity: 2 })]
    const menuItems = [makeMenuItem({ id: 'm1', category: 'chicken' })]
    const inventoryItems = [
      makeInventoryItem({ id: 'i1', category: 'meat' }),
      makeInventoryItem({ id: 'i2', category: 'oil' }),
    ]

    const deductions = FastFoodService.computeInventoryDeductions(orderItems, menuItems, inventoryItems)

    expect(deductions instanceof Map).toBe(true)
    expect(deductions.get('i1')).toBeGreaterThan(0) // meat gets deducted
    expect(deductions.get('i2')).toBeGreaterThan(0) // oil gets deducted
  })

  it('handles unknown menu item id gracefully', () => {
    const orderItems = [makeOrderItem({ menuItemId: 'nonexistent' })]
    const menuItems: MenuItem[] = []
    const inventoryItems = [makeInventoryItem()]

    const deductions = FastFoodService.computeInventoryDeductions(orderItems, menuItems, inventoryItems)
    expect(deductions.size).toBe(0)
  })

  it('handles different categories', () => {
    const orderItems = [makeOrderItem({ quantity: 1 })]
    const menuItems = [makeMenuItem({ id: 'm1', category: 'drinks' })]
    const inventoryItems = [
      makeInventoryItem({ id: 'i1', category: 'drinks_supplies' }),
    ]

    const deductions = FastFoodService.computeInventoryDeductions(orderItems, menuItems, inventoryItems)
    expect(deductions.get('i1')).toBeCloseTo(0.3)
  })
})

describe('getLowStockItems', () => {
  it('identifies low stock items', () => {
    const items = [
      makeInventoryItem({ id: '1', quantityOnHand: 5, reorderPoint: 10, status: 'in_stock' }),
      makeInventoryItem({ id: '2', quantityOnHand: 50, reorderPoint: 10, status: 'in_stock' }),
      makeInventoryItem({ id: '3', quantityOnHand: 0, reorderPoint: 10, status: 'out_of_stock' }),
    ]
    const lowStock = FastFoodService.getLowStockItems(items)
    expect(lowStock.length).toBe(1)
    expect(lowStock[0]!.id).toBe('1')
  })
})

// ─── Daily Sales ──────────────────────────────────────────────

describe('computeDailySales', () => {
  it('computes daily sales summary from orders', () => {
    const orders = [
      makeOrder({ id: 'o1', orderType: 'dine_in', subtotal: 500, totalAmount: 560, discountAmount: 0, vatAmount: 60, paymentMethod: 'cash' }),
      makeOrder({ id: 'o2', orderType: 'takeout', subtotal: 300, totalAmount: 336, discountAmount: 0, vatAmount: 36, paymentMethod: 'gcash' }),
    ]

    const result = FastFoodService.computeDailySales(
      'b1', '2024-06-15', 5000, orders, 200, 'Manager', 15000,
    )

    expect(result.grossSales).toBe(800)
    expect(result.netSales).toBe(800)
    expect(result.orderCount).toBe(2)
    expect(result.dineInCount).toBe(1)
    expect(result.takeoutCount).toBe(1)
    expect(result.deliveryCount).toBe(0)
    expect(result.cashSales).toBe(560)
    expect(result.gcashSales).toBe(336)
    expect(result.isClosed).toBe(false)
    expect(result.preparedBy).toBe('Manager')
    expect(result.totalExpenses).toBe(200)
  })

  it('handles empty orders', () => {
    const result = FastFoodService.computeDailySales(
      'b1', '2024-06-15', 5000, [], 0, 'Manager', 5000,
    )
    expect(result.orderCount).toBe(0)
    expect(result.grossSales).toBe(0)
    expect(result.averageOrderValue).toBe(0)
    expect(result.cashVariance).toBe(0)
  })

  it('computes cash variance', () => {
    const orders = [
      makeOrder({ subtotal: 100, totalAmount: 112, paymentMethod: 'cash' }),
    ]
    const result = FastFoodService.computeDailySales(
      'b1', '2024-06-15', 5000, orders, 200, 'Manager', 6000,
    )
    // closingCash - (openingCash + cashSales - expenses)
    // = 6000 - (5000 + 112 - 200) = 6000 - 4912 = 1088
    expect(result.cashVariance).toBe(1088)
  })
})
