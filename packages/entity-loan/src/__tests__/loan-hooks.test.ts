import { describe, it, expect, vi } from 'vitest'
import { LoanHooks } from '../loan.hooks'
import type { HookContext } from '@repo/core'
import type { Loan } from '../loan.schema'

describe('Loan Hooks', () => {
  const mockCtx: HookContext = {
    tenantId: 'tenant-123',
    userId: 'user-456',
    timestamp: Date.now(),
  }

  it('beforeCreate should inject tenantId and encodedBy', async () => {
    const input = {
      loanNumber: 'LN-999',
      borrowerId: 'borrower-999',
    } as any

    const result = await LoanHooks.beforeCreate!(input, mockCtx)
    expect(result.tenantId).toBe('tenant-123')
    expect(result.encodedBy).toBe('user-456')
    expect(result.loanNumber).toBe('LN-999')
  })

  it('afterCreate should log loan creation message', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const entity = {
      loanNumber: 'LN-999',
      borrowerId: 'borrower-999',
    } as Loan

    await LoanHooks.afterCreate!(entity, mockCtx)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[LoanHook] Loan LN-999 created for borrower borrower-999')
    )
    consoleSpy.mockRestore()
  })
})
