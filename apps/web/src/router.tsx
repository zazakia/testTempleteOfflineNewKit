/**
 * ─── Cooperative ERP Router ──────────────────────────────────
 * TanStack Router with type-safe routes for all modules.
 */

import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './routes/index'

// Legacy Customer routes
import { CustomerListPage } from './routes/customers/index'
import { CustomerDetailPage } from './routes/customers/$id'
import { CreateCustomerPage } from './routes/customers/new'

// Member routes
import { MemberListPage } from './routes/members/index'
import { CreateMemberPage } from './routes/members/new'
import { MemberDetailPage } from './routes/members/$id'

// Share Capital routes
import { ShareCapitalListPage } from './routes/share-capital/index'

// Savings routes
import { SavingsListPage } from './routes/savings/index'

// Loan routes
import { LoanListPage } from './routes/loans/index'
import { CreateLoanPage } from './routes/loans/new'
import { LoanDetailPage } from './routes/loans/$id'
import { LoanApplicationListPage } from './routes/loan-applications/index'
import { CreateLoanApplicationPage } from './routes/loan-applications/new'
import { PaymentListPage } from './routes/payments/index'

// Accounting routes
import { ChartOfAccountsPage } from './routes/accounting/chart-of-accounts'
import { JournalEntryListPage } from './routes/accounting/journal-entries'
import { CreateJournalEntryPage } from './routes/accounting/journal-entries-new'
import { TrialBalancePage } from './routes/accounting/trial-balance'
import { CollectorListPage } from './routes/collectors/index'
import { RemittanceListPage } from './routes/remittances/index'
import { BankAccountListPage } from './routes/bank-accounts/index'
import { ExpensesListPage } from './routes/expenses/index'
import { lazy } from 'react'
const ReportsPage = lazy(() => import('./routes/reports/index').then(m => ({ default: m.ReportsPage })))
import { SettingsPage } from './routes/settings/index'
import { FileCasesListPage } from './routes/file-cases/index'
import { LoginPage } from './routes/login'
import { LoanCalculatorPage } from './routes/loan-calculator'
import { SyncCenterPage } from './routes/sync-center'
import { BorrowerPortal } from './routes/portal/borrower/index'
import { CollectorPortal } from './routes/portal/collector/index'
import { EncoderPortal } from './routes/portal/encoder/index'
import { PromissoryNotePage } from './routes/loans/promissory-note'
const WsCustomersPage = lazy(() => import('./routes/water-station/customers').then(m => ({ default: m.WsCustomersPage })))
const WsDeliveriesPage = lazy(() => import('./routes/water-station/deliveries').then(m => ({ default: m.WsDeliveriesPage })))

// Clinic Management System
import { ClinicPatientsPage } from './routes/clinic/patients/index'
import { ClinicNewPatientPage } from './routes/clinic/patients/new'
import { ClinicPatientDetailPage } from './routes/clinic/patients/$id'
import { ClinicAppointmentsPage } from './routes/clinic/appointments/index'
import { ClinicBillingPage } from './routes/clinic/billing/index'
import { PayrollPage } from './routes/payroll/index'
import { GovernancePage } from './routes/governance/index'
import { CashOnHandPage } from './routes/cash-on-hand/index'
import { AdvancedSettingsPage } from './routes/settings/advanced'
import { AreasListPage } from './routes/areas/index'
import { BankAccountDetailPage } from './routes/bank-accounts/[id]'
import { PendingApprovalPage } from './routes/loans/pending-approval'
import { BorrowerLoanRequestPage } from './routes/portal/borrower/loans/request'
import { BorrowerProfilePage } from './routes/portal/borrower/profile'
import { BorrowerTransactionsPage } from './routes/portal/borrower/transactions'
import { CoopComputationsPage } from './routes/settings/coop-computations'
import { DeletedRecordsPage } from './routes/settings/deleted'
import { DailyCollectionSheetPage } from './routes/portal/collector/collection-sheet-daily'
import { AuditSettingsPage } from './routes/settings/audit-settings'
import { BorrowerDocumentsPage } from './routes/portal/borrower/documents'
import { CollectorDailyLogPage } from './routes/portal/collector/daily-log'

const trialBalanceRoute = createRoute({
  getParentRoute: () => accountingRoute,
  path: 'trial-balance',
  component: TrialBalancePage,
})

// ─── Root Layout ─────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
  notFoundComponent: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  ),
})

// ─── Dashboard ───────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

// ─── Members ────────────────────────────────────────────────

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'members',
  component: () => <Outlet />,
})

const membersIndexRoute = createRoute({
  getParentRoute: () => membersRoute,
  path: '/',
  component: MemberListPage,
})

const membersNewRoute = createRoute({
  getParentRoute: () => membersRoute,
  path: 'new',
  component: CreateMemberPage,
})

const memberDetailRoute = createRoute({
  getParentRoute: () => membersRoute,
  path: '$id',
  component: MemberDetailPage,
})

// ─── Share Capital ──────────────────────────────────────────

const shareCapitalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'share-capital',
  component: ShareCapitalListPage,
})

// ─── Savings ────────────────────────────────────────────────

const savingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'savings',
  component: SavingsListPage,
})

// ─── Loans ──────────────────────────────────────────────────

const loansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'loans',
  component: () => <Outlet />,
})

const loansIndexRoute = createRoute({
  getParentRoute: () => loansRoute,
  path: '/',
  component: LoanListPage,
})

const loansNewRoute = createRoute({
  getParentRoute: () => loansRoute,
  path: 'new',
  component: CreateLoanPage,
})

const loanDetailRoute = createRoute({
  getParentRoute: () => loansRoute,
  path: '$id',
  component: LoanDetailPage,
})

// ─── Loan Applications ──────────────────────────────────────

const loanApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'loan-applications',
  component: () => <Outlet />,
})

const loanApplicationsIndexRoute = createRoute({
  getParentRoute: () => loanApplicationsRoute,
  path: '/',
  component: LoanApplicationListPage,
})

const loanApplicationsNewRoute = createRoute({
  getParentRoute: () => loanApplicationsRoute,
  path: 'new',
  component: CreateLoanApplicationPage,
})

// ─── Payments ───────────────────────────────────────────────

const paymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'payments',
  component: PaymentListPage,
})

// ─── Accounting ─────────────────────────────────────────────

const accountingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'accounting',
  component: () => <Outlet />,
})

const chartOfAccountsRoute = createRoute({
  getParentRoute: () => accountingRoute,
  path: 'chart-of-accounts',
  component: ChartOfAccountsPage,
})

const journalEntriesRoute = createRoute({
  getParentRoute: () => accountingRoute,
  path: 'journal-entries',
  component: () => <Outlet />,
})

const journalEntriesIndexRoute = createRoute({
  getParentRoute: () => journalEntriesRoute,
  path: '/',
  component: JournalEntryListPage,
})

const journalEntriesNewRoute = createRoute({
  getParentRoute: () => journalEntriesRoute,
  path: 'new',
  component: CreateJournalEntryPage,
})

// ─── Legacy Customer Routes ─────────────────────────────────

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'customers',
  component: () => <Outlet />,
})

const customersIndexRoute = createRoute({
  getParentRoute: () => customersRoute,
  path: '/',
  component: CustomerListPage,
})

const customersNewRoute = createRoute({
  getParentRoute: () => customersRoute,
  path: 'new',
  component: CreateCustomerPage,
})

const customerDetailRoute = createRoute({
  getParentRoute: () => customersRoute,
  path: '$id',
  component: CustomerDetailPage,
})

// ─── Route Tree ──────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  
  // Cooperative Modules
  membersRoute.addChildren([membersIndexRoute, membersNewRoute, memberDetailRoute]),
  shareCapitalRoute,
  savingsRoute,
  loansRoute.addChildren([loansIndexRoute, loansNewRoute, loanDetailRoute]),
  loanApplicationsRoute.addChildren([loanApplicationsIndexRoute, loanApplicationsNewRoute]),
  paymentsRoute,
  accountingRoute.addChildren([
    chartOfAccountsRoute,
    journalEntriesRoute.addChildren([journalEntriesIndexRoute, journalEntriesNewRoute]),
    trialBalanceRoute,
  ]),
  
  // Collectors
  createRoute({ getParentRoute: () => rootRoute, path: 'collectors', component: CollectorListPage }),
  
  // Remittances
  createRoute({ getParentRoute: () => rootRoute, path: 'remittances', component: RemittanceListPage }),
  
  // Bank Accounts
  createRoute({ getParentRoute: () => rootRoute, path: 'bank-accounts', component: BankAccountListPage }),
  
  // Expenses
  createRoute({ getParentRoute: () => rootRoute, path: 'expenses', component: ExpensesListPage }),
  
  // Reports
  createRoute({ getParentRoute: () => rootRoute, path: 'reports', component: ReportsPage }),
  
  // Settings
  createRoute({ getParentRoute: () => rootRoute, path: 'settings', component: SettingsPage }),
  
  // File Cases
  createRoute({ getParentRoute: () => rootRoute, path: 'file-cases', component: FileCasesListPage }),
  
  // Login
  createRoute({ getParentRoute: () => rootRoute, path: 'login', component: LoginPage }),
  
  // Loan Calculator
  createRoute({ getParentRoute: () => rootRoute, path: 'loan-calculator', component: LoanCalculatorPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'promissory-note/$id', component: PromissoryNotePage }),
  
  // Sync Center
  createRoute({ getParentRoute: () => rootRoute, path: 'sync-center', component: SyncCenterPage }),
  
  // Portals
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/borrower', component: BorrowerPortal }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/collector', component: CollectorPortal }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/encoder', component: EncoderPortal }),
  
  // Water Station
  createRoute({ getParentRoute: () => rootRoute, path: 'water-station/customers', component: WsCustomersPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'water-station/deliveries', component: WsDeliveriesPage }),
  
  // Payroll
  createRoute({ getParentRoute: () => rootRoute, path: 'payroll', component: PayrollPage }),
  
  // Governance
  createRoute({ getParentRoute: () => rootRoute, path: 'governance', component: GovernancePage }),
  
  // Cash on Hand
  createRoute({ getParentRoute: () => rootRoute, path: 'cash-on-hand', component: CashOnHandPage }),
  
  // Advanced Settings
  createRoute({ getParentRoute: () => rootRoute, path: 'settings/advanced', component: AdvancedSettingsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'settings/coop-computations', component: CoopComputationsPage }),
  
  // Areas
  createRoute({ getParentRoute: () => rootRoute, path: 'areas', component: AreasListPage }),
  
  // Bank Account Detail
  createRoute({ getParentRoute: () => rootRoute, path: 'bank-accounts/$id', component: BankAccountDetailPage }),
  
  // Pending Approvals
  createRoute({ getParentRoute: () => rootRoute, path: 'pending-approvals', component: PendingApprovalPage }),
  
  // Borrower Portal sub-routes
  createRoute({ getParentRoute: () => rootRoute, path: 'settings/deleted-records', component: DeletedRecordsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/collector/daily-sheet', component: DailyCollectionSheetPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/borrower/request', component: BorrowerLoanRequestPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'settings/audit', component: AuditSettingsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/collector/daily-log', component: CollectorDailyLogPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/borrower/documents', component: BorrowerDocumentsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/borrower/profile', component: BorrowerProfilePage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'portal/borrower/transactions', component: BorrowerTransactionsPage }),
  
  // Legacy
  customersRoute.addChildren([customersIndexRoute, customersNewRoute, customerDetailRoute]),

  // ─── Clinic Management System ─────────────────────────────
  // Patients
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/patients', component: ClinicPatientsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/patients/new', component: ClinicNewPatientPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/patients/$id', component: ClinicPatientDetailPage }),
  // Appointments
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/appointments', component: ClinicAppointmentsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/appointments/new', component: ClinicAppointmentsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/appointments/$id', component: ClinicAppointmentsPage }),
  // Consultation Records
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/records', component: ClinicPatientsPage }),
  // Billing
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/billing', component: ClinicBillingPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/billing/new', component: ClinicBillingPage }),
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/billing/$id', component: ClinicBillingPage }),
  // Doctors
  createRoute({ getParentRoute: () => rootRoute, path: 'clinic/doctors', component: ClinicPatientsPage }),
])

// ─── Router Instance ─────────────────────────────────────────

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultViewTransition: false,
  basePath: '/',
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
