/**
 * ─── Loan Service Tests (Enhanced) ───────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { LoanService } from '../loan.service'
import type { Loan, Frequency } from '../loan.schema'

describe('LoanService', () => {
  describe('computeDiminishingAmortization', () => {
    it('should compute correct monthly payment for standard loan', () => {
      const result = LoanService.computeDiminishingAmortization(10000, 12, 12)
      expect(result.monthlyPayment).toBeGreaterThan(0)
      expect(result.totalAmount).toBeGreaterThan(10000)
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.schedule).toHaveLength(12)
    })

    it('should have decreasing interest over time', () => {
      const result = LoanService.computeDiminishingAmortization(10000, 12, 12)
      expect(result.schedule.length).toBeGreaterThan(0)
      const first = result.schedule[0]!
      const last = result.schedule[result.schedule.length - 1]!
      expect(last.interest).toBeLessThanOrEqual(first.interest)
    })

    it('should end with near-zero balance', () => {
      const result = LoanService.computeDiminishingAmortization(10000, 12, 12)
      const last = result.schedule[result.schedule.length - 1]
      expect(last?.balance).toBeLessThan(1)
    })

    it('should handle zero interest rate', () => {
      const result = LoanService.computeDiminishingAmortization(10000, 0, 12)
      expect(result.totalInterest).toBe(0)
      expect(result.totalAmount).toBe(10000)
      expect(result.monthlyPayment).toBeCloseTo(10000 / 12, 2)
      expect(result.schedule).toHaveLength(12)
    })

    it('should handle large loan amounts', () => {
      const result = LoanService.computeDiminishingAmortization(1000000, 12, 24)
      expect(result.monthlyPayment).toBeGreaterThan(0)
      expect(result.schedule).toHaveLength(24)
    })

    it('should handle short terms', () => {
      const result = LoanService.computeDiminishingAmortization(10000, 12, 1)
      expect(result.schedule).toHaveLength(1)
      expect(result.totalAmount).toBeGreaterThan(10000)
    })

    it('should handle very small loan amounts', () => {
      const result = LoanService.computeDiminishingAmortization(100, 12, 3)
      expect(result.monthlyPayment).toBeGreaterThan(0)
      expect(result.totalAmount).toBeGreaterThan(100)
    })

    it('should handle zero principal', () => {
      const result = LoanService.computeDiminishingAmortization(0, 12, 12)
      expect(result.totalAmount).toBe(0)
    })
  })

  describe('computeStraightAmortization', () => {
    it('should compute correct straight line amortization', () => {
      const result = LoanService.computeStraightAmortization(10000, 12, 12)
      expect(result.totalAmount).toBe(11200)
      expect(result.totalInterest).toBe(1200)
      expect(result.monthlyPayment).toBeCloseTo(11200 / 12, 2)
    })

    it('should handle zero interest', () => {
      const result = LoanService.computeStraightAmortization(10000, 0, 12)
      expect(result.totalInterest).toBe(0)
      expect(result.totalAmount).toBe(10000)
    })

    it('should handle large principal', () => {
      const result = LoanService.computeStraightAmortization(1000000, 12, 12)
      expect(result.totalInterest).toBe(120000)
      expect(result.totalAmount).toBe(1120000)
    })
  })

  describe('computeDPD', () => {
    it('should return 0 when not past due', () => {
      expect(LoanService.computeDPD(Date.now(), Date.now() + 86400000)).toBe(0)
    })
    it('should return positive days when past due', () => {
      const pastDue = Date.now() - 5 * 86400000
      expect(LoanService.computeDPD(undefined, pastDue)).toBe(5)
    })
    it('should return 0 when no next due date', () => {
      expect(LoanService.computeDPD(Date.now())).toBe(0)
    })
    it('should return 0 when last payment is recent', () => {
      const futureDue = Date.now() + 30 * 86400000
      expect(LoanService.computeDPD(Date.now(), futureDue)).toBe(0)
    })
  })

  describe('computeAgingBucket', () => {
    it('should return current for 0 DPD', () => expect(LoanService.computeAgingBucket(0)).toBe('current'))
    it('should return 1-30 for 15 DPD', () => expect(LoanService.computeAgingBucket(15)).toBe('1-30'))
    it('should return 31-60 for 45 DPD', () => expect(LoanService.computeAgingBucket(45)).toBe('31-60'))
    it('should return 61-90 for 75 DPD', () => expect(LoanService.computeAgingBucket(75)).toBe('61-90'))
    it('should return 91-180 for 120 DPD', () => expect(LoanService.computeAgingBucket(120)).toBe('91-180'))
    it('should return 180+ for 200 DPD', () => expect(LoanService.computeAgingBucket(200)).toBe('180+'))
  })

  describe('isDelinquent', () => {
    it('should be delinquent when dpd >= 1', () => {
      expect(LoanService.isDelinquent({ dpd: 5 } as Loan)).toBe(true)
    })
    it('should not be delinquent when dpd is 0', () => {
      expect(LoanService.isDelinquent({ dpd: 0 } as Loan)).toBe(false)
    })
    it('should not be delinquent when dpd undefined', () => {
      expect(LoanService.isDelinquent({} as Loan)).toBe(false)
    })
  })

  describe('computePenalty', () => {
    it('should compute late payment penalty', () => {
      expect(LoanService.computePenalty(1000, 10)).toBe(50)
    })
    it('should accept custom penalty rate', () => {
      expect(LoanService.computePenalty(1000, 10, 0.01)).toBe(100)
    })
    it('should return 0 for zero days late', () => {
      expect(LoanService.computePenalty(1000, 0)).toBe(0)
    })
  })

  describe('canApplyNewLoan', () => {
    it('should allow if no delinquent loans', () => {
      expect(LoanService.canApplyNewLoan([{ isDelinquent: false, status: 'active' } as Loan]).allowed).toBe(true)
    })
    it('should reject if has delinquent loans', () => {
      expect(LoanService.canApplyNewLoan([{ isDelinquent: true, status: 'active' } as Loan]).allowed).toBe(false)
    })
    it('should allow if only paid loans exist', () => {
      expect(LoanService.canApplyNewLoan([{ isDelinquent: true, status: 'paid' } as Loan]).allowed).toBe(true)
    })
    it('should allow if no loans exist', () => {
      expect(LoanService.canApplyNewLoan([]).allowed).toBe(true)
    })
  })

  describe('computeLoanFees', () => {
    it('should compute percentage-based processing fee', () => {
      expect(LoanService.computeLoanFees(10000, { defaultProcessingFeeRate: 2 }).processingFee).toBe(200)
    })
    it('should use flat fee when no rate given', () => {
      expect(LoanService.computeLoanFees(10000, { defaultProcessingFeeFlat: 150 }).processingFee).toBe(150)
    })
    it('should apply higher notarial fee above threshold', () => {
      const fees = LoanService.computeLoanFees(50000, { defaultNotarialFee: 100, notarialFeeThreshold: 30000, notarialFeeAboveThreshold: 200 })
      expect(fees.notarialFee).toBe(200)
    })
    it('should use default notarial fee below threshold', () => {
      const fees = LoanService.computeLoanFees(20000, { defaultNotarialFee: 100, notarialFeeThreshold: 30000, notarialFeeAboveThreshold: 200 })
      expect(fees.notarialFee).toBe(100)
    })
  })

  describe('getIntervalMs', () => {
    it('should return correct intervals', () => {
      expect(LoanService.getIntervalMs('daily')).toBe(86400000)
      expect(LoanService.getIntervalMs('weekly')).toBe(7 * 86400000)
      expect(LoanService.getIntervalMs('monthly')).toBe(30 * 86400000)
      expect(LoanService.getIntervalMs('annual')).toBe(365 * 86400000)
    })
    it('should handle all frequency types', () => {
      const freqs: Frequency[] = ['daily', 'weekly', 'semi_monthly', 'monthly', 'quarterly', 'semi_annual', 'annual']
      freqs.forEach(f => {
        expect(LoanService.getIntervalMs(f)).toBeGreaterThan(0)
      })
    })
  })
})
