import { describe, it, expect } from 'vitest'
import {
  DrivingStudentPolicies,
  DrivingInstructorPolicies,
  DrivingCoursePolicies,
  DrivingEnrollmentPolicies,
  DrivingSchedulePolicies,
  DrivingPaymentPolicies,
  DrivingVehiclePolicies,
} from '../driving-school.policies'
import type { PolicyContext } from '../driving-school.policies'

// ─── Helpers ──────────────────────────────────────────────────

function makeCtx(roles: string[]): PolicyContext {
  return { userId: 'u1', tenantId: 't1', roles, permissions: [] }
}

function evalPolicy(policies: typeof DrivingStudentPolicies, action: string, ctx: PolicyContext): string {
  const matches = policies
    .filter((p) => p.action === action || p.action === '*')
    .filter((p) => !p.conditions || p.conditions(ctx))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  return matches[0]?.effect ?? 'deny'
}

// ─── DrivingStudentPolicies ───────────────────────────────────

describe('DrivingStudentPolicies', () => {
  it('admin has full access', () => {
    const ctx = makeCtx(['admin'])
    expect(evalPolicy(DrivingStudentPolicies, '*', ctx)).toBe('allow')
    expect(evalPolicy(DrivingStudentPolicies, 'delete', ctx)).toBe('allow')
  })

  it('driving_school_admin has full access', () => {
    const ctx = makeCtx(['driving_school_admin'])
    expect(evalPolicy(DrivingStudentPolicies, 'create', ctx)).toBe('allow')
  })

  it('enrollment_officer can read and create', () => {
    const ctx = makeCtx(['enrollment_officer'])
    expect(evalPolicy(DrivingStudentPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingStudentPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(DrivingStudentPolicies, 'delete', ctx)).toBe('deny')
  })

  it('instructor can read and update', () => {
    const ctx = makeCtx(['instructor'])
    expect(evalPolicy(DrivingStudentPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingStudentPolicies, 'update', ctx)).toBe('allow')
  })

  it('lto_liaison can only read', () => {
    const ctx = makeCtx(['lto_liaison'])
    expect(evalPolicy(DrivingStudentPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingStudentPolicies, 'create', ctx)).toBe('deny')
    expect(evalPolicy(DrivingStudentPolicies, 'update', ctx)).toBe('deny')
  })
})

// ─── DrivingInstructorPolicies ────────────────────────────────

describe('DrivingInstructorPolicies', () => {
  it('driving_school_manager can create and update', () => {
    const ctx = makeCtx(['driving_school_manager'])
    expect(evalPolicy(DrivingInstructorPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(DrivingInstructorPolicies, 'update', ctx)).toBe('allow')
  })

  it('enrollment_officer can only read', () => {
    const ctx = makeCtx(['enrollment_officer'])
    expect(evalPolicy(DrivingInstructorPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingInstructorPolicies, 'create', ctx)).toBe('deny')
  })
})

// ─── DrivingCoursePolicies ────────────────────────────────────

describe('DrivingCoursePolicies', () => {
  it('cashier can read courses', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(DrivingCoursePolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingCoursePolicies, 'create', ctx)).toBe('deny')
  })

  it('driving_school_manager can manage courses', () => {
    const ctx = makeCtx(['driving_school_manager'])
    expect(evalPolicy(DrivingCoursePolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(DrivingCoursePolicies, 'update', ctx)).toBe('allow')
  })
})

// ─── DrivingEnrollmentPolicies ────────────────────────────────

describe('DrivingEnrollmentPolicies', () => {
  it('lto_liaison can read enrollments', () => {
    const ctx = makeCtx(['lto_liaison'])
    expect(evalPolicy(DrivingEnrollmentPolicies, 'read', ctx)).toBe('allow')
  })

  it('instructor can update enrollments', () => {
    const ctx = makeCtx(['instructor'])
    expect(evalPolicy(DrivingEnrollmentPolicies, 'update', ctx)).toBe('allow')
  })
})

// ─── DrivingSchedulePolicies ──────────────────────────────────

describe('DrivingSchedulePolicies', () => {
  it('instructor can update schedules', () => {
    const ctx = makeCtx(['instructor'])
    expect(evalPolicy(DrivingSchedulePolicies, 'update', ctx)).toBe('allow')
    expect(evalPolicy(DrivingSchedulePolicies, 'read', ctx)).toBe('allow')
  })

  it('enrollment_officer can create schedules', () => {
    const ctx = makeCtx(['enrollment_officer'])
    expect(evalPolicy(DrivingSchedulePolicies, 'create', ctx)).toBe('allow')
  })

  it('cashier has no schedule access', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(DrivingSchedulePolicies, 'read', ctx)).toBe('deny')
  })
})

// ─── DrivingPaymentPolicies ───────────────────────────────────

describe('DrivingPaymentPolicies', () => {
  it('cashier can read, create, update payments', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(DrivingPaymentPolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingPaymentPolicies, 'create', ctx)).toBe('allow')
    expect(evalPolicy(DrivingPaymentPolicies, 'update', ctx)).toBe('allow')
  })

  it('cashier cannot delete payments', () => {
    const ctx = makeCtx(['cashier'])
    expect(evalPolicy(DrivingPaymentPolicies, 'delete', ctx)).toBe('deny')
  })
})

// ─── DrivingVehiclePolicies ───────────────────────────────────

describe('DrivingVehiclePolicies', () => {
  it('instructor can read and update vehicles', () => {
    const ctx = makeCtx(['instructor'])
    expect(evalPolicy(DrivingVehiclePolicies, 'read', ctx)).toBe('allow')
    expect(evalPolicy(DrivingVehiclePolicies, 'update', ctx)).toBe('allow')
  })

  it('enrollment_officer has no vehicle access', () => {
    const ctx = makeCtx(['enrollment_officer'])
    expect(evalPolicy(DrivingVehiclePolicies, 'read', ctx)).toBe('deny')
  })
})
