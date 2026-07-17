/**
 * ─── Laundry Shop Management System — Schema ──────────────────
 * Defines all TypeScript types and Zod validation schemas for the
 * multi-branch Laundry Shop Management System.
 *
 * Entities covered:
 *  - LaundryCustomer — Customer profiles with preferences
 *  - LaundryService  — Wash/dry-clean/fold service catalog
 *  - LaundryOrder    — Work orders with tracking lifecycle
 *  - LaundryPayment  — Billing and payment collection
 *  - LaundryInventory — Supplies and consumables per branch
 */

import { z } from 'zod'
import {
  baseEntitySchema,
  emailSchema,
  phoneSchema,
  notesSchema,
  createQuerySchema,
  createUpdateSchema,
} from '@repo/core'

// ─── LaundryCustomer ──────────────────────────────────────────

export type CustomerType = 'walk_in' | 'regular' | 'corporate'
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface LaundryCustomer {
  id: string
  tenantId: string
  branchId?: string
  customerCode: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  email?: string
  address?: string
  barangay?: string
  city?: string
  province?: string
  customerType: CustomerType
  customerTier: CustomerTier
  /** Total lifetime spend in PHP — computed, cached for tier eligibility */
  lifetimeSpend: number
  /** Loyalty points accrued */
  loyaltyPoints: number
  /** Fabric preferences / special instructions */
  preferences?: string
  /** Preferred pickup/delivery address if different */
  deliveryAddress?: string
  /** Date of first transaction */
  firstVisitDate?: string
  /** Last order date */
  lastOrderDate?: string
  status: 'active' | 'inactive' | 'blocked'
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const CustomerTypeSchema = z.enum(['walk_in', 'regular', 'corporate'])
export const CustomerTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum'])

export const CreateLaundryCustomerSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  customerCode: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  phone: phoneSchema,
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  barangay: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  customerType: CustomerTypeSchema.default('walk_in'),
  customerTier: CustomerTierSchema.default('bronze'),
  lifetimeSpend: z.number().min(0).default(0),
  loyaltyPoints: z.number().int().min(0).default(0),
  preferences: z.string().max(500).optional(),
  deliveryAddress: z.string().max(500).optional(),
  firstVisitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lastOrderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  notes: notesSchema,
})

export const UpdateLaundryCustomerSchema = createUpdateSchema({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  barangay: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  customerType: CustomerTypeSchema.optional(),
  customerTier: CustomerTierSchema.optional(),
  preferences: z.string().max(500).optional(),
  deliveryAddress: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  notes: notesSchema.optional(),
})

export const LaundryCustomerQuerySchema = createQuerySchema({
  customerType: CustomerTypeSchema.optional(),
  customerTier: CustomerTierSchema.optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  branchId: z.string().optional(),
})

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  walk_in: 'Walk-in',
  regular: 'Regular',
  corporate: 'Corporate',
}

export const CUSTOMER_TIER_LABELS: Record<CustomerTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

export const CUSTOMER_TIER_COLORS: Record<CustomerTier, 'yellow' | 'gray' | 'yellow' | 'purple'> = {
  bronze: 'yellow',
  silver: 'gray',
  gold: 'yellow',
  platinum: 'purple',
}

// ─── LaundryService ───────────────────────────────────────────

export type ServiceCategory = 'wash_dry' | 'dry_clean' | 'iron' | 'fold' | 'stain_removal' | 'leather_care' | 'shoe_clean' | 'carpet' | 'curtain' | 'other'
export type PricingUnit = 'per_kg' | 'per_piece' | 'per_set' | 'per_pair' | 'flat_rate'
export type ServiceStatus = 'active' | 'inactive' | 'seasonal'

export interface LaundryService {
  id: string
  tenantId: string
  serviceCode: string
  name: string
  description?: string
  category: ServiceCategory
  pricingUnit: PricingUnit
  basePrice: number            // PHP — base price per unit
  /** Metadata-driven: tenant can override price per branch via metadata */
  branchPriceOverrides?: Record<string, number>  // branchId -> override price
  minCharge: number            // minimum PHP charge for this service
  /** Estimated turnaround in hours (used for SLA calc) */
  turnaroundHours: number
  /** Requires special handling/tagging */
  requiresSpecialHandling: boolean
  /** Sort order in catalog display */
  sortOrder: number
  status: ServiceStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const ServiceCategorySchema = z.enum([
  'wash_dry', 'dry_clean', 'iron', 'fold', 'stain_removal',
  'leather_care', 'shoe_clean', 'carpet', 'curtain', 'other',
])
export const PricingUnitSchema = z.enum(['per_kg', 'per_piece', 'per_set', 'per_pair', 'flat_rate'])

export const CreateLaundryServiceSchema = z.object({
  tenantId: z.string().min(1),
  serviceCode: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: ServiceCategorySchema,
  pricingUnit: PricingUnitSchema,
  basePrice: z.number().min(0),
  branchPriceOverrides: z.record(z.number().min(0)).optional(),
  minCharge: z.number().min(0).default(0),
  turnaroundHours: z.number().int().min(1).max(720).default(24),
  requiresSpecialHandling: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(['active', 'inactive', 'seasonal']).default('active'),
  notes: notesSchema,
})

export const UpdateLaundryServiceSchema = createUpdateSchema({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  category: ServiceCategorySchema.optional(),
  pricingUnit: PricingUnitSchema.optional(),
  basePrice: z.number().min(0).optional(),
  branchPriceOverrides: z.record(z.number().min(0)).optional(),
  minCharge: z.number().min(0).optional(),
  turnaroundHours: z.number().int().min(1).max(720).optional(),
  requiresSpecialHandling: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive', 'seasonal']).optional(),
  notes: notesSchema.optional(),
})

export const LaundryServiceQuerySchema = createQuerySchema({
  category: ServiceCategorySchema.optional(),
  status: z.enum(['active', 'inactive', 'seasonal']).optional(),
})

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  wash_dry: 'Wash & Dry',
  dry_clean: 'Dry Clean',
  iron: 'Iron / Press',
  fold: 'Fold Only',
  stain_removal: 'Stain Removal',
  leather_care: 'Leather Care',
  shoe_clean: 'Shoe Cleaning',
  carpet: 'Carpet / Rug',
  curtain: 'Curtain / Drapery',
  other: 'Other Service',
}

export const SERVICE_CATEGORY_COLORS: Record<ServiceCategory, 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'gray'> = {
  wash_dry: 'blue',
  dry_clean: 'purple',
  iron: 'green',
  fold: 'yellow',
  stain_removal: 'red',
  leather_care: 'gray',
  shoe_clean: 'gray',
  carpet: 'gray',
  curtain: 'gray',
  other: 'gray',
}

export const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  per_kg: 'Per Kilogram',
  per_piece: 'Per Piece',
  per_set: 'Per Set',
  per_pair: 'Per Pair',
  flat_rate: 'Flat Rate',
}

// ─── LaundryOrder ─────────────────────────────────────────────

export type OrderStatus = 'dropped_off' | 'sorted' | 'in_process' | 'quality_check' | 'ready_for_pickup' | 'picked_up' | 'delivered' | 'cancelled'
export type OrderPriority = 'normal' | 'express' | 'rush'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'

export interface LaundryOrderItem {
  serviceId: string
  serviceName: string
  quantity: number
  unitPrice: number
  lineTotal: number
  specialInstructions?: string
}

export interface LaundryOrder {
  id: string
  tenantId: string
  branchId?: string
  orderCode: string
  customerId: string
  customerName: string        // denormalized for quick lookup
  orderDate: string            // ISO date YYYY-MM-DD
  dropOffTime: string          // HH:MM
  promisedPickupDate: string   // ISO date
  promisedPickupTime: string   // HH:MM
  items: LaundryOrderItem[]    // JSONB array
  totalWeight?: number         // kg
  subtotal: number             // PHP
  discountAmount: number       // PHP
  taxAmount: number            // PHP (VAT if applicable)
  totalAmount: number          // PHP
  amountPaid: number           // PHP
  balance: number              // PHP
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  orderPriority: OrderPriority
  /** Who accepted the drop-off */
  receivedBy: string
  /** Who processed the order */
  processedBy?: string
  /** Who did QC check */
  checkedBy?: string
  /** Actual pickup/delivery timestamp */
  actualPickupDate?: string
  actualPickupTime?: string
  /** Customer signature / confirmation */
  pickupConfirmedBy?: string
  /** Special washing/drying instructions */
  careInstructions?: string
  /** Any damage noted at drop-off */
  damageNotes?: string
  /** Tag number for garment tracking */
  tagNumbers?: string[]        // JSONB array
  /** Was this a pickup & delivery order */
  isDelivery: boolean
  deliveryAddress?: string
  deliveryFee: number
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const OrderItemSchema = z.object({
  serviceId: z.string().min(1),
  serviceName: z.string().min(1),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  lineTotal: z.number().min(0),
  specialInstructions: z.string().max(300).optional(),
})

export const CreateLaundryOrderSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  orderCode: z.string().min(1).max(20),
  customerId: z.string().min(1),
  customerName: z.string().min(1).max(200),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  dropOffTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  promisedPickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  promisedPickupTime: z.string().regex(/^\d{2}:\d{2}$/),
  items: z.array(OrderItemSchema).min(1),
  totalWeight: z.number().min(0).optional(),
  subtotal: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  amountPaid: z.number().min(0).default(0),
  balance: z.number().default(0),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).default('unpaid'),
  orderStatus: z.enum([
    'dropped_off', 'sorted', 'in_process', 'quality_check',
    'ready_for_pickup', 'picked_up', 'delivered', 'cancelled',
  ]).default('dropped_off'),
  orderPriority: z.enum(['normal', 'express', 'rush']).default('normal'),
  receivedBy: z.string().min(1),
  processedBy: z.string().optional(),
  checkedBy: z.string().optional(),
  actualPickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  actualPickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  pickupConfirmedBy: z.string().optional(),
  careInstructions: z.string().max(500).optional(),
  damageNotes: z.string().max(500).optional(),
  tagNumbers: z.array(z.string().max(50)).optional(),
  isDelivery: z.boolean().default(false),
  deliveryAddress: z.string().max(500).optional(),
  deliveryFee: z.number().min(0).default(0),
  notes: notesSchema,
})

export const UpdateLaundryOrderSchema = createUpdateSchema({
  promisedPickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  promisedPickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  items: z.array(OrderItemSchema).min(1).optional(),
  totalWeight: z.number().min(0).optional(),
  subtotal: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  balance: z.number().optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
  orderStatus: z.enum([
    'dropped_off', 'sorted', 'in_process', 'quality_check',
    'ready_for_pickup', 'picked_up', 'delivered', 'cancelled',
  ]).optional(),
  orderPriority: z.enum(['normal', 'express', 'rush']).optional(),
  processedBy: z.string().optional(),
  checkedBy: z.string().optional(),
  actualPickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  actualPickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  pickupConfirmedBy: z.string().optional(),
  careInstructions: z.string().max(500).optional(),
  damageNotes: z.string().max(500).optional(),
  tagNumbers: z.array(z.string().max(50)).optional(),
  deliveryAddress: z.string().max(500).optional(),
  deliveryFee: z.number().min(0).optional(),
  notes: notesSchema.optional(),
})

export const LaundryOrderQuerySchema = createQuerySchema({
  orderStatus: z.enum([
    'dropped_off', 'sorted', 'in_process', 'quality_check',
    'ready_for_pickup', 'picked_up', 'delivered', 'cancelled',
  ]).optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
  customerId: z.string().optional(),
  branchId: z.string().optional(),
  orderDate: z.string().optional(),
  orderPriority: z.enum(['normal', 'express', 'rush']).optional(),
})

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  dropped_off: 'Dropped Off',
  sorted: 'Sorted',
  in_process: 'In Process',
  quality_check: 'Quality Check',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'gray'> = {
  dropped_off: 'blue',
  sorted: 'yellow',
  in_process: 'purple',
  quality_check: 'yellow',
  ready_for_pickup: 'green',
  picked_up: 'green',
  delivered: 'green',
  cancelled: 'red',
}

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  normal: 'Normal',
  express: 'Express',
  rush: 'Rush',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'red' | 'yellow' | 'green' | 'gray'> = {
  unpaid: 'red',
  partial: 'yellow',
  paid: 'green',
  refunded: 'gray',
}

// ─── LaundryPayment ───────────────────────────────────────────

export type LaundryPaymentMethod = 'cash' | 'gcash' | 'maya' | 'bank_transfer' | 'card' | 'loyalty_points'

export interface LaundryPayment {
  id: string
  tenantId: string
  branchId?: string
  paymentCode: string
  orderId: string
  customerId: string
  paymentDate: string          // ISO date
  paymentTime: string          // HH:MM
  amount: number               // PHP
  paymentMethod: LaundryPaymentMethod
  referenceNumber?: string
  /** For partial payments: how many loyalty points were redeemed */
  loyaltyPointsRedeemed: number
  /** Points earned from this payment (metadata-driven rate) */
  loyaltyPointsEarned: number
  receivedBy: string
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const LaundryPaymentMethodSchema = z.enum([
  'cash', 'gcash', 'maya', 'bank_transfer', 'card', 'loyalty_points',
])

export const CreateLaundryPaymentSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  paymentCode: z.string().min(1).max(20),
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  paymentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  amount: z.number().min(0),
  paymentMethod: LaundryPaymentMethodSchema,
  referenceNumber: z.string().max(100).optional(),
  loyaltyPointsRedeemed: z.number().int().min(0).default(0),
  loyaltyPointsEarned: z.number().int().min(0).default(0),
  receivedBy: z.string().min(1),
  notes: notesSchema,
})

export const UpdateLaundryPaymentSchema = createUpdateSchema({
  amount: z.number().min(0).optional(),
  paymentMethod: LaundryPaymentMethodSchema.optional(),
  referenceNumber: z.string().max(100).optional(),
  loyaltyPointsRedeemed: z.number().int().min(0).optional(),
  loyaltyPointsEarned: z.number().int().min(0).optional(),
  notes: notesSchema.optional(),
})

export const LaundryPaymentQuerySchema = createQuerySchema({
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  paymentMethod: LaundryPaymentMethodSchema.optional(),
  branchId: z.string().optional(),
  paymentDate: z.string().optional(),
})

export const LAUNDRY_PAYMENT_METHOD_LABELS: Record<LaundryPaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  loyalty_points: 'Loyalty Points',
}

// ─── LaundryInventory ─────────────────────────────────────────

export type InventoryCategory = 'detergent' | 'softener' | 'bleach' | 'stain_remover' | 'packaging' | 'hanger' | 'tag' | 'other'
export type InventoryUnit = 'liter' | 'kilogram' | 'piece' | 'pack' | 'box' | 'bottle'

export interface LaundryInventory {
  id: string
  tenantId: string
  branchId?: string
  itemCode: string
  name: string
  category: InventoryCategory
  unit: InventoryUnit
  quantityOnHand: number
  minStockLevel: number         // reorder point
  maxStockLevel: number
  costPerUnit: number           // PHP
  /** Metadata-driven: per-branch stock levels */
  supplierName?: string
  lastRestockDate?: string
  lastRestockQuantity?: number
  lastRestockCost?: number
  expirationDate?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const InventoryCategorySchema = z.enum([
  'detergent', 'softener', 'bleach', 'stain_remover',
  'packaging', 'hanger', 'tag', 'other',
])
export const InventoryUnitSchema = z.enum(['liter', 'kilogram', 'piece', 'pack', 'box', 'bottle'])

export const CreateLaundryInventorySchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  itemCode: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  category: InventoryCategorySchema,
  unit: InventoryUnitSchema,
  quantityOnHand: z.number().min(0).default(0),
  minStockLevel: z.number().min(0).default(5),
  maxStockLevel: z.number().min(0).default(100),
  costPerUnit: z.number().min(0).default(0),
  supplierName: z.string().max(200).optional(),
  lastRestockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lastRestockQuantity: z.number().min(0).optional(),
  lastRestockCost: z.number().min(0).optional(),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
  notes: notesSchema,
})

export const UpdateLaundryInventorySchema = createUpdateSchema({
  name: z.string().min(1).max(200).optional(),
  category: InventoryCategorySchema.optional(),
  unit: InventoryUnitSchema.optional(),
  quantityOnHand: z.number().min(0).optional(),
  minStockLevel: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
  costPerUnit: z.number().min(0).optional(),
  supplierName: z.string().max(200).optional(),
  lastRestockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lastRestockQuantity: z.number().min(0).optional(),
  lastRestockCost: z.number().min(0).optional(),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
  notes: notesSchema.optional(),
})

export const LaundryInventoryQuerySchema = createQuerySchema({
  category: InventoryCategorySchema.optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
  branchId: z.string().optional(),
})

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  detergent: 'Detergent',
  softener: 'Fabric Softener',
  bleach: 'Bleach',
  stain_remover: 'Stain Remover',
  packaging: 'Packaging Materials',
  hanger: 'Hangers',
  tag: 'Tags / Labels',
  other: 'Other',
}

export const INVENTORY_STATUS_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  discontinued: 'Discontinued',
}

export const INVENTORY_STATUS_COLORS: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  in_stock: 'green',
  low_stock: 'yellow',
  out_of_stock: 'red',
  discontinued: 'gray',
}
