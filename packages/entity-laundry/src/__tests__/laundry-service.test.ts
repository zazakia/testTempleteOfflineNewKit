/**
 * ─── Laundry Service Logic Tests ─────────────────────────────
 * Validates business rules: loyalty, pricing, order computation,
 * inventory management, promo code logic.
 */

import { describe, it, expect } from 'vitest'
import {
  LaundryCustomerService,
  LaundryOrderService,
  LaundryInventoryService,
  LaundryPaymentService,
  DEFAULT_LAUNDRY_CONFIG,
} from '../laundry.service'
import type { LaundryInventory, LaundryOrderItem } from '../laundry.schema'

describe('LaundryCustomerService', () => {
  describe('generateCustomerCode', () => {
    it('generates code in correct format', () => {
      const code = LaundryCustomerService.generateCustomerCode(42)
      expect(code).toMatch(/^LC-\d{6}-0042$/)
    })
  })

  describe('computeTier', () => {
    it('returns bronze for low spend', () => {
      expect(LaundryCustomerService.computeTier(1000)).toBe('bronze')
    })
    it('returns silver at threshold', () => {
      expect(LaundryCustomerService.computeTier(5000)).toBe('silver')
    })
    it('returns gold at threshold', () => {
      expect(LaundryCustomerService.computeTier(20000)).toBe('gold')
    })
    it('returns platinum at threshold', () => {
      expect(LaundryCustomerService.computeTier(50000)).toBe('platinum')
    })
    it('handles exact boundary', () => {
      expect(LaundryCustomerService.computeTier(4999)).toBe('bronze')
      expect(LaundryCustomerService.computeTier(5000)).toBe('silver')
    })
  })

  describe('computeLoyaltyPoints', () => {
    it('gives 1 point per 100 PHP', () => {
      expect(LaundryCustomerService.computeLoyaltyPoints(500)).toBe(5)
    })
    it('floors at 99', () => {
      expect(LaundryCustomerService.computeLoyaltyPoints(99)).toBe(0)
    })
    it('handles custom rate', () => {
      expect(LaundryCustomerService.computeLoyaltyPoints(100, 2)).toBe(2)
    })
  })

  describe('computeLoyaltyValue', () => {
    it('returns 0 below minimum points', () => {
      expect(LaundryCustomerService.computeLoyaltyValue(400)).toBe(0)
    })
    it('computes PHP value', () => {
      expect(LaundryCustomerService.computeLoyaltyValue(500)).toBe(250)
    })
  })

  describe('getTierDiscount', () => {
    it('bronze gets 0%', () => expect(LaundryCustomerService.getTierDiscount('bronze')).toBe(0))
    it('silver gets 5%', () => expect(LaundryCustomerService.getTierDiscount('silver')).toBe(0.05))
    it('gold gets 10%', () => expect(LaundryCustomerService.getTierDiscount('gold')).toBe(0.10))
    it('platinum gets 15%', () => expect(LaundryCustomerService.getTierDiscount('platinum')).toBe(0.15))
  })
})

describe('LaundryOrderService', () => {
  describe('generateOrderCode', () => {
    it('generates code in correct format', () => {
      const code = LaundryOrderService.generateOrderCode(1)
      expect(code).toMatch(/^LO-\d{8}-0001$/)
    })
  })

  describe('computeItemTotals', () => {
    it('computes subtotal from items', () => {
      const items = [{ quantity: 2, unitPrice: 80 }, { quantity: 1.5, unitPrice: 100 }]
      const result = LaundryOrderService.computeItemTotals(items)
      expect(result.subtotal).toBe(310)
      expect(result.items).toHaveLength(2)
      expect(result.items[0]!.lineTotal).toBe(160)
      expect(result.items[1]!.lineTotal).toBe(150)
    })
  })

  describe('computePrioritySurcharge', () => {
    it('normal = no surcharge', () => {
      expect(LaundryOrderService.computePrioritySurcharge(100, 'normal')).toBe(0)
    })
    it('express = 50% surcharge', () => {
      expect(LaundryOrderService.computePrioritySurcharge(100, 'express')).toBe(50)
    })
    it('rush = 100% surcharge', () => {
      expect(LaundryOrderService.computePrioritySurcharge(100, 'rush')).toBe(100)
    })
  })

  describe('computeVAT', () => {
    it('no VAT below threshold', () => {
      expect(LaundryOrderService.computeVAT(400)).toBe(0)
    })
    it('12% VAT above threshold', () => {
      expect(LaundryOrderService.computeVAT(1000)).toBe(120)
    })
  })

  describe('computeTotal', () => {
    it('sums all components', () => {
      const total = LaundryOrderService.computeTotal({
        subtotal: 200, prioritySurcharge: 50, deliveryFee: 50, vat: 36, discount: 20,
      })
      expect(total).toBe(316)
    })
    it('never negative', () => {
      const total = LaundryOrderService.computeTotal({
        subtotal: 10, prioritySurcharge: 0, deliveryFee: 0, vat: 0, discount: 100,
      })
      expect(total).toBe(0)
    })
  })

  describe('computeBalance', () => {
    it('computes remaining balance', () => {
      expect(LaundryOrderService.computeBalance(500, 200)).toBe(300)
    })
    it('zero when fully paid', () => {
      expect(LaundryOrderService.computeBalance(500, 500)).toBe(0)
    })
    it('zero when overpaid', () => {
      expect(LaundryOrderService.computeBalance(500, 600)).toBe(0)
    })
  })

  describe('computePaymentStatus', () => {
    it('unpaid when nothing paid', () => {
      expect(LaundryOrderService.computePaymentStatus(100, 0)).toBe('unpaid')
    })
    it('partial when some paid', () => {
      expect(LaundryOrderService.computePaymentStatus(100, 50)).toBe('partial')
    })
    it('paid when full', () => {
      expect(LaundryOrderService.computePaymentStatus(100, 100)).toBe('paid')
    })
  })

  describe('isOverdue', () => {
    it('detects overdue', () => {
      expect(LaundryOrderService.isOverdue('2020-01-01', '12:00')).toBe(true)
    })
    it('not overdue for future date', () => {
      expect(LaundryOrderService.isOverdue('2099-12-31', '12:00')).toBe(false)
    })
  })
})

describe('LaundryInventoryService', () => {
  describe('computeStatus', () => {
    it('out of stock at zero', () => {
      expect(LaundryInventoryService.computeStatus(0, 5)).toBe('out_of_stock')
    })
    it('low stock at or below min', () => {
      expect(LaundryInventoryService.computeStatus(5, 5)).toBe('low_stock')
      expect(LaundryInventoryService.computeStatus(3, 5)).toBe('low_stock')
    })
    it('in stock above min', () => {
      expect(LaundryInventoryService.computeStatus(10, 5)).toBe('in_stock')
    })
  })

  describe('computeReorder', () => {
    it('recommends reorder when low', () => {
      const item = { quantityOnHand: 3, minStockLevel: 5, maxStockLevel: 20, costPerUnit: 150 }
      const result = LaundryInventoryService.computeReorder(item)
      expect(result.recommendReorder).toBe(true)
      expect(result.orderQuantity).toBe(17)
      expect(result.estimatedCost).toBe(2550)
    })
    it('no reorder when sufficient', () => {
      const item = { quantityOnHand: 10, minStockLevel: 5, maxStockLevel: 20, costPerUnit: 150 }
      expect(LaundryInventoryService.computeReorder(item).recommendReorder).toBe(false)
    })
  })

  describe('getLowStockItems', () => {
    it('finds items below reorder point', () => {
      const items: LaundryInventory[] = [
        { id: '1', name: 'A', quantityOnHand: 3, minStockLevel: 5, status: 'in_stock' } as LaundryInventory,
        { id: '2', name: 'B', quantityOnHand: 10, minStockLevel: 5, status: 'in_stock' } as LaundryInventory,
        { id: '3', name: 'C', quantityOnHand: 0, minStockLevel: 5, status: 'discontinued' } as LaundryInventory,
      ]
      const low = LaundryInventoryService.getLowStockItems(items)
      expect(low).toHaveLength(1)
      expect(low[0]!.name).toBe('A')
    })
  })
})
