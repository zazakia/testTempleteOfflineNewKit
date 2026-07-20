/**
 * ─── Branch Schema ───────────────────────────────────────────
 * Zod schemas and types for the Branch entity.
 * A branch represents a physical location/branch of a cooperative.
 */

import { z } from 'zod'
import {
  baseEntitySchema,
  phoneSchema,
  emailSchema,
  statusSchema,
  notesSchema,
  createQuerySchema,
  createUpdateSchema,
} from '@repo/core'

// ─── Types ───────────────────────────────────────────────────

export type BranchStatus = 'active' | 'inactive' | 'suspended'

export interface Branch {
  id: string
  tenantId: string
  /** Unique branch code (e.g., "BAT-MAIN", "BAT-LIPA") */
  branchCode: string
  /** Branch display name */
  name: string
  /** Full address */
  address?: string
  /** Barangay */
  barangay?: string
  /** City/Municipality */
  cityMunicipality?: string
  /** Province */
  province?: string
  /** Contact phone */
  phone?: string
  /** Contact email */
  email?: string
  /** Branch manager name */
  managerName?: string
  /** Whether this is the main/head office */
  isMainBranch: boolean
  /** Branch status */
  status: BranchStatus
  /** Date branch was opened */
  openedDate?: number
  /** Optional notes */
  notes?: string
  /** GPS / map coordinates (lat,lng) */
  coordinates?: string

  // Base entity fields
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

// ─── Schemas ─────────────────────────────────────────────────

export const BranchStatusSchema = z.enum(['active', 'inactive', 'suspended'])

/**
 * Schema for creating a new branch.
 */
export const CreateBranchSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  branchCode: z.string().min(1, 'Branch code is required').max(20, 'Branch code too long'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  address: z.string().max(500).optional(),
  barangay: z.string().max(100).optional(),
  cityMunicipality: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  managerName: z.string().max(200).optional(),
  isMainBranch: z.boolean().default(false),
  status: BranchStatusSchema.default('active'),
  openedDate: z.number().positive().optional(),
  notes: notesSchema,
  coordinates: z.string().max(50).optional(),
})

/**
 * Schema for updating a branch.
 */
export const UpdateBranchSchema = createUpdateSchema({
  branchCode: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  barangay: z.string().max(100).optional(),
  cityMunicipality: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  managerName: z.string().max(200).optional(),
  isMainBranch: z.boolean().optional(),
  status: BranchStatusSchema.optional(),
  openedDate: z.number().positive().optional(),
  notes: notesSchema.optional(),
  coordinates: z.string().max(50).optional(),
})

/**
 * Schema for querying branches.
 */
export const BranchQuerySchema = createQuerySchema({
  status: BranchStatusSchema.optional(),
  isMainBranch: z.boolean().optional(),
})

// ─── Display Helpers ────────────────────────────────────────

export const BRANCH_STATUS_LABELS: Record<BranchStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

export const BRANCH_STATUS_COLORS: Record<BranchStatus, 'green' | 'gray' | 'red'> = {
  active: 'green',
  inactive: 'gray',
  suspended: 'red',
}
