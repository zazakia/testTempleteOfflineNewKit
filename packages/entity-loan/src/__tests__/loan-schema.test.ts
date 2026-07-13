import { describe, it, expect } from 'vitest'
import { CreateLoanSchema, CreateLoanApplicationSchema, CreateLoanProductSchema, CreatePaymentSchema } from '../loan.schema'

describe('Loan Schemas', () => {
  describe('CreateLoanProductSchema', () => {
    it('should validate valid loan products', () => {
      const valid = CreateLoanProductSchema.safeParse({
        productType: 'regular',
        label: 'Regular Loan Product',
        defaultRatePercent: 12,
        defaultTerm: 12,
      })
      expect(valid.success).toBe(true)
    })

    it('should reject invalid defaultRatePercent', () => {
      const invalid = CreateLoanProductSchema.safeParse({
        productType: 'regular',
        label: 'Regular Loan Product',
        defaultRatePercent: 150, // exceeds 100
        defaultTerm: 12,
      })
      expect(invalid.success).toBe(false)
    })
  })

  describe('CreateLoanApplicationSchema', () => {
    it('should validate valid loan applications', () => {
      const valid = CreateLoanApplicationSchema.safeParse({
        borrowerId: 'borrower-1',
        amountApplied: 10000,
        applicationDate: Date.now(),
      })
      expect(valid.success).toBe(true)
    })

    it('should reject non-positive amounts', () => {
      const invalid = CreateLoanApplicationSchema.safeParse({
        borrowerId: 'borrower-1',
        amountApplied: 0,
        applicationDate: Date.now(),
      })
      expect(invalid.success).toBe(false)
    })
  })

  describe('CreateLoanSchema', () => {
    it('should validate standard loan creation data', () => {
      const valid = CreateLoanSchema.safeParse({
        borrowerId: 'borrower-1',
        loanNumber: 'LN-001',
        principalAmount: 50000,
        interestRate: 6,
        term: 24,
      })
      expect(valid.success).toBe(true)
    })

    it('should reject negative principalAmount', () => {
      const invalid = CreateLoanSchema.safeParse({
        borrowerId: 'borrower-1',
        loanNumber: 'LN-001',
        principalAmount: -5000,
        interestRate: 6,
        term: 24,
      })
      expect(invalid.success).toBe(false)
    })
  })

  describe('CreatePaymentSchema', () => {
    it('should validate valid payments', () => {
      const valid = CreatePaymentSchema.safeParse({
        loanId: 'loan-1',
        amount: 2500,
        paymentDate: Date.now(),
      })
      expect(valid.success).toBe(true)
    })

    it('should reject zero or negative payment amounts', () => {
      const invalid = CreatePaymentSchema.safeParse({
        loanId: 'loan-1',
        amount: 0,
        paymentDate: Date.now(),
      })
      expect(invalid.success).toBe(false)
    })
  })
})
