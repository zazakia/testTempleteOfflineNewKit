import type { JournalEntry, JournalEntryLine, ChartOfAccount } from './accounting.schema'

export class AccountingService {
  static validateJournalEntry(lines: Array<{ debitAmount?: number; creditAmount?: number }>): { valid: boolean; reason?: string } {
    let totalDebit = 0
    let totalCredit = 0

    for (const line of lines) {
      totalDebit += line.debitAmount ?? 0
      totalCredit += line.creditAmount ?? 0
    }

    totalDebit = Math.round(totalDebit * 100) / 100
    totalCredit = Math.round(totalCredit * 100) / 100

    if (totalDebit !== totalCredit) {
      return { valid: false, reason: `Debits (${totalDebit}) must equal Credits (${totalCredit})` }
    }

    if (totalDebit === 0) {
      return { valid: false, reason: 'Journal entry cannot have zero amount' }
    }

    return { valid: true }
  }

  static computeTrialBalance(accounts: ChartOfAccount[], lines: JournalEntryLine[]): Array<{ code: string; name: string; debit: number; credit: number; balance: number }> {
    const balances = new Map<string, { debit: number; credit: number }>()

    for (const line of lines) {
      if (!balances.has(line.accountCode)) {
        balances.set(line.accountCode, { debit: 0, credit: 0 })
      }
      const b = balances.get(line.accountCode)!
      b.debit += line.debitAmount ?? 0
      b.credit += line.creditAmount ?? 0
    }

    return accounts
      .filter(a => !a.isHeader)
      .map(account => {
        const b = balances.get(account.code) ?? { debit: 0, credit: 0 }
        const balance = account.normalBalance === 'debit' ? b.debit - b.credit : b.credit - b.debit
        return {
          code: account.code,
          name: account.name,
          debit: Math.round(b.debit * 100) / 100,
          credit: Math.round(b.credit * 100) / 100,
          balance: Math.round(balance * 100) / 100,
        }
      })
  }
}
