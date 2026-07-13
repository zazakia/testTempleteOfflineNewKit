/**
 * ─── Clinic Service — Business Logic ─────────────────────────
 * Pure functions for clinic business rules.
 * No I/O — all side effects are handled by middleware pipeline.
 */

import type { ClinicPatient, ClinicBilling, ClinicAppointment } from './clinic.schema'

export class ClinicPatientService {
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
   * Generate patient code with prefix
   * Pattern: PT-YYYYMM-NNNN
   */
  static generatePatientCode(sequenceNumber: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `PT-${year}${month}-${seq}`
  }

  /**
   * Prepare patient data before create — normalize names
   */
  static prepareForCreate(input: Record<string, unknown>): Record<string, unknown> {
    const data = { ...input }
    if (typeof data.firstName === 'string') {
      data.firstName = data.firstName.trim()
    }
    if (typeof data.lastName === 'string') {
      data.lastName = data.lastName.trim()
    }
    if (!data.fullName && data.firstName && data.lastName) {
      data.fullName = `${data.firstName} ${data.lastName}`
    }
    if (!data.status) {
      data.status = 'active'
    }
    return data
  }

  /**
   * Check if patient record is complete (for analytics)
   */
  static isProfileComplete(patient: ClinicPatient): boolean {
    return !!(
      patient.firstName &&
      patient.lastName &&
      patient.dateOfBirth &&
      patient.sex &&
      patient.phone
    )
  }
}

export class ClinicBillingService {
  /**
   * Compute total amount from individual fees
   */
  static computeTotal(params: {
    consultationFee: number
    procedureFees: number
    medicationFees: number
    discountAmount: number
  }): number {
    const subtotal = params.consultationFee + params.procedureFees + params.medicationFees
    return Math.max(0, subtotal - params.discountAmount)
  }

  /**
   * Compute balance after payment
   */
  static computeBalance(totalAmount: number, amountPaid: number): number {
    return Math.max(0, totalAmount - amountPaid)
  }

  /**
   * Determine billing status from amounts
   */
  static computeStatus(
    totalAmount: number,
    amountPaid: number,
  ): 'pending' | 'partial' | 'paid' {
    if (amountPaid <= 0) return 'pending'
    if (amountPaid >= totalAmount) return 'paid'
    return 'partial'
  }

  /**
   * Generate billing code
   * Pattern: BL-YYYYMMDD-NNNN
   */
  static generateBillingCode(sequenceNumber: number): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `BL-${datePart}-${seq}`
  }

  /**
   * Format PHP currency
   */
  static formatPHP(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  }
}

export class ClinicAppointmentService {
  /**
   * Generate appointment code
   * Pattern: APT-YYYYMMDD-NNNN
   */
  static generateAppointmentCode(sequenceNumber: number): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(sequenceNumber).padStart(4, '0')
    return `APT-${datePart}-${seq}`
  }

  /**
   * Check if appointment time has passed (for auto-marking no-shows)
   */
  static isPastAppointment(appointmentDate: string, appointmentTime: string): boolean {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)
    return appointmentDateTime < new Date()
  }

  /**
   * Get today's appointments filter
   */
  static getTodayFilter(): string {
    return new Date().toISOString().slice(0, 10)
  }
}
