/**
 * ─── Driving School Entity Definitions ────────────────────────
 * All driving school entities self-register with the Entity Registry on import.
 *
 * Importing '@repo/entity-driving-school' is enough to wire up:
 *  - Navigation menu items (under "Driving School" group)
 *  - Sync configuration per entity
 *  - RBAC permission prefixes
 *  - Audit trail settings
 *  - Soft delete configuration
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type {
  DrivingStudent,
  DrivingInstructor,
  DrivingCourse,
  DrivingEnrollment,
  DrivingSchedule,
  DrivingPayment,
  DrivingVehicle,
} from './driving-school.schema'

// ─── Student Entity ────────────────────────────────────────

export const DrivingStudentEntity: EntityDefinition<DrivingStudent> = {
  name: 'driving_students',
  ui: {
    label: 'Student',
    labelPlural: 'Students',
    icon: 'GraduationCap',
    routePath: 'driving-school/students',
    color: 'blue',
    showInNav: true,
    navOrder: 10,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
    excludeFields: [],
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_student',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingStudentEntity)

// ─── Instructor Entity ─────────────────────────────────────

export const DrivingInstructorEntity: EntityDefinition<DrivingInstructor> = {
  name: 'driving_instructors',
  ui: {
    label: 'Instructor',
    labelPlural: 'Instructors',
    icon: 'UserCheck',
    routePath: 'driving-school/instructors',
    color: 'green',
    showInNav: true,
    navOrder: 20,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_instructor',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingInstructorEntity)

// ─── Course Entity ─────────────────────────────────────────

export const DrivingCourseEntity: EntityDefinition<DrivingCourse> = {
  name: 'driving_courses',
  ui: {
    label: 'Course',
    labelPlural: 'Courses',
    icon: 'BookOpen',
    routePath: 'driving-school/courses',
    color: 'purple',
    showInNav: true,
    navOrder: 30,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_course',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingCourseEntity)

// ─── Enrollment Entity ─────────────────────────────────────

export const DrivingEnrollmentEntity: EntityDefinition<DrivingEnrollment> = {
  name: 'driving_enrollments',
  ui: {
    label: 'Enrollment',
    labelPlural: 'Enrollments',
    icon: 'ClipboardList',
    routePath: 'driving-school/enrollments',
    color: 'yellow',
    showInNav: true,
    navOrder: 40,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'critical',   // enrollments are core business
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_enrollment',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingEnrollmentEntity)

// ─── Schedule Entity ───────────────────────────────────────

export const DrivingScheduleEntity: EntityDefinition<DrivingSchedule> = {
  name: 'driving_schedules',
  ui: {
    label: 'Schedule',
    labelPlural: 'Schedules',
    icon: 'Calendar',
    routePath: 'driving-school/schedules',
    color: 'blue',
    showInNav: true,
    navOrder: 50,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'critical',   // schedules are time-sensitive
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_schedule',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingScheduleEntity)

// ─── Payment Entity ────────────────────────────────────────

export const DrivingPaymentEntity: EntityDefinition<DrivingPayment> = {
  name: 'driving_payments',
  ui: {
    label: 'Payment',
    labelPlural: 'Payments',
    icon: 'Receipt',
    routePath: 'driving-school/payments',
    color: 'green',
    showInNav: true,
    navOrder: 60,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_payment',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingPaymentEntity)

// ─── Vehicle Entity ────────────────────────────────────────

export const DrivingVehicleEntity: EntityDefinition<DrivingVehicle> = {
  name: 'driving_vehicles',
  ui: {
    label: 'Vehicle',
    labelPlural: 'Vehicles',
    icon: 'Car',
    routePath: 'driving-school/vehicles',
    color: 'red',
    showInNav: true,
    navOrder: 70,
    navGroup: 'Driving School',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'background',
  },
  audit: {
    enabled: true,
    excludeFields: ['version'],
  },
  rbac: {
    enabled: true,
    permissionPrefix: 'driving_vehicle',
  },
  hooks: {},
  pagination: 'offset',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

EntityRegistry.register(DrivingVehicleEntity)
