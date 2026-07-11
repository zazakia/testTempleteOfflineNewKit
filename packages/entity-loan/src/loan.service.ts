/**
 * ─── Loan Service ────────────────────────────────────────────
 * Pure business logic for cooperative loan management.
 * Payment scheduling, amortization, delinquency tracking.
 */

import type { Loan, PaymentSchedule, Frequency, InterestType, TermUnit } from './loan.schema'
import type { MetadataResolver, InterestFormulaConfig } from '@repo/multi-tenant'

export class LoanService {
  /** Metadata resolver for per-tenant customization (set via configure()) */
  private static resolver: MetadataResolver | null = null

  /** Inject the metadata resolver (called once at app startup) */
  static configure(resolver: MetadataResolver): void {
    LoanService.resolver = resolver
  }
  /**
   * Compute monthly amortization using diminishing balance method.
   */
  static computeDiminishingAmortization(
    principal: number,
    annualRate: number,
    termMonths: number,
  ): { monthlyPayment: number; totalInterest: number; totalAmount: number; schedule: Array<{ month: number; principal: number; interest: number; balance: number }> } {
    if (annualRate === 0 || termMonths === 0) {
      const equalPrincipal = Math.round((principal / termMonths) * 100) / 100
      const schedule = Array.from({ length: termMonths }, (_, i) => ({
        month: i + 1,
        principal: i === termMonths - 1 ? Math.round((principal - equalPrincipal * (termMonths - 1)) * 100) / 100 : equalPrincipal,
        interest: 0,
        balance: Math.round((principal - equalPrincipal * (i + 1)) * 100) / 100,
      }))
      return { monthlyPayment: Math.round((principal / termMonths) * 100) / 100, totalInterest: 0, totalAmount: principal, schedule }
    }
    const monthlyRate = annualRate / 100 / 12
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
    let balance = principal
    const schedule = []

    for (let i = 1; i <= termMonths; i++) {
      const interest = balance * monthlyRate
      const principalPaid = payment - interest
      balance -= principalPaid
      schedule.push({ month: i, principal: Math.round(principalPaid * 100) / 100, interest: Math.round(interest * 100) / 100, balance: Math.max(0, Math.round(balance * 100) / 100) })
    }

    const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0)
    return {
      monthlyPayment: Math.round(payment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round((principal + totalInterest) * 100) / 100,
      schedule,
    }
  }

  /**
   * Compute straight line amortization (principal + interest divided equally).
   */
  static computeStraightAmortization(principal: number, annualRate: number, termMonths: number): { monthlyPayment: number; totalInterest: number; totalAmount: number } {
    const totalInterest = principal * (annualRate / 100) * (termMonths / 12)
    const totalAmount = principal + totalInterest
    return {
      monthlyPayment: Math.round((totalAmount / termMonths) * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    }
  }

  /**
   * Generate payment schedules for a loan.
   */
  static generatePaymentSchedules(loan: Loan): Array<{
    dueDate: number
    scheduledAmount: number
    principalAmount?: number
    interestAmount?: number
    status: 'pending'
  }> {
    const schedules: Array<{ dueDate: number; scheduledAmount: number; principalAmount?: number; interestAmount?: number; status: 'pending' }> = []
    const releaseDate = loan.releaseDate ?? Date.now()
    const termMonths = loan.termUnit === 'years' ? loan.term * 12 : loan.termUnit === 'weeks' ? loan.term : loan.term
    const intervalMs = this.getIntervalMs(loan.frequency)

    for (let i = 1; i <= (loan.frequency === 'monthly' ? termMonths : termMonths * 4); i++) {
      const dueDate = releaseDate + i * intervalMs
      schedules.push({
        dueDate,
        scheduledAmount: loan.installmentAmount,
        principalAmount: loan.principalAmount / (loan.frequency === 'monthly' ? termMonths : termMonths * 4),
        interestAmount: loan.interestAmount ? loan.interestAmount / (loan.frequency === 'monthly' ? termMonths : termMonths * 4) : undefined,
        status: 'pending',
      })
    }

    return schedules
  }

  /**
   * Get interval in milliseconds for a given frequency.
   */
  static getIntervalMs(frequency: Frequency): number {
    const DAY = 24 * 60 * 60 * 1000
    switch (frequency) {
      case 'daily': return DAY
      case 'weekly': return 7 * DAY
      case 'semi_monthly': return 15 * DAY
      case 'monthly': return 30 * DAY
      case 'quarterly': return 91 * DAY
      case 'semi_annual': return 182 * DAY
      case 'annual': return 365 * DAY
    }
  }

  /**
   * Compute days past due.
   */
  static computeDPD(lastPaymentDate: number | undefined, nextDueDate?: number): number {
    const now = Date.now()
    if (nextDueDate && now > nextDueDate) {
      return Math.floor((now - nextDueDate) / (24 * 60 * 60 * 1000))
    }
    return 0
  }

  /**
   * Determine aging bucket based on DPD.
   */
  static computeAgingBucket(dpd: number): string {
    if (dpd <= 0) return 'current'
    if (dpd <= 30) return '1-30'
    if (dpd <= 60) return '31-60'
    if (dpd <= 90) return '61-90'
    if (dpd <= 180) return '91-180'
    return '180+'
  }

  /**
   * Check if loan is delinquent (past due by 1+ days).
   */
  static isDelinquent(loan: Loan): boolean {
    return (loan.dpd ?? 0) >= 1
  }

  /**
   * Compute total fees for a loan based on product configuration.
   */
  static computeLoanFees(principal: number, product: { defaultProcessingFeeRate?: number; defaultProcessingFeeFlat?: number; defaultNotarialFee?: number; notarialFeeThreshold?: number; notarialFeeAboveThreshold?: number; defaultSavingsPerPayment?: number }): {
    processingFee: number
    notarialFee: number
    savingsPerPayment: number
  } {
    const processingFee = product.defaultProcessingFeeRate
      ? principal * (product.defaultProcessingFeeRate / 100)
      : (product.defaultProcessingFeeFlat ?? 0)

    const notarialFee = product.notarialFeeThreshold && principal > product.notarialFeeThreshold
      ? (product.notarialFeeAboveThreshold ?? 0)
      : (product.defaultNotarialFee ?? 0)

    return {
      processingFee: Math.round(processingFee * 100) / 100,
      notarialFee: Math.round(notarialFee * 100) / 100,
      savingsPerPayment: product.defaultSavingsPerPayment ?? 0,
    }
  }

  /**
   * Compute penalty for late payment.
   */
  static computePenalty(installmentAmount: number, daysLate: number, penaltyRate: number = 0.005): number {
    // Philippine coops typically charge 0.5% per day on overdue amount
    return Math.round(installmentAmount * penaltyRate * daysLate * 100) / 100
  }

  /**
   * Check if a member is eligible for a new loan (existing loan must not be delinquent).
   */
  static canApplyNewLoan(existingLoans: Loan[]): { allowed: boolean; reason?: string } {
    const delinquentLoans = existingLoans.filter(l => l.isDelinquent && l.status !== 'paid')
    if (delinquentLoans.length > 0) {
      return { allowed: false, reason: `Member has ${delinquentLoans.length} delinquent loan(s)` }
    }
    return { allowed: true }
  }

  /**
   * Compute amortization with tenant-specific metadata applied.
   * Reads rateMultiplier and roundingMode from the metadata resolver.
   * Falls back to default formula if resolver is not configured.
   *
   * This is the METADATA-DRIVEN entry point. Use this instead of the raw methods
   * when you need per-tenant customization without hardcoding.
   */
  static async computeAmortizationFromMetadata(
    tenantId: string,
    principal: number,
    annualRate: number,
    termMonths: number,
    formulaType: 'declining_balance' | 'flat_rate' = 'declining_balance',
  ): Promise<ReturnType<typeof LoanService.computeDiminishingAmortization> | { monthlyPayment: number; totalInterest: number; totalAmount: number }> {
    // Get per-tenant configuration
    let config: InterestFormulaConfig = { rateMultiplier: 1.0, roundingMode: 'nearest_cent' }
    if (LoanService.resolver) {
      config = await LoanService.resolver.getLoanInterestFormula(tenantId, formulaType)
    }

    const adjustedRate = annualRate * config.rateMultiplier

    if (formulaType === 'declining_balance') {
      const result = LoanService.computeDiminishingAmortization(principal, adjustedRate, termMonths)
      return LoanService.applyRounding(result, config.roundingMode)
    }

    const result = LoanService.computeStraightAmortization(principal, adjustedRate, termMonths)
    return LoanService.applyRoundingSimple(result, config.roundingMode)
  }

  /**
   * Apply rounding mode to diminishing balance result.
   */
  private static applyRounding(
    result: ReturnType<typeof LoanService.computeDiminishingAmortization>,
    mode: InterestFormulaConfig['roundingMode'],
  ): ReturnType<typeof LoanService.computeDiminishingAmortization> {
    if (mode === 'nearest_cent') return result // default already rounds to 2 decimals

    const round = mode === 'floor' ? Math.floor : Math.ceil
    return {
      monthlyPayment: round(result.monthlyPayment * 100) / 100,
      totalInterest: round(result.totalInterest * 100) / 100,
      totalAmount: round(result.totalAmount * 100) / 100,
      schedule: result.schedule.map(s => ({
        ...s,
        principal: round(s.principal * 100) / 100,
        interest: round(s.interest * 100) / 100,
        balance: round(s.balance * 100) / 100,
      })),
    }
  }

  /** Apply rounding to simple (flat rate) result */
  private static applyRoundingSimple(
    result: { monthlyPayment: number; totalInterest: number; totalAmount: number },
    mode: InterestFormulaConfig['roundingMode'],
  ): { monthlyPayment: number; totalInterest: number; totalAmount: number } {
    if (mode === 'nearest_cent') return result
    const round = mode === 'floor' ? Math.floor : Math.ceil
    return {
      monthlyPayment: round(result.monthlyPayment * 100) / 100,
      totalInterest: round(result.totalInterest * 100) / 100,
      totalAmount: round(result.totalAmount * 100) / 100,
    }
  }
}
