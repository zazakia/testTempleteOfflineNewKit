/**
 * ─── Crispy King Fast Food Schema ───────────────────────────
 * Types and Zod schemas for the fast food service module.
 *
 * Entities:
 *  - MenuItem      — Food/drink products with prices and categories
 *  - Order         — Customer order (dine-in, takeout, delivery)
 *  - OrderItem     — Line items within an order
 *  - Inventory     — Branch-level ingredient/stock tracking
 *  - DailySales    — End-of-day branch sales summary
 */

import { z } from 'zod'
import { notesSchema, createQuerySchema, createUpdateSchema } from '@repo/core'

// ═══════════════════════════════════════════════════════════════
// Menu Item
// ═══════════════════════════════════════════════════════════════

export type MenuCategory =
  | 'chicken'
  | 'sides'
  | 'drinks'
  | 'desserts'
  | 'combos'
  | 'breakfast'
  | 'merchandise'

export type MenuItemStatus = 'available' | 'sold_out' | 'discontinued'

export interface MenuItem {
  id: string
  tenantId: string
  branchId?: string // null = shared across branches
  /** Short code (e.g. "CJ-1PC") */
  itemCode: string
  /** Display name (e.g. "1-Piece Chicken Joy") */
  name: string
  category: MenuCategory
  /** Selling price in PHP */
  price: number
  /** Cost price for margin calculation */
  costPrice?: number
  /** Description / ingredients */
  description?: string
  /** Image URL */
  imageUrl?: string
  /** Status */
  status: MenuItemStatus
  /** Sort order in menu display */
  sortOrder: number
  /** Whether this is a bestseller / featured item */
  isFeatured: boolean
  /** Tags for filtering */
  tags: string[]
  /** Nutritional info (calories, etc.) — stored as JSON */
  nutritionInfo?: Record<string, unknown>

  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const MenuCategorySchema = z.enum([
  'chicken', 'sides', 'drinks', 'desserts', 'combos', 'breakfast', 'merchandise',
])
export const MenuItemStatusSchema = z.enum(['available', 'sold_out', 'discontinued'])

export const CreateMenuItemSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  itemCode: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  category: MenuCategorySchema,
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  status: MenuItemStatusSchema.default('available'),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().max(30)).default([]),
  nutritionInfo: z.record(z.unknown()).optional(),
})

export const UpdateMenuItemSchema = createUpdateSchema({
  itemCode: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  category: MenuCategorySchema.optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  status: MenuItemStatusSchema.optional(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string().max(30)).optional(),
  nutritionInfo: z.record(z.unknown()).optional(),
})

export const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  chicken: 'Chicken',
  sides: 'Sides',
  drinks: 'Drinks',
  desserts: 'Desserts',
  combos: 'Combo Meals',
  breakfast: 'Breakfast',
  merchandise: 'Merchandise',
}

export const MENU_STATUS_LABELS: Record<MenuItemStatus, string> = {
  available: 'Available',
  sold_out: 'Sold Out',
  discontinued: 'Discontinued',
}

// ═══════════════════════════════════════════════════════════════
// Order
// ═══════════════════════════════════════════════════════════════

export type OrderType = 'dine_in' | 'takeout' | 'delivery'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card' | 'online_transfer'

export interface Order {
  id: string
  tenantId: string
  branchId: string
  /** Order number (branch-specific sequential, e.g. "CK-MAIN-0001") */
  orderNumber: string
  orderType: OrderType
  status: OrderStatus
  /** Customer name (optional for walk-ins) */
  customerName?: string
  /** Customer contact (for takeout/delivery) */
  customerPhone?: string
  /** Table number (for dine-in) */
  tableNumber?: string
  /** Subtotal before discounts/tax */
  subtotal: number
  /** Discount amount */
  discountAmount: number
  /** Discount label (e.g. "Senior Citizen 20%") */
  discountLabel?: string
  /** VAT amount (12% in PH) */
  vatAmount: number
  /** Final total after discount + VAT */
  totalAmount: number
  /** Amount tendered by customer */
  amountTendered: number
  /** Change due */
  changeAmount: number
  paymentMethod: PaymentMethod
  /** Payment reference (GCash ref#, card auth code) */
  paymentReference?: string
  /** Special instructions */
  notes?: string
  /** Who took the order */
  cashierName?: string
  /** Order timestamps */
  orderedAt: number
  servedAt?: number
  completedAt?: number
  cancelledAt?: number
  cancelReason?: string

  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const OrderTypeSchema = z.enum(['dine_in', 'takeout', 'delivery'])
export const OrderStatusSchema = z.enum(['pending','preparing','ready','served','completed','cancelled'])
export const PaymentMethodSchema = z.enum(['cash','gcash','maya','card','online_transfer'])

export const CreateOrderSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().min(1, 'Branch is required'),
  orderNumber: z.string().min(1).max(30),
  orderType: OrderTypeSchema,
  status: OrderStatusSchema.default('pending'),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(20).optional(),
  tableNumber: z.string().max(10).optional(),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  discountLabel: z.string().max(100).optional(),
  vatAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  amountTendered: z.number().min(0),
  changeAmount: z.number().min(0).default(0),
  paymentMethod: PaymentMethodSchema,
  paymentReference: z.string().max(100).optional(),
  notes: notesSchema,
  cashierName: z.string().max(200).optional(),
  orderedAt: z.number().positive(),
  servedAt: z.number().positive().optional(),
  completedAt: z.number().positive().optional(),
  cancelledAt: z.number().positive().optional(),
  cancelReason: z.string().max(500).optional(),
})

export const UpdateOrderSchema = createUpdateSchema({
  status: OrderStatusSchema.optional(),
  discountAmount: z.number().min(0).optional(),
  discountLabel: z.string().max(100).optional(),
  notes: notesSchema.optional(),
  servedAt: z.number().positive().optional(),
  completedAt: z.number().positive().optional(),
  cancelledAt: z.number().positive().optional(),
  cancelReason: z.string().max(500).optional(),
})

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: 'Dine-In',
  takeout: 'Takeout',
  delivery: 'Delivery',
}
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending', preparing: 'Preparing', ready: 'Ready',
  served: 'Served', completed: 'Completed', cancelled: 'Cancelled',
}
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash', gcash: 'GCash', maya: 'Maya', card: 'Card', online_transfer: 'Online Transfer',
}

// ═══════════════════════════════════════════════════════════════
// Order Item (line items)
// ═══════════════════════════════════════════════════════════════

export interface OrderItem {
  id: string
  tenantId: string
  branchId: string
  orderId: string
  menuItemId: string
  menuItemName: string // denormalized for reporting
  menuItemCode: string
  quantity: number
  unitPrice: number
  totalPrice: number
  /** Special requests (e.g. "extra gravy", "no ice") */
  specialRequest?: string
  /** For combos: which specific pieces */
  comboDetails?: Record<string, unknown>

  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const CreateOrderItemSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().min(1),
  orderId: z.string().min(1),
  menuItemId: z.string().min(1),
  menuItemName: z.string().max(200),
  menuItemCode: z.string().max(20),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().min(0),
  specialRequest: z.string().max(500).optional(),
  comboDetails: z.record(z.unknown()).optional(),
})

export const UpdateOrderItemSchema = createUpdateSchema({
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().positive().optional(),
  totalPrice: z.number().min(0).optional(),
  specialRequest: z.string().max(500).optional(),
})

// ═══════════════════════════════════════════════════════════════
// Inventory
// ═══════════════════════════════════════════════════════════════

export type InventoryUnit = 'kg' | 'g' | 'L' | 'mL' | 'pc' | 'pack' | 'box' | 'sack'
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface InventoryItem {
  id: string
  tenantId: string
  branchId: string
  /** Ingredient name (e.g. "Chicken Thigh", "Cooking Oil", "Flour") */
  name: string
  category: string // e.g. "meat", "oil", "dry_goods", "packaging", "cleaning"
  unit: InventoryUnit
  /** Current quantity on hand */
  quantityOnHand: number
  /** Minimum threshold — triggers "low stock" alert */
  reorderPoint: number
  /** Ideal maximum stock level */
  maxStock: number
  /** Last purchase price per unit */
  lastCostPrice?: number
  supplier?: string
  status: InventoryStatus
  notes?: string
  /** When was last restocked */
  lastRestockedAt?: number

  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const InventoryUnitSchema = z.enum(['kg','g','L','mL','pc','pack','box','sack'])
export const InventoryStatusSchema = z.enum(['in_stock','low_stock','out_of_stock'])

export const CreateInventoryItemSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().min(1),
  name: z.string().min(1).max(200),
  category: z.string().max(50),
  unit: InventoryUnitSchema,
  quantityOnHand: z.number().min(0).default(0),
  reorderPoint: z.number().min(0).default(0),
  maxStock: z.number().min(0).default(0),
  lastCostPrice: z.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  status: InventoryStatusSchema.default('in_stock'),
  notes: notesSchema,
  lastRestockedAt: z.number().positive().optional(),
})

export const UpdateInventoryItemSchema = createUpdateSchema({
  name: z.string().min(1).max(200).optional(),
  category: z.string().max(50).optional(),
  unit: InventoryUnitSchema.optional(),
  quantityOnHand: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  lastCostPrice: z.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  status: InventoryStatusSchema.optional(),
  notes: notesSchema.optional(),
  lastRestockedAt: z.number().positive().optional(),
})

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock',
}

// ═══════════════════════════════════════════════════════════════
// Daily Sales Summary
// ═══════════════════════════════════════════════════════════════

export interface DailySales {
  id: string
  tenantId: string
  branchId: string
  /** ISO date string YYYY-MM-DD */
  salesDate: string
  /** Opening cash float */
  openingCash: number
  /** Total sales (gross before discounts) */
  grossSales: number
  /** Total discounts given */
  totalDiscounts: number
  /** Total VAT collected */
  totalVat: number
  /** Net sales after discounts */
  netSales: number
  /** Number of orders */
  orderCount: number
  /** Average order value */
  averageOrderValue: number
  /** Breakdown by order type */
  dineInCount: number
  dineInSales: number
  takeoutCount: number
  takeoutSales: number
  deliveryCount: number
  deliverySales: number
  /** Breakdown by payment method */
  cashSales: number
  gcashSales: number
  mayaSales: number
  cardSales: number
  /** Actual cash counted at end of day */
  closingCash: number
  /** Cash discrepancy */
  cashVariance: number
  /** Total expenses for the day */
  totalExpenses: number
  /** Who prepared this summary */
  preparedBy: string
  /** Whether this day is finalized/closed */
  isClosed: boolean
  notes?: string

  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const CreateDailySalesSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().min(1),
  salesDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  openingCash: z.number().min(0),
  grossSales: z.number().min(0),
  totalDiscounts: z.number().min(0).default(0),
  totalVat: z.number().min(0).default(0),
  netSales: z.number().min(0),
  orderCount: z.number().int().min(0),
  averageOrderValue: z.number().min(0),
  dineInCount: z.number().int().min(0).default(0),
  dineInSales: z.number().min(0).default(0),
  takeoutCount: z.number().int().min(0).default(0),
  takeoutSales: z.number().min(0).default(0),
  deliveryCount: z.number().int().min(0).default(0),
  deliverySales: z.number().min(0).default(0),
  cashSales: z.number().min(0).default(0),
  gcashSales: z.number().min(0).default(0),
  mayaSales: z.number().min(0).default(0),
  cardSales: z.number().min(0).default(0),
  closingCash: z.number().min(0),
  cashVariance: z.number().default(0),
  totalExpenses: z.number().min(0).default(0),
  preparedBy: z.string().max(200),
  isClosed: z.boolean().default(false),
  notes: notesSchema,
})
