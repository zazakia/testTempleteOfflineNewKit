import { describe, it, expect } from 'vitest'
import { EntityRegistry } from '@repo/core'

// Import triggers self-registration
import '../driving-school.entity'

describe('Driving School Entities', () => {
  it('registers DrivingStudentEntity', () => {
    expect(EntityRegistry.has('driving_students')).toBe(true)
    const def = EntityRegistry.get('driving_students')
    expect(def.ui.navGroup).toBe('Driving School')
    expect(def.ui.labelPlural).toBe('Students')
    expect(def.rbac.permissionPrefix).toBe('driving_student')
  })

  it('registers DrivingInstructorEntity', () => {
    expect(EntityRegistry.has('driving_instructors')).toBe(true)
    const def = EntityRegistry.get('driving_instructors')
    expect(def.name).toBe('driving_instructors')
    expect(def.rbac.permissionPrefix).toBe('driving_instructor')
  })

  it('registers DrivingCourseEntity', () => {
    expect(EntityRegistry.has('driving_courses')).toBe(true)
    const def = EntityRegistry.get('driving_courses')
    expect(def.rbac.permissionPrefix).toBe('driving_course')
  })

  it('registers DrivingEnrollmentEntity with critical sync priority', () => {
    expect(EntityRegistry.has('driving_enrollments')).toBe(true)
    const def = EntityRegistry.get('driving_enrollments')
    expect(def.sync.priority).toBe('critical')
  })

  it('registers DrivingScheduleEntity with critical sync priority', () => {
    expect(EntityRegistry.has('driving_schedules')).toBe(true)
    const def = EntityRegistry.get('driving_schedules')
    expect(def.sync.priority).toBe('critical')
  })

  it('registers DrivingPaymentEntity', () => {
    expect(EntityRegistry.has('driving_payments')).toBe(true)
    const def = EntityRegistry.get('driving_payments')
    expect(def.rbac.permissionPrefix).toBe('driving_payment')
  })

  it('registers DrivingVehicleEntity', () => {
    expect(EntityRegistry.has('driving_vehicles')).toBe(true)
    const def = EntityRegistry.get('driving_vehicles')
    expect(def.ui.labelPlural).toBe('Vehicles')
    expect(def.sync.priority).toBe('background')
  })
})
