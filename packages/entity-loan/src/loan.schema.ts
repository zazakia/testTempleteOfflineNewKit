/**
 * ─── Loan Schema ─────────────────────────────────────────────
 * Complete loan management for Philippine cooperatives.
 * Products, applications, disbursed loans, payments, penalties.
 */

import { z } from 'zod'
import { createUpdateSchema, createQuerySchema } from '@repo/core'

// ─── Types ───────────────────────────────────────────────────

export type LoanStatus = 'pending' | 'approved' | 'disbursed' | 'active' | 'paid' | 'restructured' | 'defaulted' | 'written_off'
export type LoanApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled'
export type LoanType = 'regular' | 'emergency' | 'educational' | 'agricultural' | 'housing' | 'business' | 'special'
export type InterestType = 'diminishing' | 'straight' | 'add_on' | 'fixed'
export type TermUnit = 'months' | 'years' | 'weeks'
export type Frequency = 'daily' | 'weekly' | 'semi_monthly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
export type PaymentType = 'regular' | 'advance' | 'partial' | 'full_prepayment' | 'penalty' | 'collection_fee'
export type PaymentScheduleStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'waived'

export interface LoanProduct {
  id: string
  tenantId: string
  productType: string
  label: string
  description?: string
  defaultRatePercent: number
  defaultTerm: number
  defaultTermUnit: TermUnit
  defaultFrequency: Frequency
  defaultProcessingFeeRate?: number
  defaultProcessingFeeFlat?: number
  defaultNotarialFee?: number
  notarialFeeThreshold?: number
  notarialFeeAboveThreshold?: number
  defaultSavingsPerPayment?: number
  defaultPrincipal?: number
  maxPrincipal?: number
  minTermMonths?: number
  maxTermMonths?: number
  is_active: boolean
  sortOrder?: number
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface LoanApplication {
  id: string
  tenantId: string
  borrowerId: string
  productId?: string
  amountApplied: number
  amountApproved?: number
  purpose?: string
  applicationDate: number
  status: LoanApplicationStatus
  approvedBy?: string
  approvedAt?: number
  notes?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface Loan {
  id: string
  tenantId: string
  borrowerId: string
  loanNumber: string
  loanType?: string
  productId?: string
  applicationId?: string
  principalAmount: number
  interestRate: number
  interestType: InterestType
  term: number
  termUnit: TermUnit
  frequency: Frequency
  totalAmount: number
  installmentAmount: number
  depositAmount?: number
  insuranceAmount?: number
  processingFee?: number
  collectionFee?: number
  notarialFee?: number
  rodFee?: number
  ltoFee?: number
  udiRebatableFee?: number
  vatOnInterest?: number
  vatOnCharges?: number
  dstFee?: number
  rebateAmount?: number
  savingsPerPayment?: number
  releaseDate?: number
  firstPaymentDate?: number
  maturityDate?: number
  status: LoanStatus
  isReloan?: boolean
  previousLoanId?: string
  deductedAmount?: number
  encodedBy?: string
  collectorId?: string
  batch?: number
  cycle?: number
  interestAmount?: number
  notes?: string
  dpd?: number
  agingBucket?: string
  isDelinquent?: boolean
  delinquentSince?: number
  approvedBy?: string
  approvedAt?: number
  balance?: number
  nextPaymentDue?: number
  lastPaymentDate?: number
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface PaymentSchedule {
  id: string
  loanId: string
  dueDate: number
  scheduledAmount: number
  principalAmount?: number
  interestAmount?: number
  feesAmount?: number
  balanceAfter?: number
  status: PaymentScheduleStatus
  paidAmount?: number
  paidDate?: number
  createdAt: number; updatedAt: number; deletedAt: number | null
}

export interface Payment {
  id: string
  tenantId: string
  loanId: string
  borrowerId?: string
  scheduleId?: string
  collectorId?: string
  amount: number
  principalAmount?: number
  interestAmount?: number
  penaltyAmount?: number
  savingsAmount?: number
  paymentDate: number
  paymentType: PaymentType
  receiptNumber?: string
  notes?: string
  encodedAt?: number
  encodedBy?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface LoanPenalty {
  id: string
  loanId: string
  amount: number
  penaltyDate: number
  reason?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
}

export interface Guarantor {
  id: string
  loanId?: string
  applicationId?: string
  guarantorName: string
  contactNo?: string
  relationship?: string
  memberId?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
}

// ─── Schemas ─────────────────────────────────────────────────

export const LoanStatusSchema = z.enum(['pending', 'approved', 'disbursed', 'active', 'paid', 'restructured', 'defaulted', 'written_off'])
export const LoanApplicationStatusSchema = z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled'])
export const InterestTypeSchema = z.enum(['diminishing', 'straight', 'add_on', 'fixed'])
export const TermUnitSchema = z.enum(['months', 'years', 'weeks'])
export const FrequencySchema = z.enum(['daily', 'weekly', 'semi_monthly', 'monthly', 'quarterly', 'semi_annual', 'annual'])
export const PaymentTypeSchema = z.enum(['regular', 'advance', 'partial', 'full_prepayment', 'penalty', 'collection_fee'])

export const CreateLoanProductSchema = z.object({
  productType: z.string().min(1),
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  defaultRatePercent: z.number().min(0).max(100),
  defaultTerm: z.number().int().positive(),
  defaultTermUnit: TermUnitSchema.default('months'),
  defaultFrequency: FrequencySchema.default('monthly'),
  defaultProcessingFeeRate: z.number().min(0).optional(),
  defaultProcessingFeeFlat: z.number().min(0).optional(),
  defaultNotarialFee: z.number().min(0).optional(),
  notarialFeeThreshold: z.number().min(0).optional(),
  notarialFeeAboveThreshold: z.number().min(0).optional(),
  defaultSavingsPerPayment: z.number().min(0).optional(),
  maxPrincipal: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
})

export const CreateLoanApplicationSchema = z.object({
  borrowerId: z.string().min(1),
  productId: z.string().optional(),
  amountApplied: z.number().min(1, 'Amount must be greater than 0'),
  purpose: z.string().max(500).optional(),
  applicationDate: z.number().positive(),
  notes: z.string().max(1000).optional(),
})

export const CreateLoanSchema = z.object({
  borrowerId: z.string().min(1),
  loanNumber: z.string().min(1),
  productId: z.string().optional(),
  applicationId: z.string().optional(),
  principalAmount: z.number().min(1),
  interestRate: z.number().min(0).max(100),
  interestType: InterestTypeSchema.default('diminishing'),
  term: z.number().int().positive(),
  termUnit: TermUnitSchema.default('months'),
  frequency: FrequencySchema.default('monthly'),
  releaseDate: z.number().positive().optional(),
  firstPaymentDate: z.number().positive().optional(),
  collectorId: z.string().optional(),
  processingFee: z.number().min(0).optional(),
  notarialFee: z.number().min(0).optional(),
  insuranceAmount: z.number().min(0).optional(),
  savingsPerPayment: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  encodedBy: z.string().optional(),
})

export const CreatePaymentSchema = z.object({
  loanId: z.string().min(1),
  borrowerId: z.string().optional(),
  scheduleId: z.string().optional(),
  collectorId: z.string().optional(),
  amount: z.number().min(0.01),
  paymentDate: z.number().positive(),
  paymentType: PaymentTypeSchema.default('regular'),
  receiptNumber: z.string().optional(),
  notes: z.string().max(500).optional(),
  encodedBy: z.string().optional(),
})

export const LoanQuerySchema = createQuerySchema({
  status: LoanStatusSchema.optional(),
  borrowerId: z.string().optional(),
  collectorId: z.string().optional(),
  loanType: z.string().optional(),
  isDelinquent: z.boolean().optional(),
  agingBucket: z.string().optional(),
})

export const LoanApplicationQuerySchema = createQuerySchema({
  status: LoanApplicationStatusSchema.optional(),
  borrowerId: z.string().optional(),
})

// ─── Display Helpers ────────────────────────────────────────

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  pending: 'Pending', approved: 'Approved', disbursed: 'Disbursed', active: 'Active',
  paid: 'Paid', restructured: 'Restructured', defaulted: 'Defaulted', written_off: 'Written Off',
}

export const LOAN_STATUS_COLORS: Record<LoanStatus, 'yellow' | 'blue' | 'purple' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow', approved: 'blue', disbursed: 'purple', active: 'green',
  paid: 'green', restructured: 'gray', defaulted: 'red', written_off: 'gray',
}

export const LOAN_APPLICATION_STATUS_LABELS: Record<LoanApplicationStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled',
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Daily', weekly: 'Weekly', semi_monthly: 'Semi-Monthly',
  monthly: 'Monthly', quarterly: 'Quarterly', semi_annual: 'Semi-Annual', annual: 'Annual',
}

export const AGING_BUCKET_LABELS: Record<string, string> = {
  current: 'Current', '1-30': '1-30 Days', '31-60': '31-60 Days',
  '61-90': '61-90 Days', '91-180': '91-180 Days', '180+': 'Over 180 Days',
}
