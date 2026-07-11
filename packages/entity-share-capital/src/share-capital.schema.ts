/**
 * ─── Share Capital Schema ────────────────────────────────────
 * Member share capital management for Philippine cooperatives.
 * Handles subscription, amortization, and dividend computation.
 */

import { z } from 'zod'
import { createUpdateSchema, createQuerySchema } from '@repo/core'

// ─── Types ───────────────────────────────────────────────────

export type ShareTransactionType = 'subscription' | 'payment' | 'refund' | 'dividend' | 'transfer' | 'adjustment'
export type ShareType = 'common' | 'preferred'
export type DividendFrequency = 'annual' | 'semi_annual' | 'quarterly'

export interface ShareCapitalTransaction {
  id: string
  tenantId: string
  memberId: string
  transactionType: ShareTransactionType
  shareType: ShareType
  numberOfShares?: number
  parValue?: number
  amount: number
  runningBalanceShares?: number
  runningBalanceAmount?: number
  referenceNumber?: string
  date: number
  notes?: string
  recordedBy?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface ShareCapitalAccount {
  memberId: string
  totalShares: number
  totalAmount: number
  parValue: number
  lastTransactionDate?: number
}

// ─── Schemas ─────────────────────────────────────────────────

export const ShareTransactionTypeSchema = z.enum(['subscription', 'payment', 'refund', 'dividend', 'transfer', 'adjustment'])
export const ShareTypeSchema = z.enum(['common', 'preferred'])
export const DividendFrequencySchema = z.enum(['annual', 'semi_annual', 'quarterly'])

export const CreateShareCapitalTransactionSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  transactionType: ShareTransactionTypeSchema,
  shareType: ShareTypeSchema.default('common'),
  numberOfShares: z.number().int().positive().optional(),
  parValue: z.number().min(0).optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  referenceNumber: z.string().max(100).optional(),
  date: z.number().positive('Date is required'),
  notes: z.string().max(500).optional(),
  recordedBy: z.string().optional(),
})

export const UpdateShareCapitalTransactionSchema = createUpdateSchema({
  transactionType: ShareTransactionTypeSchema.optional(),
  shareType: ShareTypeSchema.optional(),
  numberOfShares: z.number().int().positive().optional(),
  parValue: z.number().min(0).optional(),
  amount: z.number().min(0.01).optional(),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const ShareCapitalQuerySchema = createQuerySchema({
  memberId: z.string().optional(),
  transactionType: ShareTransactionTypeSchema.optional(),
  shareType: ShareTypeSchema.optional(),
})

// ─── Display Helpers ────────────────────────────────────────

export const SHARE_TRANSACTION_TYPE_LABELS: Record<ShareTransactionType, string> = {
  subscription: 'Subscription',
  payment: 'Payment',
  refund: 'Refund',
  dividend: 'Dividend',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
}

export const SHARE_TYPE_LABELS: Record<ShareType, string> = {
  common: 'Common Share',
  preferred: 'Preferred Share',
}
