import type { EntityHooks, HookContext } from '@repo/core'
import type { Loan } from './loan.schema'

export const LoanHooks: EntityHooks<Loan> = {
  beforeCreate: async (input, ctx) => {
    input.tenantId = ctx.tenantId
    input.encodedBy = ctx.userId
    return input
  },
  afterCreate: async (entity) => {
    console.log(`[LoanHook] Loan ${entity.loanNumber} created for borrower ${entity.borrowerId}`)
  },
  beforeUpdate: async (id, input) => {
    return input
  },
}
