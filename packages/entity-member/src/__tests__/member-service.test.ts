/**
 * ─── Member Service Tests (Enhanced) ─────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { MemberService } from '../member.service'
import type { Member } from '../member.schema'

const createMockMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'm1', tenantId: 'default', firstName: 'Juan', lastName: 'Dela Cruz',
  fullName: 'Juan Dela Cruz', membershipNumber: 'COOP-2026-0001',
  membershipStatus: 'active', membershipType: 'regular',
  pmesCompleted: true, bodResolutionNumber: 'BR-2026-001',
  createdAt: Date.now(), updatedAt: Date.now(), deletedAt: null,
  version: 1, createdBy: 'admin', updatedBy: 'admin',
  ...overrides,
})

describe('MemberService', () => {
  describe('formatFullName', () => {
    it('should format with first and last name', () => {
      expect(MemberService.formatFullName('Juan', 'Dela Cruz')).toBe('Juan Dela Cruz')
    })
    it('should include middle name', () => {
      expect(MemberService.formatFullName('Juan', 'Dela Cruz', 'Santos')).toBe('Juan Santos Dela Cruz')
    })
    it('should include extension', () => {
      expect(MemberService.formatFullName('Juan', 'Dela Cruz', undefined, 'Jr.')).toBe('Juan Dela Cruz Jr.')
    })
    it('should handle all four parts', () => {
      expect(MemberService.formatFullName('Juan', 'Dela Cruz', 'Santos', 'III')).toBe('Juan Santos Dela Cruz III')
    })
  })

  describe('generateMembershipNumber', () => {
    it('should format with leading zeros', () => {
      expect(MemberService.generateMembershipNumber('COOP', 2026, 1)).toBe('COOP-2026-0001')
      expect(MemberService.generateMembershipNumber('COOP', 2026, 123)).toBe('COOP-2026-0123')
    })
    it('should handle large sequences', () => {
      expect(MemberService.generateMembershipNumber('MPC', 2026, 9999)).toBe('MPC-2026-9999')
    })
  })

  describe('canActivate', () => {
    it('should allow activation when eligible', () => {
      expect(MemberService.canActivate(createMockMember({ membershipStatus: 'inactive' })).valid).toBe(true)
    })
    it('should reject if already active', () => {
      const r = MemberService.canActivate(createMockMember())
      expect(r.valid).toBe(false)
      expect(r.reason).toContain('already active')
    })
    it('should reject if PMES not completed', () => {
      const r = MemberService.canActivate(createMockMember({ membershipStatus: 'inactive', pmesCompleted: false }))
      expect(r.valid).toBe(false)
      expect(r.reason).toContain('PMES')
    })
    it('should reject if no BOD resolution', () => {
      const r = MemberService.canActivate(createMockMember({ membershipStatus: 'inactive', bodResolutionNumber: undefined }))
      expect(r.valid).toBe(false)
      expect(r.reason).toContain('resolution')
    })
  })

  describe('canApplyForLoan', () => {
    it('should allow active regular members', () => {
      expect(MemberService.canApplyForLoan(createMockMember()).valid).toBe(true)
    })
    it('should reject inactive members', () => {
      expect(MemberService.canApplyForLoan(createMockMember({ membershipStatus: 'inactive' })).valid).toBe(false)
    })
    it('should reject associate members', () => {
      expect(MemberService.canApplyForLoan(createMockMember({ membershipType: 'associate' })).valid).toBe(false)
    })
    it('should reject terminated members', () => {
      expect(MemberService.canApplyForLoan(createMockMember({ terminationDate: Date.now() })).valid).toBe(false)
    })
    it('should reject suspended members', () => {
      expect(MemberService.canApplyForLoan(createMockMember({ membershipStatus: 'suspended' })).valid).toBe(false)
    })
  })

  describe('hasCompleteRequirements', () => {
    it('should return complete for full member', () => {
      const member = createMockMember({ dateOfBirth: Date.now(), barangay: 'Barangay', cityMunicipality: 'City', province: 'Province', tinNumber: '123-456-789' })
      expect(MemberService.hasCompleteRequirements(member).complete).toBe(true)
    })
    it('should list missing fields for incomplete member', () => {
      const member = createMockMember({ firstName: '', lastName: '', barangay: undefined, cityMunicipality: undefined, province: undefined, tinNumber: undefined, pmesCompleted: false })
      const r = MemberService.hasCompleteRequirements(member)
      expect(r.complete).toBe(false)
      expect(r.missing.length).toBeGreaterThan(3)
    })
  })

  describe('computeAge', () => {
    it('should compute correct age', () => {
      const twentyYearsAgo = Date.now() - 20 * 365.25 * 24 * 60 * 60 * 1000
      expect(MemberService.computeAge(twentyYearsAgo)).toBe(20)
    })
    it('should return 0 for today', () => {
      expect(MemberService.computeAge(Date.now())).toBe(0)
    })
  })

  describe('shouldAutoInactivate', () => {
    it('should inactivate after 3+ years no activity', () => {
      const oldDate = Date.now() - 4 * 365.25 * 24 * 60 * 60 * 1000
      expect(MemberService.shouldAutoInactivate(createMockMember({ updatedAt: oldDate }))).toBe(true)
    })
    it('should not inactivate recently active', () => {
      expect(MemberService.shouldAutoInactivate(createMockMember({ updatedAt: Date.now() }))).toBe(false)
    })
    it('should not inactivate non-active members', () => {
      expect(MemberService.shouldAutoInactivate(createMockMember({ membershipStatus: 'terminated', updatedAt: Date.now() - 4 * 365 * 24 * 60 * 60 * 1000 }))).toBe(false)
    })
  })

  describe('getStatusLabel', () => {
    it('should return correct labels', () => {
      expect(MemberService.getStatusLabel('active')).toBe('Active')
      expect(MemberService.getStatusLabel('terminated')).toBe('Terminated')
      expect(MemberService.getStatusLabel('deceased')).toBe('Deceased')
    })
  })
})
