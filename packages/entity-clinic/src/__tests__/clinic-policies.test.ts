import { describe, it, expect } from 'vitest'
import {
  ClinicPatientPolicies,
  ClinicDoctorPolicies,
  ClinicAppointmentPolicies,
  ClinicRecordPolicies,
  ClinicBillingPolicies,
} from '../clinic.policies'
import type { PolicyContext } from '../clinic.policies'

// ─── Helpers ──────────────────────────────────────────────────

function makeCtx(roles: string[], permissions: string[] = []): PolicyContext {
  return {
    userId: 'u1',
    tenantId: 't1',
    roles,
    permissions,
  }
}

function evalPolicy(policies: typeof ClinicPatientPolicies, action: string, ctx: PolicyContext): string {
  // Find highest-priority matching policy
  const matches = policies
    .filter((p) => p.action === action || p.action === '*')
    .filter((p) => !p.conditions || p.conditions(ctx))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  return matches[0]?.effect ?? 'deny'
}

// ─── ClinicPatientPolicies ────────────────────────────────────

describe('ClinicPatientPolicies', () => {
  it('admin has full access', () => {
    const ctx = makeCtx(['admin'])
    expect(evalPolicy(ClinicPatientPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'update', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'delete', ctx)).toBe('allow')
  })

  it('clinic_admin has full access', () => {
    const ctx = makeCtx(['clinic_admin'])
    expect(evalPolicy(ClinicPatientPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'update', ctx)).toBe('allow')
  })

  it('doctor can read but not create', () => {
    const ctx = makeCtx(['doctor'])
    expect(evalPolicy(ClinicPatientPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'create', ctx)).toBe('deny')
  })

  it('nurse can read, create, update', () => {
    const ctx = makeCtx(['nurse'])
    expect(evalPolicy(ClinicPatientPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'update', ctx)).toBe('allow')
  })

  it('receptionist can read and create but not delete', () => {
    const ctx = makeCtx(['receptionist'])
    expect(evalPolicy(ClinicPatientPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicPatientPolicies, 'delete', ctx)).toBe('deny')
  })

  it('unknown role is denied delete (and non-read/create)', () => {
    const ctx = makeCtx(['unknown'])
    expect(evalPolicy(ClinicPatientPolicies, 'delete', ctx)).toBe('deny')
  })
})

// ─── ClinicDoctorPolicies ─────────────────────────────────────

describe('ClinicDoctorPolicies', () => {
  it('admin has full access', () => {
    const ctx = makeCtx(['admin'])
    expect(evalPolicy(ClinicDoctorPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicDoctorPolicies, 'delete', ctx)).toBe('allow')
  })

  it('receptionist can read', () => {
    const ctx = makeCtx(['receptionist'])
    expect(evalPolicy(ClinicDoctorPolicies, 'read', ctx)).toBe('allow')
  })

  it('receptionist cannot create doctors', () => {
    const ctx = makeCtx(['receptionist'])
    expect(evalPolicy(ClinicDoctorPolicies, 'create', ctx)).toBe('deny')
  })
})

// ─── ClinicAppointmentPolicies ────────────────────────────────

describe('ClinicAppointmentPolicies', () => {
  it('nurse can create and update appointments', () => {
    const ctx = makeCtx(['nurse'])
    expect(evalPolicy(ClinicAppointmentPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicAppointmentPolicies, 'update', ctx)).toBe('allow')
    expect(evalPolicy(ClinicAppointmentPolicies, 'read', ctx)).toBe('allow')
  })

  it('cashier cannot manage appointments', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(ClinicAppointmentPolicies, 'read', ctx)).toBe('deny')
    expect(evalPolicy(ClinicAppointmentPolicies, 'create', ctx)).toBe('deny')
  })

  it('doctor can read and update appointments', () => {
    const ctx = makeCtx(['doctor'])
    expect(evalPolicy(ClinicAppointmentPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicAppointmentPolicies, 'update', ctx)).toBe('allow')
  })
})

// ─── ClinicRecordPolicies ─────────────────────────────────────

describe('ClinicRecordPolicies', () => {
  it('doctor can create and update records', () => {
    const ctx = makeCtx(['doctor'])
    expect(evalPolicy(ClinicRecordPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicRecordPolicies, 'update', ctx)).toBe('allow')
    expect(evalPolicy(ClinicRecordPolicies, 'read', ctx)).toBe('allow')
  })

  it('doctor cannot delete records', () => {
    const ctx = makeCtx(['doctor'])
    expect(evalPolicy(ClinicRecordPolicies, 'delete', ctx)).toBe('deny')
  })

  it('nurse can read and create but not update', () => {
    const ctx = makeCtx(['nurse'])
    expect(evalPolicy(ClinicRecordPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicRecordPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicRecordPolicies, 'update', ctx)).toBe('deny')
  })
})

// ─── ClinicBillingPolicies ────────────────────────────────────

describe('ClinicBillingPolicies', () => {
  it('cashier can read, create, and update billing', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(ClinicBillingPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicBillingPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicBillingPolicies, 'update', ctx)).toBe('allow')
  })

  it('cashier cannot delete billing', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(ClinicBillingPolicies, 'delete', ctx)).toBe('deny')
  })

  it('receptionist can read and manage billing', () => {
    const ctx = makeCtx(['receptionist'])
    expect(evalPolicy(ClinicBillingPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicBillingPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(ClinicBillingPolicies, 'update', ctx)).toBe('allow')
  })

  it('doctor can read billing', () => {
    const ctx = makeCtx(['doctor'])
    expect(evalPolicy(ClinicBillingPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(ClinicBillingPolicies, 'create', ctx)).toBe('deny')
  })
})
