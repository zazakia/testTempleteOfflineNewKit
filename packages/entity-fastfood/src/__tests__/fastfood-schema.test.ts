import { describe, it, expect } from 'vitest'
import {
  MenuCategorySchema,
  MenuItemStatusSchema,
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
  MENU_CATEGORY_LABELS,
  MENU_STATUS_LABELS,
  OrderTypeSchema,
  OrderStatusSchema,
  PaymentMethodSchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  CreateOrderItemSchema,
  InventoryUnitSchema,
  InventoryStatusSchema,
  CreateInventoryItemSchema,
  INVENTORY_STATUS_LABELS,
  CreateDailySalesSchema,
} from '../fastfood.schema'

// ─── Menu Item ────────────────────────────────────────────────

describe('MenuCategorySchema', () => {
  it('accepts valid categories', () => {
    expect(MenuCategorySchema.parse('chicken')).toBe('chicken')
    expect(MenuCategorySchema.parse('combos')).toBe('combos')
    expect(MenuCategorySchema.parse('merchandise')).toBe('merchandise')
  })
  it('rejects invalid', () => {
    expect(() => MenuCategorySchema.parse('invalid')).toThrow()
  })
})

describe('MenuItemStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(MenuItemStatusSchema.parse('available')).toBe('available')
    expect(MenuItemStatusSchema.parse('sold_out')).toBe('sold_out')
    expect(MenuItemStatusSchema.parse('discontinued')).toBe('discontinued')
  })
})

describe('CreateMenuItemSchema', () => {
  const validItem = {
    tenantId: 't1',
    itemCode: 'CJ-1PC',
    name: '1-Piece Chicken Joy',
    category: 'chicken' as const,
    price: 99,
  }

  it('accepts valid menu item', () => {
    const result = CreateMenuItemSchema.parse(validItem)
    expect(result.name).toBe('1-Piece Chicken Joy')
    expect(result.status).toBe('available')
    expect(result.isFeatured).toBe(false)
    expect(result.tags).toEqual([])
  })

  it('rejects zero/negative price', () => {
    expect(() => CreateMenuItemSchema.parse({ ...validItem, price: 0 })).toThrow()
    expect(() => CreateMenuItemSchema.parse({ ...validItem, price: -10 })).toThrow()
  })

  it('accepts with costPrice', () => {
    const result = CreateMenuItemSchema.parse({ ...validItem, costPrice: 45 })
    expect(result.costPrice).toBe(45)
  })

  it('accepts tags', () => {
    const result = CreateMenuItemSchema.parse({
      ...validItem,
      tags: ['bestseller', 'spicy'],
    })
    expect(result.tags).toEqual(['bestseller', 'spicy'])
  })
})

describe('MENU_CATEGORY_LABELS', () => {
  it('has all labels', () => {
    expect(MENU_CATEGORY_LABELS.chicken).toBe('Chicken')
    expect(MENU_CATEGORY_LABELS.combos).toBe('Combo Meals')
    expect(MENU_CATEGORY_LABELS.merchandise).toBe('Merchandise')
  })
})

// ─── Order ────────────────────────────────────────────────────

describe('OrderTypeSchema', () => {
  it('accepts valid types', () => {
    expect(OrderTypeSchema.parse('dine_in')).toBe('dine_in')
    expect(OrderTypeSchema.parse('delivery')).toBe('delivery')
  })
})

describe('OrderStatusSchema', () => {
  it('accepts all statuses', () => {
    expect(OrderStatusSchema.parse('pending')).toBe('pending')
    expect(OrderStatusSchema.parse('cancelled')).toBe('cancelled')
  })
})

describe('CreateOrderSchema', () => {
  const validOrder = {
    tenantId: 't1',
    branchId: 'b1',
    orderNumber: 'CK-MAIN-0001',
    orderType: 'dine_in' as const,
    subtotal: 500,
    totalAmount: 560,
    amountTendered: 600,
    paymentMethod: 'cash' as const,
    orderedAt: Date.now(),
  }

  it('accepts valid order', () => {
    const result = CreateOrderSchema.parse(validOrder)
    expect(result.status).toBe('pending')
    expect(result.discountAmount).toBe(0)
    expect(result.changeAmount).toBe(0)
  })

  it('rejects missing branchId', () => {
    expect(() => CreateOrderSchema.parse({ ...validOrder, branchId: '' })).toThrow()
  })

  it('accepts delivery order with customer details', () => {
    const result = CreateOrderSchema.parse({
      ...validOrder,
      orderType: 'delivery',
      customerName: 'Juan',
      customerPhone: '+639171234567',
    })
    expect(result.orderType).toBe('delivery')
    expect(result.customerName).toBe('Juan')
  })
})

describe('ORDER_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(ORDER_STATUS_LABELS.pending).toBe('Pending')
    expect(ORDER_STATUS_LABELS.preparing).toBe('Preparing')
    expect(ORDER_STATUS_LABELS.completed).toBe('Completed')
  })
})

// ─── Order Item ───────────────────────────────────────────────

describe('CreateOrderItemSchema', () => {
  const validItem = {
    tenantId: 't1',
    branchId: 'b1',
    orderId: 'o1',
    menuItemId: 'm1',
    menuItemName: '1-Piece Chicken',
    menuItemCode: 'CJ-1PC',
    quantity: 2,
    unitPrice: 99,
    totalPrice: 198,
  }

  it('accepts valid order item', () => {
    const result = CreateOrderItemSchema.parse(validItem)
    expect(result.quantity).toBe(2)
    expect(result.totalPrice).toBe(198)
  })

  it('rejects zero quantity', () => {
    expect(() => CreateOrderItemSchema.parse({ ...validItem, quantity: 0 })).toThrow()
  })

  it('accepts special request', () => {
    const result = CreateOrderItemSchema.parse({
      ...validItem,
      specialRequest: 'Extra gravy please',
    })
    expect(result.specialRequest).toBe('Extra gravy please')
  })
})

// ─── Inventory ────────────────────────────────────────────────

describe('InventoryUnitSchema', () => {
  it('accepts valid units', () => {
    expect(InventoryUnitSchema.parse('kg')).toBe('kg')
    expect(InventoryUnitSchema.parse('pc')).toBe('pc')
  })
})

describe('CreateInventoryItemSchema', () => {
  const validInventory = {
    tenantId: 't1',
    branchId: 'b1',
    name: 'Chicken Thigh',
    category: 'meat',
    unit: 'kg' as const,
  }

  it('accepts valid inventory item', () => {
    const result = CreateInventoryItemSchema.parse(validInventory)
    expect(result.status).toBe('in_stock')
    expect(result.quantityOnHand).toBe(0)
  })

  it('accepts with reorder point', () => {
    const result = CreateInventoryItemSchema.parse({
      ...validInventory,
      quantityOnHand: 50,
      reorderPoint: 10,
      maxStock: 100,
    })
    expect(result.quantityOnHand).toBe(50)
  })
})

describe('INVENTORY_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(INVENTORY_STATUS_LABELS.in_stock).toBe('In Stock')
    expect(INVENTORY_STATUS_LABELS.low_stock).toBe('Low Stock')
    expect(INVENTORY_STATUS_LABELS.out_of_stock).toBe('Out of Stock')
  })
})

// ─── Daily Sales ──────────────────────────────────────────────

describe('CreateDailySalesSchema', () => {
  const validSales = {
    tenantId: 't1',
    branchId: 'b1',
    salesDate: '2024-06-15',
    openingCash: 5000,
    grossSales: 15000,
    netSales: 14000,
    orderCount: 50,
    averageOrderValue: 280,
    closingCash: 18000,
    preparedBy: 'Manager',
  }

  it('accepts valid daily sales', () => {
    const result = CreateDailySalesSchema.parse(validSales)
    expect(result.isClosed).toBe(false)
    expect(result.totalExpenses).toBe(0)
  })

  it('rejects invalid sales date format', () => {
    expect(() => CreateDailySalesSchema.parse({ ...validSales, salesDate: 'bad' })).toThrow()
  })

  it('accepts full breakdown', () => {
    const result = CreateDailySalesSchema.parse({
      ...validSales,
      dineInCount: 30,
      dineInSales: 9000,
      takeoutCount: 15,
      takeoutSales: 4500,
      deliveryCount: 5,
      deliverySales: 1500,
      cashSales: 12000,
      gcashSales: 2000,
      mayaSales: 500,
      cardSales: 500,
      totalExpenses: 500,
      notes: 'Busy Saturday',
    })
    expect(result.dineInCount).toBe(30)
    expect(result.cashVariance).toBe(0)
  })
})
