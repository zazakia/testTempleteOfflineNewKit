/**
 * ─── Metadata Resolver ────────────────────────────────────────
 * Typed runtime interpreter for tenant metadata.
 * Wraps TenantMetadataStore with:
 *  - Typed getters for known configuration domains
 *  - Sensible defaults when no metadata exists
 *  - Caching (in-memory, cleared on set)
 *
 * This is the bridge between raw JSON storage and business logic.
 * Entities call the resolver instead of accessing the store directly.
 *
 * Usage:
 *   const resolver = new MetadataResolver(metadataStore)
 *   const formula = resolver.getLoanInterestFormula('tenant-1', 'declining_balance')
 *   // -> { rateMultiplier: 1.0, roundingMode: 'nearest_cent' }
 */

import type { TenantMetadataStore } from './metadata-store'

// ─── Default Configurations (fallback when no metadata exists) ──

export interface InterestFormulaConfig {
  rateMultiplier: number
  roundingMode: 'nearest_cent' | 'floor' | 'ceil'
}

export const DEFAULT_INTEREST_FORMULAS: Record<string, InterestFormulaConfig> = {
  declining_balance: {
    rateMultiplier: 1.0,
    roundingMode: 'nearest_cent',
  },
  flat_rate: {
    rateMultiplier: 1.2,
    roundingMode: 'nearest_cent',
  },
}

export interface LoanLimitsConfig {
  maxTermMonths: number
  minAmount: number
  maxAmount: number
  maxActiveLoans: number
}

export const DEFAULT_LOAN_LIMITS: LoanLimitsConfig = {
  maxTermMonths: 60,
  minAmount: 1000,
  maxAmount: 500000,
  maxActiveLoans: 3,
}

export interface SavingsConfig {
  interestRate: number       // annual, e.g. 0.04 = 4%
  compoundingFrequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
  minBalance: number
  withdrawalFee: number
}

export const DEFAULT_SAVINGS_CONFIG: SavingsConfig = {
  interestRate: 0.04,
  compoundingFrequency: 'monthly',
  minBalance: 500,
  withdrawalFee: 0,
}

export interface CustomFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'boolean'
  required: boolean
  options?: string[]
  defaultValue?: unknown
}

export interface UIConfig {
  theme: {
    primaryColor: string
    logo?: string | null
  }
  customFields: Record<string, CustomFieldDef[]>
}

export const DEFAULT_UI_CONFIG: UIConfig = {
  theme: {
    primaryColor: '#16a34a',
    logo: null,
  },
  customFields: {},
}

export interface ApprovalStep {
  role: string
  action: 'encode' | 'approve' | 'verify' | 'disburse'
  minAmount?: number
}

export interface ApprovalWorkflow {
  steps: ApprovalStep[]
}

export const DEFAULT_APPROVAL_WORKFLOW: Record<string, ApprovalWorkflow> = {
  loan: {
    steps: [
      { role: 'loan_encoder', action: 'encode' },
      { role: 'manager', action: 'approve', minAmount: 50000 },
    ],
  },
}

// ─── Branch Config ──────────────────────────────────────────

export interface BranchConfig {
  /** Whether multi-branch is enabled for this tenant */
  enabled: boolean
  /** Allow users from one branch to see data from other branches */
  allowCrossBranchAccess: boolean
  /** Require branch assignment when creating a member */
  requireBranchOnMember: boolean
  /** Require branch assignment when creating a loan */
  requireBranchOnLoan: boolean
  /** Whether loan products are shared across branches */
  sharedProducts: boolean
}

export const DEFAULT_BRANCH_CONFIG: BranchConfig = {
  enabled: false,
  allowCrossBranchAccess: true,
  requireBranchOnMember: false,
  requireBranchOnLoan: false,
  sharedProducts: true,
}

// ─── Laundry Domain ────────────────────────────────────

export interface LaundryBusinessConfig {
  /** Loyalty points earned per PHP 100 spent */
  loyaltyPointsRate: number
  /** Minimum points to redeem */
  loyaltyRedemptionMinPoints: number
  /** PHP equivalent per 100 points */
  loyaltyRedemptionPHPEquivalent: number
  /** Tier upgrade lifetime spend thresholds (PHP) */
  tierThresholds: Record<string, number>
  /** Express surcharge multiplier */
  expressSurchargeMultiplier: number
  /** Rush surcharge multiplier */
  rushSurchargeMultiplier: number
  /** Default VAT rate (e.g. 0.12 for 12%) */
  vatRate: number
  /** Auto-compute tax for orders above this amount */
  vatThreshold: number
  /** Default turnaround hours per priority */
  turnaroundHours: Record<string, number>
}

export const DEFAULT_LAUNDRY_CONFIG: LaundryBusinessConfig = {
  loyaltyPointsRate: 1,
  loyaltyRedemptionMinPoints: 500,
  loyaltyRedemptionPHPEquivalent: 50,
  tierThresholds: {
    bronze: 0,
    silver: 5000,
    gold: 20000,
    platinum: 50000,
  },
  expressSurchargeMultiplier: 1.5,
  rushSurchargeMultiplier: 2.0,
  vatRate: 0.12,
  vatThreshold: 500,
  turnaroundHours: {
    normal: 48,
    express: 24,
    rush: 6,
  },
}

// ─── Driving School Domain ───────────────────────────────

export interface DrivingSchoolConfig {
  /** Minimum age for student permit */
  minimumAgeStudentPermit: number
  /** Minimum age for non-professional license */
  minimumAgeNonPro: number
  /** Minimum age for professional license */
  minimumAgeProfessional: number
  /** Passing score for theory exam (percentage) */
  theoryPassingScore: number
  /** Passing score for practical exam (percentage) */
  practicalPassingScore: number
  /** Default TDC hours required (LTO mandate) */
  requiredTDCHours: number
  /** Default PDC hours required for cars */
  requiredPDCCarHours: number
  /** Default PDC hours required for motorcycles */
  requiredPDCMotorcycleHours: number
  /** Maximum reschedules allowed per enrollment */
  maxReschedules: number
  /** Installment plan: max number of installments */
  maxInstallments: number
  /** Installment plan: minimum down payment percentage */
  minDownPaymentPercent: number
  /** Certificate validity period in days */
  certificateValidityDays: number
  /** Auto-cancel enrollment if no activity for X days */
  inactivityCancelDays: number
}

export const DEFAULT_DRIVING_SCHOOL_CONFIG: DrivingSchoolConfig = {
  minimumAgeStudentPermit: 16,
  minimumAgeNonPro: 17,
  minimumAgeProfessional: 18,
  theoryPassingScore: 70,
  practicalPassingScore: 75,
  requiredTDCHours: 15,
  requiredPDCCarHours: 8,
  requiredPDCMotorcycleHours: 8,
  maxReschedules: 3,
  maxInstallments: 6,
  minDownPaymentPercent: 30,
  certificateValidityDays: 365,
  inactivityCancelDays: 90,
}

// ─── Resolver ─────────────────────────────────────────────────

export class MetadataResolver {
  private cache = new Map<string, Record<string, unknown>>()

  constructor(private store: TenantMetadataStore) {}

  /** Invalidate cache for a tenant (call after set/setField) */
  invalidate(tenantId: string): void {
    this.cache.delete(tenantId)
  }

  /** Get full metadata for a tenant (with caching) */
  private async getMetadata(tenantId: string): Promise<Record<string, unknown>> {
    if (!this.cache.has(tenantId)) {
      const data = await this.store.get(tenantId)
      this.cache.set(tenantId, data)
    }
    return this.cache.get(tenantId)!
  }

  // ─── Loan Domain ───────────────────────────────────────

  /** Get interest formula configuration for a tenant */
  async getLoanInterestFormula(
    tenantId: string,
    formulaType: 'declining_balance' | 'flat_rate',
  ): Promise<InterestFormulaConfig> {
    const metadata = await this.getMetadata(tenantId)
    const loan = (metadata.loan as Record<string, unknown> | undefined) ?? {}
    const formulas = (loan.interestFormulas as Record<string, unknown> | undefined) ?? {}
    const formula = formulas[formulaType] as Partial<InterestFormulaConfig> | undefined

    const defaults = DEFAULT_INTEREST_FORMULAS[formulaType]!
    return {
      rateMultiplier: formula?.rateMultiplier ?? defaults.rateMultiplier,
      roundingMode: formula?.roundingMode ?? defaults.roundingMode,
    }
  }

  /** Get loan limits for a tenant */
  async getLoanLimits(tenantId: string): Promise<LoanLimitsConfig> {
    const metadata = await this.getMetadata(tenantId)
    const loan = (metadata.loan as Record<string, unknown> | undefined) ?? {}

    return {
      maxTermMonths: (loan.maxTermMonths as number) ?? DEFAULT_LOAN_LIMITS.maxTermMonths,
      minAmount: (loan.minAmount as number) ?? DEFAULT_LOAN_LIMITS.minAmount,
      maxAmount: (loan.maxAmount as number) ?? DEFAULT_LOAN_LIMITS.maxAmount,
      maxActiveLoans: (loan.maxActiveLoans as number) ?? DEFAULT_LOAN_LIMITS.maxActiveLoans,
    }
  }

  // ─── Savings Domain ────────────────────────────────────

  /** Get savings configuration for a tenant */
  async getSavingsConfig(tenantId: string): Promise<SavingsConfig> {
    const metadata = await this.getMetadata(tenantId)
    const savings = (metadata.savings as Record<string, unknown> | undefined) ?? {}

    return {
      interestRate: (savings.interestRate as number) ?? DEFAULT_SAVINGS_CONFIG.interestRate,
      compoundingFrequency:
        (savings.compoundingFrequency as SavingsConfig['compoundingFrequency']) ??
        DEFAULT_SAVINGS_CONFIG.compoundingFrequency,
      minBalance: (savings.minBalance as number) ?? DEFAULT_SAVINGS_CONFIG.minBalance,
      withdrawalFee: (savings.withdrawalFee as number) ?? DEFAULT_SAVINGS_CONFIG.withdrawalFee,
    }
  }

  // ─── UI Domain ─────────────────────────────────────────

  /** Get UI configuration for a tenant (theme, custom fields) */
  async getUIConfig(tenantId: string): Promise<UIConfig> {
    const metadata = await this.getMetadata(tenantId)
    const ui = (metadata.ui as Record<string, unknown> | undefined) ?? {}
    const theme = (ui.theme as Record<string, unknown> | undefined) ?? {}

    return {
      theme: {
        primaryColor: (theme.primaryColor as string) ?? DEFAULT_UI_CONFIG.theme.primaryColor,
        logo: theme.logo as string | null | undefined ?? DEFAULT_UI_CONFIG.theme.logo,
      },
      customFields: (ui.customFields as Record<string, CustomFieldDef[]>) ?? DEFAULT_UI_CONFIG.customFields,
    }
  }

  /** Get custom fields for a specific entity */
  async getCustomFields(tenantId: string, entity: string): Promise<CustomFieldDef[]> {
    const uiConfig = await this.getUIConfig(tenantId)
    return uiConfig.customFields[entity] ?? []
  }

    // ─── Approval Workflows ────────────────────────────────

  /** Get approval workflow for a given module */
  async getApprovalWorkflow(tenantId: string, module: string): Promise<ApprovalWorkflow> {
    const metadata = await this.getMetadata(tenantId)
    const workflows = (metadata.approvalWorkflows as Record<string, ApprovalWorkflow> | undefined) ?? {}
    return workflows[module] ?? DEFAULT_APPROVAL_WORKFLOW[module] ?? { steps: [] }
  }

  // ─── Branch Domain ────────────────────────────────────

  /** Get branch configuration for a tenant */
  async getBranchConfig(tenantId: string): Promise<BranchConfig> {
    const metadata = await this.getMetadata(tenantId)
    const branch = (metadata.branch as Record<string, unknown> | undefined) ?? {}

    return {
      enabled: (branch.enabled as boolean) ?? DEFAULT_BRANCH_CONFIG.enabled,
      allowCrossBranchAccess:
        (branch.allowCrossBranchAccess as boolean) ??
        DEFAULT_BRANCH_CONFIG.allowCrossBranchAccess,
      requireBranchOnMember:
        (branch.requireBranchOnMember as boolean) ??
        DEFAULT_BRANCH_CONFIG.requireBranchOnMember,
      requireBranchOnLoan:
        (branch.requireBranchOnLoan as boolean) ??
        DEFAULT_BRANCH_CONFIG.requireBranchOnLoan,
      sharedProducts:
        (branch.sharedProducts as boolean) ??
        DEFAULT_BRANCH_CONFIG.sharedProducts,
    }
  }

  // ─── Laundry Domain ────────────────────────────────────

  /** Get laundry business configuration for a tenant */
  async getLaundryConfig(tenantId: string): Promise<LaundryBusinessConfig> {
    const metadata = await this.getMetadata(tenantId)
    const laundry = (metadata.laundry as Record<string, unknown> | undefined) ?? {}
    const loyalty = (laundry.loyalty as Record<string, unknown> | undefined) ?? {}
    const tiers = (laundry.tierThresholds as Record<string, number> | undefined) ?? DEFAULT_LAUNDRY_CONFIG.tierThresholds
    const turnaround = (laundry.turnaroundHours as Record<string, number> | undefined) ?? DEFAULT_LAUNDRY_CONFIG.turnaroundHours

    return {
      loyaltyPointsRate: (loyalty.pointsRate as number) ?? DEFAULT_LAUNDRY_CONFIG.loyaltyPointsRate,
      loyaltyRedemptionMinPoints: (loyalty.redemptionMinPoints as number) ?? DEFAULT_LAUNDRY_CONFIG.loyaltyRedemptionMinPoints,
      loyaltyRedemptionPHPEquivalent: (loyalty.redemptionPHPEquivalent as number) ?? DEFAULT_LAUNDRY_CONFIG.loyaltyRedemptionPHPEquivalent,
      tierThresholds: tiers,
      expressSurchargeMultiplier: (laundry.expressSurchargeMultiplier as number) ?? DEFAULT_LAUNDRY_CONFIG.expressSurchargeMultiplier,
      rushSurchargeMultiplier: (laundry.rushSurchargeMultiplier as number) ?? DEFAULT_LAUNDRY_CONFIG.rushSurchargeMultiplier,
      vatRate: (laundry.vatRate as number) ?? DEFAULT_LAUNDRY_CONFIG.vatRate,
      vatThreshold: (laundry.vatThreshold as number) ?? DEFAULT_LAUNDRY_CONFIG.vatThreshold,
      turnaroundHours: turnaround,
    }
  }

  // ─── Driving School Domain ─────────────────────────────

  /** Get driving school configuration for a tenant */
  async getDrivingSchoolConfig(tenantId: string): Promise<DrivingSchoolConfig> {
    const metadata = await this.getMetadata(tenantId)
    const ds = (metadata.drivingSchool as Record<string, unknown> | undefined) ?? {}
    const lto = (ds.lto as Record<string, unknown> | undefined) ?? {}
    const installment = (ds.installment as Record<string, unknown> | undefined) ?? {}

    return {
      minimumAgeStudentPermit: (lto.minimumAgeStudentPermit as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.minimumAgeStudentPermit,
      minimumAgeNonPro: (lto.minimumAgeNonPro as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.minimumAgeNonPro,
      minimumAgeProfessional: (lto.minimumAgeProfessional as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.minimumAgeProfessional,
      theoryPassingScore: (ds.theoryPassingScore as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.theoryPassingScore,
      practicalPassingScore: (ds.practicalPassingScore as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.practicalPassingScore,
      requiredTDCHours: (lto.requiredTDCHours as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.requiredTDCHours,
      requiredPDCCarHours: (lto.requiredPDCCarHours as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.requiredPDCCarHours,
      requiredPDCMotorcycleHours: (lto.requiredPDCMotorcycleHours as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.requiredPDCMotorcycleHours,
      maxReschedules: (ds.maxReschedules as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.maxReschedules,
      maxInstallments: (installment.maxInstallments as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.maxInstallments,
      minDownPaymentPercent: (installment.minDownPaymentPercent as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.minDownPaymentPercent,
      certificateValidityDays: (ds.certificateValidityDays as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.certificateValidityDays,
      inactivityCancelDays: (ds.inactivityCancelDays as number) ?? DEFAULT_DRIVING_SCHOOL_CONFIG.inactivityCancelDays,
    }
  }
}
