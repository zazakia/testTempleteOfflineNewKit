/**
 * ─── Savings Service Tests ───────────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { SavingsService } from '../savings.service'

describe('SavingsService', () => {
  describe('computeNewBalance', () => {
    const account = { id: 'a1', memberId: 'm1', accountType: 'regular' as const, accountNumber: 'SAV-001', balance: 10000, interestRate: 3, status: 'active' as const, openedDate: Date.now(), tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' }

    it('should add deposit amount', () => {
      expect(SavingsService.computeNewBalance(account, { type: 'deposit', amount: 5000 })).toBe(15000)
    })

    it('should subtract withdrawal amount', () => {
      expect(SavingsService.computeNewBalance(account, { type: 'withdrawal', amount: 3000 })).toBe(7000)
    })

    it('should add interest', () => {
      expect(SavingsService.computeNewBalance(account, { type: 'interest', amount: 250 })).toBe(10250)
    })

    it('should handle adjustment as absolute', () => {
      expect(SavingsService.computeNewBalance(account, { type: 'adjustment', amount: 5000 })).toBe(5000)
    })
  })

  describe('canWithdraw', () => {
    const activeAccount = { id: 'a1', memberId: 'm1', accountType: 'regular' as const, accountNumber: 'SAV-001', balance: 10000, interestRate: 3, status: 'active' as const, openedDate: Date.now(), tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' }
    const closedAccount = { ...activeAccount, status: 'closed' as const }

    it('should allow withdrawal with sufficient balance', () => {
      expect(SavingsService.canWithdraw(activeAccount, 5000).allowed).toBe(true)
    })

    it('should reject withdrawal exceeding balance', () => {
      expect(SavingsService.canWithdraw(activeAccount, 20000).allowed).toBe(false)
    })

    it('should reject withdrawal from closed account', () => {
      expect(SavingsService.canWithdraw(closedAccount, 1000).allowed).toBe(false)
    })
  })

  describe('computeInterest', () => {
    const account = { id: 'a1', memberId: 'm1', accountType: 'regular' as const, accountNumber: 'SAV-001', balance: 100000, interestRate: 3, status: 'active' as const, openedDate: Date.now(), tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' }

    it('should compute monthly interest', () => {
      const interest = SavingsService.computeInterest(account, 30)
      expect(interest).toBeCloseTo(246.58, 0) // 100000 * 3%/365 * 30
    })

    it('should compute annual interest', () => {
      const interest = SavingsService.computeInterest(account, 365)
      expect(interest).toBeCloseTo(3000, 0) // 100000 * 3%
    })

    it('should return 0 for zero balance', () => {
      const zeroAccount = { ...account, balance: 0 }
      expect(SavingsService.computeInterest(zeroAccount, 30)).toBe(0)
    })
  })
})
