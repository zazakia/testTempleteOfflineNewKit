import { z } from 'zod'
import { createUpdateSchema } from '@repo/core'

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'
export type NormalBalance = 'debit' | 'credit'
export type EntryType = 'auto' | 'manual' | 'adjusting' | 'closing' | 'reversing'

export interface ChartOfAccount {
  id: string
  tenantId: string
  code: string
  name: string
  accountType: AccountType
  normalBalance: NormalBalance
  parentCode?: string
  isHeader?: boolean
  is_active: boolean
  description?: string
  sortOrder?: number
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface JournalEntry {
  id: string
  tenantId: string
  entryDate: number
  referenceNumber: string
  description: string
  entryType: EntryType
  sourceTable?: string
  sourceId?: string
  postedBy?: string
  isPosted?: boolean
  totalDebit: number
  totalCredit: number
  fiscalYear?: number
  fiscalMonth?: number
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface JournalEntryLine {
  id: string
  journalEntryId: string
  accountCode: string
  accountName?: string
  debitAmount?: number
  creditAmount?: number
  description?: string
  businessUnitId?: string
  moduleSourceTable?: string
  moduleSourceId?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
}

export interface FinancialPeriod {
  id: string
  fiscalYear: number
  fiscalMonth: number
  periodStart: number
  periodEnd: number
  isClosed: boolean
  closedAt?: number
  closedBy?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
}

export const AccountTypeSchema = z.enum(['asset', 'liability', 'equity', 'income', 'expense'])
export const NormalBalanceSchema = z.enum(['debit', 'credit'])
export const EntryTypeSchema = z.enum(['auto', 'manual', 'adjusting', 'closing', 'reversing'])

export const CreateAccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1).max(200),
  accountType: AccountTypeSchema,
  normalBalance: NormalBalanceSchema,
  parentCode: z.string().optional(),
  isHeader: z.boolean().optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
})

export const CreateJournalEntrySchema = z.object({
  entryDate: z.number().positive(),
  description: z.string().min(1).max(500),
  entryType: EntryTypeSchema.default('manual'),
  lines: z.array(z.object({
    accountCode: z.string().min(1),
    debitAmount: z.number().min(0).optional(),
    creditAmount: z.number().min(0).optional(),
    description: z.string().max(200).optional(),
  })).min(2, 'Journal entry must have at least 2 lines'),
})

export const UpdateJournalEntrySchema = createUpdateSchema({
  description: z.string().min(1).max(500).optional(),
  isPosted: z.boolean().optional(),
})

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Asset', liability: 'Liability', equity: 'Equity', income: 'Income', expense: 'Expense',
}
