/**
 * ─── Collection Service ──────────────────────────────────────
 * Business logic for field collections, remittances, and route management.
 */

import type { CollectionLog, Remittance, Collector } from './collection.schema'

export class CollectionService {
  /**
   * Compute cash accountability.
   */
  static computeCashAccountability(log: Pick<CollectionLog, 'cashOnHandStart' | 'totalCollected' | 'cashOnHandEnd'>): {
    expectedEndingCash: number
    difference: number
    isBalanced: boolean
  } {
    const expectedEndingCash = log.cashOnHandStart + log.totalCollected
    const difference = log.cashOnHandEnd - expectedEndingCash
    return {
      expectedEndingCash: Math.round(expectedEndingCash * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      isBalanced: Math.abs(difference) < 0.01,
    }
  }

  /**
   * Check if remittance is within allowed range of collected amounts.
   */
  static validateRemittanceAmount(remittanceAmount: number, totalCollected: number): { valid: boolean; reason?: string } {
    if (remittanceAmount <= 0) return { valid: false, reason: 'Remittance amount must be positive' }
    if (remittanceAmount > totalCollected) {
      return { valid: false, reason: `Remittance (₱${remittanceAmount}) exceeds total collected (₱${totalCollected})` }
    }
    return { valid: true }
  }

  /**
   * Compute collection efficiency rate.
   */
  static computeEfficiencyRate(totalCollected: number, totalExpected: number): number {
    if (totalExpected === 0) return 0
    return Math.round((totalCollected / totalExpected) * 10000) / 100
  }

  /**
   * Get collector performance summary.
   */
  static computeCollectorPerformance(
    collector: Collector,
    logs: CollectionLog[],
    remittances: Remittance[],
  ): {
    collectorName: string
    totalCollected: number
    totalRemitted: number
    outstanding: number
    logCount: number
    remittanceCount: number
  } {
    const totalCollected = logs.reduce((s, l) => s + l.totalCollected, 0)
    const totalRemitted = remittances.filter(r => r.status !== 'rejected').reduce((s, r) => s + r.amount, 0)
    return {
      collectorName: collector.fullName,
      totalCollected,
      totalRemitted,
      outstanding: totalCollected - totalRemitted,
      logCount: logs.length,
      remittanceCount: remittances.length,
    }
  }

  /**
   * Recommend collection route order based on area proximity.
   */
  static optimizeRoute(members: Array<{ id: string; name: string; routeIndex?: number; latitude?: number; longitude?: number }>): Array<{ id: string; name: string }> {
    return [...members]
      .sort((a, b) => (a.routeIndex ?? 999) - (b.routeIndex ?? 999))
      .map(m => ({ id: m.id, name: m.name }))
  }

  /**
   * Compute daily collection target based on expected payments.
   */
  static computeDailyTarget(scheduledPayments: number[]): { total: number; count: number; average: number } {
    const total = scheduledPayments.reduce((s, a) => s + a, 0)
    return { total, count: scheduledPayments.length, average: scheduledPayments.length > 0 ? total / scheduledPayments.length : 0 }
  }

  static generateReceiptNumber(prefix: string, date: number, sequence: number): string {
    const dateStr = new Date(date).toISOString().slice(0, 10).replace(/-/g, '')
    return `${prefix}-${dateStr}-${String(sequence).padStart(4, '0')}`
  }
}
