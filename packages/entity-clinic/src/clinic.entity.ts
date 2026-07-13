/**
 * ─── Clinic Entity Definitions ───────────────────────────────
 * All clinic entities self-register with the Entity Registry on import.
 *
 * Importing '@repo/entity-clinic' is enough to wire up:
 *  - Navigation menu items (under "Clinic" group)
 *  - Sync configuration per entity
 *  - RBAC permission prefixes
 *  - Audit trail settings
 *  - Soft delete configuration
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type {
  ClinicPatient,
  ClinicDoctor,
  ClinicAppointment,
  ClinicConsultationRecord,
  ClinicBilling,
} from './clinic.schema'

// ─── Patient Entity ──────────────────────────────────────────

export const ClinicPatientEntity: EntityDefinition<ClinicPatient> = {
  name: 'clinic_patients',
  ui: {
    label: 'Patient',
    labelPlural: 'Patients',
    icon: 'Users',
    routePath: 'clinic/patients',
    color: 'blue',
    showInNav: true,
    navOrder: 10,
    navGroup: 'Clinic',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
    excludeFields: [],
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'clinic_patient',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(ClinicPatientEntity)

// ─── Doctor Entity ───────────────────────────────────────────

export const ClinicDoctorEntity: EntityDefinition<ClinicDoctor> = {
  name: 'clinic_doctors',
  ui: {
    label: 'Doctor',
    labelPlural: 'Doctors',
    icon: 'UserCheck',
    routePath: 'clinic/doctors',
    color: 'green',
    showInNav: true,
    navOrder: 20,
    navGroup: 'Clinic',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'clinic_doctor',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(ClinicDoctorEntity)

// ─── Appointment Entity ──────────────────────────────────────

export const ClinicAppointmentEntity: EntityDefinition<ClinicAppointment> = {
  name: 'clinic_appointments',
  ui: {
    label: 'Appointment',
    labelPlural: 'Appointments',
    icon: 'ScrollText',
    routePath: 'clinic/appointments',
    color: 'purple',
    showInNav: true,
    navOrder: 30,
    navGroup: 'Clinic',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'critical',   // appointments are time-sensitive
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'clinic_appointment',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(ClinicAppointmentEntity)

// ─── Consultation Record Entity ──────────────────────────────

export const ClinicConsultationRecordEntity: EntityDefinition<ClinicConsultationRecord> = {
  name: 'clinic_consultation_records',
  ui: {
    label: 'Consultation Record',
    labelPlural: 'Consultation Records',
    icon: 'FileText',
    routePath: 'clinic/records',
    color: 'yellow',
    showInNav: true,
    navOrder: 40,
    navGroup: 'Clinic',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'clinic_record',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(ClinicConsultationRecordEntity)

// ─── Billing Entity ──────────────────────────────────────────

export const ClinicBillingEntity: EntityDefinition<ClinicBilling> = {
  name: 'clinic_billing',
  ui: {
    label: 'Billing',
    labelPlural: 'Billing Records',
    icon: 'Receipt',
    routePath: 'clinic/billing',
    color: 'green',
    showInNav: true,
    navOrder: 50,
    navGroup: 'Clinic',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'clinic_billing',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(ClinicBillingEntity)
