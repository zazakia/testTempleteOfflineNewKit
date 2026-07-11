import type { SavingsTransaction, SavingsAccount } from './savings.schema'

export class SavingsService {
  static computeNewBalance(account: SavingsAccount, transaction: Pick<SavingsTransaction, 'type' | 'amount'>): number {
    switch (transaction.type) {
      case 'deposit': case 'transfer_in': case 'interest': case 'dividend':
        return account.balance + transaction.amount
      case 'withdrawal': case 'transfer_out':
        return account.balance - transaction.amount
      case 'adjustment':
        return transaction.amount // absolute value for adjustments
      default:
        return account.balance
    }
  }

  static canWithdraw(account: SavingsAccount, amount: number): { allowed: boolean; reason?: string } {
    if (account.status !== 'active') return { allowed: false, reason: 'Account is not active' }
    if (account.balance < amount) return { allowed: false, reason: 'Insufficient balance' }
    return { allowed: true }
  }

  static computeInterest(account: SavingsAccount, days: number): number {
    const dailyRate = account.interestRate / 100 / 365
    return account.balance * dailyRate * days
  }
}
