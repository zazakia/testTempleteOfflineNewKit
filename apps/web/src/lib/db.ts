/**
 * ─── Database Setup ──────────────────────────────────────────
 * Initializes Dexie repositories for cooperative entities.
 */

import { createDexieRepository, type ContextFactory } from '@repo/db-dexie'
import { MiddlewarePipeline } from '@repo/core'
import type { Repository, BaseEntity } from '@repo/core'
import { createTenantMiddleware, TenantMetadataStore, MetadataResolver } from '@repo/multi-tenant'
import { createAuditMiddleware, getAuditStore } from '@repo/audit-trail'
import type { TenantMetadataRepository } from '@repo/multi-tenant'
import type { TenantMetadata } from '@repo/core'
import type { Customer } from '@repo/entity-customer'
import type { Member } from '@repo/entity-member'
import type { ShareCapitalTransaction } from '@repo/entity-share-capital'
import type { SavingsTransaction } from '@repo/entity-savings'
import type { Loan, LoanProduct, LoanApplication, Payment } from '@repo/entity-loan'
import type { JournalEntry, ChartOfAccount } from '@repo/entity-accounting'
import type {
  ClinicPatient,
  ClinicDoctor,
  ClinicAppointment,
  ClinicConsultationRecord,
  ClinicBilling,
} from '@repo/entity-clinic'
import type { Branch } from '@repo/entity-branch'
import type { ChangelogEntry } from '@repo/entity-changelog'
import type { MenuItem, Order, OrderItem, InventoryItem, DailySales } from '@repo/entity-fastfood'
import type {
  LaundryCustomer,
  LaundryService,
  LaundryOrder,
  LaundryPayment,
  LaundryInventory,
  PromoCode,
} from '@repo/entity-laundry'
import type {
  DrivingStudent,
  DrivingInstructor,
  DrivingCourse,
  DrivingEnrollment,
  DrivingSchedule,
  DrivingPayment,
  DrivingVehicle,
} from '@repo/entity-driving-school'

// Register all entity packages (self-registers with EntityRegistry)
import '@repo/entity-customer'
import '@repo/entity-member'
import '@repo/entity-share-capital'
import '@repo/entity-savings'
import '@repo/entity-loan'
import '@repo/entity-accounting'
import '@repo/entity-collection'
import '@repo/entity-governance'
import '@repo/entity-clinic'          // ← Clinic Management System
import '@repo/entity-branch'          // ← Multi-Branch Management
import '@repo/entity-changelog'       // ← Changelog / Roadmap
import '@repo/entity-laundry'         // ← Laundry Shop Multi-Branch
import '@repo/entity-driving-school'  // ← Driving School Multi-Branch
import '@repo/entity-fastfood'        // ← Crispy King Fast Food

// ─── Tenant Context Factory ──────────────────────────────────
// Reads current auth state to provide tenant isolation context.
// Every repository op calls this so tenantId is always fresh.

const tenantContextFactory: ContextFactory = () => {
  try {
    const stored = localStorage.getItem('cooperp_user')
    if (stored) {
      const user = JSON.parse(stored)
      return {
        userId: user.id ?? 'anonymous',
        tenantId: user.tenantId ?? 'default',
        timestamp: Date.now(),
      }
    }
  } catch { /* fall through to defaults */ }
  return {
    userId: 'anonymous',
    tenantId: 'default',
    timestamp: Date.now(),
  }
}

// ─── Repository Factory (with tenant isolation) ─────────────

/**
 * Create a tenant-isolated repository for the given entity.
 * Wraps createDexieRepository with tenant middleware + context factory.
 */
function createRepo<T extends BaseEntity>(entityName: string): Repository<T> {
  const pipeline = new MiddlewarePipeline<BaseEntity>()
  pipeline.use(createTenantMiddleware(entityName))
  pipeline.use(createAuditMiddleware(entityName))
  return createDexieRepository<T>(entityName, {
    middleware: pipeline,
    contextFactory: tenantContextFactory,
  })
}

// ─── Repository Instances ────────────────────────────────────

// Legacy
export const customerRepo: Repository<Customer> = createRepo<Customer>('customer')

// Cooperative ERP - Core
export const memberRepo: Repository<Member> = createRepo<Member>('members')

// Share Capital
export const shareCapitalRepo: Repository<ShareCapitalTransaction> = 
  createRepo<ShareCapitalTransaction>('share_capital_transactions')

// Savings
export const savingsRepo: Repository<SavingsTransaction> = 
  createRepo<SavingsTransaction>('savings_transactions')

// Loan Management
export const loanRepo: Repository<Loan> = createRepo<Loan>('loans')
export const loanProductRepo: Repository<LoanProduct> = createRepo<LoanProduct>('loan_products')
export const loanApplicationRepo: Repository<LoanApplication> = 
  createRepo<LoanApplication>('loan_applications')
export const paymentRepo: Repository<Payment> = createRepo<Payment>('payments')

// Accounting
export const journalEntryRepo: Repository<JournalEntry> = 
  createRepo<JournalEntry>('journal_entries')
export const chartOfAccountRepo: Repository<ChartOfAccount> = 
  createRepo<ChartOfAccount>('chart_of_accounts')

// Collections
export const collectorRepo: Repository<any> = createRepo<any>('collectors')
export const collectionGroupRepo: Repository<any> = createRepo<any>('collection_groups')
export const collectionLogRepo: Repository<any> = createRepo<any>('collection_logs')
export const remittanceRepo: Repository<any> = createRepo<any>('remittances')
export const areaRepo: Repository<any> = createRepo<any>('areas')

// Bank & Cash
export const bankAccountRepo: Repository<any> = createRepo<any>('bank_accounts')
export const bankTransactionRepo: Repository<any> = createRepo<any>('bank_transactions')
export const cashTransactionRepo: Repository<any> = createRepo<any>('cash_transactions')

// Expenses
export const expenseRepo: Repository<any> = createRepo<any>('expenses')
export const expenseCategoryRepo: Repository<any> = createRepo<any>('expense_categories')

// File Cases
export const fileCaseRepo: Repository<any> = createRepo<any>('file_cases')

// Payroll
export const employeeRepo: Repository<any> = createRepo<any>('employees')
export const payrollRepo: Repository<any> = createRepo<any>('payrolls')

// Governance
export const committeeRepo: Repository<any> = createRepo<any>('committees')
export const committeeMemberRepo: Repository<any> = createRepo<any>('committee_members')
export const boardResolutionRepo: Repository<any> = createRepo<any>('board_resolutions')
export const meetingAttendanceRepo: Repository<any> = createRepo<any>('meeting_attendance')

// Statutory Funds
export const statutoryFundRepo: Repository<any> = createRepo<any>('statutory_fund_allocations')

// Water Station
export const wsCustomerRepo: Repository<any> = createRepo<any>('ws_customers')
export const wsDeliveryRepo: Repository<any> = createRepo<any>('ws_deliveries')
export const wsContainerRepo: Repository<any> = createRepo<any>('ws_containers')
export const wsPaymentRepo: Repository<any> = createRepo<any>('ws_payments')

// ─── Clinic Management System ─────────────────────────
// Full medical clinic: patients, doctors, appointments, records, billing
export const clinicPatientRepo: Repository<ClinicPatient> = createRepo<ClinicPatient>('clinic_patients')
export const clinicDoctorRepo: Repository<ClinicDoctor> = createRepo<ClinicDoctor>('clinic_doctors')
export const clinicAppointmentRepo: Repository<ClinicAppointment> = createRepo<ClinicAppointment>('clinic_appointments')
export const clinicRecordRepo: Repository<ClinicConsultationRecord> = createRepo<ClinicConsultationRecord>('clinic_consultation_records')
export const clinicBillingRepo: Repository<ClinicBilling> = createRepo<ClinicBilling>('clinic_billing')

// ─── Multi-Branch Management ─────────────────────────────────
export const branchRepo: Repository<Branch> = createRepo<Branch>('branches')

// ─── Changelog / Roadmap ─────────────────────────────────────
export const changelogRepo: Repository<ChangelogEntry> = createRepo<ChangelogEntry>('changelog_entries')

// ─── Laundry Shop System ─────────────────────────────────────
export const laundryCustomerRepo: Repository<LaundryCustomer> = createRepo<LaundryCustomer>('laundry_customers')
export const laundryServiceRepo: Repository<LaundryService> = createRepo<LaundryService>('laundry_services')
export const laundryOrderRepo: Repository<LaundryOrder> = createRepo<LaundryOrder>('laundry_orders')
export const laundryPaymentRepo: Repository<LaundryPayment> = createRepo<LaundryPayment>('laundry_payments')
export const laundryInventoryRepo: Repository<LaundryInventory> = createRepo<LaundryInventory>('laundry_inventory')
export const laundryPromoCodeRepo: Repository<PromoCode> = createRepo<PromoCode>('laundry_promo_codes')

// ─── Driving School System ───────────────────────────────────
export const drivingStudentRepo: Repository<DrivingStudent> = createRepo<DrivingStudent>('driving_students')
export const drivingInstructorRepo: Repository<DrivingInstructor> = createRepo<DrivingInstructor>('driving_instructors')
export const drivingCourseRepo: Repository<DrivingCourse> = createRepo<DrivingCourse>('driving_courses')
export const drivingEnrollmentRepo: Repository<DrivingEnrollment> = createRepo<DrivingEnrollment>('driving_enrollments')
export const drivingScheduleRepo: Repository<DrivingSchedule> = createRepo<DrivingSchedule>('driving_schedules')
export const drivingPaymentRepo: Repository<DrivingPayment> = createRepo<DrivingPayment>('driving_payments')
export const drivingVehicleRepo: Repository<DrivingVehicle> = createRepo<DrivingVehicle>('driving_vehicles')

// ─── Crispy King Fast Food ───────────────────────────────────
export const ckMenuItemRepo: Repository<MenuItem> = createRepo<MenuItem>('ck_menu_items')
export const ckOrderRepo: Repository<Order> = createRepo<Order>('ck_orders')
export const ckOrderItemRepo: Repository<OrderItem> = createRepo<OrderItem>('ck_order_items')
export const ckInventoryRepo: Repository<InventoryItem> = createRepo<InventoryItem>('ck_inventory')
export const ckDailySalesRepo: Repository<DailySales> = createRepo<DailySales>('ck_daily_sales')

// ─── Expose repos for runtime testing (console / E2E) ────────
if (typeof window !== 'undefined') {
  ;(window as any).__DB__ = {
    customerRepo,
    memberRepo,
    shareCapitalRepo,
    savingsRepo,
    loanRepo,
    loanProductRepo,
    loanApplicationRepo,
    paymentRepo,
    journalEntryRepo,
    chartOfAccountRepo,
    collectorRepo,
    collectionGroupRepo,
    collectionLogRepo,
    remittanceRepo,
    areaRepo,
    bankAccountRepo,
    bankTransactionRepo,
    cashTransactionRepo,
    expenseRepo,
    expenseCategoryRepo,
    fileCaseRepo,
    employeeRepo,
    payrollRepo,
    committeeRepo,
    committeeMemberRepo,
    boardResolutionRepo,
    meetingAttendanceRepo,
    statutoryFundRepo,
    wsCustomerRepo,
    wsDeliveryRepo,
    wsContainerRepo,
    wsPaymentRepo,
    // Clinic Management System
    clinicPatientRepo,
    clinicDoctorRepo,
    clinicAppointmentRepo,
    clinicRecordRepo,
    clinicBillingRepo,
    // Multi-Branch Management
    branchRepo,
    // Changelog / Roadmap
    changelogRepo,
    // Laundry Shop System
    laundryCustomerRepo,
    laundryServiceRepo,
    laundryOrderRepo,
    laundryPaymentRepo,
    laundryInventoryRepo,
    laundryPromoCodeRepo,
    // Driving School System
    drivingStudentRepo,
    drivingInstructorRepo,
    drivingCourseRepo,
    drivingEnrollmentRepo,
    drivingScheduleRepo,
    drivingPaymentRepo,
    drivingVehicleRepo,
    // Crispy King Fast Food
    ckMenuItemRepo, ckOrderRepo, ckOrderItemRepo, ckInventoryRepo, ckDailySalesRepo,
  }
}

// ─── Tenant Metadata Store ───────────────────────────────────

/**
 * Dexie-backed repository adapter for tenant metadata.
 * Uses dynamic import to access the Dexie database lazily (avoids circular deps).
 */
function createMetadataRepo(): TenantMetadataRepository {
  return {
    async get(tenantId: string): Promise<TenantMetadata | undefined> {
      const { getDatabase } = await import('@repo/db-dexie')
      const db = getDatabase()
      return db.table('tenant_metadata').get(tenantId) as Promise<TenantMetadata | undefined>
    },
    async put(record: TenantMetadata): Promise<void> {
      const { getDatabase } = await import('@repo/db-dexie')
      const db = getDatabase()
      await db.table('tenant_metadata').put(record as any)
    },
  }
}

/** Singleton metadata store — use this throughout the app */
export const metadataStore = new TenantMetadataStore(createMetadataRepo())

/** Singleton metadata resolver — typed access with defaults + caching */
export const metadataResolver = new MetadataResolver(metadataStore)

// ─── Wire resolver into domain services (metadata-driven customization) ──
// Each service reads per-tenant config through the resolver at runtime.
import { LoanService, ApprovalEngine } from '@repo/entity-loan'
LoanService.configure(metadataResolver)

/** Singleton approval engine — reads workflows from tenant metadata */
export const approvalEngine = new ApprovalEngine(metadataResolver)

// Expose for testing
if (typeof window !== 'undefined') {
  ;(window as any).__METADATA__ = metadataStore
  ;(window as any).__AUDIT__ = getAuditStore()
  ;(window as any).__APPROVAL__ = approvalEngine
}

// ─── Database Health ─────────────────────────────────────────

export interface DbHealth {
  ok: boolean
  tableCount: number
  totalRecords: number
  storageEstimate?: { usage: number; quota: number }
}

export async function checkDbHealth(): Promise<DbHealth> {
  try {
    const { getDatabase } = await import('@repo/db-dexie')
    const db = getDatabase()
    const tables = db.tables
    let totalRecords = 0

    for (const table of tables) {
      totalRecords += await table.count()
    }

    let storageEstimate: { usage: number; quota: number } | undefined
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate()
      storageEstimate = {
        usage: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
      }
    }

    return {
      ok: true,
      tableCount: tables.length,
      totalRecords,
      storageEstimate,
    }
  } catch (error) {
    return { ok: false, tableCount: 0, totalRecords: 0 }
  }
}
