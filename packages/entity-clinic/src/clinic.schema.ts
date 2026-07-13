/**
 * ─── Clinic Management System — Schema ───────────────────────
 * Defines all TypeScript types and Zod validation schemas for the
 * Clinic Management System (CMS) entities.
 *
 * Entities covered:
 *  - ClinicPatient     — Patient demographics and medical history
 *  - ClinicDoctor      — Doctor profiles and specializations
 *  - ClinicAppointment — Scheduling and visit tracking
 *  - ClinicRecord      — Consultation records / SOAP notes
 *  - ClinicPrescription — Drug orders per visit
 *  - ClinicBilling     — Fee collection and billing
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

// ─── ClinicPatient ──────────────────────────────────────────

export type PatientStatus = 'active' | 'inactive' | 'deceased'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
export type Sex = 'male' | 'female' | 'other'

export interface ClinicPatient {
  id: string
  tenantId: string
  patientCode: string
  firstName: string
  lastName: string
  fullName: string
  sex: Sex
  dateOfBirth: string        // ISO date: YYYY-MM-DD
  age?: number               // Computed, not stored
  bloodType: BloodType
  phone?: string
  email?: string
  address?: string
  barangay?: string
  city?: string
  province?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  allergies?: string         // Free text, comma-separated
  chronicConditions?: string // Free text, comma-separated
  status: PatientStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const PatientStatusSchema = z.enum(['active', 'inactive', 'deceased'])
export const BloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
export const SexSchema = z.enum(['male', 'female', 'other'])

export const CreateClinicPatientSchema = z.object({
  tenantId: z.string().min(1),
  patientCode: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  sex: SexSchema,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  bloodType: BloodTypeSchema.default('unknown'),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  barangay: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: phoneSchema.optional(),
  emergencyContactRelation: z.string().max(100).optional(),
  allergies: z.string().max(500).optional(),
  chronicConditions: z.string().max(500).optional(),
  status: PatientStatusSchema.default('active'),
  notes: notesSchema,
})

export const UpdateClinicPatientSchema = createUpdateSchema({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  sex: SexSchema.optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bloodType: BloodTypeSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  barangay: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: phoneSchema.optional(),
  emergencyContactRelation: z.string().max(100).optional(),
  allergies: z.string().max(500).optional(),
  chronicConditions: z.string().max(500).optional(),
  status: PatientStatusSchema.optional(),
  notes: notesSchema.optional(),
})

export const ClinicPatientQuerySchema = createQuerySchema({
  status: PatientStatusSchema.optional(),
  sex: SexSchema.optional(),
  bloodType: BloodTypeSchema.optional(),
})

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  deceased: 'Deceased',
}

export const PATIENT_STATUS_COLORS: Record<PatientStatus, 'green' | 'gray' | 'red'> = {
  active: 'green',
  inactive: 'gray',
  deceased: 'red',
}

// ─── ClinicDoctor ────────────────────────────────────────────

export type DoctorStatus = 'active' | 'inactive' | 'on_leave'

export interface ClinicDoctor {
  id: string
  tenantId: string
  doctorCode: string
  firstName: string
  lastName: string
  fullName: string
  specialization: string
  licenseNumber: string
  phone?: string
  email?: string
  scheduleNotes?: string     // e.g., "Mon/Wed/Fri 8am-12pm"
  consultationFee: number    // in PHP
  status: DoctorStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const DoctorStatusSchema = z.enum(['active', 'inactive', 'on_leave'])

export const CreateClinicDoctorSchema = z.object({
  tenantId: z.string().min(1),
  doctorCode: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  specialization: z.string().min(1).max(200),
  licenseNumber: z.string().min(1).max(50),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  scheduleNotes: z.string().max(500).optional(),
  consultationFee: z.number().min(0).default(0),
  status: DoctorStatusSchema.default('active'),
  notes: notesSchema,
})

export const UpdateClinicDoctorSchema = createUpdateSchema({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  specialization: z.string().min(1).max(200).optional(),
  licenseNumber: z.string().min(1).max(50).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  scheduleNotes: z.string().max(500).optional(),
  consultationFee: z.number().min(0).optional(),
  status: DoctorStatusSchema.optional(),
  notes: notesSchema.optional(),
})

export const DOCTOR_STATUS_LABELS: Record<DoctorStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
}

export const DOCTOR_STATUS_COLORS: Record<DoctorStatus, 'green' | 'gray' | 'yellow'> = {
  active: 'green',
  inactive: 'gray',
  on_leave: 'yellow',
}

// ─── ClinicAppointment ───────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type AppointmentType = 'consultation' | 'follow_up' | 'checkup' | 'procedure' | 'emergency'

export interface ClinicAppointment {
  id: string
  tenantId: string
  appointmentCode: string
  patientId: string
  doctorId: string
  appointmentDate: string    // ISO date: YYYY-MM-DD
  appointmentTime: string    // HH:MM (24h)
  appointmentType: AppointmentType
  chiefComplaint?: string
  status: AppointmentStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const AppointmentStatusSchema = z.enum([
  'scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'
])
export const AppointmentTypeSchema = z.enum([
  'consultation', 'follow_up', 'checkup', 'procedure', 'emergency'
])

export const CreateClinicAppointmentSchema = z.object({
  tenantId: z.string().min(1),
  appointmentCode: z.string().min(1).max(20),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  appointmentType: AppointmentTypeSchema.default('consultation'),
  chiefComplaint: z.string().max(500).optional(),
  status: AppointmentStatusSchema.default('scheduled'),
  notes: notesSchema,
})

export const UpdateClinicAppointmentSchema = createUpdateSchema({
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  appointmentType: AppointmentTypeSchema.optional(),
  chiefComplaint: z.string().max(500).optional(),
  status: AppointmentStatusSchema.optional(),
  notes: notesSchema.optional(),
})

export const AppointmentQuerySchema = createQuerySchema({
  status: AppointmentStatusSchema.optional(),
  appointmentType: AppointmentTypeSchema.optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  appointmentDate: z.string().optional(),
})

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, 'blue' | 'green' | 'yellow' | 'purple' | 'gray' | 'red'> = {
  scheduled: 'blue',
  confirmed: 'green',
  arrived: 'yellow',
  in_progress: 'purple',
  completed: 'green',
  cancelled: 'red',
  no_show: 'gray',
}

// ─── ClinicConsultationRecord ─────────────────────────────────

export interface ClinicConsultationRecord {
  id: string
  tenantId: string
  recordCode: string
  appointmentId: string
  patientId: string
  doctorId: string
  visitDate: string
  // SOAP Notes
  subjective?: string        // Patient's symptoms / chief complaint
  objective?: string         // Doctor's physical findings / vitals
  assessment?: string        // Diagnosis
  plan?: string              // Treatment plan
  // Vitals
  bloodPressure?: string     // e.g., "120/80"
  pulseRate?: number
  temperature?: number       // In Celsius
  weight?: number            // In kg
  height?: number            // In cm
  oxygenSaturation?: number  // SpO2 %
  // ICD Code for diagnosis
  diagnosisCode?: string
  diagnosisDescription?: string
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const CreateClinicConsultationRecordSchema = z.object({
  tenantId: z.string().min(1),
  recordCode: z.string().min(1).max(20),
  appointmentId: z.string().min(1),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  subjective: z.string().max(2000).optional(),
  objective: z.string().max(2000).optional(),
  assessment: z.string().max(2000).optional(),
  plan: z.string().max(2000).optional(),
  bloodPressure: z.string().max(20).optional(),
  pulseRate: z.number().min(0).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  weight: z.number().min(0).max(500).optional(),
  height: z.number().min(0).max(300).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  diagnosisCode: z.string().max(20).optional(),
  diagnosisDescription: z.string().max(500).optional(),
  notes: notesSchema,
})

export const UpdateClinicConsultationRecordSchema = createUpdateSchema({
  subjective: z.string().max(2000).optional(),
  objective: z.string().max(2000).optional(),
  assessment: z.string().max(2000).optional(),
  plan: z.string().max(2000).optional(),
  bloodPressure: z.string().max(20).optional(),
  pulseRate: z.number().min(0).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  weight: z.number().min(0).max(500).optional(),
  height: z.number().min(0).max(300).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  diagnosisCode: z.string().max(20).optional(),
  diagnosisDescription: z.string().max(500).optional(),
  notes: notesSchema.optional(),
})

// ─── ClinicBilling ────────────────────────────────────────────

export type BillingStatus = 'pending' | 'partial' | 'paid' | 'waived' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'maya' | 'bank_transfer' | 'philhealth' | 'hmo'

export interface ClinicBilling {
  id: string
  tenantId: string
  billingCode: string
  appointmentId: string
  patientId: string
  doctorId: string
  billingDate: string
  consultationFee: number    // PHP
  procedureFees: number      // Additional PHP charges
  medicationFees: number     // Dispensed meds cost PHP
  discountAmount: number     // PHP
  totalAmount: number        // PHP
  amountPaid: number         // PHP
  balance: number            // PHP
  paymentMethod?: PaymentMethod
  philhealthClaimed: boolean
  hmoName?: string
  status: BillingStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export const BillingStatusSchema = z.enum(['pending', 'partial', 'paid', 'waived', 'cancelled'])
export const PaymentMethodSchema = z.enum(['cash', 'card', 'gcash', 'maya', 'bank_transfer', 'philhealth', 'hmo'])

export const CreateClinicBillingSchema = z.object({
  tenantId: z.string().min(1),
  billingCode: z.string().min(1).max(20),
  appointmentId: z.string().min(1),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  billingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  consultationFee: z.number().min(0).default(0),
  procedureFees: z.number().min(0).default(0),
  medicationFees: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  amountPaid: z.number().min(0).default(0),
  balance: z.number().default(0),
  paymentMethod: PaymentMethodSchema.optional(),
  philhealthClaimed: z.boolean().default(false),
  hmoName: z.string().max(200).optional(),
  status: BillingStatusSchema.default('pending'),
  notes: notesSchema,
})

export const UpdateClinicBillingSchema = createUpdateSchema({
  consultationFee: z.number().min(0).optional(),
  procedureFees: z.number().min(0).optional(),
  medicationFees: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  balance: z.number().optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  philhealthClaimed: z.boolean().optional(),
  hmoName: z.string().max(200).optional(),
  status: BillingStatusSchema.optional(),
  notes: notesSchema.optional(),
})

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  pending: 'Pending',
  partial: 'Partially Paid',
  paid: 'Fully Paid',
  waived: 'Waived',
  cancelled: 'Cancelled',
}

export const BILLING_STATUS_COLORS: Record<BillingStatus, 'yellow' | 'blue' | 'green' | 'gray' | 'red'> = {
  pending: 'yellow',
  partial: 'blue',
  paid: 'green',
  waived: 'gray',
  cancelled: 'red',
}
