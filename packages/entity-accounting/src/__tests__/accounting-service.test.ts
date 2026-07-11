/**
 * ─── Accounting Service Tests (Enhanced) ─────────────────────
 */

import { describe, it, expect } from 'vitest'
import { AccountingService } from '../accounting.service'
import { ReportGenerator } from '../accounting.reports'
import type { ChartOfAccount, JournalEntryLine } from '../accounting.schema'

describe('AccountingService', () => {
  describe('validateJournalEntry', () => {
    it('should validate balanced entry', () => {
      expect(AccountingService.validateJournalEntry([
        { debitAmount: 100, creditAmount: 0 },
        { debitAmount: 0, creditAmount: 100 },
      ]).valid).toBe(true)
    })

    it('should reject unbalanced entry', () => {
      const result = AccountingService.validateJournalEntry([
        { debitAmount: 100, creditAmount: 0 },
      ])
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Debits')
    })

    it('should reject zero amount entry', () => {
      expect(AccountingService.validateJournalEntry([
        { debitAmount: 0, creditAmount: 0 },
        { debitAmount: 0, creditAmount: 0 },
      ]).valid).toBe(false)
    })

    it('should handle multiple debits single credit', () => {
      expect(AccountingService.validateJournalEntry([
        { debitAmount: 300, creditAmount: 0 },
        { debitAmount: 200, creditAmount: 0 },
        { debitAmount: 0, creditAmount: 500 },
      ]).valid).toBe(true)
    })

    it('should handle multiple credits single debit', () => {
      expect(AccountingService.validateJournalEntry([
        { debitAmount: 1000, creditAmount: 0 },
        { debitAmount: 0, creditAmount: 600 },
        { debitAmount: 0, creditAmount: 400 },
      ]).valid).toBe(true)
    })

    it('should reject when only one side has entries', () => {
      expect(AccountingService.validateJournalEntry([
        { debitAmount: 500, creditAmount: 0 },
      ]).valid).toBe(false)
    })
  })

  describe('computeTrialBalance', () => {
    const accounts: ChartOfAccount[] = [
      { id: '1', code: '110', name: 'Cash', accountType: 'asset', normalBalance: 'debit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
      { id: '2', code: '310', name: 'Share Capital', accountType: 'equity', normalBalance: 'credit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
      { id: '3', code: '410', name: 'Interest Income', accountType: 'income', normalBalance: 'credit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
      { id: '4', code: '510', name: 'Salaries', accountType: 'expense', normalBalance: 'debit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
    ]

    const lines: JournalEntryLine[] = [
      { accountCode: '110', debitAmount: 10000, creditAmount: 0, journalEntryId: 'je1', id: 'l1', createdAt: 0, updatedAt: 0, deletedAt: null },
      { accountCode: '310', debitAmount: 0, creditAmount: 10000, journalEntryId: 'je1', id: 'l2', createdAt: 0, updatedAt: 0, deletedAt: null },
      { accountCode: '510', debitAmount: 3000, creditAmount: 0, journalEntryId: 'je2', id: 'l3', createdAt: 0, updatedAt: 0, deletedAt: null },
      { accountCode: '110', debitAmount: 0, creditAmount: 3000, journalEntryId: 'je2', id: 'l4', createdAt: 0, updatedAt: 0, deletedAt: null },
    ]

    it('should compute trial balance', () => {
      const tb = AccountingService.computeTrialBalance(accounts, lines)
      // All 4 accounts returned, 3 have non-zero entries
      const nonZero = tb.filter(r => Math.abs(r.debit) > 0.01 || Math.abs(r.credit) > 0.01)
      expect(nonZero).toHaveLength(3)
      const cash = tb.find(r => r.code === '110')
      expect(cash?.debit).toBe(10000)
      expect(cash?.credit).toBe(3000)
      expect(cash?.balance).toBe(7000) // asset has debit normal balance
    })

    it('should exclude header accounts', () => {
      const accountsWithHeader = [...accounts, { ...accounts[0]!, code: '100', name: 'ASSETS', isHeader: true }]
      const tb = AccountingService.computeTrialBalance(accountsWithHeader, lines)
      const header = tb.find(r => r.code === '100')
      expect(header).toBeUndefined()
    })
  })
})

describe('ReportGenerator', () => {
  const accounts: ChartOfAccount[] = [
    { id: '1', code: '110', name: 'Cash', accountType: 'asset', normalBalance: 'debit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
    { id: '2', code: '410', name: 'Interest Income', accountType: 'income', normalBalance: 'credit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
    { id: '3', code: '510', name: 'Salaries', accountType: 'expense', normalBalance: 'debit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
    { id: '4', code: '310', name: 'Share Capital', accountType: 'equity', normalBalance: 'credit', is_active: true, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' },
  ]

  const lines: JournalEntryLine[] = [
    { accountCode: '110', debitAmount: 5000, creditAmount: 0, journalEntryId: 'je1', id: 'l1', createdAt: 0, updatedAt: 0, deletedAt: null },
    { accountCode: '410', debitAmount: 0, creditAmount: 5000, journalEntryId: 'je1', id: 'l2', createdAt: 0, updatedAt: 0, deletedAt: null },
    { accountCode: '510', debitAmount: 2000, creditAmount: 0, journalEntryId: 'je2', id: 'l3', createdAt: 0, updatedAt: 0, deletedAt: null },
    { accountCode: '110', debitAmount: 0, creditAmount: 2000, journalEntryId: 'je2', id: 'l4', createdAt: 0, updatedAt: 0, deletedAt: null },
    { accountCode: '310', debitAmount: 0, creditAmount: 10000, journalEntryId: 'je3', id: 'l5', createdAt: 0, updatedAt: 0, deletedAt: null },
    { accountCode: '110', debitAmount: 10000, creditAmount: 0, journalEntryId: 'je3', id: 'l6', createdAt: 0, updatedAt: 0, deletedAt: null },
  ]

  it('should generate income statement with net surplus', () => {
    const result = ReportGenerator.generateIncomeStatement(accounts, lines)
    expect(result.revenue.length).toBeGreaterThan(0)
    expect(result.expenses.length).toBeGreaterThan(0)
    expect(result.netSurplus).toBe(3000) // 5000 income - 2000 expense
  })

  it('should generate balance sheet with all categories', () => {
    const result = ReportGenerator.generateBalanceSheet(accounts, lines)
    expect(result.assets.length).toBeGreaterThan(0) // Cash
    expect(result.equity.length).toBeGreaterThan(0) // Share Capital
  })

  it('should compute statutory allocations correctly', () => {
    const allocs = ReportGenerator.computeStatutoryAllocations(100000)
    expect(allocs.find(a => a.fundType === 'Reserve Fund')?.amount).toBe(10000)
    expect(allocs.find(a => a.fundType === 'Education and Training Fund')?.amount).toBe(10000)
    expect(allocs.find(a => a.fundType === 'Community Development Fund')?.amount).toBe(3000)
    expect(allocs.reduce((s, a) => s + a.percentage, 0)).toBe(30)
  })

  it('should compute benefit distribution', () => {
    const result = ReportGenerator.computeBenefitDistribution(100000, 23000, 50000, 500000, 100000)
    expect(result.patronageRefundPool).toBeGreaterThan(0)
    expect(result.interestOnCapitalPool).toBeGreaterThan(0)
    expect(result.patronageRefundRate).toBeGreaterThan(0)
  })

  it('should handle zero net surplus in statutory allocations', () => {
    const allocs = ReportGenerator.computeStatutoryAllocations(0)
    allocs.forEach(a => expect(a.amount).toBe(0))
  })
})
