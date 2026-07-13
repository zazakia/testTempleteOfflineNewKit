# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: savings.spec.ts >> Savings Flow >> should allow recording deposit and withdrawal transactions and show updated balance
- Location: e2e\savings.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=₱3,000').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=₱3,000').first()

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
  - paragraph: Total Savings Balance
  - paragraph: ₱32,405
  - paragraph: Total Transactions
  - paragraph: "67"
  - heading "Savings Passbook" [level=3]
  - paragraph: 67 transactions
  - button "New Transaction":
    - img
    - text: New Transaction
  - img
  - textbox "Search by member ID..."
  - table:
    - rowgroup:
      - row "Date Member Type Deposit Withdrawal Reference":
        - columnheader "Date"
        - columnheader "Member"
        - columnheader "Type"
        - columnheader "Deposit"
        - columnheader "Withdrawal"
        - columnheader "Reference"
    - rowgroup:
      - row "7/13/2026 MEM-SAVINGS-1 Withdrawal — ₱2,000 —":
        - cell "7/13/2026"
        - cell "MEM-SAVINGS-1"
        - cell "Withdrawal"
        - cell "—"
        - cell "₱2,000"
        - cell "—"
      - row "7/13/2026 MEM-SAVINGS-1 Deposit ₱5,000 — —":
        - cell "7/13/2026"
        - cell "MEM-SAVINGS-1"
        - cell "Deposit"
        - cell "₱5,000"
        - cell "—"
        - cell "—"
      - row "5/29/2026 99505205-084d-4f63-b219-f3018566c4a0 Deposit ₱1,648 — —":
        - cell "5/29/2026"
        - cell "99505205-084d-4f63-b219-f3018566c4a0"
        - cell "Deposit"
        - cell "₱1,648"
        - cell "—"
        - cell "—"
      - row "5/29/2026 b9d0dc2c-7106-4c11-a97e-c35aa77d5c19 Deposit ₱1,171 — —":
        - cell "5/29/2026"
        - cell "b9d0dc2c-7106-4c11-a97e-c35aa77d5c19"
        - cell "Deposit"
        - cell "₱1,171"
        - cell "—"
        - cell "—"
      - row "5/29/2026 f42bf42a-65bd-4881-b983-0f272d445c58 Deposit ₱943 — —":
        - cell "5/29/2026"
        - cell "f42bf42a-65bd-4881-b983-0f272d445c58"
        - cell "Deposit"
        - cell "₱943"
        - cell "—"
        - cell "—"
      - row "5/29/2026 8a508449-dbc5-4c4a-8c34-6d228bdd6624 Deposit ₱666 — —":
        - cell "5/29/2026"
        - cell "8a508449-dbc5-4c4a-8c34-6d228bdd6624"
        - cell "Deposit"
        - cell "₱666"
        - cell "—"
        - cell "—"
      - row "5/29/2026 457228da-cfe7-4b5b-b380-14818231207f Deposit ₱1,464 — —":
        - cell "5/29/2026"
        - cell "457228da-cfe7-4b5b-b380-14818231207f"
        - cell "Deposit"
        - cell "₱1,464"
        - cell "—"
        - cell "—"
      - row "5/29/2026 1dfe7890-5ea8-4c4b-b36b-c946a9f2ab2d Deposit ₱1,939 — —":
        - cell "5/29/2026"
        - cell "1dfe7890-5ea8-4c4b-b36b-c946a9f2ab2d"
        - cell "Deposit"
        - cell "₱1,939"
        - cell "—"
        - cell "—"
      - row "5/29/2026 573cc362-683b-4dab-81c2-65c676113eff Deposit ₱2,408 — —":
        - cell "5/29/2026"
        - cell "573cc362-683b-4dab-81c2-65c676113eff"
        - cell "Deposit"
        - cell "₱2,408"
        - cell "—"
        - cell "—"
      - row "5/29/2026 64284b2a-1f33-4d6c-bca2-7dd7bbdf0837 Deposit ₱818 — —":
        - cell "5/29/2026"
        - cell "64284b2a-1f33-4d6c-bca2-7dd7bbdf0837"
        - cell "Deposit"
        - cell "₱818"
        - cell "—"
        - cell "—"
      - row "5/29/2026 2a5a4ce9-6db1-4306-8b0c-08b2a9abf5cf Deposit ₱1,214 — —":
        - cell "5/29/2026"
        - cell "2a5a4ce9-6db1-4306-8b0c-08b2a9abf5cf"
        - cell "Deposit"
        - cell "₱1,214"
        - cell "—"
        - cell "—"
      - row "5/29/2026 4ca276c3-424e-4a6f-a46c-2a81adb93147 Deposit ₱1,093 — —":
        - cell "5/29/2026"
        - cell "4ca276c3-424e-4a6f-a46c-2a81adb93147"
        - cell "Deposit"
        - cell "₱1,093"
        - cell "—"
        - cell "—"
      - row "5/29/2026 de4476f6-49e5-4bed-8de4-ccaeeb62d700 Deposit ₱1,210 — —":
        - cell "5/29/2026"
        - cell "de4476f6-49e5-4bed-8de4-ccaeeb62d700"
        - cell "Deposit"
        - cell "₱1,210"
        - cell "—"
        - cell "—"
      - row "5/29/2026 d709cf50-bad8-4683-bcd8-a4ebf46e7ba8 Deposit ₱1,689 — —":
        - cell "5/29/2026"
        - cell "d709cf50-bad8-4683-bcd8-a4ebf46e7ba8"
        - cell "Deposit"
        - cell "₱1,689"
        - cell "—"
        - cell "—"
      - row "5/29/2026 29451aac-4216-49c3-b0be-80baf85bbc1d Deposit ₱1,081 — —":
        - cell "5/29/2026"
        - cell "29451aac-4216-49c3-b0be-80baf85bbc1d"
        - cell "Deposit"
        - cell "₱1,081"
        - cell "—"
        - cell "—"
      - row "5/29/2026 90f4eea3-fabe-4054-90b5-bf703a809f86 Deposit ₱1,489 — —":
        - cell "5/29/2026"
        - cell "90f4eea3-fabe-4054-90b5-bf703a809f86"
        - cell "Deposit"
        - cell "₱1,489"
        - cell "—"
        - cell "—"
      - row "5/29/2026 8fd93215-691c-4d42-926f-744001b22610 Deposit ₱1,671 — —":
        - cell "5/29/2026"
        - cell "8fd93215-691c-4d42-926f-744001b22610"
        - cell "Deposit"
        - cell "₱1,671"
        - cell "—"
        - cell "—"
      - row "5/29/2026 85732eb3-9e70-4a6a-9b71-92a71bd5f818 Deposit ₱966 — —":
        - cell "5/29/2026"
        - cell "85732eb3-9e70-4a6a-9b71-92a71bd5f818"
        - cell "Deposit"
        - cell "₱966"
        - cell "—"
        - cell "—"
      - row "4/14/2026 99505205-084d-4f63-b219-f3018566c4a0 Deposit ₱1,235 — —":
        - cell "4/14/2026"
        - cell "99505205-084d-4f63-b219-f3018566c4a0"
        - cell "Deposit"
        - cell "₱1,235"
        - cell "—"
        - cell "—"
      - row "4/14/2026 b9d0dc2c-7106-4c11-a97e-c35aa77d5c19 Deposit ₱1,985 — —":
        - cell "4/14/2026"
        - cell "b9d0dc2c-7106-4c11-a97e-c35aa77d5c19"
        - cell "Deposit"
        - cell "₱1,985"
        - cell "—"
        - cell "—"
      - row "4/14/2026 f42bf42a-65bd-4881-b983-0f272d445c58 Deposit ₱589 — —":
        - cell "4/14/2026"
        - cell "f42bf42a-65bd-4881-b983-0f272d445c58"
        - cell "Deposit"
        - cell "₱589"
        - cell "—"
        - cell "—"
      - row "4/14/2026 8a508449-dbc5-4c4a-8c34-6d228bdd6624 Deposit ₱592 — —":
        - cell "4/14/2026"
        - cell "8a508449-dbc5-4c4a-8c34-6d228bdd6624"
        - cell "Deposit"
        - cell "₱592"
        - cell "—"
        - cell "—"
      - row "4/14/2026 457228da-cfe7-4b5b-b380-14818231207f Deposit ₱1,363 — —":
        - cell "4/14/2026"
        - cell "457228da-cfe7-4b5b-b380-14818231207f"
        - cell "Deposit"
        - cell "₱1,363"
        - cell "—"
        - cell "—"
      - row "4/14/2026 1dfe7890-5ea8-4c4b-b36b-c946a9f2ab2d Deposit ₱614 — —":
        - cell "4/14/2026"
        - cell "1dfe7890-5ea8-4c4b-b36b-c946a9f2ab2d"
        - cell "Deposit"
        - cell "₱614"
        - cell "—"
        - cell "—"
      - row "4/14/2026 573cc362-683b-4dab-81c2-65c676113eff Deposit ₱1,557 — —":
        - cell "4/14/2026"
        - cell "573cc362-683b-4dab-81c2-65c676113eff"
        - cell "Deposit"
        - cell "₱1,557"
        - cell "—"
        - cell "—"
  - paragraph: Page 1 of 3
  - button "Prev" [disabled]:
    - img
    - text: Prev
  - button "Next":
    - img
    - text: Next
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Savings Flow', () => {
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
  14 |   test('should allow recording deposit and withdrawal transactions and show updated balance', async ({ page }) => {
  15 |     // 1. Navigate to savings page
  16 |     await page.getByRole('link', { name: 'Savings', exact: true }).click()
  17 |     await expect(page.getByRole('heading', { name: 'Savings Passbook' })).toBeVisible()
  18 | 
  19 |     // 2. Click New Transaction button
  20 |     await page.getByRole('button', { name: 'New Transaction' }).click()
  21 |     await expect(page.getByRole('heading', { name: 'Record Savings Transaction' })).toBeVisible()
  22 | 
  23 |     // 3. Fill deposit details
  24 |     await page.getByLabel('Member ID').fill('MEM-SAVINGS-1')
  25 |     await page.getByLabel('Account ID').fill('ACC-SAVINGS-1')
  26 |     await page.getByLabel('Amount (₱)').fill('5000')
  27 |     await page.getByRole('button', { name: 'Save' }).click()
  28 | 
  29 |     // 4. Verify deposit transaction and balance update
  30 |     await expect(page.locator('text=Total Savings Balance')).toBeVisible()
  31 |     await expect(page.locator('text=₱5,000').first()).toBeVisible()
  32 |     await expect(page.locator('table')).toContainText('Deposit')
  33 |     await expect(page.locator('table')).toContainText('MEM-SAVINGS-1')
  34 | 
  35 |     // 5. Record withdrawal transaction
  36 |     await page.getByRole('button', { name: 'New Transaction' }).click()
  37 |     await page.getByLabel('Member ID').fill('MEM-SAVINGS-1')
  38 |     await page.getByLabel('Account ID').fill('ACC-SAVINGS-1')
  39 |     await page.locator('select').selectOption('withdrawal')
  40 |     await page.getByLabel('Amount (₱)').fill('2000')
  41 |     await page.getByRole('button', { name: 'Save' }).click()
  42 | 
  43 |     // 6. Verify withdrawal transaction and updated balance
> 44 |     await expect(page.locator('text=₱3,000').first()).toBeVisible() // 5000 - 2000 = 3000 balance
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  45 |     await expect(page.locator('table')).toContainText('Withdrawal')
  46 |   })
  47 | })
  48 | 
```