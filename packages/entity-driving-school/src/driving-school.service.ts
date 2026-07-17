/**
 * ─── Driving School Service — Business Logic ──────────────────
 * Pure functions for driving school management business rules.
 * No I/O — all side effects handled by middleware pipeline.
 *
 * Metadata-driven features:
 *  - LTO compliance field requirements per tenant
 *  - Course pricing per branch
 *  - Installment plan parameters
 *  - Age requirements (may vary by region/LTO regulations)
 *  - Passing score thresholds
 *  - Assessment grading rubrics
 */

import type {
  DrivingStudent,
  DrivingCourse,
  DrivingEnrollment,
  DrivingSchedule,
} from './driving-school.schema'

// ─── Default Metadata-Driven Configuration ──────────────────

export interface DrivingSchoolConfig {
  /** Minimum age for student permit (LTO: 16 for Filipino, may vary) */
  minimumAgeStudentPermit: number
  /** Minimum age for non-professional license */
  minimumAgeNonPro: number
  /** Minimum age for professional license */
  minimumAgeProfessional: number
  /** Passing score for theory exam (percentage) */
  theoryPassingScore: number
  /** Passing score for practical exam (percentage) */
  practicalPassingScore: number
  /** Default TDC hours required (LTO mandate) */
  requiredTDCHours: number
  /** Default PDC hours required (LTO mandate for cars) */
  requiredPDCCarHours: number
  /** Default PDC hours required for motorcycles */
  requiredPDCMotorcycleHours: number
  /** Maximum reschedules allowed per enrollment */
  maxReschedules: number
  /** Installment plan: max number of installments */
  maxInstallments: number
  /** Installment plan: minimum down payment percentage */
  minDownPaymentPercent: number
  /** Certificate validity period in days */
  certificateValidityDays: number
  /** Auto-cancel enrollment if no activity for X days */
  inactivityCancelDays: number
}

export const DEFAULT_DRIVING_SCHOOL_CONFIG: DrivingSchoolConfig = {
  minimumAgeStudentPermit: 16,
  minimumAgeNonPro: 17,
  minimumAgeProfessional: 18,
  theoryPassingScore: 70,
  practicalPassingScore: 75,
  requiredTDCHours: 15,
  requiredPDCCarHours: 8,
  requiredPDCMotorcycleHours: 8,
  maxReschedules: 3,
  maxInstallments: 6,
  minDownPaymentPercent: 30,
  certificateValidityDays: 365,
  inactivityCancelDays: 90,
}

// ─── Student Service ────────────────────────────────────────

export class DrivingStudentService {
  /**
   * Generate student code
   * Pattern: DS-YYYYMM-NNNN
   */
  static generateStudentCode(sequenceNumber: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `DS-${year}${month}-${seq}`
  }

  /**
   * Compute age from date of birth
   */
  static computeAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age
  }

  /**
   * Check if student meets minimum age requirement for a license type.
   * Metadata-driven: age thresholds come from tenant config.
   */
  static meetsAgeRequirement(
    dateOfBirth: string,
    licenseType: 'student_permit' | 'non_professional' | 'professional',
    config: DrivingSchoolConfig = DEFAULT_DRIVING_SCHOOL_CONFIG,
  ): boolean {
    const age = DrivingStudentService.computeAge(dateOfBirth)
    switch (licenseType) {
      case 'student_permit':
        return age >= config.minimumAgeStudentPermit
      case 'non_professional':
        return age >= config.minimumAgeNonPro
      case 'professional':
        return age >= config.minimumAgeProfessional
    }
  }

  /**
   * Check if student permit is expired or expiring soon.
   */
  static checkPermitValidity(
    expiryDate: string,
    warningDays: number = 30,
  ): { valid: boolean; expiring: boolean; expired: boolean; daysRemaining: number } {
    const now = new Date()
    const expiry = new Date(expiryDate + 'T23:59:59')
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      valid: daysRemaining > 0,
      expiring: daysRemaining > 0 && daysRemaining <= warningDays,
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
    }
  }

  /**
   * Prepare student data before create — normalize fields.
   */
  static prepareForCreate(input: Record<string, unknown>): Record<string, unknown> {
    const data = { ...input }
    if (typeof data.firstName === 'string') data.firstName = data.firstName.trim()
    if (typeof data.lastName === 'string') data.lastName = data.lastName.trim()
    if (typeof data.middleName === 'string') data.middleName = data.middleName.trim()
    if (!data.fullName && data.firstName && data.lastName) {
      const middle = data.middleName ? ` ${data.middleName} ` : ' '
      data.fullName = `${data.firstName}${middle}${data.lastName}`
    }
    if (!data.nationality) data.nationality = 'Filipino'
    if (!data.status) data.status = 'inquiry'
    return data
  }
}

// ─── Course Service ─────────────────────────────────────────

export class DrivingCourseService {
  /**
   * Generate course code
   * Pattern: DC-YYYYMM-NNNN
   */
  static generateCourseCode(sequenceNumber: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `DC-${year}${month}-${seq}`
  }

  /**
   * Get required LTO hours for a course category.
   * Metadata-driven: LTO-mandated hours may change.
   */
  static getRequiredLTOHours(
    category: string,
    config: DrivingSchoolConfig = DEFAULT_DRIVING_SCHOOL_CONFIG,
  ): { theoryHours: number; practicalHours: number } {
    switch (category) {
      case 'tdc':
        return { theoryHours: config.requiredTDCHours, practicalHours: 0 }
      case 'pdc_car':
        return { theoryHours: 0, practicalHours: config.requiredPDCCarHours }
      case 'pdc_motorcycle':
        return { theoryHours: 0, practicalHours: config.requiredPDCMotorcycleHours }
      case 'pdc_truck':
        return { theoryHours: 0, practicalHours: 12 }
      default:
        return { theoryHours: 0, practicalHours: 0 }
    }
  }

  /**
   * Compute total course fee (tuition + registration + assessment + certificate).
   */
  static computeTotalFee(course: Pick<DrivingCourse, 'baseTuitionFee' | 'registrationFee' | 'assessmentFee' | 'certificateFee'>): number {
    return course.baseTuitionFee + course.registrationFee + course.assessmentFee + course.certificateFee
  }

  /**
   * Resolve effective tuition fee for a branch.
   * Checks branchFeeOverrides first, falls back to baseTuitionFee.
   */
  static resolveBranchFee(
    course: Pick<DrivingCourse, 'baseTuitionFee' | 'branchFeeOverrides'>,
    branchId?: string,
  ): number {
    if (branchId && course.branchFeeOverrides?.[branchId] !== undefined) {
      return course.branchFeeOverrides[branchId]
    }
    return course.baseTuitionFee
  }
}

// ─── Enrollment Service ────────────────────────────────────

export class DrivingEnrollmentService {
  /**
   * Generate enrollment code
   * Pattern: DE-YYYYMMDD-NNNN
   */
  static generateEnrollmentCode(sequenceNumber: number): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `DE-${datePart}-${seq}`
  }

  /**
   * Compute installment plan details.
   * Metadata-driven: max installments, min down payment from tenant config.
   */
  static computeInstallmentPlan(
    totalFee: number,
    numberOfInstallments: number,
    config: DrivingSchoolConfig = DEFAULT_DRIVING_SCHOOL_CONFIG,
  ): { valid: boolean; plan?: { totalInstallments: number; installmentAmount: number; paidInstallments: number; nextDueDate?: string }; reason?: string } {
    if (numberOfInstallments > config.maxInstallments) {
      return { valid: false, reason: `Maximum ${config.maxInstallments} installments allowed` }
    }

    const minDownPayment = Math.round(totalFee * config.minDownPaymentPercent / 100 * 100) / 100
    const remainingAfterDown = totalFee - minDownPayment
    const installmentAmount = Math.round(remainingAfterDown / (numberOfInstallments - 1) * 100) / 100

    // Next due date 30 days from now
    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + 30)

    return {
      valid: true,
      plan: {
        totalInstallments: numberOfInstallments,
        installmentAmount,
        paidInstallments: 1,  // down payment counts as first installment
        nextDueDate: nextDue.toISOString().slice(0, 10),
      },
    }
  }

  /**
   * Compute enrollment progress as percentage.
   */
  static computeProgress(enrollment: {
    theoryHoursCompleted: number
    practicalHoursCompleted: number
    sessionsAttended: number
    sessionsTotal: number
  }, course: { theoryHours: number; practicalHours: number }): {
    theoryPercent: number
    practicalPercent: number
    overallPercent: number
    sessionsPercent: number
  } {
    const theoryPercent = course.theoryHours > 0
      ? Math.min(100, Math.round(enrollment.theoryHoursCompleted / course.theoryHours * 100))
      : 100
    const practicalPercent = course.practicalHours > 0
      ? Math.min(100, Math.round(enrollment.practicalHoursCompleted / course.practicalHours * 100))
      : 100
    const sessionsPercent = enrollment.sessionsTotal > 0
      ? Math.min(100, Math.round(enrollment.sessionsAttended / enrollment.sessionsTotal * 100))
      : 0
    const overallPercent = Math.round((theoryPercent + practicalPercent + sessionsPercent) / 3)

    return { theoryPercent, practicalPercent, overallPercent, sessionsPercent }
  }

  /**
   * Compute overall grade from theory and practical scores.
   */
  static computeOverallGrade(
    theoryScore?: number,
    practicalScore?: number,
  ): number | undefined {
    if (theoryScore === undefined && practicalScore === undefined) return undefined
    const tScore = theoryScore ?? 0
    const pScore = practicalScore ?? 0
    const count = (theoryScore !== undefined ? 1 : 0) + (practicalScore !== undefined ? 1 : 0)
    return Math.round((tScore + pScore) / count)
  }

  /**
   * Check if student passed both exams.
   */
  static hasPassed(
    theoryScore: number | undefined,
    practicalScore: number | undefined,
    config: DrivingSchoolConfig = DEFAULT_DRIVING_SCHOOL_CONFIG,
  ): { passed: boolean; theoryPassed: boolean; practicalPassed: boolean } {
    const theoryPassed = theoryScore !== undefined && theoryScore >= config.theoryPassingScore
    const practicalPassed = practicalScore !== undefined && practicalScore >= config.practicalPassingScore
    return {
      passed: theoryPassed && practicalPassed,
      theoryPassed,
      practicalPassed,
    }
  }

  /**
   * Compute balance after payment
   */
  static computeBalance(totalFee: number, amountPaid: number): number {
    return Math.max(0, Math.round((totalFee - amountPaid) * 100) / 100)
  }

  /**
   * Format PHP currency
   */
  static formatPHP(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  }
}

// ─── Schedule Service ──────────────────────────────────────

export class DrivingScheduleService {
  /**
   * Generate schedule code
   * Pattern: SCH-YYYYMMDD-NNNN
   */
  static generateScheduleCode(sequenceNumber: number): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `SCH-${datePart}-${seq}`
  }

  /**
   * Compute duration in hours from start and end time.
   */
  static computeDuration(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    return Math.round(((endH! * 60 + endM!) - (startH! * 60 + startM!)) / 60 * 10) / 10
  }

  /**
   * Check for schedule conflict (instructor double-booked).
   * Returns true if there's a conflict.
   */
  static hasConflict(
    newSchedule: { sessionDate: string; startTime: string; endTime: string },
    existingSchedules: { sessionDate: string; startTime: string; endTime: string }[],
  ): boolean {
    const newStart = new Date(`${newSchedule.sessionDate}T${newSchedule.startTime}:00`).getTime()
    const newEnd = new Date(`${newSchedule.sessionDate}T${newSchedule.endTime}:00`).getTime()

    for (const existing of existingSchedules) {
      const existStart = new Date(`${existing.sessionDate}T${existing.startTime}:00`).getTime()
      const existEnd = new Date(`${existing.sessionDate}T${existing.endTime}:00`).getTime()
      // Overlap: newStart < existEnd AND newEnd > existStart
      if (newStart < existEnd && newEnd > existStart) return true
    }
    return false
  }

  /**
   * Check if a session is in the past.
   */
  static isPastSession(sessionDate: string, endTime: string): boolean {
    const sessionEnd = new Date(`${sessionDate}T${endTime}:00`)
    return sessionEnd < new Date()
  }

  /**
   * Get today's sessions filter.
   */
  static getTodayFilter(): string {
    return new Date().toISOString().slice(0, 10)
  }
}

// ─── Vehicle Service ───────────────────────────────────────

export class DrivingVehicleService {
  /**
   * Generate vehicle code
   * Pattern: DV-YYYYMM-NNNN
   */
  static generateVehicleCode(sequenceNumber: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `DV-${year}${month}-${seq}`
  }

  /**
   * Check if registration is expiring soon.
   */
  static checkRegistrationValidity(
    expiryDate: string,
    warningDays: number = 30,
  ): { valid: boolean; expiring: boolean; expired: boolean; daysRemaining: number } {
    const now = new Date()
    const expiry = new Date(expiryDate + 'T23:59:59')
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      valid: daysRemaining > 0,
      expiring: daysRemaining > 0 && daysRemaining <= warningDays,
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
    }
  }

  /**
   * Check if maintenance is due based on odometer.
   */
  static isMaintenanceDue(
    currentOdometer: number,
    nextMaintenanceOdometer?: number,
  ): boolean {
    if (nextMaintenanceOdometer === undefined || nextMaintenanceOdometer === 0) return false
    return currentOdometer >= nextMaintenanceOdometer
  }
}
