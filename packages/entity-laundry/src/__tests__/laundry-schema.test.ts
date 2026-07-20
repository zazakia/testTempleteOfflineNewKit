/**
 * ─── Laundry Schema Tests ────────────────────────────────────
 * Validates all Zod schemas for the laundry module.
 */

import { describe, it, expect } from 'vitest'
import {
  CreateLaundryCustomerSchema, UpdateLaundryCustomerSchema,
  CreateLaundryServiceSchema, CreateLaundryOrderSchema, OrderItemSchema,
  CreateLaundryPaymentSchema, CreateLaundryInventorySchema,
  CreatePromoCodeSchema,
  CustomerTypeSchema, CustomerTierSchema, ServiceCategorySchema,
  PricingUnitSchema,
  LaundryPaymentMethodSchema, InventoryCategorySchema,
  PromoTypeSchema, PromoStatusSchema, PromoTargetSchema,
} from '../laundry.schema'

describe('Laundry Customer Schema', () => {
  it('validates a valid customer creation', () => {
    const input = {
      tenantId: 't1', customerCode: 'LC-202607-0001',
      firstName: 'Juan', lastName: 'Dela Cruz', fullName: 'Juan Dela Cruz',
      phone: '09123456789', customerType: 'regular', customerTier: 'bronze',
      lifetimeSpend: 0, loyaltyPoints: 0, status: 'active',
    }
    const result = CreateLaundryCustomerSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejects missing required fields', () => {
    expect(CreateLaundryCustomerSchema.safeParse({}).success).toBe(false)
  })

  it('accepts optional fields', () => {
    const input = {
      tenantId: 't1', customerCode: 'LC-01', firstName: 'Maria', lastName: 'Santos',
      fullName: 'Maria Santos', phone: '09187654321', email: 'maria@test.com',
      address: '123 Rizal', barangay: 'Poblacion', city: 'Manila', province: 'NCR',
      customerType: 'corporate', customerTier: 'gold', lifetimeSpend: 25000, loyaltyPoints: 500,
      preferences: 'gentle cycle', deliveryAddress: '456 Ayala',
      firstVisitDate: '2026-01-15', lastOrderDate: '2026-07-01', status: 'active',
    }
    expect(CreateLaundryCustomerSchema.safeParse(input).success).toBe(true)
  })

  it('validates customer type enum', () => {
    expect(CustomerTypeSchema.safeParse('walk_in').success).toBe(true)
    expect(CustomerTypeSchema.safeParse('regular').success).toBe(true)
    expect(CustomerTypeSchema.safeParse('corporate').success).toBe(true)
    expect(CustomerTypeSchema.safeParse('invalid').success).toBe(false)
  })

  it('validates customer tier enum', () => {
    expect(CustomerTierSchema.safeParse('bronze').success).toBe(true)
    expect(CustomerTierSchema.safeParse('platinum').success).toBe(true)
    expect(CustomerTierSchema.safeParse('diamond').success).toBe(false)
  })

  it('requires version on update', () => {
    expect(UpdateLaundryCustomerSchema.safeParse({ firstName: 'Test' }).success).toBe(false)
    expect(UpdateLaundryCustomerSchema.safeParse({ version: 1, firstName: 'Test' }).success).toBe(true)
  })
})

describe('Laundry Service Schema', () => {
  it('validates a valid service', () => {
    const input = {
      tenantId: 't1', serviceCode: 'WD-01', name: 'Wash & Dry Regular',
      category: 'wash_dry', pricingUnit: 'per_kg', basePrice: 80,
      turnaroundHours: 48, status: 'active',
    }
    expect(CreateLaundryServiceSchema.safeParse(input).success).toBe(true)
  })

  it('validates all service categories', () => {
    const cats = ['wash_dry', 'dry_clean', 'iron', 'fold', 'stain_removal', 'leather_care', 'shoe_clean', 'carpet', 'curtain', 'other']
    for (const cat of cats) {
      expect(ServiceCategorySchema.safeParse(cat).success).toBe(true)
    }
  })

  it('validates pricing units', () => {
    expect(PricingUnitSchema.safeParse('per_kg').success).toBe(true)
    expect(PricingUnitSchema.safeParse('per_piece').success).toBe(true)
    expect(PricingUnitSchema.safeParse('per_set').success).toBe(true)
    expect(PricingUnitSchema.safeParse('per_hour').success).toBe(false)
  })

  it('enforces minimum turnaround hours', () => {
    const input = { tenantId: 't1', serviceCode: 'T1', name: 'Test', category: 'other', pricingUnit: 'flat_rate', basePrice: 100, turnaroundHours: 0 }
    expect(CreateLaundryServiceSchema.safeParse(input).success).toBe(false)
  })
})

describe('Laundry Order Schema', () => {
  it('validates order with items', () => {
    const input = {
      tenantId: 't1', orderCode: 'LO-20260718-0001', customerId: 'c1',
      customerName: 'Juan', orderDate: '2026-07-18', dropOffTime: '14:00',
      promisedPickupDate: '2026-07-20', promisedPickupTime: '14:00',
      items: [{ serviceId: 's1', serviceName: 'Wash & Dry', quantity: 2.5, unitPrice: 80, lineTotal: 200 }],
      subtotal: 200, totalAmount: 200, amountPaid: 0, balance: 200,
      paymentStatus: 'unpaid', orderStatus: 'dropped_off', orderPriority: 'normal',
      receivedBy: 'staff', isDelivery: false, deliveryFee: 0,
    }
    expect(CreateLaundryOrderSchema.safeParse(input).success).toBe(true)
  })

  it('requires at least one item', () => {
    const input = { tenantId: 't1', orderCode: 'LO-01', customerId: 'c1', customerName: 'Test', orderDate: '2026-07-18', dropOffTime: '14:00', promisedPickupDate: '2026-07-20', promisedPickupTime: '14:00', items: [], subtotal: 0, totalAmount: 0, amountPaid: 0, balance: 0, paymentStatus: 'unpaid', orderStatus: 'dropped_off', orderPriority: 'normal', receivedBy: 'staff', isDelivery: false, deliveryFee: 0 }
    expect(CreateLaundryOrderSchema.safeParse(input).success).toBe(false)
  })

  it('validates item schema', () => {
    expect(OrderItemSchema.safeParse({ serviceId: 's1', serviceName: 'Test', quantity: 1, unitPrice: 50, lineTotal: 50 }).success).toBe(true)
    expect(OrderItemSchema.safeParse({ serviceId: '', serviceName: '', quantity: 0, unitPrice: 0, lineTotal: 0 }).success).toBe(false)
  })

  it('validates order status via order creation', () => {
    const base = { tenantId: 't1', orderCode: 'LO-01', customerId: 'c1', customerName: 'Test', orderDate: '2026-07-18', dropOffTime: '14:00', promisedPickupDate: '2026-07-20', promisedPickupTime: '14:00', items: [{ serviceId: 's1', serviceName: 'Wash', quantity: 1, unitPrice: 80, lineTotal: 80 }], subtotal: 80, totalAmount: 80, amountPaid: 0, balance: 80, paymentStatus: 'unpaid' as const, orderPriority: 'normal' as const, receivedBy: 'staff', isDelivery: false, deliveryFee: 0 }
    expect(CreateLaundryOrderSchema.safeParse({ ...base, orderStatus: 'dropped_off' }).success).toBe(true)
    expect(CreateLaundryOrderSchema.safeParse({ ...base, orderStatus: 'shipped' }).success).toBe(false)
  })

  it('validates order priority via order creation', () => {
    const base = { tenantId: 't1', orderCode: 'LO-02', customerId: 'c1', customerName: 'Test', orderDate: '2026-07-18', dropOffTime: '14:00', promisedPickupDate: '2026-07-20', promisedPickupTime: '14:00', items: [{ serviceId: 's1', serviceName: 'Wash', quantity: 1, unitPrice: 80, lineTotal: 80 }], subtotal: 80, totalAmount: 80, amountPaid: 0, balance: 80, paymentStatus: 'unpaid' as const, orderStatus: 'dropped_off' as const, receivedBy: 'staff', isDelivery: false, deliveryFee: 0 }
    expect(CreateLaundryOrderSchema.safeParse({ ...base, orderPriority: 'normal' }).success).toBe(true)
    expect(CreateLaundryOrderSchema.safeParse({ ...base, orderPriority: 'rush' }).success).toBe(true)
  })
})

describe('Laundry Payment Schema', () => {
  it('validates payment', () => {
    const input = { tenantId: 't1', paymentCode: 'LP-01', orderId: 'o1', customerId: 'c1', paymentDate: '2026-07-18', paymentTime: '15:00', amount: 200, paymentMethod: 'cash', loyaltyPointsRedeemed: 0, loyaltyPointsEarned: 2, receivedBy: 'staff' }
    expect(CreateLaundryPaymentSchema.safeParse(input).success).toBe(true)
  })

  it('validates all payment methods', () => {
    const methods = ['cash', 'gcash', 'maya', 'bank_transfer', 'card', 'loyalty_points']
    for (const m of methods) expect(LaundryPaymentMethodSchema.safeParse(m).success).toBe(true)
  })
})

describe('Laundry Inventory Schema', () => {
  it('validates inventory item', () => {
    const input = { tenantId: 't1', itemCode: 'LI-01', name: 'Detergent', category: 'detergent', unit: 'liter', quantityOnHand: 20, minStockLevel: 5, maxStockLevel: 100, costPerUnit: 150, status: 'in_stock' }
    expect(CreateLaundryInventorySchema.safeParse(input).success).toBe(true)
  })

  it('validates inventory categories', () => {
    const cats = ['detergent', 'softener', 'bleach', 'stain_remover', 'packaging', 'hanger', 'tag', 'other']
    for (const c of cats) expect(InventoryCategorySchema.safeParse(c).success).toBe(true)
  })
})

describe('Promo Code Schema', () => {
  it('validates a discount promo', () => {
    const now = Date.now()
    const input = { tenantId: 't1', code: 'SUMMER20', name: 'Summer Sale', promoType: 'discount_percent', value: 20, minOrderAmount: 100, target: 'all_customers', maxUses: 100, currentUses: 0, maxUsesPerCustomer: 1, startsAt: now, endsAt: now + 86400000 * 30 }
    expect(CreatePromoCodeSchema.safeParse(input).success).toBe(true)
  })

  it('validates free_item promo type', () => {
    const now = Date.now()
    const input = { tenantId: 't1', code: '10PLUS1', name: 'Buy 10 Get 1', promoType: 'free_item', value: 0, minOrderAmount: 0, target: 'all_customers', maxUses: 500, currentUses: 0, maxUsesPerCustomer: 5, freeItemThreshold: 10, freeItemCount: 1, startsAt: now, endsAt: now + 86400000 * 30 }
    expect(CreatePromoCodeSchema.safeParse(input).success).toBe(true)
  })

  it('rejects lowercase code', () => {
    const now = Date.now()
    expect(CreatePromoCodeSchema.safeParse({ tenantId: 't1', code: 'summer20', name: 'Test', promoType: 'discount_percent', value: 10, maxUses: 100, currentUses: 0, maxUsesPerCustomer: 1, startsAt: now, endsAt: now + 86400000 }).success).toBe(false)
  })

  it('validates branchIds optional field', () => {
    const now = Date.now()
    expect(CreatePromoCodeSchema.safeParse({ tenantId: 't1', code: 'BRANCH', name: 'Branch Only', promoType: 'discount_percent', value: 15, maxUses: 50, currentUses: 0, maxUsesPerCustomer: 1, branchIds: ['b1', 'b2'], startsAt: now, endsAt: now + 86400000 }).success).toBe(true)
  })

  it('validates promo types', () => {
    expect(PromoTypeSchema.safeParse('free_item').success).toBe(true)
    expect(PromoTypeSchema.safeParse('discount_percent').success).toBe(true)
    expect(PromoTypeSchema.safeParse('invalid').success).toBe(false)
  })

  it('validates promo statuses', () => {
    expect(PromoStatusSchema.safeParse('active').success).toBe(true)
    expect(PromoStatusSchema.safeParse('scheduled').success).toBe(true)
    expect(PromoStatusSchema.safeParse('expired').success).toBe(true)
    expect(PromoStatusSchema.safeParse('deleted').success).toBe(false)
  })
})
