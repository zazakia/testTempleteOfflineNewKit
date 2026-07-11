/**
 * ─── Share Capital Service ───────────────────────────────────
 * Business logic for cooperative share capital management.
 */

import type { ShareCapitalTransaction, ShareCapitalAccount } from './share-capital.schema'

export class ShareCapitalService {
  /**
   * Compute total subscribed capital from a series of transactions.
   */
  static computeTotalShares(transactions: ShareCapitalTransaction[]): ShareCapitalAccount {
    let totalShares = 0
    let totalAmount = 0
    let parValue = 0

    for (const tx of transactions) {
      if (tx.transactionType === 'subscription' || tx.transactionType === 'payment') {
        totalShares += tx.numberOfShares ?? 0
        totalAmount += tx.amount
        if (tx.parValue) parValue = tx.parValue
      } else if (tx.transactionType === 'refund' || tx.transactionType === 'adjustment') {
        totalShares -= tx.numberOfShares ?? 0
        totalAmount -= tx.amount
      }
    }

    return {
      memberId: transactions[0]?.memberId ?? '',
      totalShares,
      totalAmount,
      parValue,
      lastTransactionDate: transactions.length > 0
        ? Math.max(...transactions.filter(t => t.date).map(t => t.date))
        : undefined,
    }
  }

  /**
   * Compute dividend for a member based on shares and dividend rate.
   */
  static computeDividend(
    totalShares: number,
    parValue: number,
    dividendRate: number, // e.g., 0.05 for 5%
  ): number {
    const totalCapital = totalShares * parValue
    return totalCapital * dividendRate
  }

  /**
   * Compute patronage refund based on member's transaction volume.
   */
  static computePatronageRefund(
    memberTransactionVolume: number,
    totalTransactionVolume: number,
    netSurplus: number,
    patronageRate: number, // e.g., 0.30 for 30% of net surplus
  ): number {
    if (totalTransactionVolume === 0) return 0
    const patronagePool = netSurplus * patronageRate
    return patronagePool * (memberTransactionVolume / totalTransactionVolume)
  }

  /**
   * Check if minimum capital subscription requirement is met.
   */
  static isMinimumSubscriptionMet(
    totalAmount: number,
    minimumCapital: number = 1000, // Default PHP 1,000 minimum
  ): boolean {
    return totalAmount >= minimumCapital
  }

  /**
   * Generate a reference number for share capital transactions.
   */
  static generateReferenceNumber(year: number, sequence: number): string {
    return `SC-${year}-${String(sequence).padStart(6, '0')}`
  }
}
