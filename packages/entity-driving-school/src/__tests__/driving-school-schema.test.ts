import { describe, it, expect } from 'vitest'
import {
  StudentStatusSchema,
  LicenseTypeSchema,
  CreateDrivingStudentSchema,
  UpdateDrivingStudentSchema,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  InstructorStatusSchema,
  InstructorSpecializationSchema,
  CreateDrivingInstructorSchema,
  INSTRUCTOR_STATUS_LABELS,
  INSTRUCTOR_SPECIALIZATION_LABELS,
  CourseCategorySchema,
  CreateDrivingCourseSchema,
  COURSE_CATEGORY_LABELS,
  EnrollmentStatusSchema,
  CreateDrivingEnrollmentSchema,
  ENROLLMENT_STATUS_LABELS,
  SessionStatusSchema,
  SessionTypeSchema,
  CreateDrivingScheduleSchema,
  SESSION_STATUS_LABELS,
  SESSION_TYPE_LABELS,
  DrivingPaymentMethodSchema,
  CreateDrivingPaymentSchema,
  DRIVING_PAYMENT_METHOD_LABELS,
  DRIVING_PAYMENT_FOR_LABELS,
  VehicleTypeSchema,
  VehicleTransmissionSchema,
  CreateDrivingVehicleSchema,
  VEHICLE_TYPE_LABELS,
  VEHICLE_TRANSMISSION_LABELS,
} from '../driving-school.schema'

// ─── Student ──────────────────────────────────────────────────

describe('StudentStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(StudentStatusSchema.parse('inquiry')).toBe('inquiry')
    expect(StudentStatusSchema.parse('graduated')).toBe('graduated')
  })
})

describe('CreateDrivingStudentSchema', () => {
  const validStudent = {
    tenantId: 't1',
    studentCode: 'DS-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    fullName: 'Juan Dela Cruz',
    sex: 'male' as const,
    dateOfBirth: '1995-05-20',
    phone: '+639171234567',
    address: '123 Main St',
    city: 'Manila',
    province: 'Metro Manila',
    emergencyContactName: 'Maria Dela Cruz',
    emergencyContactPhone: '+639189876543',
    registrationDate: '2024-01-15',
  }

  it('accepts valid student', () => {
    const result = CreateDrivingStudentSchema.parse(validStudent)
    expect(result.firstName).toBe('Juan')
    expect(result.status).toBe('inquiry')
    expect(result.nationality).toBe('Filipino')
    expect(result.bloodType).toBe('unknown')
  })

  it('rejects missing required fields', () => {
    expect(() => CreateDrivingStudentSchema.parse({})).toThrow()
  })

  it('rejects invalid date format', () => {
    expect(() => CreateDrivingStudentSchema.parse({ ...validStudent, dateOfBirth: 'bad' })).toThrow()
  })
})

describe('STUDENT_STATUS_LABELS', () => {
  it('has all labels', () => {
    expect(STUDENT_STATUS_LABELS.inquiry).toBe('Inquiry')
    expect(STUDENT_STATUS_LABELS.graduated).toBe('Graduated')
  })
})

// ─── Instructor ───────────────────────────────────────────────

describe('CreateDrivingInstructorSchema', () => {
  const validInstructor = {
    tenantId: 't1',
    instructorCode: 'INS-001',
    firstName: 'Pedro',
    lastName: 'Santos',
    fullName: 'Pedro Santos',
    phone: '+639171234567',
    ltoAccreditationNumber: 'LTO-ACC-12345',
    ltoAccreditationIssueDate: '2022-01-01',
    ltoAccreditationExpiryDate: '2025-01-01',
    specializations: ['practical_car'] as const,
    licenseType: 'professional' as const,
    licenseNumber: 'LIC-98765',
    licenseExpiryDate: '2026-06-15',
    dateHired: '2023-01-01',
  }

  it('accepts valid instructor', () => {
    const result = CreateDrivingInstructorSchema.parse(validInstructor)
    expect(result.status).toBe('active')
    expect(result.employmentType).toBe('full_time')
    expect(result.maxStudentsPerDay).toBe(8)
  })

  it('rejects empty specializations', () => {
    expect(() =>
      CreateDrivingInstructorSchema.parse({ ...validInstructor, specializations: [] }),
    ).toThrow()
  })
})

describe('INSTRUCTOR_SPECIALIZATION_LABELS', () => {
  it('has labels for all specializations', () => {
    expect(INSTRUCTOR_SPECIALIZATION_LABELS.theoretical).toContain('TDC')
    expect(INSTRUCTOR_SPECIALIZATION_LABELS.practical_car).toContain('Car')
  })
})

// ─── Course ───────────────────────────────────────────────────

describe('CourseCategorySchema', () => {
  it('accepts valid categories', () => {
    expect(CourseCategorySchema.parse('tdc')).toBe('tdc')
    expect(CourseCategorySchema.parse('pdc_car')).toBe('pdc_car')
  })
})

describe('CreateDrivingCourseSchema', () => {
  const validCourse = {
    tenantId: 't1',
    courseCode: 'DC-001',
    name: 'Theoretical Driving Course',
    category: 'tdc' as const,
    totalHours: 15,
    theoryHours: 15,
    practicalHours: 0,
    minSessionsRequired: 5,
  }

  it('accepts valid course', () => {
    const result = CreateDrivingCourseSchema.parse(validCourse)
    expect(result.status).toBe('active')
    expect(result.defaultStartTime).toBe('08:00')
    expect(result.defaultSessionHours).toBe(2)
  })
})

describe('COURSE_CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    expect(COURSE_CATEGORY_LABELS.tdc).toContain('TDC')
    expect(COURSE_CATEGORY_LABELS.pdc_car).toContain('Car')
    expect(COURSE_CATEGORY_LABELS.defensive_driving).toBe('Defensive Driving')
  })
})

// ─── Enrollment ───────────────────────────────────────────────

describe('EnrollmentStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(EnrollmentStatusSchema.parse('pending')).toBe('pending')
    expect(EnrollmentStatusSchema.parse('completed')).toBe('completed')
  })
})

describe('CreateDrivingEnrollmentSchema', () => {
  const validEnrollment = {
    tenantId: 't1',
    enrollmentCode: 'DE-001',
    studentId: 's1',
    studentName: 'Juan Dela Cruz',
    courseId: 'c1',
    courseName: 'TDC',
    enrollmentDate: '2024-06-15',
  }

  it('accepts valid enrollment', () => {
    const result = CreateDrivingEnrollmentSchema.parse(validEnrollment)
    expect(result.status).toBe('pending')
    expect(result.enrollmentType).toBe('full')
  })
})

// ─── Schedule ─────────────────────────────────────────────────

describe('SessionStatusSchema', () => {
  it('accepts all statuses', () => {
    expect(SessionStatusSchema.parse('scheduled')).toBe('scheduled')
    expect(SessionStatusSchema.parse('completed')).toBe('completed')
    expect(SessionStatusSchema.parse('rescheduled')).toBe('rescheduled')
  })
})

describe('CreateDrivingScheduleSchema', () => {
  const validSchedule = {
    tenantId: 't1',
    scheduleCode: 'SCH-001',
    enrollmentId: 'e1',
    studentId: 's1',
    studentName: 'Juan Dela Cruz',
    instructorId: 'i1',
    instructorName: 'Pedro Santos',
    sessionType: 'practical' as const,
    sessionDate: '2024-06-15',
    startTime: '08:00',
    endTime: '10:00',
    durationHours: 2,
  }

  it('accepts valid schedule', () => {
    const result = CreateDrivingScheduleSchema.parse(validSchedule)
    expect(result.status).toBe('scheduled')
    expect(result.isOnsite).toBe(true)
    expect(result.studentAttended).toBe(false)
  })

  it('rejects duration < 0.5', () => {
    expect(() =>
      CreateDrivingScheduleSchema.parse({ ...validSchedule, durationHours: 0.2 }),
    ).toThrow()
  })
})

// ─── Payment ──────────────────────────────────────────────────

describe('DrivingPaymentMethodSchema', () => {
  it('accepts valid methods', () => {
    expect(DrivingPaymentMethodSchema.parse('cash')).toBe('cash')
    expect(DrivingPaymentMethodSchema.parse('gcash')).toBe('gcash')
  })
})

describe('CreateDrivingPaymentSchema', () => {
  const validPayment = {
    tenantId: 't1',
    paymentCode: 'PAY-001',
    enrollmentId: 'e1',
    studentId: 's1',
    studentName: 'Juan Dela Cruz',
    paymentDate: '2024-06-15',
    paymentTime: '09:00',
    amount: 5000,
    paymentMethod: 'cash' as const,
    receivedBy: 'Cashier Name',
  }

  it('accepts valid payment', () => {
    const result = CreateDrivingPaymentSchema.parse(validPayment)
    expect(result.paymentFor).toBe('tuition')
    expect(result.isRefund).toBe(false)
  })

  it('rejects negative amount', () => {
    expect(() =>
      CreateDrivingPaymentSchema.parse({ ...validPayment, amount: -100 }),
    ).toThrow()
  })
})

// ─── Vehicle ──────────────────────────────────────────────────

describe('VehicleTypeSchema', () => {
  it('accepts valid types', () => {
    expect(VehicleTypeSchema.parse('sedan')).toBe('sedan')
    expect(VehicleTypeSchema.parse('motorcycle')).toBe('motorcycle')
  })
})

describe('CreateDrivingVehicleSchema', () => {
  const validVehicle = {
    tenantId: 't1',
    vehicleCode: 'DV-001',
    plateNumber: 'ABC-1234',
    make: 'Toyota',
    model: 'Vios',
    year: 2023,
    type: 'sedan' as const,
    transmission: 'automatic' as const,
    fuelType: 'gasoline' as const,
    ltoRegistrationNumber: 'REG-12345',
    ltoRegistrationExpiry: '2025-06-15',
  }

  it('accepts valid vehicle', () => {
    const result = CreateDrivingVehicleSchema.parse(validVehicle)
    expect(result.hasDualControl).toBe(true)
    expect(result.hasStudentSignage).toBe(true)
    expect(result.status).toBe('active')
  })

  it('rejects year below 1980', () => {
    expect(() =>
      CreateDrivingVehicleSchema.parse({ ...validVehicle, year: 1970 }),
    ).toThrow()
  })
})
