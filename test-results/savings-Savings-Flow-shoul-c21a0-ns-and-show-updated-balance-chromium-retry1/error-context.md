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
  - paragraph: ₱38,820
  - paragraph: Total Transactions
  - paragraph: "68"
  - heading "Savings Passbook" [level=3]
  - paragraph: 68 transactions
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
      - row "5/29/2026 57597997-ee3a-4e6f-85d4-3b0cdbd0471b Deposit ₱2,016 — —":
        - cell "5/29/2026"
        - cell "57597997-ee3a-4e6f-85d4-3b0cdbd0471b"
        - cell "Deposit"
        - cell "₱2,016"
        - cell "—"
        - cell "—"
      - row "5/29/2026 ec924db4-9d50-40e9-b856-c6d214168e27 Deposit ₱886 — —":
        - cell "5/29/2026"
        - cell "ec924db4-9d50-40e9-b856-c6d214168e27"
        - cell "Deposit"
        - cell "₱886"
        - cell "—"
        - cell "—"
      - row "5/29/2026 b8590d8b-564a-499a-b8c0-9827ed487fa7 Deposit ₱1,093 — —":
        - cell "5/29/2026"
        - cell "b8590d8b-564a-499a-b8c0-9827ed487fa7"
        - cell "Deposit"
        - cell "₱1,093"
        - cell "—"
        - cell "—"
      - row "5/29/2026 9a03be37-0742-4e2b-879a-0027175b8d99 Deposit ₱2,036 — —":
        - cell "5/29/2026"
        - cell "9a03be37-0742-4e2b-879a-0027175b8d99"
        - cell "Deposit"
        - cell "₱2,036"
        - cell "—"
        - cell "—"
      - row "5/29/2026 d03093ac-f691-4297-b5a9-918dc83a64db Deposit ₱1,669 — —":
        - cell "5/29/2026"
        - cell "d03093ac-f691-4297-b5a9-918dc83a64db"
        - cell "Deposit"
        - cell "₱1,669"
        - cell "—"
        - cell "—"
      - row "5/29/2026 1f6af3fe-36e3-4f38-93b1-da184b238f61 Deposit ₱2,381 — —":
        - cell "5/29/2026"
        - cell "1f6af3fe-36e3-4f38-93b1-da184b238f61"
        - cell "Deposit"
        - cell "₱2,381"
        - cell "—"
        - cell "—"
      - row "5/29/2026 64cd402d-3d78-4ad4-9261-4eaa21140f48 Deposit ₱2,308 — —":
        - cell "5/29/2026"
        - cell "64cd402d-3d78-4ad4-9261-4eaa21140f48"
        - cell "Deposit"
        - cell "₱2,308"
        - cell "—"
        - cell "—"
      - row "5/29/2026 d57dcc8e-315e-4deb-9b5e-5cad29ea3371 Deposit ₱2,247 — —":
        - cell "5/29/2026"
        - cell "d57dcc8e-315e-4deb-9b5e-5cad29ea3371"
        - cell "Deposit"
        - cell "₱2,247"
        - cell "—"
        - cell "—"
      - row "5/29/2026 cd5f1702-3e42-4ec7-969a-8a8ceaed2664 Deposit ₱561 — —":
        - cell "5/29/2026"
        - cell "cd5f1702-3e42-4ec7-969a-8a8ceaed2664"
        - cell "Deposit"
        - cell "₱561"
        - cell "—"
        - cell "—"
      - row "5/29/2026 d0282562-68c3-4859-993e-80326e0cef97 Deposit ₱765 — —":
        - cell "5/29/2026"
        - cell "d0282562-68c3-4859-993e-80326e0cef97"
        - cell "Deposit"
        - cell "₱765"
        - cell "—"
        - cell "—"
      - row "5/29/2026 27008a79-61ae-4f96-b6ab-fe9ab589e6c9 Deposit ₱2,470 — —":
        - cell "5/29/2026"
        - cell "27008a79-61ae-4f96-b6ab-fe9ab589e6c9"
        - cell "Deposit"
        - cell "₱2,470"
        - cell "—"
        - cell "—"
      - row "5/29/2026 aefcb160-8415-496f-bb40-3038a080b55e Deposit ₱1,081 — —":
        - cell "5/29/2026"
        - cell "aefcb160-8415-496f-bb40-3038a080b55e"
        - cell "Deposit"
        - cell "₱1,081"
        - cell "—"
        - cell "—"
      - row "5/29/2026 51f0a686-5a72-46f2-a0a7-2083b01af482 Deposit ₱1,480 — —":
        - cell "5/29/2026"
        - cell "51f0a686-5a72-46f2-a0a7-2083b01af482"
        - cell "Deposit"
        - cell "₱1,480"
        - cell "—"
        - cell "—"
      - row "5/29/2026 39abc299-f2dc-420f-8250-600e2faf1784 Deposit ₱1,661 — —":
        - cell "5/29/2026"
        - cell "39abc299-f2dc-420f-8250-600e2faf1784"
        - cell "Deposit"
        - cell "₱1,661"
        - cell "—"
        - cell "—"
      - row "5/29/2026 ddb76052-7314-4196-9323-e4871b276db2 Deposit ₱976 — —":
        - cell "5/29/2026"
        - cell "ddb76052-7314-4196-9323-e4871b276db2"
        - cell "Deposit"
        - cell "₱976"
        - cell "—"
        - cell "—"
      - row "5/29/2026 781cdbe0-aa95-467a-bfd4-01e3a8f43495 Deposit ₱1,353 — —":
        - cell "5/29/2026"
        - cell "781cdbe0-aa95-467a-bfd4-01e3a8f43495"
        - cell "Deposit"
        - cell "₱1,353"
        - cell "—"
        - cell "—"
      - row "4/14/2026 57597997-ee3a-4e6f-85d4-3b0cdbd0471b Deposit ₱1,471 — —":
        - cell "4/14/2026"
        - cell "57597997-ee3a-4e6f-85d4-3b0cdbd0471b"
        - cell "Deposit"
        - cell "₱1,471"
        - cell "—"
        - cell "—"
      - row "4/14/2026 ec924db4-9d50-40e9-b856-c6d214168e27 Deposit ₱904 — —":
        - cell "4/14/2026"
        - cell "ec924db4-9d50-40e9-b856-c6d214168e27"
        - cell "Deposit"
        - cell "₱904"
        - cell "—"
        - cell "—"
      - row "4/14/2026 b8590d8b-564a-499a-b8c0-9827ed487fa7 Deposit ₱1,168 — —":
        - cell "4/14/2026"
        - cell "b8590d8b-564a-499a-b8c0-9827ed487fa7"
        - cell "Deposit"
        - cell "₱1,168"
        - cell "—"
        - cell "—"
      - row "4/14/2026 9a03be37-0742-4e2b-879a-0027175b8d99 Deposit ₱2,472 — —":
        - cell "4/14/2026"
        - cell "9a03be37-0742-4e2b-879a-0027175b8d99"
        - cell "Deposit"
        - cell "₱2,472"
        - cell "—"
        - cell "—"
      - row "4/14/2026 d03093ac-f691-4297-b5a9-918dc83a64db Deposit ₱1,590 — —":
        - cell "4/14/2026"
        - cell "d03093ac-f691-4297-b5a9-918dc83a64db"
        - cell "Deposit"
        - cell "₱1,590"
        - cell "—"
        - cell "—"
      - row "4/14/2026 1f6af3fe-36e3-4f38-93b1-da184b238f61 Deposit ₱980 — —":
        - cell "4/14/2026"
        - cell "1f6af3fe-36e3-4f38-93b1-da184b238f61"
        - cell "Deposit"
        - cell "₱980"
        - cell "—"
        - cell "—"
      - row "4/14/2026 64cd402d-3d78-4ad4-9261-4eaa21140f48 Deposit ₱2,252 — —":
        - cell "4/14/2026"
        - cell "64cd402d-3d78-4ad4-9261-4eaa21140f48"
        - cell "Deposit"
        - cell "₱2,252"
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