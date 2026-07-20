/**
 * ─── Laundry Service — Business Logic ─────────────────────────
 * Pure functions for laundry management business rules.
 * No I/O — all side effects handled by middleware pipeline.
 *
 * Metadata-driven features:
 *  - Loyalty point accrual rates (configurable per tenant)
 *  - Tier upgrade thresholds (configurable per tenant)
 *  - Express/Rush surcharge multipliers (configurable per tenant)
 *  - Branch-specific pricing overrides (resolved at runtime)
 */

import type {
  LaundryCustomer,
  LaundryOrder,
  LaundryOrderItem,
  LaundryService,
  CustomerTier,
  OrderPriority,
  LaundryInventory,
} from './laundry.schema'

// ─── Default Metadata-Driven Configuration ──────────────────
// These defaults are used when no tenant-specific metadata exists.
// The MetadataResolver overrides with tenant-specific values.

export interface LaundryBusinessConfig {
  /** Loyalty points earned per PHP 100 spent */
  loyaltyPointsRate: number          // default: 1 point per PHP 100
  /** Minimum points to redeem (and the PHP equivalent) */
  loyaltyRedemptionMinPoints: number // default: 500
  loyaltyRedemptionPHPEquivalent: number // default: PHP 50 per 100 points
  /** Tier upgrade lifetime spend thresholds (PHP) */
  tierThresholds: Record<CustomerTier, number>
  /** Express surcharge multiplier (e.g. 1.5 = 50% surcharge) */
  expressSurchargeMultiplier: number
  /** Rush surcharge multiplier */
  rushSurchargeMultiplier: number
  /** Default VAT rate (e.g. 0.12 for 12%) */
  vatRate: number
  /** Auto-compute tax for orders above this amount */
  vatThreshold: number
  /** Default turnaround hours per priority */
  turnaroundHours: Record<OrderPriority, number>
}

export const DEFAULT_LAUNDRY_CONFIG: LaundryBusinessConfig = {
  loyaltyPointsRate: 1,
  loyaltyRedemptionMinPoints: 500,
  loyaltyRedemptionPHPEquivalent: 50,
  tierThresholds: {
    bronze: 0,
    silver: 5000,
    gold: 20000,
    platinum: 50000,
  },
  expressSurchargeMultiplier: 1.5,
  rushSurchargeMultiplier: 2.0,
  vatRate: 0.12,
  vatThreshold: 500,
  turnaroundHours: {
    normal: 48,
    express: 24,
    rush: 6,
  },
}

export class LaundryCustomerService {
  /**
   * Generate customer code with tenant prefix
   * Pattern: LC-YYYYMM-NNNN
   */
  static generateCustomerCode(sequenceNumber: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `LC-${year}${month}-${seq}`
  }

  /**
   * Compute customer tier based on lifetime spend.
   * Metadata-driven: thresholds come from tenant config.
   */
  static computeTier(
    lifetimeSpend: number,
    thresholds: Record<CustomerTier, number> = DEFAULT_LAUNDRY_CONFIG.tierThresholds,
  ): CustomerTier {
    if (lifetimeSpend >= thresholds.platinum) return 'platinum'
    if (lifetimeSpend >= thresholds.gold) return 'gold'
    if (lifetimeSpend >= thresholds.silver) return 'silver'
    return 'bronze'
  }

  /**
   * Compute loyalty points earned from a given amount spent.
   * Formula: floor(amount / 100) * pointsRate
   */
  static computeLoyaltyPoints(
    amountSpent: number,
    pointsRate: number = DEFAULT_LAUNDRY_CONFIG.loyaltyPointsRate,
  ): number {
    return Math.floor(amountSpent / 100) * pointsRate
  }

  /**
   * Compute PHP equivalent of loyalty points for redemption.
   */
  static computeLoyaltyValue(
    points: number,
    phpPerPoints: number = DEFAULT_LAUNDRY_CONFIG.loyaltyRedemptionPHPEquivalent,
    minPoints: number = DEFAULT_LAUNDRY_CONFIG.loyaltyRedemptionMinPoints,
  ): number {
    if (points < minPoints) return 0
    return Math.floor(points / 100) * phpPerPoints
  }

  /**
   * Get tier-based discount rate (metadata-driven).
   */
  static getTierDiscount(tier: CustomerTier): number {
    const discounts: Record<CustomerTier, number> = {
      bronze: 0,
      silver: 0.05,   // 5%
      gold: 0.10,     // 10%
      platinum: 0.15, // 15%
    }
    return discounts[tier]
  }

  /**
   * Prepare customer data before create — normalize names
   */
  static prepareForCreate(input: Record<string, unknown>): Record<string, unknown> {
    const data = { ...input }
    if (typeof data.firstName === 'string') {
      data.firstName = data.firstName.trim()
    }
    if (typeof data.lastName === 'string') {
      data.lastName = data.lastName.trim()
    }
    if (!data.fullName && data.firstName && data.lastName) {
      data.fullName = `${data.firstName} ${data.lastName}`
    }
    if (!data.customerTier) data.customerTier = 'bronze'
    return data
  }
}

export class LaundryOrderService {
  /**
   * Generate order code
   * Pattern: LO-YYYYMMDD-NNNN
   */
  static generateOrderCode(sequenceNumber: number): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `LO-${datePart}-${seq}`
  }

  /**
   * Compute line totals for an array of order items.
   */
  static computeItemTotals(
    items: { quantity: number; unitPrice: number }[],
  ): { items: LaundryOrderItem[]; subtotal: number } {
    const computed = items.map((item) => ({
      ...item,
      lineTotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
    })) as LaundryOrderItem[]
    const subtotal = computed.reduce((sum, i) => sum + i.lineTotal, 0)
    return { items: computed, subtotal: Math.round(subtotal * 100) / 100 }
  }

  /**
   * Compute order priority surcharge.
   * Metadata-driven: multipliers come from tenant config.
   */
  static computePrioritySurcharge(
    subtotal: number,
    priority: OrderPriority,
    config: Pick<LaundryBusinessConfig, 'expressSurchargeMultiplier' | 'rushSurchargeMultiplier'> = DEFAULT_LAUNDRY_CONFIG,
  ): number {
    switch (priority) {
      case 'express':
        return Math.round(subtotal * (config.expressSurchargeMultiplier - 1) * 100) / 100
      case 'rush':
        return Math.round(subtotal * (config.rushSurchargeMultiplier - 1) * 100) / 100
      default:
        return 0
    }
  }

  /**
   * Compute VAT for an order if total exceeds threshold.
   */
  static computeVAT(
    amount: number,
    vatRate: number = DEFAULT_LAUNDRY_CONFIG.vatRate,
    vatThreshold: number = DEFAULT_LAUNDRY_CONFIG.vatThreshold,
  ): number {
    if (amount < vatThreshold) return 0
    return Math.round(amount * vatRate * 100) / 100
  }

  /**
   * Compute grand total: subtotal + priority surcharge + delivery fee + VAT - discount
   */
  static computeTotal(params: {
    subtotal: number
    prioritySurcharge: number
    deliveryFee: number
    vat: number
    discount: number
  }): number {
    const raw = params.subtotal + params.prioritySurcharge + params.deliveryFee + params.vat - params.discount
    return Math.max(0, Math.round(raw * 100) / 100)
  }

  /**
   * Compute balance after payment
   */
  static computeBalance(totalAmount: number, amountPaid: number): number {
    return Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100)
  }

  /**
   * Determine payment status from amounts
   */
  static computePaymentStatus(
    totalAmount: number,
    amountPaid: number,
  ): 'unpaid' | 'partial' | 'paid' {
    if (amountPaid <= 0) return 'unpaid'
    if (amountPaid >= totalAmount) return 'paid'
    return 'partial'
  }

  /**
   * Compute promised pickup date based on priority turnaround hours.
   */
  static computePromisedPickup(
    dropOffDate: string,
    priority: OrderPriority,
    turnaroundHours: Record<OrderPriority, number> = DEFAULT_LAUNDRY_CONFIG.turnaroundHours,
  ): { pickupDate: string; pickupTime: string } {
    const dropOff = new Date(dropOffDate + 'T00:00:00')
    const hoursToAdd = turnaroundHours[priority]
    const pickup = new Date(dropOff.getTime() + hoursToAdd * 60 * 60 * 1000)

    // Skip to next business day if pickup falls on Sunday
    if (pickup.getDay() === 0) {
      pickup.setDate(pickup.getDate() + 1)
    }

    const pickupDate = pickup.toISOString().slice(0, 10)
    const pickupTime = `${String(pickup.getHours()).padStart(2, '0')}:00`
    return { pickupDate, pickupTime }
  }

  /**
   * Check if an order is overdue (past promised pickup datetime).
   */
  static isOverdue(promisedPickupDate: string, promisedPickupTime: string): boolean {
    const promised = new Date(`${promisedPickupDate}T${promisedPickupTime}:00`)
    return promised < new Date()
  }

  /**
   * Format PHP currency
   */
  static formatPHP(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  }
}

export class LaundryInventoryService {
  /**
   * Generate item code
   * Pattern: LI-YYYYMM-NNNN
   */
  static generateItemCode(sequenceNumber: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `LI-${year}${month}-${seq}`
  }

  /**
   * Determine inventory status from quantity levels.
   */
  static computeStatus(
    quantityOnHand: number,
    minStockLevel: number,
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (quantityOnHand <= 0) return 'out_of_stock'
    if (quantityOnHand <= minStockLevel) return 'low_stock'
    return 'in_stock'
  }

  /**
   * Compute reorder recommendation.
   * Returns quantity to order and estimated cost.
   */
  static computeReorder(item: {
    quantityOnHand: number
    minStockLevel: number
    maxStockLevel: number
    costPerUnit: number
  }): { recommendReorder: boolean; orderQuantity: number; estimatedCost: number } {
    if (item.quantityOnHand > item.minStockLevel) {
      return { recommendReorder: false, orderQuantity: 0, estimatedCost: 0 }
    }
    const orderQuantity = item.maxStockLevel - item.quantityOnHand
    return {
      recommendReorder: true,
      orderQuantity,
      estimatedCost: Math.round(orderQuantity * item.costPerUnit * 100) / 100,
    }
  }

  /**
   * Consume inventory for an order (returns updated quantities).
   */
  static consume(
    items: { itemId: string; quantityConsumed: number }[],
    inventory: LaundryInventory[],
  ): Map<string, number> {
    const updated = new Map<string, number>()
    for (const consumed of items) {
      const item = inventory.find((i) => i.id === consumed.itemId)
      if (item) {
        updated.set(item.id, Math.max(0, item.quantityOnHand - consumed.quantityConsumed))
      }
    }
    return updated
  }

  /**
   * Get items that need reordering (at or below min stock level).
   */
  static getLowStockItems(inventory: LaundryInventory[]): LaundryInventory[] {
    return inventory.filter((i) => i.quantityOnHand <= i.minStockLevel && i.status !== 'discontinued')
  }
}

export class LaundryPaymentService {
  /**
   * Generate payment code
   * Pattern: LP-YYYYMMDD-NNNN
   */
  static generatePaymentCode(sequenceNumber: number): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `LP-${datePart}-${seq}`
  }

  /**
   * Validate loyalty point redemption.
   * Returns the maximum PHP value that can be redeemed with given points.
   */
  static validateLoyaltyRedemption(
    availablePoints: number,
    amountToRedeem: number,
    config: Pick<LaundryBusinessConfig, 'loyaltyRedemptionMinPoints' | 'loyaltyRedemptionPHPEquivalent'> = DEFAULT_LAUNDRY_CONFIG,
  ): { valid: boolean; pointsRequired: number; phpValue: number; reason?: string } {
    if (availablePoints < config.loyaltyRedemptionMinPoints) {
      return {
        valid: false,
        pointsRequired: 0,
        phpValue: 0,
        reason: `Minimum ${config.loyaltyRedemptionMinPoints} points required to redeem`,
      }
    }

    const maxRedeemablePHP = LaundryCustomerService.computeLoyaltyValue(
      availablePoints,
      config.loyaltyRedemptionPHPEquivalent,
      config.loyaltyRedemptionMinPoints,
    )

    const phpValue = Math.min(amountToRedeem, maxRedeemablePHP)
    const pointsRequired = Math.ceil(phpValue / config.loyaltyRedemptionPHPEquivalent) * 100

    if (pointsRequired > availablePoints) {
      return { valid: false, pointsRequired: 0, phpValue: 0, reason: 'Insufficient loyalty points' }
    }

    return { valid: true, pointsRequired, phpValue }
  }
}
