/**
 * ─── Driving School Management System — Schema ─────────────────
 * Defines all TypeScript types and Zod validation schemas for the
 * multi-branch Driving School Management System.
 *
 * Entities covered:
 *  - DrivingStudent      — Student profiles with LTO compliance
 *  - DrivingInstructor   — Instructor profiles and certifications
 *  - DrivingCourse       — Course catalog (TDC, PDC, etc.)
 *  - DrivingEnrollment   — Student enrollment in courses
 *  - DrivingSchedule     — Session/lesson scheduling
 *  - DrivingPayment      — Fee collection and tracking
 *  - DrivingVehicle      — Training vehicle fleet management
 */

import { z } from 'zod'
import {
  baseEntitySchema,
  emailSchema,
  phoneSchema,
  notesSchema,
  createQuerySchema,
  createUpdateSchema,
} from '@repo/core'

// ─── DrivingStudent ───────────────────────────────────────────

export type StudentStatus = 'inquiry' | 'enrolled' | 'active' | 'completed' | 'dropped' | 'graduated'
export type LicenseType = 'student_permit' | 'non_professional' | 'professional'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
export type Sex = 'male' | 'female' | 'other'

export interface DrivingStudent {
  id: string
  tenantId: string
  branchId?: string
  studentCode: string
  firstName: string
  lastName: string
  fullName: string
  middleName?: string
  sex: Sex
  dateOfBirth: string            // ISO date YYYY-MM-DD
  age?: number                   // Computed
  birthplace?: string
  nationality: string
  civilStatus: 'single' | 'married' | 'widowed' | 'separated' | 'divorced'
  phone: string
  email?: string
  address: string
  barangay?: string
  city: string
  province: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation?: string
  // LTO Compliance Fields (metadata-driven per tenant)
  ltoStudentPermitNumber?: string
  ltoStudentPermitIssueDate?: string      // ISO date
  ltoStudentPermitExpiryDate?: string     // ISO date
  ltoClientId?: string                    // LTO Client ID
  // Medical
  medicalCertificateDate?: string
  medicalCertificateExpiry?: string
  bloodType: BloodType
  // Education
  highestEducation: 'elementary' | 'high_school' | 'college' | 'vocational' | 'post_grad'
  // Driving History
  hasPriorDrivingExperience: boolean
  priorDrivingYears?: number
  hasExistingLicense: boolean
  existingLicenseType?: LicenseType
  existingLicenseNumber?: string
  // Vision
  hasEyeglasses: boolean
  // Status tracking
  status: StudentStatus
  registrationDate: string               // ISO date
  expectedCompletionDate?: string
  actualCompletionDate?: string
  // Photo / Signature (URL references, not binary)
  photoUrl?: string
  signatureUrl?: string
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const StudentStatusSchema = z.enum(['inquiry', 'enrolled', 'active', 'completed', 'dropped', 'graduated'])
export const LicenseTypeSchema = z.enum(['student_permit', 'non_professional', 'professional'])
export const BloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
export const SexSchema = z.enum(['male', 'female', 'other'])

export const CreateDrivingStudentSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  studentCode: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  middleName: z.string().max(100).optional(),
  sex: SexSchema,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  birthplace: z.string().max(200).optional(),
  nationality: z.string().max(100).default('Filipino'),
  civilStatus: z.enum(['single', 'married', 'widowed', 'separated', 'divorced']).default('single'),
  phone: phoneSchema,
  email: emailSchema.optional(),
  address: z.string().min(1).max(500),
  barangay: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  province: z.string().min(1).max(100),
  emergencyContactName: z.string().min(1).max(200),
  emergencyContactPhone: phoneSchema,
  emergencyContactRelation: z.string().max(100).optional(),
  ltoStudentPermitNumber: z.string().max(50).optional(),
  ltoStudentPermitIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ltoStudentPermitExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ltoClientId: z.string().max(50).optional(),
  medicalCertificateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  medicalCertificateExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bloodType: BloodTypeSchema.default('unknown'),
  highestEducation: z.enum(['elementary', 'high_school', 'college', 'vocational', 'post_grad']).default('high_school'),
  hasPriorDrivingExperience: z.boolean().default(false),
  priorDrivingYears: z.number().int().min(0).max(60).optional(),
  hasExistingLicense: z.boolean().default(false),
  existingLicenseType: LicenseTypeSchema.optional(),
  existingLicenseNumber: z.string().max(50).optional(),
  hasEyeglasses: z.boolean().default(false),
  status: StudentStatusSchema.default('inquiry'),
  registrationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  expectedCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  actualCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  photoUrl: z.string().url().optional(),
  signatureUrl: z.string().url().optional(),
  notes: notesSchema,
})

export const UpdateDrivingStudentSchema = createUpdateSchema({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  middleName: z.string().max(100).optional(),
  sex: SexSchema.optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birthplace: z.string().max(200).optional(),
  nationality: z.string().max(100).optional(),
  civilStatus: z.enum(['single', 'married', 'widowed', 'separated', 'divorced']).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().min(1).max(500).optional(),
  barangay: z.string().max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  province: z.string().min(1).max(100).optional(),
  emergencyContactName: z.string().min(1).max(200).optional(),
  emergencyContactPhone: phoneSchema.optional(),
  emergencyContactRelation: z.string().max(100).optional(),
  ltoStudentPermitNumber: z.string().max(50).optional(),
  ltoStudentPermitIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ltoStudentPermitExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ltoClientId: z.string().max(50).optional(),
  medicalCertificateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  medicalCertificateExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bloodType: BloodTypeSchema.optional(),
  highestEducation: z.enum(['elementary', 'high_school', 'college', 'vocational', 'post_grad']).optional(),
  hasPriorDrivingExperience: z.boolean().optional(),
  priorDrivingYears: z.number().int().min(0).max(60).optional(),
  hasExistingLicense: z.boolean().optional(),
  existingLicenseType: LicenseTypeSchema.optional(),
  existingLicenseNumber: z.string().max(50).optional(),
  hasEyeglasses: z.boolean().optional(),
  status: StudentStatusSchema.optional(),
  expectedCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  actualCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  photoUrl: z.string().url().optional(),
  signatureUrl: z.string().url().optional(),
  notes: notesSchema.optional(),
})

export const DrivingStudentQuerySchema = createQuerySchema({
  status: StudentStatusSchema.optional(),
  branchId: z.string().optional(),
  licenseType: LicenseTypeSchema.optional(),
  registrationDate: z.string().optional(),
})

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  inquiry: 'Inquiry',
  enrolled: 'Enrolled',
  active: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
  graduated: 'Graduated',
}

export const STUDENT_STATUS_COLORS: Record<StudentStatus, 'blue' | 'yellow' | 'green' | 'red' | 'purple'> = {
  inquiry: 'blue',
  enrolled: 'yellow',
  active: 'green',
  completed: 'purple',
  dropped: 'red',
  graduated: 'green',
}

// ─── DrivingInstructor ────────────────────────────────────────

export type InstructorStatus = 'active' | 'inactive' | 'on_leave'
export type InstructorSpecialization = 'theoretical' | 'practical_motorcycle' | 'practical_car' | 'practical_truck' | 'heavy_equipment' | 'defensive_driving'

export interface DrivingInstructor {
  id: string
  tenantId: string
  branchId?: string
  instructorCode: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  email?: string
  address?: string
  // LTO Accreditation
  ltoAccreditationNumber: string
  ltoAccreditationIssueDate: string
  ltoAccreditationExpiryDate: string
  // Specialization
  specializations: InstructorSpecialization[]   // JSONB array
  // Experience
  yearsOfExperience: number
  // License held
  licenseType: LicenseType
  licenseNumber: string
  licenseExpiryDate: string
  // Employment
  dateHired: string
  employmentType: 'full_time' | 'part_time' | 'contract'
  maxStudentsPerDay: number
  // Rate
  ratePerHour: number               // PHP
  // Schedule preferences (metadata-driven)
  schedulePreferences?: Record<string, unknown>   // JSONB
  status: InstructorStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const InstructorStatusSchema = z.enum(['active', 'inactive', 'on_leave'])
export const InstructorSpecializationSchema = z.enum([
  'theoretical', 'practical_motorcycle', 'practical_car',
  'practical_truck', 'heavy_equipment', 'defensive_driving',
])

export const CreateDrivingInstructorSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  instructorCode: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  phone: phoneSchema,
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  ltoAccreditationNumber: z.string().min(1).max(50),
  ltoAccreditationIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  ltoAccreditationExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  specializations: z.array(InstructorSpecializationSchema).min(1),
  yearsOfExperience: z.number().int().min(0).max(50).default(0),
  licenseType: LicenseTypeSchema,
  licenseNumber: z.string().min(1).max(50),
  licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateHired: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employmentType: z.enum(['full_time', 'part_time', 'contract']).default('full_time'),
  maxStudentsPerDay: z.number().int().min(1).max(20).default(8),
  ratePerHour: z.number().min(0).default(0),
  schedulePreferences: z.record(z.unknown()).optional(),
  status: InstructorStatusSchema.default('active'),
  notes: notesSchema,
})

export const UpdateDrivingInstructorSchema = createUpdateSchema({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  ltoAccreditationNumber: z.string().min(1).max(50).optional(),
  ltoAccreditationIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ltoAccreditationExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  specializations: z.array(InstructorSpecializationSchema).min(1).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  licenseType: LicenseTypeSchema.optional(),
  licenseNumber: z.string().min(1).max(50).optional(),
  licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract']).optional(),
  maxStudentsPerDay: z.number().int().min(1).max(20).optional(),
  ratePerHour: z.number().min(0).optional(),
  schedulePreferences: z.record(z.unknown()).optional(),
  status: InstructorStatusSchema.optional(),
  notes: notesSchema.optional(),
})

export const DrivingInstructorQuerySchema = createQuerySchema({
  status: InstructorStatusSchema.optional(),
  branchId: z.string().optional(),
  specialization: InstructorSpecializationSchema.optional(),
})

export const INSTRUCTOR_STATUS_LABELS: Record<InstructorStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
}

export const INSTRUCTOR_SPECIALIZATION_LABELS: Record<InstructorSpecialization, string> = {
  theoretical: 'Theoretical (TDC)',
  practical_motorcycle: 'Practical — Motorcycle',
  practical_car: 'Practical — Car',
  practical_truck: 'Practical — Truck',
  heavy_equipment: 'Heavy Equipment',
  defensive_driving: 'Defensive Driving',
}

// ─── DrivingCourse ────────────────────────────────────────────

export type CourseCategory = 'tdc' | 'pdc_motorcycle' | 'pdc_car' | 'pdc_truck' | 'refresher' | 'defensive_driving' | 'heavy_equipment' | 'special_training'
export type CourseStatus = 'active' | 'inactive' | 'coming_soon'
export type CourseDurationUnit = 'hours' | 'days' | 'weeks'

export interface DrivingCourse {
  id: string
  tenantId: string
  courseCode: string
  name: string
  description?: string
  category: CourseCategory
  // Duration
  totalHours: number                // Theory + Practical combined
  theoryHours: number
  practicalHours: number
  minSessionsRequired: number       // LTO-mandated minimum
  // Pricing (metadata-driven per branch)
  baseTuitionFee: number            // PHP
  branchFeeOverrides?: Record<string, number>    // branchId -> override
  // Additional fees
  registrationFee: number
  assessmentFee: number
  certificateFee: number
  // LTO Compliance
  ltoCourseCode?: string            // LTO-registered course code
  ltoAccredited: boolean
  requiresStudentPermit: boolean
  requiresMedicalCertificate: boolean
  // Prerequisites
  minimumAge: number
  prerequisiteCourseId?: string     // Must complete this course first
  // Capacity
  maxStudentsPerClass: number
  // Schedule
  defaultStartTime: string          // HH:MM
  defaultSessionHours: number       // hours per session
  status: CourseStatus
  sortOrder: number
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const CourseCategorySchema = z.enum([
  'tdc', 'pdc_motorcycle', 'pdc_car', 'pdc_truck',
  'refresher', 'defensive_driving', 'heavy_equipment', 'special_training',
])

export const CreateDrivingCourseSchema = z.object({
  tenantId: z.string().min(1),
  courseCode: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: CourseCategorySchema,
  totalHours: z.number().min(1).max(500),
  theoryHours: z.number().min(0).default(0),
  practicalHours: z.number().min(0).default(0),
  minSessionsRequired: z.number().int().min(1).max(100),
  baseTuitionFee: z.number().min(0).default(0),
  branchFeeOverrides: z.record(z.number().min(0)).optional(),
  registrationFee: z.number().min(0).default(0),
  assessmentFee: z.number().min(0).default(0),
  certificateFee: z.number().min(0).default(0),
  ltoCourseCode: z.string().max(50).optional(),
  ltoAccredited: z.boolean().default(false),
  requiresStudentPermit: z.boolean().default(true),
  requiresMedicalCertificate: z.boolean().default(true),
  minimumAge: z.number().int().min(16).max(65).default(17),
  prerequisiteCourseId: z.string().optional(),
  maxStudentsPerClass: z.number().int().min(1).max(50).default(15),
  defaultStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM').default('08:00'),
  defaultSessionHours: z.number().min(1).max(8).default(2),
  status: z.enum(['active', 'inactive', 'coming_soon']).default('active'),
  sortOrder: z.number().int().min(0).default(0),
  notes: notesSchema,
})

export const UpdateDrivingCourseSchema = createUpdateSchema({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: CourseCategorySchema.optional(),
  totalHours: z.number().min(1).max(500).optional(),
  theoryHours: z.number().min(0).optional(),
  practicalHours: z.number().min(0).optional(),
  minSessionsRequired: z.number().int().min(1).max(100).optional(),
  baseTuitionFee: z.number().min(0).optional(),
  branchFeeOverrides: z.record(z.number().min(0)).optional(),
  registrationFee: z.number().min(0).optional(),
  assessmentFee: z.number().min(0).optional(),
  certificateFee: z.number().min(0).optional(),
  ltoCourseCode: z.string().max(50).optional(),
  ltoAccredited: z.boolean().optional(),
  requiresStudentPermit: z.boolean().optional(),
  requiresMedicalCertificate: z.boolean().optional(),
  minimumAge: z.number().int().min(16).max(65).optional(),
  prerequisiteCourseId: z.string().optional(),
  maxStudentsPerClass: z.number().int().min(1).max(50).optional(),
  defaultStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  defaultSessionHours: z.number().min(1).max(8).optional(),
  status: z.enum(['active', 'inactive', 'coming_soon']).optional(),
  sortOrder: z.number().int().min(0).optional(),
  notes: notesSchema.optional(),
})

export const DrivingCourseQuerySchema = createQuerySchema({
  category: CourseCategorySchema.optional(),
  status: z.enum(['active', 'inactive', 'coming_soon']).optional(),
})

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  tdc: 'Theoretical Driving Course (TDC)',
  pdc_motorcycle: 'Practical Driving Course — Motorcycle',
  pdc_car: 'Practical Driving Course — Car',
  pdc_truck: 'Practical Driving Course — Truck',
  refresher: 'Refresher Course',
  defensive_driving: 'Defensive Driving',
  heavy_equipment: 'Heavy Equipment Operation',
  special_training: 'Special Training',
}

// ─── DrivingEnrollment ────────────────────────────────────────

export type EnrollmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'refunded'
export type EnrollmentType = 'full' | 'installment'

export interface DrivingEnrollment {
  id: string
  tenantId: string
  branchId?: string
  enrollmentCode: string
  studentId: string
  studentName: string          // denormalized
  courseId: string
  courseName: string            // denormalized
  enrollmentDate: string        // ISO date
  startDate?: string
  expectedEndDate?: string
  actualEndDate?: string
  // Assigned instructor
  instructorId?: string
  instructorName?: string       // denormalized
  // Fee breakdown
  tuitionFee: number            // PHP (resolved from course + branch overrides)
  registrationFee: number
  assessmentFee: number
  certificateFee: number
  discountAmount: number
  totalFee: number
  amountPaid: number
  balance: number
  enrollmentType: EnrollmentType
  // Installment plan (metadata-driven)
  installmentPlan?: {
    totalInstallments: number
    installmentAmount: number
    paidInstallments: number
    nextDueDate?: string
  }
  // Progress tracking
  theoryHoursCompleted: number
  practicalHoursCompleted: number
  sessionsAttended: number
  sessionsTotal: number
  // Assessment
  theoryExamScore?: number
  practicalExamScore?: number
  overallGrade?: number
  hasCertificateIssued: boolean
  certificateIssueDate?: string
  certificateNumber?: string
  // LTO
  ltoSubmissionDate?: string
  ltoReferenceNumber?: string
  status: EnrollmentStatus
  cancellationReason?: string
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const EnrollmentStatusSchema = z.enum([
  'pending', 'confirmed', 'in_progress', 'completed', 'failed', 'cancelled', 'refunded',
])

export const CreateDrivingEnrollmentSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  enrollmentCode: z.string().min(1).max(20),
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(200),
  courseId: z.string().min(1),
  courseName: z.string().min(1).max(200),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expectedEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  instructorId: z.string().optional(),
  instructorName: z.string().max(200).optional(),
  tuitionFee: z.number().min(0).default(0),
  registrationFee: z.number().min(0).default(0),
  assessmentFee: z.number().min(0).default(0),
  certificateFee: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  totalFee: z.number().min(0).default(0),
  amountPaid: z.number().min(0).default(0),
  balance: z.number().default(0),
  enrollmentType: z.enum(['full', 'installment']).default('full'),
  installmentPlan: z.object({
    totalInstallments: z.number().int().min(2),
    installmentAmount: z.number().min(0),
    paidInstallments: z.number().int().min(0).default(0),
    nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional(),
  theoryHoursCompleted: z.number().min(0).default(0),
  practicalHoursCompleted: z.number().min(0).default(0),
  sessionsAttended: z.number().int().min(0).default(0),
  sessionsTotal: z.number().int().min(0).default(0),
  status: EnrollmentStatusSchema.default('pending'),
  notes: notesSchema,
})

export const UpdateDrivingEnrollmentSchema = createUpdateSchema({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expectedEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  actualEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  instructorId: z.string().optional(),
  instructorName: z.string().max(200).optional(),
  tuitionFee: z.number().min(0).optional(),
  registrationFee: z.number().min(0).optional(),
  assessmentFee: z.number().min(0).optional(),
  certificateFee: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  totalFee: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  balance: z.number().optional(),
  enrollmentType: z.enum(['full', 'installment']).optional(),
  installmentPlan: z.object({
    totalInstallments: z.number().int().min(2),
    installmentAmount: z.number().min(0),
    paidInstallments: z.number().int().min(0),
    nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional(),
  theoryHoursCompleted: z.number().min(0).optional(),
  practicalHoursCompleted: z.number().min(0).optional(),
  sessionsAttended: z.number().int().min(0).optional(),
  sessionsTotal: z.number().int().min(0).optional(),
  theoryExamScore: z.number().min(0).max(100).optional(),
  practicalExamScore: z.number().min(0).max(100).optional(),
  overallGrade: z.number().min(0).max(100).optional(),
  hasCertificateIssued: z.boolean().optional(),
  certificateIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  certificateNumber: z.string().max(50).optional(),
  ltoSubmissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ltoReferenceNumber: z.string().max(50).optional(),
  status: EnrollmentStatusSchema.optional(),
  cancellationReason: z.string().max(500).optional(),
  notes: notesSchema.optional(),
})

export const DrivingEnrollmentQuerySchema = createQuerySchema({
  status: EnrollmentStatusSchema.optional(),
  studentId: z.string().optional(),
  courseId: z.string().optional(),
  instructorId: z.string().optional(),
  branchId: z.string().optional(),
  enrollmentDate: z.string().optional(),
})

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, 'blue' | 'yellow' | 'green' | 'red' | 'gray' | 'purple'> = {
  pending: 'blue',
  confirmed: 'yellow',
  in_progress: 'green',
  completed: 'purple',
  failed: 'red',
  cancelled: 'gray',
  refunded: 'red',
}

// ─── DrivingSchedule ──────────────────────────────────────────

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
export type SessionType = 'theory' | 'practical' | 'assessment' | 'remedial'

export interface DrivingSchedule {
  id: string
  tenantId: string
  branchId?: string
  scheduleCode: string
  enrollmentId: string
  studentId: string
  studentName: string
  instructorId: string
  instructorName: string
  vehicleId?: string               // For practical sessions
  sessionType: SessionType
  sessionDate: string              // ISO date YYYY-MM-DD
  startTime: string                // HH:MM
  endTime: string                  // HH:MM
  durationHours: number
  // Topics covered
  topicsCovered?: string            // Free text or structured JSON
  skillsPracticed?: string
  // Assessment (for assessment sessions)
  assessmentScore?: number
  assessmentNotes?: string
  // Attendance
  studentAttended: boolean
  instructorConfirmed: boolean
  attendanceConfirmedAt?: number   // Timestamp
  // Location
  isOnsite: boolean
  location?: string
  // Vehicle tracking (for practical)
  odometerStart?: number
  odometerEnd?: number
  fuelUsed?: number
  // Reschedule tracking
  originalScheduleId?: string      // If this is a reschedule
  rescheduleReason?: string
  rescheduleCount: number
  status: SessionStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const SessionStatusSchema = z.enum([
  'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled',
])
export const SessionTypeSchema = z.enum(['theory', 'practical', 'assessment', 'remedial'])

export const CreateDrivingScheduleSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  scheduleCode: z.string().min(1).max(20),
  enrollmentId: z.string().min(1),
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(200),
  instructorId: z.string().min(1),
  instructorName: z.string().min(1).max(200),
  vehicleId: z.string().optional(),
  sessionType: SessionTypeSchema,
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  durationHours: z.number().min(0.5).max(8),
  topicsCovered: z.string().max(500).optional(),
  skillsPracticed: z.string().max(500).optional(),
  assessmentScore: z.number().min(0).max(100).optional(),
  assessmentNotes: z.string().max(500).optional(),
  studentAttended: z.boolean().default(false),
  instructorConfirmed: z.boolean().default(false),
  attendanceConfirmedAt: z.number().optional(),
  isOnsite: z.boolean().default(true),
  location: z.string().max(300).optional(),
  odometerStart: z.number().min(0).optional(),
  odometerEnd: z.number().min(0).optional(),
  fuelUsed: z.number().min(0).optional(),
  originalScheduleId: z.string().optional(),
  rescheduleReason: z.string().max(300).optional(),
  rescheduleCount: z.number().int().min(0).default(0),
  status: SessionStatusSchema.default('scheduled'),
  notes: notesSchema,
})

export const UpdateDrivingScheduleSchema = createUpdateSchema({
  instructorId: z.string().optional(),
  instructorName: z.string().max(200).optional(),
  vehicleId: z.string().optional(),
  sessionType: SessionTypeSchema.optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationHours: z.number().min(0.5).max(8).optional(),
  topicsCovered: z.string().max(500).optional(),
  skillsPracticed: z.string().max(500).optional(),
  assessmentScore: z.number().min(0).max(100).optional(),
  assessmentNotes: z.string().max(500).optional(),
  studentAttended: z.boolean().optional(),
  instructorConfirmed: z.boolean().optional(),
  attendanceConfirmedAt: z.number().optional(),
  isOnsite: z.boolean().optional(),
  location: z.string().max(300).optional(),
  odometerStart: z.number().min(0).optional(),
  odometerEnd: z.number().min(0).optional(),
  fuelUsed: z.number().min(0).optional(),
  status: SessionStatusSchema.optional(),
  notes: notesSchema.optional(),
})

export const DrivingScheduleQuerySchema = createQuerySchema({
  status: SessionStatusSchema.optional(),
  sessionType: SessionTypeSchema.optional(),
  studentId: z.string().optional(),
  instructorId: z.string().optional(),
  enrollmentId: z.string().optional(),
  branchId: z.string().optional(),
  sessionDate: z.string().optional(),
})

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  rescheduled: 'Rescheduled',
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  theory: 'Theory',
  practical: 'Practical / Behind-the-Wheel',
  assessment: 'Assessment / Exam',
  remedial: 'Remedial',
}

// ─── DrivingPayment ───────────────────────────────────────────

export type DrivingPaymentMethod = 'cash' | 'gcash' | 'maya' | 'bank_transfer' | 'card' | 'check'
export type DrivingPaymentFor = 'tuition' | 'registration' | 'assessment' | 'certificate' | 'installment' | 'other'

export interface DrivingPayment {
  id: string
  tenantId: string
  branchId?: string
  paymentCode: string
  enrollmentId: string
  studentId: string
  studentName: string
  paymentDate: string
  paymentTime: string
  amount: number
  paymentMethod: DrivingPaymentMethod
  referenceNumber?: string
  paymentFor: DrivingPaymentFor
  installmentNumber?: number      // Which installment this pays for
  officialReceiptNumber?: string
  receivedBy: string
  isRefund: boolean
  refundReason?: string
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const DrivingPaymentMethodSchema = z.enum([
  'cash', 'gcash', 'maya', 'bank_transfer', 'card', 'check',
])
export const DrivingPaymentForSchema = z.enum([
  'tuition', 'registration', 'assessment', 'certificate', 'installment', 'other',
])

export const CreateDrivingPaymentSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  paymentCode: z.string().min(1).max(20),
  enrollmentId: z.string().min(1),
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(200),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  paymentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  amount: z.number().min(0),
  paymentMethod: DrivingPaymentMethodSchema,
  referenceNumber: z.string().max(100).optional(),
  paymentFor: DrivingPaymentForSchema.default('tuition'),
  installmentNumber: z.number().int().min(1).optional(),
  officialReceiptNumber: z.string().max(50).optional(),
  receivedBy: z.string().min(1),
  isRefund: z.boolean().default(false),
  refundReason: z.string().max(300).optional(),
  notes: notesSchema,
})

export const UpdateDrivingPaymentSchema = createUpdateSchema({
  amount: z.number().min(0).optional(),
  paymentMethod: DrivingPaymentMethodSchema.optional(),
  referenceNumber: z.string().max(100).optional(),
  paymentFor: DrivingPaymentForSchema.optional(),
  installmentNumber: z.number().int().min(1).optional(),
  officialReceiptNumber: z.string().max(50).optional(),
  isRefund: z.boolean().optional(),
  refundReason: z.string().max(300).optional(),
  notes: notesSchema.optional(),
})

export const DrivingPaymentQuerySchema = createQuerySchema({
  enrollmentId: z.string().optional(),
  studentId: z.string().optional(),
  paymentFor: DrivingPaymentForSchema.optional(),
  branchId: z.string().optional(),
  paymentDate: z.string().optional(),
  isRefund: z.boolean().optional(),
})

export const DRIVING_PAYMENT_METHOD_LABELS: Record<DrivingPaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  check: 'Check',
}

export const DRIVING_PAYMENT_FOR_LABELS: Record<DrivingPaymentFor, string> = {
  tuition: 'Tuition Fee',
  registration: 'Registration Fee',
  assessment: 'Assessment Fee',
  certificate: 'Certificate Fee',
  installment: 'Installment Payment',
  other: 'Other',
}

// ─── DrivingVehicle ───────────────────────────────────────────

export type VehicleType = 'sedan' | 'hatchback' | 'suv' | 'pickup' | 'van' | 'truck' | 'bus' | 'motorcycle'
export type VehicleTransmission = 'manual' | 'automatic' | 'semi_automatic'
export type VehicleFuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid'
export type VehicleStatus = 'active' | 'maintenance' | 'out_of_service' | 'for_sale'

export interface DrivingVehicle {
  id: string
  tenantId: string
  branchId?: string
  vehicleCode: string
  plateNumber: string
  make: string                      // e.g. Toyota
  model: string                     // e.g. Vios
  year: number
  type: VehicleType
  transmission: VehicleTransmission
  fuelType: VehicleFuelType
  color?: string
  // Registration
  ltoRegistrationNumber: string
  ltoRegistrationExpiry: string     // ISO date
  insuranceProvider?: string
  insurancePolicyNumber?: string
  insuranceExpiryDate?: string
  // Training Equipment
  hasDualControl: boolean           // Dual brake/clutch for instructor
  hasDashCam: boolean
  hasStudentSignage: boolean
  // Maintenance
  odometerReading: number           // km
  lastMaintenanceDate?: string
  lastMaintenanceOdometer?: number
  nextMaintenanceOdometer?: number
  maintenanceNotes?: string
  // Assignment
  assignedBranchId?: string
  assignedInstructorId?: string     // Primary instructor
  // Status
  status: VehicleStatus
  acquisitionDate?: string
  acquisitionCost?: number
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const VehicleTypeSchema = z.enum([
  'sedan', 'hatchback', 'suv', 'pickup', 'van', 'truck', 'bus', 'motorcycle',
])
export const VehicleTransmissionSchema = z.enum(['manual', 'automatic', 'semi_automatic'])
export const VehicleFuelTypeSchema = z.enum(['gasoline', 'diesel', 'electric', 'hybrid'])

export const CreateDrivingVehicleSchema = z.object({
  tenantId: z.string().min(1),
  branchId: z.string().optional(),
  vehicleCode: z.string().min(1).max(20),
  plateNumber: z.string().min(1).max(20),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1980).max(2030),
  type: VehicleTypeSchema,
  transmission: VehicleTransmissionSchema,
  fuelType: VehicleFuelTypeSchema,
  color: z.string().max(50).optional(),
  ltoRegistrationNumber: z.string().min(1).max(50),
  ltoRegistrationExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  insuranceProvider: z.string().max(200).optional(),
  insurancePolicyNumber: z.string().max(100).optional(),
  insuranceExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hasDualControl: z.boolean().default(true),
  hasDashCam: z.boolean().default(false),
  hasStudentSignage: z.boolean().default(true),
  odometerReading: z.number().min(0).default(0),
  lastMaintenanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lastMaintenanceOdometer: z.number().min(0).optional(),
  nextMaintenanceOdometer: z.number().min(0).optional(),
  maintenanceNotes: z.string().max(500).optional(),
  assignedBranchId: z.string().optional(),
  assignedInstructorId: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'out_of_service', 'for_sale']).default('active'),
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  acquisitionCost: z.number().min(0).optional(),
  notes: notesSchema,
})

export const UpdateDrivingVehicleSchema = createUpdateSchema({
  plateNumber: z.string().min(1).max(20).optional(),
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1980).max(2030).optional(),
  type: VehicleTypeSchema.optional(),
  transmission: VehicleTransmissionSchema.optional(),
  fuelType: VehicleFuelTypeSchema.optional(),
  color: z.string().max(50).optional(),
  ltoRegistrationNumber: z.string().min(1).max(50).optional(),
  ltoRegistrationExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  insuranceProvider: z.string().max(200).optional(),
  insurancePolicyNumber: z.string().max(100).optional(),
  insuranceExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hasDualControl: z.boolean().optional(),
  hasDashCam: z.boolean().optional(),
  hasStudentSignage: z.boolean().optional(),
  odometerReading: z.number().min(0).optional(),
  lastMaintenanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lastMaintenanceOdometer: z.number().min(0).optional(),
  nextMaintenanceOdometer: z.number().min(0).optional(),
  maintenanceNotes: z.string().max(500).optional(),
  assignedBranchId: z.string().optional(),
  assignedInstructorId: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'out_of_service', 'for_sale']).optional(),
  notes: notesSchema.optional(),
})

export const DrivingVehicleQuerySchema = createQuerySchema({
  type: VehicleTypeSchema.optional(),
  transmission: VehicleTransmissionSchema.optional(),
  status: z.enum(['active', 'maintenance', 'out_of_service', 'for_sale']).optional(),
  branchId: z.string().optional(),
  assignedInstructorId: z.string().optional(),
})

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  suv: 'SUV',
  pickup: 'Pickup Truck',
  van: 'Van',
  truck: 'Truck',
  bus: 'Bus',
  motorcycle: 'Motorcycle',
}

export const VEHICLE_TRANSMISSION_LABELS: Record<VehicleTransmission, string> = {
  manual: 'Manual',
  automatic: 'Automatic',
  semi_automatic: 'Semi-Automatic',
}
