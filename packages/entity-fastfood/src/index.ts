/**
 * ─── Entity Fast Food — Barrel Export ──────────────────────
 * Crispy King fast food service module with multi-branch support.
 *
 * Importing this module auto-registers 5 entities:
 *  - ck_menu_items    — Food/drink product catalog
 *  - ck_orders        — Customer orders (dine-in, takeout, delivery)
 *  - ck_order_items   — Line items within an order
 *  - ck_inventory     — Branch-level ingredient/stock tracking
 *  - ck_daily_sales   — End-of-day per-branch sales summary
 */

// Self-register all entities
export {
  MenuItemEntity,
  OrderEntity,
  OrderItemEntity,
  InventoryItemEntity,
  DailySalesEntity,
} from './fastfood.entity'

// Types
export type {
  MenuItem, MenuCategory, MenuItemStatus,
  Order, OrderType, OrderStatus, PaymentMethod,
  OrderItem,
  InventoryItem, InventoryUnit, InventoryStatus,
  DailySales,
} from './fastfood.schema'

// Schemas
export {
  MenuCategorySchema, MenuItemStatusSchema,
  CreateMenuItemSchema, UpdateMenuItemSchema,
  MENU_CATEGORY_LABELS, MENU_STATUS_LABELS,

  OrderTypeSchema, OrderStatusSchema, PaymentMethodSchema,
  CreateOrderSchema, UpdateOrderSchema,
  ORDER_TYPE_LABELS, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS,

  CreateOrderItemSchema, UpdateOrderItemSchema,

  InventoryUnitSchema, InventoryStatusSchema,
  CreateInventoryItemSchema, UpdateInventoryItemSchema,
  INVENTORY_STATUS_LABELS,

  CreateDailySalesSchema,
} from './fastfood.schema'

// Business logic
export { FastFoodService } from './fastfood.service'
