/**
 * ─── @repo/entity-clinic — Barrel Export ─────────────────────
 * Importing this package registers all Clinic entities with the framework.
 *
 * Usage in apps/web/src/lib/db.ts:
 *   import '@repo/entity-clinic'
 *   // Now all clinic entities are registered, synced, audited, and
 *   // visible in the navigation under the "Clinic" group.
 */

// Self-registers ALL clinic entities on import
export {
  ClinicPatientEntity,
  ClinicDoctorEntity,
  ClinicAppointmentEntity,
  ClinicConsultationRecordEntity,
  ClinicBillingEntity,
} from './clinic.entity'

// ─── ClinicPatient ──────────────────────────────────────────
export type {
  ClinicPatient,
  PatientStatus,
  BloodType,
  Sex,
} from './clinic.schema'

export {
  CreateClinicPatientSchema,
  UpdateClinicPatientSchema,
  ClinicPatientQuerySchema,
  PatientStatusSchema,
  BloodTypeSchema,
  SexSchema,
  PATIENT_STATUS_LABELS,
  PATIENT_STATUS_COLORS,
} from './clinic.schema'

// ─── ClinicDoctor ────────────────────────────────────────────
export type { ClinicDoctor, DoctorStatus } from './clinic.schema'

export {
  CreateClinicDoctorSchema,
  UpdateClinicDoctorSchema,
  DoctorStatusSchema,
  DOCTOR_STATUS_LABELS,
  DOCTOR_STATUS_COLORS,
} from './clinic.schema'

// ─── ClinicAppointment ───────────────────────────────────────
export type {
  ClinicAppointment,
  AppointmentStatus,
  AppointmentType,
} from './clinic.schema'

export {
  CreateClinicAppointmentSchema,
  UpdateClinicAppointmentSchema,
  AppointmentQuerySchema,
  AppointmentStatusSchema,
  AppointmentTypeSchema,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from './clinic.schema'

// ─── ClinicConsultationRecord ─────────────────────────────────
export type { ClinicConsultationRecord } from './clinic.schema'

export {
  CreateClinicConsultationRecordSchema,
  UpdateClinicConsultationRecordSchema,
} from './clinic.schema'

// ─── ClinicBilling ────────────────────────────────────────────
export type { ClinicBilling, BillingStatus, PaymentMethod } from './clinic.schema'

export {
  CreateClinicBillingSchema,
  UpdateClinicBillingSchema,
  BillingStatusSchema,
  PaymentMethodSchema,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
} from './clinic.schema'

// ─── Services ────────────────────────────────────────────────
export {
  ClinicPatientService,
  ClinicBillingService,
  ClinicAppointmentService,
} from './clinic.service'

// ─── Policies ────────────────────────────────────────────────
export {
  ClinicPatientPolicies,
  ClinicDoctorPolicies,
  ClinicAppointmentPolicies,
  ClinicRecordPolicies,
  ClinicBillingPolicies,
} from './clinic.policies'
