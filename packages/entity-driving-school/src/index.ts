/**
 * ─── @repo/entity-driving-school — Barrel Export ──────────────
 * Importing this package registers all Driving School entities with the framework.
 *
 * Usage in apps/web/src/lib/db.ts:
 *   import '@repo/entity-driving-school'
 *   // Now all driving school entities are registered, synced, audited, and
 *   // visible in the navigation under the "Driving School" group.
 */

// Self-registers ALL driving school entities on import
export {
  DrivingStudentEntity,
  DrivingInstructorEntity,
  DrivingCourseEntity,
  DrivingEnrollmentEntity,
  DrivingScheduleEntity,
  DrivingPaymentEntity,
  DrivingVehicleEntity,
} from './driving-school.entity'

// ─── DrivingStudent ────────────────────────────────────────
export type {
  DrivingStudent,
  StudentStatus,
  LicenseType,
} from './driving-school.schema'

export {
  CreateDrivingStudentSchema,
  UpdateDrivingStudentSchema,
  DrivingStudentQuerySchema,
  StudentStatusSchema,
  LicenseTypeSchema,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
} from './driving-school.schema'

// ─── DrivingInstructor ─────────────────────────────────────
export type {
  DrivingInstructor,
  InstructorStatus,
  InstructorSpecialization,
} from './driving-school.schema'

export {
  CreateDrivingInstructorSchema,
  UpdateDrivingInstructorSchema,
  DrivingInstructorQuerySchema,
  InstructorStatusSchema,
  InstructorSpecializationSchema,
  INSTRUCTOR_STATUS_LABELS,
  INSTRUCTOR_SPECIALIZATION_LABELS,
} from './driving-school.schema'

// ─── DrivingCourse ─────────────────────────────────────────
export type {
  DrivingCourse,
  CourseCategory,
  CourseStatus,
} from './driving-school.schema'

export {
  CreateDrivingCourseSchema,
  UpdateDrivingCourseSchema,
  DrivingCourseQuerySchema,
  CourseCategorySchema,
  COURSE_CATEGORY_LABELS,
} from './driving-school.schema'

// ─── DrivingEnrollment ─────────────────────────────────────
export type {
  DrivingEnrollment,
  EnrollmentStatus,
  EnrollmentType,
} from './driving-school.schema'

export {
  CreateDrivingEnrollmentSchema,
  UpdateDrivingEnrollmentSchema,
  DrivingEnrollmentQuerySchema,
  EnrollmentStatusSchema,
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_COLORS,
} from './driving-school.schema'

// ─── DrivingSchedule ───────────────────────────────────────
export type {
  DrivingSchedule,
  SessionStatus,
  SessionType,
} from './driving-school.schema'

export {
  CreateDrivingScheduleSchema,
  UpdateDrivingScheduleSchema,
  DrivingScheduleQuerySchema,
  SessionStatusSchema,
  SessionTypeSchema,
  SESSION_STATUS_LABELS,
  SESSION_TYPE_LABELS,
} from './driving-school.schema'

// ─── DrivingPayment ────────────────────────────────────────
export type {
  DrivingPayment,
  DrivingPaymentMethod,
  DrivingPaymentFor,
} from './driving-school.schema'

export {
  CreateDrivingPaymentSchema,
  UpdateDrivingPaymentSchema,
  DrivingPaymentQuerySchema,
  DrivingPaymentMethodSchema,
  DrivingPaymentForSchema,
  DRIVING_PAYMENT_METHOD_LABELS,
  DRIVING_PAYMENT_FOR_LABELS,
} from './driving-school.schema'

// ─── DrivingVehicle ────────────────────────────────────────
export type {
  DrivingVehicle,
  VehicleType,
  VehicleTransmission,
  VehicleFuelType,
  VehicleStatus,
} from './driving-school.schema'

export {
  CreateDrivingVehicleSchema,
  UpdateDrivingVehicleSchema,
  DrivingVehicleQuerySchema,
  VehicleTypeSchema,
  VehicleTransmissionSchema,
  VEHICLE_TYPE_LABELS,
  VEHICLE_TRANSMISSION_LABELS,
} from './driving-school.schema'

// ─── Services ──────────────────────────────────────────────
export {
  DrivingStudentService,
  DrivingCourseService,
  DrivingEnrollmentService,
  DrivingScheduleService,
  DrivingVehicleService,
} from './driving-school.service'

export type { DrivingSchoolConfig } from './driving-school.service'
export { DEFAULT_DRIVING_SCHOOL_CONFIG } from './driving-school.service'

// ─── Policies ──────────────────────────────────────────────
export {
  DrivingStudentPolicies,
  DrivingInstructorPolicies,
  DrivingCoursePolicies,
  DrivingEnrollmentPolicies,
  DrivingSchedulePolicies,
  DrivingPaymentPolicies,
  DrivingVehiclePolicies,
} from './driving-school.policies'
