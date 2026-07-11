import { describe, it, expect } from 'vitest'
import { ShareCapitalService } from '../share-capital.service'
import type { ShareCapitalTransaction } from '../share-capital.schema'

describe('ShareCapitalService', () => {
  describe('computeTotalShares', () => {
    it('should compute total from transactions', () => {
      const txns: ShareCapitalTransaction[] = [
        { memberId: 'm1', transactionType: 'subscription', shareType: 'common', numberOfShares: 10, parValue: 100, amount: 1000, date: Date.now(), id: '1', createdAt: 0, updatedAt: 0, deletedAt: null },
        { memberId: 'm1', transactionType: 'payment', shareType: 'common', numberOfShares: 5, parValue: 100, amount: 500, date: Date.now(), id: '2', createdAt: 0, updatedAt: 0, deletedAt: null },
      ] as any[]
      const result = ShareCapitalService.computeTotalShares(txns)
      expect(result.totalShares).toBe(15)
      expect(result.totalAmount).toBe(1500)
      expect(result.parValue).toBe(100)
    })

    it('should handle refunds', () => {
      const txns: ShareCapitalTransaction[] = [
        { memberId: 'm1', transactionType: 'subscription', numberOfShares: 10, amount: 1000, date: Date.now(), id: '1' },
        { memberId: 'm1', transactionType: 'refund', numberOfShares: 2, amount: 200, date: Date.now(), id: '2' },
      ] as any[]
      const result = ShareCapitalService.computeTotalShares(txns)
      expect(result.totalShares).toBe(8)
      expect(result.totalAmount).toBe(800)
    })

    it('should return zero for empty transactions', () => {
      const result = ShareCapitalService.computeTotalShares([])
      expect(result.totalShares).toBe(0)
      expect(result.totalAmount).toBe(0)
    })
  })

  describe('computeDividend', () => {
    it('should compute dividend correctly', () => {
      expect(ShareCapitalService.computeDividend(100, 100, 0.05)).toBe(500) // 100 shares * ₱100 * 5%
    })
    it('should return 0 for zero shares', () => {
      expect(ShareCapitalService.computeDividend(0, 100, 0.05)).toBe(0)
    })
  })

  describe('computePatronageRefund', () => {
    it('should compute patronage refund proportionally', () => {
      const refund = ShareCapitalService.computePatronageRefund(50000, 500000, 100000, 0.30)
      expect(refund).toBe(3000) // 50000/500000 * 100000 * 0.30
    })
    it('should return 0 for zero transaction volume', () => {
      expect(ShareCapitalService.computePatronageRefund(0, 0, 100000, 0.30)).toBe(0)
    })
  })

  describe('isMinimumSubscriptionMet', () => {
    it('should check minimum capital requirement', () => {
      expect(ShareCapitalService.isMinimumSubscriptionMet(1000)).toBe(true)
      expect(ShareCapitalService.isMinimumSubscriptionMet(500)).toBe(false)
    })
    it('should accept custom minimum', () => {
      expect(ShareCapitalService.isMinimumSubscriptionMet(500, 500)).toBe(true)
    })
  })
})
