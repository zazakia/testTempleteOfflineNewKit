/**
 * ─── Full Seed Data — Philippine Cooperative Demo ────────────
 * Pre-populates all modules with realistic demo data.
 * Run on first launch or when SEED_KEY is cleared.
 */

import {
  memberRepo, shareCapitalRepo, savingsRepo, loanRepo, loanProductRepo,
  loanApplicationRepo, paymentRepo, collectorRepo, collectionGroupRepo,
  remittanceRepo, bankAccountRepo, cashTransactionRepo, expenseRepo,
  expenseCategoryRepo, employeeRepo, committeeRepo, boardResolutionRepo,
  wsCustomerRepo, wsDeliveryRepo, areaRepo, chartOfAccountRepo
} from './db'

const SEED_KEY = 'cooperp_full_seeded_v2'
let seededCount = 0

function log(msg: string) { seededCount++; console.log(`[Seed] ${msg}`) }

// ─── Members (15 demo members) ─────────────────────────────
const DEMO_MEMBERS = [
  { firstName: 'Juan', lastName: 'Dela Cruz', middleName: 'Santos', membershipNumber: 'COOP-2026-0001', barangay: 'Poblacion', cityMunicipality: 'San Juan', province: 'La Union', phone: '09171234567', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 365 * 86400000 },
  { firstName: 'Maria', lastName: 'Santos', middleName: 'Reyes', membershipNumber: 'COOP-2026-0002', barangay: 'Barangay 1', cityMunicipality: 'Bauang', province: 'La Union', phone: '09179876543', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 300 * 86400000 },
  { firstName: 'Pedro', lastName: 'Gonzales', middleName: 'Cruz', membershipNumber: 'COOP-2026-0003', barangay: 'San Nicolas', cityMunicipality: 'San Fernando', province: 'La Union', phone: '09175678901', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 250 * 86400000 },
  { firstName: 'Ana', lastName: 'Bautista', membershipNumber: 'COOP-2026-0004', barangay: 'Paringao', cityMunicipality: 'Bauang', province: 'La Union', phone: '09173456789', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 200 * 86400000 },
  { firstName: 'Jose', lastName: 'Rizal', middleName: 'Mercado', membershipNumber: 'COOP-2026-0005', barangay: 'Taboc', cityMunicipality: 'San Juan', province: 'La Union', phone: '09172345678', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 180 * 86400000 },
  { firstName: 'Elena', lastName: 'Villanueva', membershipNumber: 'COOP-2026-0006', barangay: 'Dallangayan Este', cityMunicipality: 'San Juan', province: 'La Union', phone: '09174567890', membershipType: 'associate', pmesCompleted: true, dateJoined: Date.now() - 150 * 86400000 },
  { firstName: 'Carlos', lastName: 'Mendoza', membershipNumber: 'COOP-2026-0007', barangay: 'Luna', cityMunicipality: 'Luna', province: 'La Union', phone: '09177890123', membershipType: 'regular', pmesCompleted: false, dateJoined: Date.now() - 120 * 86400000 },
  { firstName: 'Luisa', lastName: 'Fernandez', membershipNumber: 'COOP-2026-0008', barangay: 'Bacnotan', cityMunicipality: 'Bacnotan', province: 'La Union', phone: '09179012345', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 100 * 86400000 },
  { firstName: 'Antonio', lastName: 'Lopez', membershipNumber: 'COOP-2026-0009', barangay: 'Poblacion', cityMunicipality: 'Agoo', province: 'La Union', phone: '09175612345', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 90 * 86400000 },
  { firstName: 'Isabel', lastName: 'Martinez', membershipNumber: 'COOP-2026-0010', barangay: 'Santo Tomas', cityMunicipality: 'Santo Tomas', province: 'La Union', phone: '09178123456', membershipType: 'associate', pmesCompleted: true, dateJoined: Date.now() - 60 * 86400000 },
  { firstName: 'Ramon', lastName: 'Torres', membershipNumber: 'COOP-2026-0011', barangay: 'Rosario', cityMunicipality: 'Rosario', province: 'La Union', phone: '09173456123', membershipType: 'regular', pmesCompleted: true, membershipStatus: 'inactive', dateJoined: Date.now() - 730 * 86400000 },
  { firstName: 'Carmen', lastName: 'Rivera', membershipNumber: 'COOP-2026-0012', barangay: 'Caba', cityMunicipality: 'Caba', province: 'La Union', phone: '09177894567', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 500 * 86400000 },
  { firstName: 'Fernando', lastName: 'Garcia', membershipNumber: 'COOP-2026-0013', barangay: 'Pugo', cityMunicipality: 'Pugo', province: 'La Union', phone: '09179017890', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 400 * 86400000 },
  { firstName: 'Teresa', lastName: 'Santos', membershipNumber: 'COOP-2026-0014', barangay: 'Naguilian', cityMunicipality: 'Naguilian', province: 'La Union', phone: '09172349012', membershipType: 'regular', pmesCompleted: true, membershipStatus: 'terminated', dateJoined: Date.now() - 800 * 86400000 },
  { firstName: 'Ricardo', lastName: 'Dimaano', membershipNumber: 'COOP-2026-0015', barangay: 'Bagulin', cityMunicipality: 'Bagulin', province: 'La Union', phone: '09175679012', membershipType: 'regular', pmesCompleted: true, dateJoined: Date.now() - 30 * 86400000 },
]

// ─── Loan Products ──────────────────────────────────────────
const DEMO_LOAN_PRODUCTS = [
  { productType: 'regular', label: 'Regular Loan', defaultRatePercent: 12, defaultTerm: 12, defaultTermUnit: 'months', defaultFrequency: 'monthly', defaultProcessingFeeFlat: 150, defaultNotarialFee: 50, defaultSavingsPerPayment: 50, maxPrincipal: 200000, is_active: true, sortOrder: 1 },
  { productType: 'emergency', label: 'Emergency Loan', defaultRatePercent: 10, defaultTerm: 6, defaultTermUnit: 'months', defaultFrequency: 'monthly', defaultProcessingFeeFlat: 100, maxPrincipal: 50000, is_active: true, sortOrder: 2 },
  { productType: 'educational', label: 'Educational Loan', defaultRatePercent: 8, defaultTerm: 24, defaultTermUnit: 'months', defaultFrequency: 'monthly', defaultProcessingFeeFlat: 100, maxPrincipal: 100000, is_active: true, sortOrder: 3 },
  { productType: 'agricultural', label: 'Agricultural Loan', defaultRatePercent: 9, defaultTerm: 18, defaultTermUnit: 'months', defaultFrequency: 'quarterly', defaultProcessingFeeRate: 1.5, maxPrincipal: 300000, is_active: true, sortOrder: 4 },
  { productType: 'housing', label: 'Housing Loan', defaultRatePercent: 7, defaultTerm: 60, defaultTermUnit: 'months', defaultFrequency: 'monthly', defaultProcessingFeeFlat: 500, defaultNotarialFee: 200, maxPrincipal: 1000000, is_active: true, sortOrder: 5 },
]

// ─── Loans (10 sample loans) ────────────────────────────────
const DEMO_LOANS = [
  { borrowerIndex: 0, loanNumber: 'LN-2026-0001', principal: 50000, rate: 12, term: 12, status: 'active', dpd: 0, isDelinquent: false, released: Date.now() - 120 * 86400000 },
  { borrowerIndex: 1, loanNumber: 'LN-2026-0002', principal: 25000, rate: 12, term: 6, status: 'active', dpd: 15, isDelinquent: true, released: Date.now() - 90 * 86400000 },
  { borrowerIndex: 2, loanNumber: 'LN-2026-0003', principal: 100000, rate: 10, term: 24, status: 'active', dpd: 0, isDelinquent: false, released: Date.now() - 60 * 86400000 },
  { borrowerIndex: 3, loanNumber: 'LN-2026-0004', principal: 30000, rate: 12, term: 12, status: 'paid', dpd: 0, isDelinquent: false, released: Date.now() - 365 * 86400000 },
  { borrowerIndex: 4, loanNumber: 'LN-2026-0005', principal: 75000, rate: 12, term: 18, status: 'active', dpd: 45, isDelinquent: true, released: Date.now() - 150 * 86400000 },
  { borrowerIndex: 5, loanNumber: 'LN-2026-0006', principal: 15000, rate: 10, term: 6, status: 'active', dpd: 0, isDelinquent: false, released: Date.now() - 30 * 86400000 },
  { borrowerIndex: 6, loanNumber: 'LN-2026-0007', principal: 40000, rate: 12, term: 12, status: 'defaulted', dpd: 120, isDelinquent: true, released: Date.now() - 200 * 86400000 },
  { borrowerIndex: 7, loanNumber: 'LN-2026-0008', principal: 80000, rate: 9, term: 24, status: 'active', dpd: 5, isDelinquent: true, released: Date.now() - 45 * 86400000 },
  { borrowerIndex: 8, loanNumber: 'LN-2026-0009', principal: 20000, rate: 12, term: 6, status: 'paid', dpd: 0, isDelinquent: false, released: Date.now() - 180 * 86400000 },
  { borrowerIndex: 9, loanNumber: 'LN-2026-0010', principal: 60000, rate: 12, term: 12, status: 'active', dpd: 0, isDelinquent: false, released: Date.now() - 10 * 86400000 },
]

// ─── Collectors ──────────────────────────────────────────────
const DEMO_COLLECTORS = [
  { fullName: 'Michael Reyes', phone: '09171112233', is_active: true },
  { fullName: 'Sarah Lim', phone: '09174445566', is_active: true },
  { fullName: 'David Tan', phone: '09177778899', is_active: true },
]

// ─── Areas ───────────────────────────────────────────────────
const DEMO_AREAS = [
  { name: 'San Juan North', code: 'SJN', is_active: true },
  { name: 'San Juan South', code: 'SJS', is_active: true },
  { name: 'Bauang East', code: 'BGE', is_active: true },
  { name: 'Bauang West', code: 'BGW', is_active: true },
  { name: 'City Proper', code: 'CTY', is_active: true },
]

// ─── Bank Accounts ──────────────────────────────────────────
const DEMO_BANK_ACCOUNTS = [
  { bankName: 'Land Bank of the Philippines', accountName: 'CoopERP Savings', accountNumber: 'LBP-1234-5678-90', startingBalance: 500000 },
  { bankName: 'Development Bank of the Philippines', accountName: 'CoopERP Checking', accountNumber: 'DBP-9876-5432-10', startingBalance: 250000 },
  { bankName: 'BDO Unibank', accountName: 'CoopERP Time Deposit', accountNumber: 'BDO-4567-8901-23', startingBalance: 1000000 },
]

// ─── Employees ───────────────────────────────────────────────
const DEMO_EMPLOYEES = [
  { name: 'Atty. Maria Santos', role: 'manager', baseSalary: 45000, is_active: true },
  { name: 'Juan Dela Cruz Jr.', role: 'officer', baseSalary: 30000, is_active: true },
  { name: 'Ana Bautista', role: 'staff', baseSalary: 18000, is_active: true },
  { name: 'Pedro Gonzales', role: 'collector', baseSalary: 15000, is_active: true },
  { name: 'Luisa Fernandez', role: 'staff', baseSalary: 16000, is_active: true },
]

// ─── Committees ─────────────────────────────────────────────
const DEMO_COMMITTEES = [
  { name: 'Credit Committee', type: 'credit', is_active: true },
  { name: 'Audit Committee', type: 'audit', is_active: true },
  { name: 'Education Committee', type: 'education', is_active: true },
  { name: 'Ethics Committee', type: 'ethics', is_active: true },
  { name: 'Election Committee', type: 'election', is_active: true },
]

// ─── Expense Categories ──────────────────────────────────────
const DEMO_EXPENSE_CATEGORIES = [
  { name: 'Transportation' }, { name: 'Office Supplies' }, { name: 'Utilities' },
  { name: 'Communication' }, { name: 'Salaries and Wages' }, { name: 'Repairs and Maintenance' },
  { name: 'Training and Seminars' }, { name: 'Representation' }, { name: 'Miscellaneous' },
]

// ─── Water Station Customers ─────────────────────────────────
const DEMO_WS_CUSTOMERS = [
  { name: 'Restaurant sa Plaza', phone: '09175551111', address: 'Poblacion, San Juan', isMember: true, memberId: 'm1' },
  { name: 'Casa de Eduarda', phone: '09175552222', address: 'Barangay 1, Bauang', isMember: false },
  { name: 'Jollibee San Juan', phone: '09175553333', address: 'National Highway, San Juan', isMember: true, memberId: 'm3' },
  { name: 'Rizal Elementary School', phone: '09175554444', address: 'Taboc, San Juan', isMember: false },
]

// ─── Board Resolutions ──────────────────────────────────────
const DEMO_RESOLUTIONS = [
  { resolutionNumber: 'BR-2026-001', title: 'Approval of Annual Business Plan', description: 'Resolution approving the cooperative annual business plan for fiscal year 2026', resolutionDate: Date.now() - 60 * 86400000, status: 'active' },
  { resolutionNumber: 'BR-2026-002', title: 'Declaration of Dividends', description: 'Resolution declaring 5% dividend on share capital for fiscal year 2025', resolutionDate: Date.now() - 30 * 86400000, status: 'active' },
  { resolutionNumber: 'BR-2026-003', title: 'Amendment of By-Laws Article III', description: 'Resolution amending membership classification criteria', resolutionDate: Date.now() - 15 * 86400000, status: 'active' },
]

// ─── Main Seed Function ─────────────────────────────────────
export async function seedFullDatabase(): Promise<number> {
  if (typeof window === 'undefined') return 0
  if (localStorage.getItem(SEED_KEY)) { console.log('[Seed] Already seeded'); return 0 }

  seededCount = 0
  console.log('[Seed] Starting full database seed...')

  try {
    // 1. Members
    const memberIds: string[] = []
    for (const m of DEMO_MEMBERS) {
      const fullName = `${m.firstName} ${m.middleName ? m.middleName + ' ' : ''}${m.lastName}`
      const created = await memberRepo.create({
        ...m, fullName, tenantId: 'default', membershipStatus: (m as any).membershipStatus ?? 'active',
        createdBy: 'system', updatedBy: 'system',
      } as any)
      memberIds.push(created.id)
    }
    log(`${memberIds.length} members created`)

    // 2. Loan Products
    for (const p of DEMO_LOAN_PRODUCTS) {
      await loanProductRepo.create({ ...p, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_LOAN_PRODUCTS.length} loan products created`)

    // 3. Collectors
    for (const c of DEMO_COLLECTORS) {
      await collectorRepo.create({ ...c, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_COLLECTORS.length} collectors created`)

    // 4. Areas
    for (const a of DEMO_AREAS) {
      await areaRepo.create({ ...a, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_AREAS.length} areas created`)

    // 5. Loans with payments
    let paymentCount = 0
    for (const l of DEMO_LOANS) {
      const { LoanService } = await import('@repo/entity-loan')
      const amort = LoanService.computeDiminishingAmortization(l.principal, l.rate, l.term)
      const loan = await loanRepo.create({
        borrowerId: memberIds[l.borrowerIndex] ?? memberIds[0],
        loanNumber: l.loanNumber, principalAmount: l.principal,
        interestRate: l.rate, interestType: 'diminishing', term: l.term,
        termUnit: 'months', frequency: 'monthly',
        totalAmount: amort.totalAmount, installmentAmount: amort.monthlyPayment,
        interestAmount: amort.totalInterest,
        releaseDate: l.released, status: l.status, dpd: l.dpd,
        isDelinquent: l.isDelinquent,
        tenantId: 'default', createdBy: 'system', updatedBy: 'system',
      } as any)

      // Create payments for paid and active loans
      if (l.status === 'paid' || l.status === 'active') {
        const numPayments = l.status === 'paid' ? l.term : Math.floor(Math.random() * Math.min(l.term - 1, 5)) + 1
        for (let i = 0; i < numPayments; i++) {
          const payDate = l.released + (i + 1) * 30 * 86400000
          if (payDate < Date.now()) {
            await paymentRepo.create({
              loanId: loan.id, borrowerId: memberIds[l.borrowerIndex],
              amount: amort.monthlyPayment, paymentDate: payDate + Math.random() * 3 * 86400000,
              paymentType: 'regular', receiptNumber: `RCP-${String(++paymentCount).padStart(6, '0')}`,
              tenantId: 'default', createdBy: 'system', updatedBy: 'system',
            } as any)
          }
        }
      }
    }
    log(`${DEMO_LOANS.length} loans created with ${paymentCount} payments`)

    // 6. Share Capital for members
    let shareCount = 0
    for (let i = 0; i < memberIds.length; i++) {
      const numTx = Math.floor(Math.random() * 4) + 1
      for (let j = 0; j < numTx; j++) {
        const shares = (j + 1) * 5
        await shareCapitalRepo.create({
          memberId: memberIds[i], transactionType: j === 0 ? 'subscription' : 'payment',
          shareType: 'common', numberOfShares: 5, parValue: 100, amount: 500,
          date: Date.now() - (numTx - j) * 90 * 86400000,
          referenceNumber: `SC-2026-${String(++shareCount).padStart(6, '0')}`,
          tenantId: 'default', recordedBy: 'system', createdBy: 'system', updatedBy: 'system',
        } as any)
      }
    }
    log(`${shareCount} share capital transactions created`)

    // 7. Savings transactions for members
    let savingsCount = 0
    for (let i = 0; i < Math.min(memberIds.length, 8); i++) {
      const numTx = Math.floor(Math.random() * 5) + 2
      let balance = 0
      for (let j = 0; j < numTx; j++) {
        const isDeposit = j < numTx - 1 || balance > 500
        const amount = isDeposit ? Math.floor(Math.random() * 2000) + 500 : Math.floor(Math.random() * 500) + 100
        balance += isDeposit ? amount : -amount
        await savingsRepo.create({
          memberId: memberIds[i], savingsAccountId: `SAV-${memberIds[i]?.slice(0, 8)}`,
          type: isDeposit ? 'deposit' : 'withdrawal', amount,
          runningBalance: Math.max(0, balance),
          date: Date.now() - (numTx - j) * 45 * 86400000,
          tenantId: 'default', recordedBy: 'system', createdBy: 'system', updatedBy: 'system',
        } as any)
        savingsCount++
      }
    }
    log(`${savingsCount} savings transactions created`)

    // 8. Bank Accounts
    for (const b of DEMO_BANK_ACCOUNTS) {
      await bankAccountRepo.create({ ...b, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_BANK_ACCOUNTS.length} bank accounts created`)

    // 9. Employees
    for (const e of DEMO_EMPLOYEES) {
      await employeeRepo.create({ ...e, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_EMPLOYEES.length} employees created`)

    // 10. Committees
    for (const c of DEMO_COMMITTEES) {
      await committeeRepo.create({ ...c, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_COMMITTEES.length} committees created`)

    // 11. Board Resolutions
    for (const r of DEMO_RESOLUTIONS) {
      await boardResolutionRepo.create({ ...r, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_RESOLUTIONS.length} board resolutions created`)

    // 12. Expense Categories
    for (const c of DEMO_EXPENSE_CATEGORIES) {
      await expenseCategoryRepo.create({ ...c, is_active: true, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_EXPENSE_CATEGORIES.length} expense categories created`)

    // 13. Water Station Customers
    for (const c of DEMO_WS_CUSTOMERS) {
      await wsCustomerRepo.create({ ...c, tenantId: 'default', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${DEMO_WS_CUSTOMERS.length} water station customers created`)

    // 14. Water Station Deliveries
    let wsDeliveryCount = 0
    for (const c of DEMO_WS_CUSTOMERS) {
      const numDel = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numDel; j++) {
        const gallons = Math.floor(Math.random() * 20) + 5
        await wsDeliveryRepo.create({
          customerId: c.name, deliveryDate: Date.now() - j * 7 * 86400000,
          gallons, pricePerGallon: 40, totalAmount: gallons * 40,
          status: 'delivered', tenantId: 'default', createdBy: 'system', updatedBy: 'system',
        } as any)
        wsDeliveryCount++
      }
    }
    log(`${wsDeliveryCount} water station deliveries created`)

    // 15. Sample Expenses
    const sampleExpenses = [
      { category: 'Transportation', description: 'Field collection trip - San Juan', amount: 350, expenseDate: Date.now() - 5 * 86400000, payee: 'Gas Station' },
      { category: 'Office Supplies', description: 'Printer ink and bond paper', amount: 1280, expenseDate: Date.now() - 10 * 86400000, payee: 'National Book Store' },
      { category: 'Utilities', description: 'Monthly electricity bill', amount: 3450, expenseDate: Date.now() - 3 * 86400000, payee: 'MERALCO' },
      { category: 'Communication', description: 'Internet and phone bill', amount: 1899, expenseDate: Date.now() - 7 * 86400000, payee: 'PLDT' },
      { category: 'Training and Seminars', description: 'CDA Compliance Seminar - 5 staff', amount: 5000, expenseDate: Date.now() - 15 * 86400000, payee: 'CDA Regional Office' },
    ]
    for (const e of sampleExpenses) {
      await expenseRepo.create({ ...e, tenantId: 'default', encodedBy: 'system', createdBy: 'system', updatedBy: 'system' } as any)
    }
    log(`${sampleExpenses.length} expenses created`)

    localStorage.setItem(SEED_KEY, 'true')
    console.log(`[Seed] ✅ COMPLETE — ${seededCount} records created`)
    return seededCount
  } catch (error) {
    console.error('[Seed] Error:', error)
    return seededCount
  }
}
