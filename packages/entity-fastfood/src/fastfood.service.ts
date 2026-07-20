/**
 * ─── Fast Food Service ──────────────────────────────────────
 * Business logic for Crispy King operations.
 */

import type {
  MenuItem, Order, OrderItem, InventoryItem, DailySales,
  MenuCategory, OrderType, OrderStatus, PaymentMethod,
} from './fastfood.schema'

export class FastFoodService {
  // ─── Menu ─────────────────────────────────────────────

  /** Calculate gross profit margin for a menu item */
  static getProfitMargin(item: MenuItem): number | null {
    if (!item.costPrice || item.costPrice <= 0) return null
    return ((item.price - item.costPrice) / item.price) * 100
  }

  /** Sort menu items by category then sortOrder */
  static sortMenu(items: MenuItem[]): MenuItem[] {
    const categoryOrder: MenuCategory[] = [
      'chicken', 'combos', 'sides', 'drinks', 'desserts', 'breakfast', 'merchandise',
    ]
    return [...items].sort((a, b) => {
      const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      if (catDiff !== 0) return catDiff
      return a.sortOrder - b.sortOrder
    })
  }

  /** Group menu items by category */
  static groupByCategory(items: MenuItem[]): Map<MenuCategory, MenuItem[]> {
    const map = new Map<MenuCategory, MenuItem[]>()
    for (const item of items) {
      const group = map.get(item.category) ?? []
      group.push(item)
      map.set(item.category, group)
    }
    return map
  }

  // ─── Orders ───────────────────────────────────────────

  /** Generate next order number for a branch */
  static generateOrderNumber(branchCode: string, lastOrderNumber?: string): string {
    const prefix = `CK-${branchCode}-`
    if (!lastOrderNumber || !lastOrderNumber.startsWith(prefix)) {
      return `${prefix}0001`
    }
    const num = parseInt(lastOrderNumber.replace(prefix, ''), 10)
    return `${prefix}${String((isNaN(num) ? 0 : num) + 1).padStart(4, '0')}`
  }

  /** Compute order totals from line items */
  static computeOrderTotals(
    items: { quantity: number; unitPrice: number }[],
    discountPercent: number = 0,
    isVatable: boolean = true,
  ): { subtotal: number; discountAmount: number; vatAmount: number; totalAmount: number } {
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
    const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
    const afterDiscount = subtotal - discountAmount
    const vatRate = isVatable ? 0.12 : 0
    const vatAmount = Math.round(afterDiscount * vatRate * 100) / 100
    const totalAmount = afterDiscount + vatAmount
    return { subtotal, discountAmount, vatAmount, totalAmount }
  }

  /** Validate that change equals amount tendered minus total */
  static computeChange(amountTendered: number, totalAmount: number): number {
    return Math.max(0, Math.round((amountTendered - totalAmount) * 100) / 100)
  }

  /** Determine if an order can transition to a new status */
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: ['completed'],
      completed: [],
      cancelled: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  // ─── Inventory ────────────────────────────────────────

  /** Determine stock status based on quantity */
  static getStockStatus(quantityOnHand: number, reorderPoint: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (quantityOnHand <= 0) return 'out_of_stock'
    if (quantityOnHand <= reorderPoint) return 'low_stock'
    return 'in_stock'
  }

  /** Deduct inventory after an order is completed */
  static computeInventoryDeductions(
    orderItems: OrderItem[],
    menuItems: MenuItem[],
    inventoryItems: InventoryItem[],
  ): Map<string, number> {
    const deductions = new Map<string, number>()

    for (const orderItem of orderItems) {
      const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId)
      if (!menuItem) continue

      // Simple model: each order item consumes some inventory
      // In production, you'd have a BOM (bill of materials) per menu item
      // Here we estimate based on category
      const qty = orderItem.quantity

      for (const inv of inventoryItems) {
        let usagePerItem = 0
        switch (menuItem.category) {
          case 'chicken':
            if (inv.category === 'meat') usagePerItem = 0.15 // 150g per piece
            if (inv.category === 'oil') usagePerItem = 0.02 // shared oil
            if (inv.category === 'dry_goods') usagePerItem = 0.01 // breading
            break
          case 'sides':
            if (inv.category === 'dry_goods') usagePerItem = 0.05
            break
          case 'drinks':
            if (inv.category === 'drinks_supplies') usagePerItem = 0.3
            break
          default:
            usagePerItem = 0
        }

        if (usagePerItem > 0) {
          const current = deductions.get(inv.id) ?? 0
          deductions.set(inv.id, current + usagePerItem * qty)
        }
      }
    }
    return deductions
  }

  /** Get items that need reordering */
  static getLowStockItems(items: InventoryItem[]): InventoryItem[] {
    return items.filter(
      (i) => i.quantityOnHand <= i.reorderPoint && i.status !== 'out_of_stock',
    )
  }

  // ─── Daily Sales ──────────────────────────────────────

  /** Compute daily sales summary from a list of orders */
  static computeDailySales(
    branchId: string,
    salesDate: string,
    openingCash: number,
    orders: Order[],
    expenses: number,
    preparedBy: string,
    closingCash: number,
  ): Omit<DailySales, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version' | 'createdBy' | 'updatedBy'> {
    const grossSales = orders.reduce((s, o) => s + o.subtotal, 0)
    const totalDiscounts = orders.reduce((s, o) => s + o.discountAmount, 0)
    const totalVat = orders.reduce((s, o) => s + o.vatAmount, 0)
    const netSales = grossSales - totalDiscounts
    const orderCount = orders.length
    const averageOrderValue = orderCount > 0 ? netSales / orderCount : 0

    const dineInOrders = orders.filter((o) => o.orderType === 'dine_in')
    const takeoutOrders = orders.filter((o) => o.orderType === 'takeout')
    const deliveryOrders = orders.filter((o) => o.orderType === 'delivery')

    const cashSales = orders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((s, o) => s + o.totalAmount, 0)
    const gcashSales = orders
      .filter((o) => o.paymentMethod === 'gcash')
      .reduce((s, o) => s + o.totalAmount, 0)
    const mayaSales = orders
      .filter((o) => o.paymentMethod === 'maya')
      .reduce((s, o) => s + o.totalAmount, 0)
    const cardSales = orders
      .filter((o) => o.paymentMethod === 'card')
      .reduce((s, o) => s + o.totalAmount, 0)

    return {
      branchId,
      salesDate,
      openingCash,
      grossSales,
      totalDiscounts,
      totalVat,
      netSales,
      orderCount,
      averageOrderValue,
      dineInCount: dineInOrders.length,
      dineInSales: dineInOrders.reduce((s, o) => s + o.totalAmount, 0),
      takeoutCount: takeoutOrders.length,
      takeoutSales: takeoutOrders.reduce((s, o) => s + o.totalAmount, 0),
      deliveryCount: deliveryOrders.length,
      deliverySales: deliveryOrders.reduce((s, o) => s + o.totalAmount, 0),
      cashSales,
      gcashSales,
      mayaSales,
      cardSales,
      closingCash,
      cashVariance: closingCash - (openingCash + cashSales - expenses),
      totalExpenses: expenses,
      preparedBy,
      isClosed: false,
    }
  }
}
