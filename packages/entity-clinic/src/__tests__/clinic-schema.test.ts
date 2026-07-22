import { describe, it, expect } from 'vitest'
import {
  PatientStatusSchema,
  BloodTypeSchema,
  SexSchema,
  CreateClinicPatientSchema,
  UpdateClinicPatientSchema,
  ClinicPatientQuerySchema,
  PATIENT_STATUS_LABELS,
  PATIENT_STATUS_COLORS,
  DoctorStatusSchema,
  CreateClinicDoctorSchema,
  UpdateClinicDoctorSchema,
  DOCTOR_STATUS_LABELS,
  DOCTOR_STATUS_COLORS,
  AppointmentStatusSchema,
  AppointmentTypeSchema,
  CreateClinicAppointmentSchema,
  UpdateClinicAppointmentSchema,
  AppointmentQuerySchema,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  CreateClinicConsultationRecordSchema,
  UpdateClinicConsultationRecordSchema,
  BillingStatusSchema,
  PaymentMethodSchema,
  CreateClinicBillingSchema,
  UpdateClinicBillingSchema,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
} from '../clinic.schema'

// ─── Patient ──────────────────────────────────────────────────

describe('PatientStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(PatientStatusSchema.parse('active')).toBe('active')
    expect(PatientStatusSchema.parse('inactive')).toBe('inactive')
    expect(PatientStatusSchema.parse('deceased')).toBe('deceased')
  })
  it('rejects invalid status', () => {
    expect(() => PatientStatusSchema.parse('unknown')).toThrow()
  })
})

describe('BloodTypeSchema', () => {
  it('accepts valid blood types', () => {
    expect(BloodTypeSchema.parse('A+')).toBe('A+')
    expect(BloodTypeSchema.parse('O-')).toBe('O-')
    expect(BloodTypeSchema.parse('unknown')).toBe('unknown')
  })
  it('rejects invalid', () => {
    expect(() => BloodTypeSchema.parse('X+')).toThrow()
  })
})

describe('SexSchema', () => {
  it('accepts valid sexes', () => {
    expect(SexSchema.parse('male')).toBe('male')
    expect(SexSchema.parse('female')).toBe('female')
    expect(SexSchema.parse('other')).toBe('other')
  })
})

describe('CreateClinicPatientSchema', () => {
  const validPatient = {
    tenantId: 't1',
    patientCode: 'PT-202401-0001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    fullName: 'Juan Dela Cruz',
    sex: 'male' as const,
    dateOfBirth: '1990-01-15',
  }

  it('accepts valid patient', () => {
    const result = CreateClinicPatientSchema.parse(validPatient)
    expect(result.firstName).toBe('Juan')
    expect(result.bloodType).toBe('unknown') // default
    expect(result.status).toBe('active') // default
  })

  it('rejects missing required fields', () => {
    expect(() => CreateClinicPatientSchema.parse({})).toThrow()
  })

  it('rejects invalid dateOfBirth format', () => {
    expect(() =>
      CreateClinicPatientSchema.parse({ ...validPatient, dateOfBirth: '15/01/1990' }),
    ).toThrow()
  })

  it('accepts optional fields', () => {
    const result = CreateClinicPatientSchema.parse({
      ...validPatient,
      phone: '+639171234567',
      email: 'juan@example.com',
      address: '123 Main St',
      allergies: 'Penicillin',
      status: 'inactive',
    })
    expect(result.phone).toBe('+639171234567')
    expect(result.allergies).toBe('Penicillin')
    expect(result.status).toBe('inactive')
  })
})

describe('UpdateClinicPatientSchema', () => {
  it('accepts partial update with version', () => {
    const result = UpdateClinicPatientSchema.parse({
      firstName: 'John',
      version: 1,
    })
    expect(result.firstName).toBe('John')
  })

  it('rejects update without version', () => {
    expect(() => UpdateClinicPatientSchema.parse({ firstName: 'John' })).toThrow()
  })
})

describe('ClinicPatientQuerySchema', () => {
  it('accepts query params', () => {
    const result = ClinicPatientQuerySchema.parse({ limit: 10 })
    expect(result.limit).toBe(10)
  })

  it('accepts filter array', () => {
    const result = ClinicPatientQuerySchema.parse({
      filter: [{ field: 'status', operator: 'eq' as const, value: 'active' }],
    })
    expect(result.filter).toHaveLength(1)
  })
})

describe('PATIENT_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(PATIENT_STATUS_LABELS.active).toBe('Active')
    expect(PATIENT_STATUS_LABELS.inactive).toBe('Inactive')
    expect(PATIENT_STATUS_LABELS.deceased).toBe('Deceased')
  })
})

describe('PATIENT_STATUS_COLORS', () => {
  it('maps to valid colors', () => {
    expect(PATIENT_STATUS_COLORS.active).toBe('green')
    expect(PATIENT_STATUS_COLORS.inactive).toBe('gray')
    expect(PATIENT_STATUS_COLORS.deceased).toBe('red')
  })
})

// ─── Doctor ───────────────────────────────────────────────────

describe('DoctorStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(DoctorStatusSchema.parse('active')).toBe('active')
    expect(DoctorStatusSchema.parse('on_leave')).toBe('on_leave')
  })
})

describe('CreateClinicDoctorSchema', () => {
  const validDoctor = {
    tenantId: 't1',
    doctorCode: 'DR-001',
    firstName: 'Maria',
    lastName: 'Santos',
    fullName: 'Maria Santos',
    specialization: 'Cardiology',
    licenseNumber: 'LIC-12345',
  }

  it('accepts valid doctor', () => {
    const result = CreateClinicDoctorSchema.parse(validDoctor)
    expect(result.status).toBe('active')
    expect(result.consultationFee).toBe(0)
  })

  it('rejects missing required fields', () => {
    expect(() => CreateClinicDoctorSchema.parse({})).toThrow()
  })
})

describe('DOCTOR_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(DOCTOR_STATUS_LABELS.active).toBe('Active')
    expect(DOCTOR_STATUS_LABELS.on_leave).toBe('On Leave')
  })
})

// ─── Appointment ──────────────────────────────────────────────

describe('AppointmentStatusSchema', () => {
  it('accepts all statuses', () => {
    expect(AppointmentStatusSchema.parse('scheduled')).toBe('scheduled')
    expect(AppointmentStatusSchema.parse('completed')).toBe('completed')
    expect(AppointmentStatusSchema.parse('no_show')).toBe('no_show')
  })
})

describe('CreateClinicAppointmentSchema', () => {
  const validAppt = {
    tenantId: 't1',
    appointmentCode: 'APT-001',
    patientId: 'p1',
    doctorId: 'd1',
    appointmentDate: '2024-06-15',
    appointmentTime: '09:00',
  }

  it('accepts valid appointment', () => {
    const result = CreateClinicAppointmentSchema.parse(validAppt)
    expect(result.status).toBe('scheduled')
    expect(result.appointmentType).toBe('consultation')
  })

  it('rejects invalid time format', () => {
    expect(() =>
      CreateClinicAppointmentSchema.parse({ ...validAppt, appointmentTime: '9:00' }),
    ).toThrow()
  })

  it('rejects invalid date format', () => {
    expect(() =>
      CreateClinicAppointmentSchema.parse({ ...validAppt, appointmentDate: '06/15/2024' }),
    ).toThrow()
  })
})

describe('APPOINTMENT_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(APPOINTMENT_STATUS_LABELS.scheduled).toBe('Scheduled')
    expect(APPOINTMENT_STATUS_LABELS.in_progress).toBe('In Progress')
    expect(APPOINTMENT_STATUS_LABELS.cancelled).toBe('Cancelled')
  })
})

// ─── Consultation Record ──────────────────────────────────────

describe('CreateClinicConsultationRecordSchema', () => {
  const validRecord = {
    tenantId: 't1',
    recordCode: 'REC-001',
    appointmentId: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    visitDate: '2024-06-15',
  }

  it('accepts valid record', () => {
    const result = CreateClinicConsultationRecordSchema.parse(validRecord)
    expect(result.recordCode).toBe('REC-001')
  })

  it('accepts SOAP note fields', () => {
    const result = CreateClinicConsultationRecordSchema.parse({
      ...validRecord,
      subjective: 'Patient reports headache',
      objective: 'BP 120/80, HR 72',
      assessment: 'Tension headache',
      plan: 'Prescribed ibuprofen',
      bloodPressure: '120/80',
      pulseRate: 72,
      temperature: 36.5,
      weight: 70,
      height: 170,
      oxygenSaturation: 98,
      diagnosisCode: 'G44.2',
    })
    expect(result.subjective).toBeDefined()
    expect(result.pulseRate).toBe(72)
    expect(result.diagnosisCode).toBe('G44.2')
  })

  it('rejects out-of-range vital values', () => {
    expect(() =>
      CreateClinicConsultationRecordSchema.parse({
        ...validRecord,
        temperature: 50, // too high
      }),
    ).toThrow()
  })
})

// ─── Billing ──────────────────────────────────────────────────

describe('BillingStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(BillingStatusSchema.parse('pending')).toBe('pending')
    expect(BillingStatusSchema.parse('paid')).toBe('paid')
  })
})

describe('PaymentMethodSchema', () => {
  it('accepts valid methods', () => {
    expect(PaymentMethodSchema.parse('cash')).toBe('cash')
    expect(PaymentMethodSchema.parse('gcash')).toBe('gcash')
  })
})

describe('CreateClinicBillingSchema', () => {
  const validBilling = {
    tenantId: 't1',
    billingCode: 'BL-001',
    appointmentId: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    billingDate: '2024-06-15',
  }

  it('accepts valid billing', () => {
    const result = CreateClinicBillingSchema.parse(validBilling)
    expect(result.status).toBe('pending')
    expect(result.consultationFee).toBe(0)
    expect(result.philhealthClaimed).toBe(false)
  })

  it('accepts with fees', () => {
    const result = CreateClinicBillingSchema.parse({
      ...validBilling,
      consultationFee: 500,
      procedureFees: 1000,
      medicationFees: 200,
      discountAmount: 100,
      totalAmount: 1600,
      amountPaid: 1000,
      paymentMethod: 'cash',
    })
    expect(result.totalAmount).toBe(1600)
    expect(result.amountPaid).toBe(1000)
  })
})

describe('BILLING_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(BILLING_STATUS_LABELS.pending).toBe('Pending')
    expect(BILLING_STATUS_LABELS.partial).toBe('Partially Paid')
    expect(BILLING_STATUS_LABELS.paid).toBe('Fully Paid')
    expect(BILLING_STATUS_LABELS.waived).toBe('Waived')
    expect(BILLING_STATUS_LABELS.cancelled).toBe('Cancelled')
  })
})
