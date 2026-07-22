/**
 * ─── JournalEntryAggregate Tests ────────────────────────────
 * Verifies the double-entry accounting invariant.
 */

import { describe, it, expect } from 'vitest'
import { Money, DomainError } from '@repo/core'
import { JournalEntryAggregate } from '../journal.aggregate'

describe('JournalEntryAggregate', () => {
  describe('double-entry invariant', () => {
    it('validates a balanced entry', () => {
      const entry = new JournalEntryAggregate('je-1', 't1', 'Loan disbursement')
      entry.addDebitLine('1100', Money.fromDecimal(10000), 'Loans Receivable')
      entry.addCreditLine('1000', Money.fromDecimal(10000), 'Cash on Hand')
      expect(entry.isBalanced).toBe(true)
      entry.validate() // should not throw
    })

    it('detects imbalance', () => {
      const entry = new JournalEntryAggregate('je-2', 't1')
      entry.addDebitLine('1100', Money.fromDecimal(10000))
      entry.addCreditLine('1000', Money.fromDecimal(9999))
      expect(entry.isBalanced).toBe(false)
      expect(entry.imbalance.toDecimal()).toBe(1)
      expect(() => entry.validate()).toThrow(DomainError)
    })

    it('requires at least 2 lines', () => {
      const entry = new JournalEntryAggregate('je-3', 't1')
      entry.addDebitLine('1100', Money.fromDecimal(100))
      expect(() => entry.validate()).toThrow(/at least 2 lines/)
    })

    it('rejects lines with both debit and credit', () => {
      const entry = new JournalEntryAggregate('je-4', 't1')
      // Add valid debit + credit to satisfy line count and balance checks
      entry.addDebitLine('1100', Money.fromDecimal(50), 'Asset')
      entry.addCreditLine('2000', Money.fromDecimal(50), 'Liability')
      // Now inject a third line with both debit AND credit via backdoor
      ;(entry as any)._lines.push({
        accountCode: '3000', accountName: 'Bad Line',
        debit: Money.fromDecimal(25), credit: Money.fromDecimal(25),
      })
      // Update totals to keep balance (each side +25)
      ;(entry as any)._totalDebit = Money.fromDecimal(75)
      ;(entry as any)._totalCredit = Money.fromDecimal(75)
      // Now validate should catch the both-sides line
      expect(() => entry.validate()).toThrow(/both debit.*and credit/)
    })

    it('rejects zero amount lines', () => {
      const entry = new JournalEntryAggregate('je-5', 't1')
      expect(() => entry.addDebitLine('1100', Money.zero())).toThrow(DomainError)
      expect(() => entry.addCreditLine('2000', Money.zero())).toThrow(DomainError)
    })

    it('supports multiple debit and credit lines', () => {
      const entry = new JournalEntryAggregate('je-6', 't1')
      entry.addDebitLine('1100', Money.fromDecimal(5000), 'Loan A')
      entry.addDebitLine('1110', Money.fromDecimal(5000), 'Loan B')
      entry.addCreditLine('1000', Money.fromDecimal(9000), 'Cash')
      entry.addCreditLine('4000', Money.fromDecimal(1000), 'Fee Income')
      expect(entry.isBalanced).toBe(true)
      entry.validate()
      expect(entry.lines).toHaveLength(4)
      expect(entry.totalDebit.toDecimal()).toBe(10000)
      expect(entry.totalCredit.toDecimal()).toBe(10000)
    })

    it('supports linked source entities', () => {
      const entry = new JournalEntryAggregate('je-7', 't1')
      entry.addSourceLine(
        { accountCode: '1100', accountName: 'Loan', debit: Money.fromDecimal(5000) },
        'loans', 'loan-123',
      )
      entry.addSourceLine(
        { accountCode: '1000', accountName: 'Cash', credit: Money.fromDecimal(5000) },
        'loans', 'loan-123',
      )
      expect(entry.isBalanced).toBe(true)
      entry.validate()
      expect(entry.lines[0]!.sourceTable).toBe('loans')
      expect(entry.lines[0]!.sourceId).toBe('loan-123')
    })

    it('tracks description and date', () => {
      const date = new Date('2026-07-18')
      const entry = new JournalEntryAggregate('je-8', 't1', 'Payment received', date)
      expect(entry.description).toBe('Payment received')
      expect(entry.entryDate).toEqual(date)
    })

    it('produces correct snapshot', () => {
      const entry = new JournalEntryAggregate('je-9', 't1')
      entry.addDebitLine('1100', Money.fromDecimal(1000), 'Asset')
      entry.addCreditLine('2000', Money.fromDecimal(1000), 'Liability')
      const snap = entry.toSnapshot()
      expect(snap.lines).toHaveLength(2)
      expect(snap.totalDebit).toBe(1000)
      expect(snap.totalCredit).toBe(1000)
      expect(snap.lines[0]!.debitAmount).toBe(1000)
      expect(snap.lines[1]!.creditAmount).toBe(1000)
    })
  })
})
