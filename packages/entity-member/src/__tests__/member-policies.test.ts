import { describe, it, expect } from 'vitest'
import { evaluatePolicies, MemberPolicies } from '../member.policies'
import type { PolicyContext } from '../member.policies'

const createContext = (overrides?: Partial<PolicyContext>): PolicyContext => ({
  userId: 'user-1',
  tenantId: 'tenant-1',
  roles: ['user'],
  permissions: [],
  ...overrides,
})

describe('Member Policies', () => {
  it('should allow admin to do everything', () => {
    const ctx = createContext({ roles: ['admin'] })
    expect(evaluatePolicies('create', ctx).allowed).toBe(true)
    expect(evaluatePolicies('read', ctx).allowed).toBe(true)
    expect(evaluatePolicies('update', ctx).allowed).toBe(true)
    expect(evaluatePolicies('delete', ctx).allowed).toBe(true)
  })

  it('should allow manager to do everything', () => {
    const ctx = createContext({ roles: ['manager'] })
    expect(evaluatePolicies('create', ctx).allowed).toBe(true)
    expect(evaluatePolicies('read', ctx).allowed).toBe(true)
    expect(evaluatePolicies('update', ctx).allowed).toBe(true)
  })

  it('should allow officer to create, read, and update but deny delete', () => {
    const ctx = createContext({ roles: ['officer'] })
    expect(evaluatePolicies('create', ctx).allowed).toBe(true)
    expect(evaluatePolicies('read', ctx).allowed).toBe(true)
    expect(evaluatePolicies('update', ctx).allowed).toBe(true)
    expect(evaluatePolicies('delete', ctx).allowed).toBe(false)
  })

  it('should allow encoder to create and read but deny update', () => {
    const ctx = createContext({ roles: ['encoder'] })
    expect(evaluatePolicies('create', ctx).allowed).toBe(true)
    expect(evaluatePolicies('read', ctx).allowed).toBe(true)
    expect(evaluatePolicies('update', ctx).allowed).toBe(false)
  })

  it('should deny delete, approve, terminate, bulk_import to standard users', () => {
    const ctx = createContext({ roles: ['user'] })
    expect(evaluatePolicies('delete', ctx).allowed).toBe(false)
    expect(evaluatePolicies('approve', ctx).allowed).toBe(false)
    expect(evaluatePolicies('terminate', ctx).allowed).toBe(false)
    expect(evaluatePolicies('bulk_import', ctx).allowed).toBe(false)
  })
})
