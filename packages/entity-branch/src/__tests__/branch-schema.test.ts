/**
 * ─── Branch Schema Tests ─────────────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import {
  CreateBranchSchema,
  UpdateBranchSchema,
  BranchStatusSchema,
  BRANCH_STATUS_LABELS,
  BRANCH_STATUS_COLORS,
} from '../branch.schema'
import { BranchService } from '../branch.service'

describe('Branch Schema', () => {
  describe('CreateBranchSchema', () => {
    it('should validate a valid branch creation input', () => {
      const input = {
        tenantId: 'tenant-1',
        branchCode: 'TEST-MAIN',
        name: 'Test Branch',
        isMainBranch: false,
        status: 'active',
      }
      const result = CreateBranchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const result = CreateBranchSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject empty branchCode', () => {
      const result = CreateBranchSchema.safeParse({
        tenantId: 't1',
        branchCode: '',
        name: 'Test',
      })
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const input = {
        tenantId: 'tenant-1',
        branchCode: 'T-B',
        name: 'Branch',
        phone: '09123456789',
        email: 'branch@test.com',
        address: '123 Street',
        barangay: 'Barangay 1',
        cityMunicipality: 'Test City',
        province: 'Test Province',
        managerName: 'John Doe',
        notes: 'A test branch',
        coordinates: '14.123,121.456',
      }
      const result = CreateBranchSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe('09123456789')
        expect(result.data.email).toBe('branch@test.com')
      }
    })

    it('should set default values', () => {
      const input = {
        tenantId: 'tenant-1',
        branchCode: 'DEF',
        name: 'Default Test',
      }
      const result = CreateBranchSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isMainBranch).toBe(false)
        expect(result.data.status).toBe('active')
      }
    })
  })

  describe('UpdateBranchSchema', () => {
    it('should validate partial updates', () => {
      const result = UpdateBranchSchema.safeParse({
        version: 1,
        name: 'Updated Name',
      })
      expect(result.success).toBe(true)
    })

    it('should require version for concurrency', () => {
      const result = UpdateBranchSchema.safeParse({ name: 'X' })
      expect(result.success).toBe(false)
    })
  })

  describe('BranchStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(BranchStatusSchema.safeParse('active').success).toBe(true)
      expect(BranchStatusSchema.safeParse('inactive').success).toBe(true)
      expect(BranchStatusSchema.safeParse('suspended').success).toBe(true)
    })

    it('should reject invalid statuses', () => {
      expect(BranchStatusSchema.safeParse('closed').success).toBe(false)
      expect(BranchStatusSchema.safeParse('deleted').success).toBe(false)
    })
  })

  describe('BRANCH_STATUS_LABELS', () => {
    it('should have labels for all statuses', () => {
      expect(BRANCH_STATUS_LABELS.active).toBe('Active')
      expect(BRANCH_STATUS_LABELS.inactive).toBe('Inactive')
      expect(BRANCH_STATUS_LABELS.suspended).toBe('Suspended')
    })
  })

  describe('BRANCH_STATUS_COLORS', () => {
    it('should have colors for all statuses', () => {
      expect(BRANCH_STATUS_COLORS.active).toBe('green')
      expect(BRANCH_STATUS_COLORS.inactive).toBe('gray')
      expect(BRANCH_STATUS_COLORS.suspended).toBe('red')
    })
  })
})

describe('BranchService', () => {
  describe('prepareForCreate', () => {
    it('should uppercase the branch code', () => {
      const result = BranchService.prepareForCreate({
        branchCode: 'test-br',
        name: 'Test Branch',
      })
      expect(result.branchCode).toBe('TEST-BR')
    })

    it('should title-case the name', () => {
      const result = BranchService.prepareForCreate({
        branchCode: 'T',
        name: '  test branch name  ',
      })
      expect(result.name).toBe('Test Branch Name')
    })

    it('should set defaults', () => {
      const result = BranchService.prepareForCreate({
        branchCode: 'T-M',
        name: 'Test',
      })
      expect(result.isMainBranch).toBe(false)
      expect(result.status).toBe('active')
      expect(result.openedDate).toBeDefined()
    })
  })

  describe('validate', () => {
    it('should pass for valid data', () => {
      const result = BranchService.validate({
        name: 'Valid Branch',
        branchCode: 'VALID-01',
      })
      expect(result.valid).toBe(true)
    })

    it('should fail for empty name', () => {
      const result = BranchService.validate({ name: '', branchCode: 'X' })
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('name')
    })

    it('should fail for empty code', () => {
      const result = BranchService.validate({ name: 'N', branchCode: '' })
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('code')
    })

    it('should fail for invalid code format (lowercase)', () => {
      const result = BranchService.validate({ name: 'N', branchCode: 'lowercase' })
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('uppercase')
    })
  })

  describe('generateBranchCode', () => {
    it('should generate a branch code from tenant slug and location', () => {
      const code = BranchService.generateBranchCode('batangas', 'lipa')
      expect(code).toBe('BAT-LIPA')
    })

    it('should handle short inputs', () => {
      const code = BranchService.generateBranchCode('ab', 'cd')
      expect(code).toBe('AB-CD')
    })

    it('should strip non-alphanumeric from location', () => {
      const code = BranchService.generateBranchCode('coop', 'san jose')
      expect(code).toBe('COO-SANJ')
    })
  })

  describe('canDeactivate', () => {
    it('should allow deactivating non-main branch', () => {
      const branch = { id: '1', isMainBranch: false, status: 'active' } as any
      const all = [branch]
      const result = BranchService.canDeactivate(branch, all)
      expect(result.allowed).toBe(true)
    })

    it('should not allow deactivating the only active main branch', () => {
      const branch = { id: '1', isMainBranch: true, status: 'active' } as any
      const all = [branch]
      const result = BranchService.canDeactivate(branch, all)
      expect(result.allowed).toBe(false)
    })

    it('should allow deactivating main branch when another active branch exists', () => {
      const main = { id: '1', isMainBranch: true, status: 'active' } as any
      const other = { id: '2', isMainBranch: false, status: 'active' } as any
      const result = BranchService.canDeactivate(main, [main, other])
      expect(result.allowed).toBe(true)
    })
  })

  describe('getSummary', () => {
    it('should compute summary statistics', () => {
      const branch = {
        id: '1',
        name: 'Test Branch',
        branchCode: 'T-M',
        isMainBranch: true,
        status: 'active' as const,
        openedDate: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
      } as any
      const summary = BranchService.getSummary(branch, 100, 50, 50000)
      expect(summary.branchName).toBe('Test Branch')
      expect(summary.memberCount).toBe(100)
      expect(summary.loanCount).toBe(50)
      expect(summary.totalDeposits).toBe(50000)
      expect(summary.daysSinceOpened).toBeGreaterThanOrEqual(29)
    })
  })
})
