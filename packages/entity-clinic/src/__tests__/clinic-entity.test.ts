import { describe, it, expect } from 'vitest'
import { EntityRegistry } from '@repo/core'

// Import triggers self-registration
import '../clinic.entity'

describe('Clinic Entities', () => {
  it('registers ClinicPatientEntity', () => {
    expect(EntityRegistry.has('clinic_patients')).toBe(true)
    const def = EntityRegistry.get('clinic_patients')
    expect(def.name).toBe('clinic_patients')
    expect(def.ui.navGroup).toBe('Clinic')
    expect(def.ui.labelPlural).toBe('Patients')
    expect(def.sync.priority).toBe('normal')
    expect(def.rbac.permissionPrefix).toBe('clinic_patient')
  })

  it('registers ClinicDoctorEntity', () => {
    expect(EntityRegistry.has('clinic_doctors')).toBe(true)
    const def = EntityRegistry.get('clinic_doctors')
    expect(def.name).toBe('clinic_doctors')
    expect(def.ui.labelPlural).toBe('Doctors')
    expect(def.rbac.permissionPrefix).toBe('clinic_doctor')
  })

  it('registers ClinicAppointmentEntity', () => {
    expect(EntityRegistry.has('clinic_appointments')).toBe(true)
    const def = EntityRegistry.get('clinic_appointments')
    expect(def.name).toBe('clinic_appointments')
    expect(def.ui.labelPlural).toBe('Appointments')
    expect(def.sync.priority).toBe('critical') // time-sensitive
    expect(def.rbac.permissionPrefix).toBe('clinic_appointment')
  })

  it('registers ClinicConsultationRecordEntity', () => {
    expect(EntityRegistry.has('clinic_consultation_records')).toBe(true)
    const def = EntityRegistry.get('clinic_consultation_records')
    expect(def.name).toBe('clinic_consultation_records')
    expect(def.ui.labelPlural).toBe('Consultation Records')
    expect(def.rbac.permissionPrefix).toBe('clinic_record')
  })

  it('registers ClinicBillingEntity', () => {
    expect(EntityRegistry.has('clinic_billing')).toBe(true)
    const def = EntityRegistry.get('clinic_billing')
    expect(def.name).toBe('clinic_billing')
    expect(def.ui.labelPlural).toBe('Billing Records')
    expect(def.rbac.permissionPrefix).toBe('clinic_billing')
  })

  it('all clinic entities have sync enabled', () => {
    const entities = [
      'clinic_patients',
      'clinic_doctors',
      'clinic_appointments',
      'clinic_consultation_records',
      'clinic_billing',
    ]
    for (const name of entities) {
      const def = EntityRegistry.get(name)
      expect(def.sync.enabled).toBe(true)
    }
  })

  it('all clinic entities have audit enabled', () => {
    const entities = [
      'clinic_patients',
      'clinic_doctors',
      'clinic_appointments',
      'clinic_consultation_records',
      'clinic_billing',
    ]
    for (const name of entities) {
      const def = EntityRegistry.get(name)
      expect(def.audit.enabled).toBe(true)
    }
  })

  it('all clinic entities have soft delete', () => {
    const entities = [
      'clinic_patients',
      'clinic_doctors',
      'clinic_appointments',
      'clinic_consultation_records',
      'clinic_billing',
    ]
    for (const name of entities) {
      const def = EntityRegistry.get(name)
      expect(def.softDelete.enabled).toBe(true)
    }
  })
})
