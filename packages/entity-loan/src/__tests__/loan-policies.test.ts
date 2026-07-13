import { describe, it, expect } from 'vitest'
import { evaluatePolicies, LoanPolicies, LOAN_APPLICATION_POLICIES } from '../loan.policies'
import type { PolicyContext } from '../loan.policies'

const createContext = (overrides?: Partial<PolicyContext>): PolicyContext => ({
  userId: 'user-1',
  tenantId: 'tenant-1',
  roles: ['user'],
  permissions: [],
  ...overrides,
})

describe('Loan Policies', () => {
  describe('Loan CRUD Policies', () => {
    it('should allow admin to do everything', () => {
      const ctx = createContext({ roles: ['admin'] })
      expect(evaluatePolicies('create', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('read', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('update', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('delete', ctx, LoanPolicies).allowed).toBe(true)
    })

    it('should allow manager to do everything', () => {
      const ctx = createContext({ roles: ['manager'] })
      expect(evaluatePolicies('create', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('read', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('update', ctx, LoanPolicies).allowed).toBe(true)
    })

    it('should allow loan_encoder to create and read loans', () => {
      const ctx = createContext({ roles: ['loan_encoder'] })
      expect(evaluatePolicies('create', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('read', ctx, LoanPolicies).allowed).toBe(true)
      expect(evaluatePolicies('delete', ctx, LoanPolicies).allowed).toBe(false)
    })

    it('should deny delete to non-admin/non-manager roles', () => {
      const ctx = createContext({ roles: ['loan_encoder'] })
      expect(evaluatePolicies('delete', ctx, LoanPolicies).allowed).toBe(false)
    })
  })

  describe('Loan Application Policies', () => {
    it('should allow admin to do everything', () => {
      const ctx = createContext({ roles: ['admin'] })
      expect(evaluatePolicies('create', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(true)
      expect(evaluatePolicies('approve', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(true)
    })

    it('should allow manager to approve and read applications', () => {
      const ctx = createContext({ roles: ['manager'] })
      expect(evaluatePolicies('approve', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(true)
      expect(evaluatePolicies('read', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(true)
    })

    it('should allow loan_encoder to create and read but not approve', () => {
      const ctx = createContext({ roles: ['loan_encoder'] })
      expect(evaluatePolicies('create', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(true)
      expect(evaluatePolicies('read', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(true)
      expect(evaluatePolicies('approve', ctx, LOAN_APPLICATION_POLICIES).allowed).toBe(false)
    })
  })
})
