/**
 * ─── @repo/entity-laundry — Barrel Export ─────────────────────
 * Importing this package registers all Laundry entities with the framework.
 *
 * Usage in apps/web/src/lib/db.ts:
 *   import '@repo/entity-laundry'
 *   // Now all laundry entities are registered, synced, audited, and
 *   // visible in the navigation under the "Laundry" group.
 */

// Self-registers ALL laundry entities on import
export {
  LaundryCustomerEntity,
  LaundryServiceEntity,
  LaundryOrderEntity,
  LaundryPaymentEntity,
  LaundryInventoryEntity,
  PromoCodeEntity,
} from './laundry.entity'

// ─── LaundryCustomer ───────────────────────────────────────
export type {
  LaundryCustomer,
  CustomerType,
  CustomerTier,
} from './laundry.schema'

export {
  CreateLaundryCustomerSchema,
  UpdateLaundryCustomerSchema,
  LaundryCustomerQuerySchema,
  CustomerTypeSchema,
  CustomerTierSchema,
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_TIER_LABELS,
  CUSTOMER_TIER_COLORS,
} from './laundry.schema'

// ─── LaundryService ────────────────────────────────────────
export type {
  LaundryService,
  ServiceCategory,
  PricingUnit,
  ServiceStatus,
} from './laundry.schema'

export {
  CreateLaundryServiceSchema,
  UpdateLaundryServiceSchema,
  LaundryServiceQuerySchema,
  ServiceCategorySchema,
  PricingUnitSchema,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_COLORS,
  PRICING_UNIT_LABELS,
} from './laundry.schema'

// ─── LaundryOrder ──────────────────────────────────────────
export type {
  LaundryOrder,
  LaundryOrderItem,
  OrderStatus,
  OrderPriority,
  PaymentStatus,
} from './laundry.schema'

export {
  CreateLaundryOrderSchema,
  UpdateLaundryOrderSchema,
  LaundryOrderQuerySchema,
  OrderItemSchema,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_PRIORITY_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from './laundry.schema'

// ─── LaundryPayment ────────────────────────────────────────
export type { LaundryPayment, LaundryPaymentMethod } from './laundry.schema'

export {
  CreateLaundryPaymentSchema,
  UpdateLaundryPaymentSchema,
  LaundryPaymentQuerySchema,
  LaundryPaymentMethodSchema,
  LAUNDRY_PAYMENT_METHOD_LABELS,
} from './laundry.schema'

// ─── LaundryInventory ──────────────────────────────────────
export type {
  LaundryInventory,
  InventoryCategory,
  InventoryUnit,
} from './laundry.schema'

export {
  CreateLaundryInventorySchema,
  UpdateLaundryInventorySchema,
  LaundryInventoryQuerySchema,
  InventoryCategorySchema,
  InventoryUnitSchema,
  INVENTORY_CATEGORY_LABELS,
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_COLORS,
} from './laundry.schema'

// ─── Promo Codes ───────────────────────────────────────────
export type { PromoCode, PromoType, PromoStatus, PromoTarget } from './laundry.schema'
export {
  CreatePromoCodeSchema,
  UpdatePromoCodeSchema,
  PromoTypeSchema,
  PromoStatusSchema,
  PromoTargetSchema,
  PROMO_TYPE_LABELS,
  PROMO_STATUS_LABELS,
  PROMO_TARGET_LABELS,
} from './laundry.schema'

// ─── Services ──────────────────────────────────────────────
export {
  LaundryCustomerService,
  LaundryOrderService,
  LaundryInventoryService,
  LaundryPaymentService,
} from './laundry.service'

export type { LaundryBusinessConfig } from './laundry.service'
export { DEFAULT_LAUNDRY_CONFIG } from './laundry.service'

// ─── Policies ──────────────────────────────────────────────
export {
  LaundryCustomerPolicies,
  LaundryServicePolicies,
  LaundryOrderPolicies,
  LaundryPaymentPolicies,
  LaundryInventoryPolicies,
} from './laundry.policies'
