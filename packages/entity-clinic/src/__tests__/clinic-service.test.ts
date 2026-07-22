import { describe, it, expect } from 'vitest'
import {
  ClinicPatientService,
  ClinicBillingService,
  ClinicAppointmentService,
} from '../clinic.service'
import type { ClinicPatient, ClinicBilling } from '../clinic.schema'

// ─── ClinicPatientService ─────────────────────────────────────

describe('ClinicPatientService', () => {
  describe('computeAge', () => {
    it('computes age from date of birth', () => {
      const dob = '1990-01-15'
      const today = new Date()
      const expectedAge = today.getFullYear() - 1990
      // Could be expectedAge or expectedAge-1 depending on month/day
      const age = ClinicPatientService.computeAge(dob)
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1)
      expect(age).toBeLessThanOrEqual(expectedAge)
    })

    it('handles birthday earlier this year', () => {
      const thisYear = new Date().getFullYear()
      const age = ClinicPatientService.computeAge(`${thisYear - 30}-01-01`)
      expect(age).toBeGreaterThanOrEqual(29)
    })
  })

  describe('generatePatientCode', () => {
    it('generates code with correct format', () => {
      const code = ClinicPatientService.generatePatientCode(42)
      expect(code).toMatch(/^PT-\d{6}-0042$/)
    })

    it('pads sequence number', () => {
      const code = ClinicPatientService.generatePatientCode(7)
      expect(code).toMatch(/^PT-\d{6}-0007$/)
    })
  })

  describe('prepareForCreate', () => {
    it('trims names', () => {
      const result = ClinicPatientService.prepareForCreate({
        firstName: '  Juan  ',
        lastName: '  Cruz  ',
      })
      expect(result.firstName).toBe('Juan')
      expect(result.lastName).toBe('Cruz')
    })

    it('computes fullName from first and last name', () => {
      const result = ClinicPatientService.prepareForCreate({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
      })
      expect(result.fullName).toBe('Juan Dela Cruz')
    })

    it('defaults status to active', () => {
      const result = ClinicPatientService.prepareForCreate({
        firstName: 'Test',
        lastName: 'User',
      })
      expect(result.status).toBe('active')
    })

    it('does not overwrite existing fullName', () => {
      const result = ClinicPatientService.prepareForCreate({
        firstName: 'Juan',
        lastName: 'Cruz',
        fullName: 'Juan C. Cruz',
      })
      expect(result.fullName).toBe('Juan C. Cruz')
    })
  })

  describe('isProfileComplete', () => {
    it('returns true for complete profile', () => {
      const patient = {
        firstName: 'Juan',
        lastName: 'Cruz',
        dateOfBirth: '1990-01-01',
        sex: 'male' as const,
        phone: '+639171234567',
      } as ClinicPatient
      expect(ClinicPatientService.isProfileComplete(patient)).toBe(true)
    })

    it('returns false without phone', () => {
      const patient = {
        firstName: 'Juan',
        lastName: 'Cruz',
        dateOfBirth: '1990-01-01',
        sex: 'male' as const,
      } as ClinicPatient
      expect(ClinicPatientService.isProfileComplete(patient)).toBe(false)
    })

    it('returns false without firstName', () => {
      const patient = {
        firstName: '',
        lastName: 'Cruz',
        dateOfBirth: '1990-01-01',
        sex: 'male' as const,
        phone: '+639171234567',
      } as ClinicPatient
      expect(ClinicPatientService.isProfileComplete(patient)).toBe(false)
    })
  })
})

// ─── ClinicBillingService ─────────────────────────────────────

describe('ClinicBillingService', () => {
  describe('computeTotal', () => {
    it('sums fees minus discount', () => {
      const total = ClinicBillingService.computeTotal({
        consultationFee: 500,
        procedureFees: 1000,
        medicationFees: 200,
        discountAmount: 100,
      })
      expect(total).toBe(1600)
    })

    it('clamps to 0 if discount exceeds total', () => {
      const total = ClinicBillingService.computeTotal({
        consultationFee: 100,
        procedureFees: 0,
        medicationFees: 0,
        discountAmount: 200,
      })
      expect(total).toBe(0)
    })
  })

  describe('computeBalance', () => {
    it('computes remaining balance', () => {
      expect(ClinicBillingService.computeBalance(1000, 600)).toBe(400)
    })

    it('clamps to 0 if overpaid', () => {
      expect(ClinicBillingService.computeBalance(1000, 1200)).toBe(0)
    })

    it('returns total if nothing paid', () => {
      expect(ClinicBillingService.computeBalance(500, 0)).toBe(500)
    })
  })

  describe('computeStatus', () => {
    it('returns pending when nothing paid', () => {
      expect(ClinicBillingService.computeStatus(1000, 0)).toBe('pending')
    })

    it('returns partial when partially paid', () => {
      expect(ClinicBillingService.computeStatus(1000, 500)).toBe('partial')
    })

    it('returns paid when fully paid', () => {
      expect(ClinicBillingService.computeStatus(1000, 1000)).toBe('paid')
    })

    it('returns paid when overpaid', () => {
      expect(ClinicBillingService.computeStatus(1000, 1200)).toBe('paid')
    })
  })

  describe('generateBillingCode', () => {
    it('generates correct format', () => {
      const code = ClinicBillingService.generateBillingCode(15)
      expect(code).toMatch(/^BL-\d{8}-0015$/)
    })
  })

  describe('formatPHP', () => {
    it('formats a PHP amount', () => {
      const formatted = ClinicBillingService.formatPHP(1500)
      expect(formatted).toContain('₱')
      expect(formatted).toContain('1,500.00')
    })
  })
})

// ─── ClinicAppointmentService ─────────────────────────────────

describe('ClinicAppointmentService', () => {
  describe('generateAppointmentCode', () => {
    it('generates correct format', () => {
      const code = ClinicAppointmentService.generateAppointmentCode(99)
      expect(code).toMatch(/^APT-\d{8}-0099$/)
    })

    it('pads single digit', () => {
      const code = ClinicAppointmentService.generateAppointmentCode(1)
      expect(code).toMatch(/-0001$/)
    })
  })

  describe('isPastAppointment', () => {
    it('returns true for past appointment', () => {
      const result = ClinicAppointmentService.isPastAppointment('2020-01-01', '10:00')
      expect(result).toBe(true)
    })

    it('returns false for future appointment', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const dateStr = futureDate.toISOString().slice(0, 10)
      const result = ClinicAppointmentService.isPastAppointment(dateStr, '10:00')
      expect(result).toBe(false)
    })
  })

  describe('getTodayFilter', () => {
    it('returns today ISO date', () => {
      const result = ClinicAppointmentService.getTodayFilter()
      const today = new Date().toISOString().slice(0, 10)
      expect(result).toBe(today)
    })
  })
})
