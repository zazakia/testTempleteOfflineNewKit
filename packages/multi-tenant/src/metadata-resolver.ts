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
}
