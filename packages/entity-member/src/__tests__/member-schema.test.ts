import { describe, it, expect } from 'vitest'
import { CreateMemberSchema, UpdateMemberSchema } from '../member.schema'

describe('Member Schema', () => {
  describe('CreateMemberSchema', () => {
    it('should validate a valid member input', () => {
      const valid = CreateMemberSchema.safeParse({
        tenantId: 'tenant-1',
        firstName: 'Juan',
        lastName: 'dela Cruz',
        membershipNumber: 'MEM-00001',
        pmesCompleted: true,
      })
      expect(valid.success).toBe(true)
    })

    it('should reject missing firstName', () => {
      const invalid = CreateMemberSchema.safeParse({
        tenantId: 'tenant-1',
        lastName: 'dela Cruz',
        membershipNumber: 'MEM-00001',
      })
      expect(invalid.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const invalid = CreateMemberSchema.safeParse({
        tenantId: 'tenant-1',
        firstName: 'Juan',
        lastName: 'dela Cruz',
        membershipNumber: 'MEM-00001',
        email: 'invalid-email',
      })
      expect(invalid.success).toBe(false)
    })
  })

  describe('UpdateMemberSchema', () => {
    it('should validate partial updates but require version', () => {
      const valid = UpdateMemberSchema.safeParse({
        firstName: 'John',
        version: 2,
      })
      expect(valid.success).toBe(true)
    })

    it('should reject updates missing version', () => {
      const invalid = UpdateMemberSchema.safeParse({
        firstName: 'John',
      })
      expect(invalid.success).toBe(false)
    })
  })
})
