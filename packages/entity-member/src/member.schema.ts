/**
 * ─── Member Schema ───────────────────────────────────────────
 * Philippine Cooperative Member profiles.
 * Compliant with CDA (Cooperative Development Authority) requirements.
 */

import { z } from 'zod'
import { createUpdateSchema, createQuerySchema } from '@repo/core'

// ─── Types ───────────────────────────────────────────────────

export type MembershipStatus = 'active' | 'inactive' | 'suspended' | 'terminated' | 'deceased'
export type MembershipType = 'regular' | 'associate' | 'institutional'
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated' | 'divorced'
export type Gender = 'male' | 'female' | 'other'
export type EducationLevel = 'elementary' | 'highschool' | 'vocational' | 'college' | 'postgraduate'

export interface Member {
  id: string
  tenantId: string

  // Personal Information
  firstName: string
  lastName: string
  middleName?: string
  nameExtension?: string  // Jr., Sr., III, etc.
  fullName: string
  dateOfBirth?: number
  birthplace?: string
  gender?: Gender
  civilStatus?: CivilStatus
  religion?: string
  educationLevel?: EducationLevel

  // Contact
  phone?: string
  email?: string

  // Address (Philippine standard)
  barangay?: string
  cityMunicipality?: string
  province?: string
  zipCode?: string

  // Employment
  employer?: string
  salary?: number
  sourceOfIncome?: string
  otherIncomeSource?: string

  // Cooperative Membership
  membershipNumber: string
  membershipStatus: MembershipStatus
  membershipType: MembershipType
  dateJoined?: number
  dateAccepted?: number
  terminationDate?: number
  terminationResolution?: string
  pmesCompleted: boolean       // Pre-Membership Education Seminar
  pmesDate?: number
  bodResolutionNumber?: string  // Board resolution approving membership

  // Spouse Information
  spouseSurname?: string
  spouseFirstName?: string
  spouseMiddleName?: string
  spouseNameExtension?: string
  spouseDateOfBirth?: number
  spouseBirthplace?: string
  spouseOccupation?: string
  spousePhone?: string

  // Banking
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankBranch?: string

  // Government IDs
  tinNumber?: string

  // Co-maker / Referral
  coMakerName?: string

  // Location / Route
  collectorId?: string
  areaId?: string
  latitude?: number
  longitude?: number

  // Business
  business?: string
  nearestRelative?: string
  numberOfDependents?: number

  // System
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface MemberDependent {
  id: string
  memberId: string
  name: string
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
  dateOfBirth?: number
  age?: number
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

// ─── Schemas ─────────────────────────────────────────────────

export const MembershipStatusSchema = z.enum(['active', 'inactive', 'suspended', 'terminated', 'deceased'])
export const MembershipTypeSchema = z.enum(['regular', 'associate', 'institutional'])
export const CivilStatusSchema = z.enum(['single', 'married', 'widowed', 'separated', 'divorced'])
export const GenderSchema = z.enum(['male', 'female', 'other'])
export const EducationLevelSchema = z.enum(['elementary', 'highschool', 'vocational', 'college', 'postgraduate'])

export const CreateMemberSchema = z.object({
  tenantId: z.string().min(1),

  // Personal Information
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  middleName: z.string().max(100).optional(),
  nameExtension: z.string().max(10).optional(),
  dateOfBirth: z.number().positive().optional(),
  birthplace: z.string().max(200).optional(),
  gender: GenderSchema.optional(),
  civilStatus: CivilStatusSchema.optional(),
  religion: z.string().max(100).optional(),
  educationLevel: EducationLevelSchema.optional(),

  // Contact
  phone: z.string().max(30).optional(),
  email: z.string().email().max(255).optional(),

  // Address
  barangay: z.string().max(100).optional(),
  cityMunicipality: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  zipCode: z.string().max(10).optional(),

  // Employment
  employer: z.string().max(200).optional(),
  salary: z.number().min(0).optional(),
  sourceOfIncome: z.string().max(200).optional(),
  otherIncomeSource: z.string().max(200).optional(),

  // Membership
  membershipNumber: z.string().min(1, 'Membership number is required'),
  membershipStatus: MembershipStatusSchema.default('active'),
  membershipType: MembershipTypeSchema.default('regular'),
  dateJoined: z.number().positive().optional(),
  dateAccepted: z.number().positive().optional(),
  pmesCompleted: z.boolean().default(false),
  pmesDate: z.number().positive().optional(),
  bodResolutionNumber: z.string().max(100).optional(),

  // Spouse
  spouseSurname: z.string().max(100).optional(),
  spouseFirstName: z.string().max(100).optional(),
  spouseMiddleName: z.string().max(100).optional(),
  spouseNameExtension: z.string().max(10).optional(),
  spouseDateOfBirth: z.number().positive().optional(),
  spouseBirthplace: z.string().max(200).optional(),
  spouseOccupation: z.string().max(100).optional(),
  spousePhone: z.string().max(30).optional(),

  // Banking
  bankName: z.string().max(200).optional(),
  bankAccountName: z.string().max(200).optional(),
  bankAccountNumber: z.string().max(50).optional(),
  bankBranch: z.string().max(200).optional(),

  tinNumber: z.string().max(50).optional(),
  coMakerName: z.string().max(200).optional(),
  collectorId: z.string().optional(),
  areaId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  business: z.string().max(200).optional(),
  nearestRelative: z.string().max(200).optional(),
  numberOfDependents: z.number().int().min(0).optional(),
})

export const UpdateMemberSchema = createUpdateSchema({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  nameExtension: z.string().max(10).optional(),
  dateOfBirth: z.number().positive().optional(),
  birthplace: z.string().max(200).optional(),
  gender: GenderSchema.optional(),
  civilStatus: CivilStatusSchema.optional(),
  religion: z.string().max(100).optional(),
  educationLevel: EducationLevelSchema.optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(255).optional(),
  barangay: z.string().max(100).optional(),
  cityMunicipality: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  zipCode: z.string().max(10).optional(),
  employer: z.string().max(200).optional(),
  salary: z.number().min(0).optional(),
  sourceOfIncome: z.string().max(200).optional(),
  otherIncomeSource: z.string().max(200).optional(),
  membershipStatus: MembershipStatusSchema.optional(),
  membershipType: MembershipTypeSchema.optional(),
  dateJoined: z.number().positive().optional(),
  dateAccepted: z.number().positive().optional(),
  pmesCompleted: z.boolean().optional(),
  pmesDate: z.number().positive().optional(),
  bodResolutionNumber: z.string().max(100).optional(),
  spouseSurname: z.string().max(100).optional(),
  spouseFirstName: z.string().max(100).optional(),
  spouseMiddleName: z.string().max(100).optional(),
  spouseNameExtension: z.string().max(10).optional(),
  spouseDateOfBirth: z.number().positive().optional(),
  spouseBirthplace: z.string().max(200).optional(),
  spouseOccupation: z.string().max(100).optional(),
  spousePhone: z.string().max(30).optional(),
  bankName: z.string().max(200).optional(),
  bankAccountName: z.string().max(200).optional(),
  bankAccountNumber: z.string().max(50).optional(),
  bankBranch: z.string().max(200).optional(),
  tinNumber: z.string().max(50).optional(),
  coMakerName: z.string().max(200).optional(),
  collectorId: z.string().optional(),
  areaId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  business: z.string().max(200).optional(),
  nearestRelative: z.string().max(200).optional(),
  numberOfDependents: z.number().int().min(0).optional(),
})

export const MemberQuerySchema = createQuerySchema({
  membershipStatus: MembershipStatusSchema.optional(),
  membershipType: MembershipTypeSchema.optional(),
  gender: GenderSchema.optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(),
  province: z.string().optional(),
  collectorId: z.string().optional(),
  areaId: z.string().optional(),
  pmesCompleted: z.boolean().optional(),
})

export const CreateDependentSchema = z.object({
  memberId: z.string().min(1),
  name: z.string().min(1).max(200),
  relationship: z.enum(['spouse', 'child', 'parent', 'sibling', 'other']),
  dateOfBirth: z.number().positive().optional(),
  age: z.number().int().min(0).optional(),
})

// ─── Display Helpers ────────────────────────────────────────

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  terminated: 'Terminated',
  deceased: 'Deceased',
}

export const MEMBERSHIP_STATUS_COLORS: Record<MembershipStatus, 'green' | 'gray' | 'yellow' | 'red' | 'blue'> = {
  active: 'green',
  inactive: 'gray',
  suspended: 'yellow',
  terminated: 'red',
  deceased: 'blue',
}

export const MEMBERSHIP_TYPE_LABELS: Record<MembershipType, string> = {
  regular: 'Regular',
  associate: 'Associate',
  institutional: 'Institutional',
}

export const CIVIL_STATUS_LABELS: Record<CivilStatus, string> = {
  single: 'Single',
  married: 'Married',
  widowed: 'Widowed',
  separated: 'Separated',
  divorced: 'Divorced',
}
