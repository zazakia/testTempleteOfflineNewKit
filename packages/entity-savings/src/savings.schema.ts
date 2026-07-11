import { z } from 'zod'
import { createUpdateSchema, createQuerySchema } from '@repo/core'

export type SavingsTransactionType = 'deposit' | 'withdrawal' | 'interest' | 'transfer_in' | 'transfer_out' | 'dividend' | 'adjustment'
export type SavingsAccountType = 'regular' | 'time_deposit' | 'special'
export type SavingsAccountStatus = 'active' | 'dormant' | 'closed'

export interface SavingsAccount {
  id: string
  tenantId: string
  memberId: string
  accountType: SavingsAccountType
  accountNumber: string
  balance: number
  interestRate: number
  status: SavingsAccountStatus
  openedDate: number
  closedDate?: number
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface SavingsTransaction {
  id: string
  tenantId: string
  savingsAccountId: string
  memberId: string
  type: SavingsTransactionType
  amount: number
  runningBalance?: number
  date: number
  referenceId?: string
  notes?: string
  recordedBy?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const SavingsTransactionTypeSchema = z.enum(['deposit', 'withdrawal', 'interest', 'transfer_in', 'transfer_out', 'dividend', 'adjustment'])
export const SavingsAccountTypeSchema = z.enum(['regular', 'time_deposit', 'special'])
export const SavingsAccountStatusSchema = z.enum(['active', 'dormant', 'closed'])

export const CreateSavingsTransactionSchema = z.object({
  memberId: z.string().min(1),
  savingsAccountId: z.string().min(1),
  type: SavingsTransactionTypeSchema,
  amount: z.number().min(0.01),
  date: z.number().positive(),
  referenceId: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export const UpdateSavingsTransactionSchema = createUpdateSchema({
  type: SavingsTransactionTypeSchema.optional(),
  amount: z.number().min(0.01).optional(),
  notes: z.string().max(500).optional(),
})

export const SavingsQuerySchema = createQuerySchema({
  memberId: z.string().optional(),
  type: SavingsTransactionTypeSchema.optional(),
  accountType: SavingsAccountTypeSchema.optional(),
})

export const SAVINGS_TYPE_LABELS: Record<SavingsTransactionType, string> = {
  deposit: 'Deposit', withdrawal: 'Withdrawal', interest: 'Interest',
  transfer_in: 'Transfer In', transfer_out: 'Transfer Out',
  dividend: 'Dividend', adjustment: 'Adjustment',
}
