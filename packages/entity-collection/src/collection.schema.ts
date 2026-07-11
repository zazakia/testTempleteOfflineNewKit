import { z } from 'zod'
import { createQuerySchema } from '@repo/core'

// ─── Types ───────────────────────────────────────────────────
export interface Collector {
  id: string; tenantId: string
  fullName: string; authId?: string; is_active?: boolean
  phone?: string; email?: string; areaId?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface CollectionGroup {
  id: string; tenantId: string
  name: string; collectorId?: string
  collectionDay: number // 0=Sun..6=Sat
  groupType?: string; areaId?: string
  centerDayName?: string; centerTime?: string
  is_active?: boolean
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface CollectionLog {
  id: string; tenantId: string
  collectorId: string; logDate: number
  totalCollected: number
  cashOnHandStart: number; cashOnHandEnd: number
  notes?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface Remittance {
  id: string; tenantId: string
  collectorId: string; amount: number
  remittanceDate: number; status: 'pending' | 'verified' | 'approved' | 'rejected'
  approvedBy?: string; notes?: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface Area {
  id: string; tenantId: string
  name: string; code?: string
  parentAreaId?: string; aoId?: string
  is_active?: boolean
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

// ─── Schemas ─────────────────────────────────────────────────
export const CreateCollectorSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().max(30).optional(), email: z.string().email().max(255).optional(),
  areaId: z.string().optional(), is_active: z.boolean().default(true),
})
export const CreateCollectionGroupSchema = z.object({
  name: z.string().min(1).max(200),
  collectorId: z.string().optional(), collectionDay: z.number().min(0).max(6),
  groupType: z.string().optional(), areaId: z.string().optional(),
  centerDayName: z.string().optional(), centerTime: z.string().optional(),
})
export const CreateCollectionLogSchema = z.object({
  collectorId: z.string().min(1), logDate: z.number().positive(),
  totalCollected: z.number().min(0), cashOnHandStart: z.number().min(0),
  cashOnHandEnd: z.number().min(0), notes: z.string().max(500).optional(),
})
export const CreateRemittanceSchema = z.object({
  collectorId: z.string().min(1), amount: z.number().min(0.01),
  remittanceDate: z.number().positive(), status: z.enum(['pending', 'verified', 'approved', 'rejected']).default('pending'),
  notes: z.string().max(500).optional(),
})
export const CreateAreaSchema = z.object({
  name: z.string().min(1).max(200), code: z.string().max(50).optional(),
  parentAreaId: z.string().optional(), aoId: z.string().optional(),
})
export const CollectionLogQuerySchema = createQuerySchema({
  collectorId: z.string().optional(),
  logDate: z.number().optional(),
})
export const RemittanceQuerySchema = createQuerySchema({
  collectorId: z.string().optional(),
  status: z.enum(['pending', 'verified', 'approved', 'rejected']).optional(),
})
export const CollectorQuerySchema = createQuerySchema({
  is_active: z.boolean().optional(),
  areaId: z.string().optional(),
})
