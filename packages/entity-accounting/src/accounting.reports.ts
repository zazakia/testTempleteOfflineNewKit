/**
 * ─── Accounting Reports ──────────────────────────────────────
 * Financial statement generators for Philippine cooperatives.
 * CDA-compliant: Trial Balance, Income Statement, Balance Sheet.
 */

import type { ChartOfAccount, JournalEntryLine, JournalEntry } from './accounting.schema'
import { AccountingService } from './accounting.service'

export interface TrialBalanceRow {
  code: string
  name: string
  accountType: string
  debit: number
  credit: number
  balance: number
}

export interface IncomeStatementRow {
  code: string
  name: string
  amount: number
  type: 'income' | 'expense'
}

export interface BalanceSheetRow {
  code: string
  name: string
  amount: number
  category: 'asset' | 'liability' | 'equity'
}

export class ReportGenerator {
  /**
   * Generate a trial balance from journal entry lines.
   */
  static generateTrialBalance(
    accounts: ChartOfAccount[],
    lines: JournalEntryLine[],
  ): TrialBalanceRow[] {
    return AccountingService.computeTrialBalance(accounts, lines).map(r => {
      const account = accounts.find(a => a.code === r.code)
      return {
        ...r,
        accountType: account?.accountType ?? '',
      }
    })
  }

  /**
   * Generate Income Statement (CDA format).
   */
  static generateIncomeStatement(
    accounts: ChartOfAccount[],
    lines: JournalEntryLine[],
    period?: { start: number; end: number },
  ): { revenue: IncomeStatementRow[]; expenses: IncomeStatementRow[]; netSurplus: number } {
    const filtered = period
      ? lines.filter(l => {
          const entry = (l as any)._entryDate
          return entry >= period.start && entry <= period.end
        })
      : lines

    const trialBalance = this.generateTrialBalance(accounts, filtered)

    const revenue = trialBalance
      .filter(r => r.accountType === 'income')
      .map(r => ({ code: r.code, name: r.name, amount: r.balance, type: 'income' as const }))
      .filter(r => r.amount !== 0)

    const expenses = trialBalance
      .filter(r => r.accountType === 'expense')
      .map(r => ({ code: r.code, name: r.name, amount: r.balance, type: 'expense' as const }))
      .filter(r => r.amount !== 0)

    const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0)
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0)

    return { revenue, expenses, netSurplus: totalRevenue - totalExpenses }
  }

  /**
   * Generate Balance Sheet.
   */
  static generateBalanceSheet(
    accounts: ChartOfAccount[],
    lines: JournalEntryLine[],
  ): { assets: BalanceSheetRow[]; liabilities: BalanceSheetRow[]; equity: BalanceSheetRow[] } {
    const trialBalance = this.generateTrialBalance(accounts, lines)

    const assets = trialBalance
      .filter(r => r.accountType === 'asset')
      .map(r => ({ code: r.code, name: r.name, amount: Math.abs(r.balance), category: 'asset' as const }))
      .filter(r => r.amount !== 0)

    const liabilities = trialBalance
      .filter(r => r.accountType === 'liability')
      .map(r => ({ code: r.code, name: r.name, amount: Math.abs(r.balance), category: 'liability' as const }))
      .filter(r => r.amount !== 0)

    const equity = trialBalance
      .filter(r => r.accountType === 'equity')
      .map(r => ({ code: r.code, name: r.name, amount: Math.abs(r.balance), category: 'equity' as const }))
      .filter(r => r.amount !== 0)

    return { assets, liabilities, equity }
  }

  /**
   * CDA-mandated statutory fund allocation computation.
   */
  static computeStatutoryAllocations(netSurplus: number): Array<{ fundType: string; percentage: number; amount: number }> {
    return [
      { fundType: 'Reserve Fund', percentage: 10, amount: Math.round(netSurplus * 0.10 * 100) / 100 },
      { fundType: 'Education and Training Fund', percentage: 10, amount: Math.round(netSurplus * 0.10 * 100) / 100 },
      { fundType: 'Community Development Fund', percentage: 3, amount: Math.round(netSurplus * 0.03 * 100) / 100 },
      { fundType: 'Optional Fund', percentage: 7, amount: Math.round(netSurplus * 0.07 * 100) / 100 },
    ]
  }

  /**
   * Compute patronage refund and interest on capital.
   */
  static computeBenefitDistribution(
    netSurplus: number,
    totalStatutoryFunds: number,
    memberTransactionVolume: number,
    totalTransactionVolume: number,
    totalShareCapital: number,
  ): { patronageRefundPool: number; patronageRefundRate: number; interestOnCapitalPool: number; interestRate: number } {
    const distributable = netSurplus - totalStatutoryFunds
    const patronagePool = distributable * 0.70 // 70% for patronage refund
    const interestPool = distributable * 0.30  // 30% for interest on capital

    return {
      patronageRefundPool: Math.round(patronagePool * 100) / 100,
      patronageRefundRate: totalTransactionVolume > 0 ? patronagePool / totalTransactionVolume : 0,
      interestOnCapitalPool: Math.round(interestPool * 100) / 100,
      interestRate: totalShareCapital > 0 ? (interestPool / totalShareCapital) * 100 : 0,
    }
  }
}
