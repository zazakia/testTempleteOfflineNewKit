# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loans.spec.ts >> Loan Flow >> should allow applying for a loan, computing amortization, disbursing, and recording payments
- Location: e2e\loans.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Amortization Summary')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Amortization Summary')

```

```yaml
- navigation "Main navigation":
  - link "CE CoopERP":
    - /url: /
  - navigation:
    - paragraph: Overview
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /
          - img
          - text: Dashboard
    - paragraph: Administration
    - list:
      - listitem:
        - link "Board Resolutions":
          - /url: /governance
          - img
          - text: Board Resolutions
      - listitem:
        - link "Settings":
          - /url: /settings
          - img
          - text: Settings
      - listitem:
        - link "Advanced":
          - /url: /settings/advanced
          - img
          - text: Advanced
      - listitem:
        - link "Computations":
          - /url: /settings/coop-computations
          - img
          - text: Computations
      - listitem:
        - link "Pending Approvals":
          - /url: /pending-approvals
          - img
          - text: Pending Approvals
      - listitem:
        - link "Sync Center":
          - /url: /sync-center
          - img
          - text: Sync Center
    - paragraph: Clinic
    - list:
      - listitem:
        - link "Patients":
          - /url: /clinic/patients
          - img
          - text: Patients
      - listitem:
        - link "Doctors":
          - /url: /clinic/doctors
          - img
          - text: Doctors
      - listitem:
        - link "Appointments":
          - /url: /clinic/appointments
          - img
          - text: Appointments
      - listitem:
        - link "Consultation Records":
          - /url: /clinic/records
          - img
          - text: Consultation Records
      - listitem:
        - link "Billing Records":
          - /url: /clinic/billing
          - img
          - text: Billing Records
    - paragraph: CRM
    - list:
      - listitem:
        - link "Customers":
          - /url: /customers
          - img
          - text: Customers
    - paragraph: Finance
    - list:
      - listitem:
        - link "Journal Entries":
          - /url: /accounting/journal-entries
          - img
          - text: Journal Entries
      - listitem:
        - link "Chart of Accounts":
          - /url: /accounting/chart-of-accounts
          - img
          - text: Chart of Accounts
    - paragraph: Lending
    - list:
      - listitem:
        - link "Loans":
          - /url: /loans
          - img
          - text: Loans
      - listitem:
        - link "Loan Applications":
          - /url: /loan-applications
          - img
          - text: Loan Applications
      - listitem:
        - link "Payments":
          - /url: /payments
          - img
          - text: Payments
    - paragraph: Membership
    - list:
      - listitem:
        - link "Members":
          - /url: /members
          - img
          - text: Members
      - listitem:
        - link "Share Capital":
          - /url: /share-capital
          - img
          - text: Share Capital
      - listitem:
        - link "Savings":
          - /url: /savings
          - img
          - text: Savings
    - paragraph: Operations
    - list:
      - listitem:
        - link "Collectors":
          - /url: /collectors
          - img
          - text: Collectors
      - listitem:
        - link "Remittances":
          - /url: /remittances
          - img
          - text: Remittances
    - paragraph: Analytics
    - list:
      - listitem:
        - link "Reports":
          - /url: /reports
          - img
          - text: Reports
      - listitem:
        - link "Trial Balance":
          - /url: /accounting/trial-balance
          - img
          - text: Trial Balance
  - img
  - text: All changes synced
- main "Page content":
  - text: Admin User
  - button "Sign Out":
    - img
    - text: Sign Out
  - text: "[FF] env=development tenant=default"
  - button "Back to Loans":
    - img
    - text: Back to Loans
  - paragraph: Quick Select Product
  - button "Housing Loan"
  - button "Regular Loan"
  - button "Emergency Loan"
  - button "Agricultural Loan"
  - button "Emergency Loan"
  - button "Educational Loan"
  - button "Agricultural Loan"
  - button "Educational Loan"
  - button "Regular Loan"
  - button "Housing Loan"
  - heading "Disburse New Loan" [level=3]
  - paragraph: Record a new loan with amortization computation
  - heading "Loan Details" [level=3]:
    - img
    - text: Loan Details
  - text: Borrower/Member ID **
  - textbox "Borrower/Member ID **": MEM-123456
  - text: Loan Number **
  - textbox "Loan Number **":
    - /placeholder: LN-2026-0001
    - text: LN-1783872405427
  - text: Principal Amount (₱) **
  - spinbutton "Principal Amount (₱) **": "10000"
  - text: Interest Rate (%) *
  - spinbutton "Interest Rate (%) *": "12"
  - text: Interest Type
  - combobox:
    - option "Diminishing Balance" [selected]
    - option "Straight Line"
  - text: Term *
  - spinbutton "Term *": "12"
  - combobox:
    - option "Months" [selected]
    - option "Years"
  - text: Payment Frequency
  - combobox:
    - option "Monthly" [selected]
    - option "Weekly"
    - option "Semi-Monthly"
    - option "Quarterly"
  - button "Compute Amortization":
    - img
    - text: Compute Amortization
  - paragraph: Monthly Payment
  - paragraph: ₱888.49
  - paragraph: Total Interest
  - paragraph: ₱661.86
  - paragraph: Total Amount
  - paragraph: ₱10,661.86
  - group: View Amortization Schedule
  - heading "Disbursement" [level=3]
  - text: Release Date
  - textbox "Release Date"
  - text: First Payment Date
  - textbox "First Payment Date"
  - heading "Fees & Deductions" [level=3]
  - text: Processing Fee
  - spinbutton "Processing Fee": "0"
  - text: Notarial Fee
  - spinbutton "Notarial Fee": "0"
  - text: Insurance
  - spinbutton "Insurance": "0"
  - text: Savings per Payment
  - spinbutton "Savings per Payment": "0"
  - heading "Assignment" [level=3]
  - text: Collector ID
  - textbox "Collector ID":
    - /placeholder: Collector assigned to this loan
  - text: Notes
  - textbox
  - button "Cancel"
  - button "Disburse Loan":
    - img
    - text: Disburse Loan
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Loan Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login
  6  |     await page.goto('/login')
  7  |     await page.getByLabel('Email').fill('admin@coop.com')
  8  |     await page.getByLabel('Password').fill('admin123')
  9  |     await page.getByRole('button', { name: 'Sign In' }).click()
  10 |     await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
  11 |     await page.waitForTimeout(1000)
  12 |   })
  13 | 
  14 |   test('should allow applying for a loan, computing amortization, disbursing, and recording payments', async ({ page }) => {
  15 |     // 1. Navigate to loans page
  16 |     await page.getByRole('link', { name: 'Loans', exact: true }).click()
  17 |     await expect(page.getByRole('heading', { name: 'Loans' })).toBeVisible()
  18 | 
  19 |     // 2. Click Add Loan button
  20 |     await page.getByRole('button', { name: 'New Loan' }).click()
  21 |     await expect(page.getByRole('heading', { name: 'Disburse New Loan' })).toBeVisible()
  22 | 
  23 |     // Wait for async loan products to load on the page
  24 |     await expect(page.getByText('Quick Select Product')).toBeVisible()
  25 | 
  26 |     // 3. Fill the loan disburse form
  27 |     const loanNum = `LN-${Date.now()}`
  28 |     await page.getByLabel('Borrower/Member ID *').fill('MEM-123456')
  29 |     await page.getByLabel('Loan Number *').fill(loanNum)
  30 |     await page.getByLabel('Principal Amount (₱) *').fill('10000')
  31 |     await page.getByLabel('Interest Rate (%) *').fill('12')
  32 |     await page.getByLabel('Term *').fill('12')
  33 | 
  34 |     // 4. Compute amortization and verify Summary is shown
  35 |     await page.getByRole('button', { name: 'Compute Amortization' }).click()
> 36 |     await expect(page.getByText('Amortization Summary')).toBeVisible()
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  37 | 
  38 |     // 5. Submit form to disburse
  39 |     await page.getByRole('button', { name: 'Disburse Loan' }).click()
  40 | 
  41 |     // 6. Verify redirected to details page with "Disbursed" status
  42 |     await expect(page.getByRole('heading', { name: `Loan ${loanNum}` })).toBeVisible()
  43 |     await expect(page.locator('text=Disbursed')).toBeVisible()
  44 |     await expect(page.locator('text=₱10,000')).toBeVisible()
  45 | 
  46 |     // 7. Record a payment
  47 |     await page.getByRole('button', { name: 'Record Payment' }).click()
  48 |     await expect(page.getByRole('heading', { name: 'Record Payment' })).toBeVisible()
  49 | 
  50 |     // Default suggested amount should be present, let's change it to 1000
  51 |     await page.getByLabel('Amount (₱)').fill('1000')
  52 |     await page.getByRole('button', { name: 'Save Payment' }).click()
  53 | 
  54 |     // 8. Verify payment appears in Payment History and Balance is reduced
  55 |     await expect(page.locator('table')).toContainText('₱1,000')
  56 |     await expect(page.locator('text=Total Paid')).toBeVisible()
  57 |     await expect(page.locator('text=₱9,000').first()).toBeVisible() // 10000 principal - 1000 paid = 9000 balance
  58 |   })
  59 | })
  60 | 
```