# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should allow user to logout
- Location: e2e\auth.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Sign In' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Sign In' })

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
  - text: "[FF] env=development tenant=default"
  - heading "Cooperative Dashboard" [level=1]
  - paragraph: 🟢 Online · 55 tables · 1008 records stored locally
  - link "Total Members 30":
    - /url: /members
    - paragraph: Total Members
    - paragraph: "30"
    - img
  - link "Active Members 26":
    - /url: /members
    - paragraph: Active Members
    - paragraph: "26"
    - img
  - link "Active Loans 14":
    - /url: /loans
    - paragraph: Active Loans
    - paragraph: "14"
    - img
  - link "Total Loans 20":
    - /url: /loans
    - paragraph: Total Loans
    - paragraph: "20"
    - img
  - heading "Quick Actions" [level=2]
  - link "Register Member":
    - /url: /members/new
    - img
    - text: Register Member
  - link "Loan Application":
    - /url: /loan-applications/new
    - img
    - text: Loan Application
  - link "Record Payment":
    - /url: /payments
    - img
    - text: Record Payment
  - link "Journal Entry":
    - /url: /accounting/journal-entries/new
    - img
    - text: Journal Entry
  - heading "System Health" [level=3]
  - term: Database
  - definition: ✅ Connected
  - term: Tables
  - definition: "55"
  - term: Total Records
  - definition: 1,008
  - term: Sync Status
  - definition: 🟢 Online
  - heading "Module Guide" [level=3]
  - paragraph: Click a module in the sidebar to get started
  - text: "1"
  - paragraph: Members
  - paragraph: Register cooperative members with full profiles
  - text: Ready 2
  - paragraph: Share Capital
  - paragraph: Manage member share subscriptions
  - text: Ready 3
  - paragraph: Loan Applications
  - paragraph: Accept and process loan applications
  - text: Ready 4
  - paragraph: Loan Disbursement
  - paragraph: Disburse approved loans
  - text: Ready 5
  - paragraph: Collections
  - paragraph: Record payments and manage collectors
  - text: Ready 6
  - paragraph: Accounting
  - paragraph: Chart of accounts and journal entries
  - text: Ready
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Start on login page in a logged out state
  6  |     await page.goto('/login')
  7  |     await page.evaluate(() => localStorage.clear())
  8  |     await page.reload()
  9  |   })
  10 | 
  11 |   test('should display login page and allow login with demo credentials', async ({ page }) => {
  12 |     await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  13 | 
  14 |     // Fill login form
  15 |     await page.getByLabel('Email').fill('admin@coop.com')
  16 |     await page.getByLabel('Password').fill('admin123')
  17 |     await page.getByRole('button', { name: 'Sign In' }).click()
  18 | 
  19 |     // Verify redirection to Dashboard
  20 |     await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
  21 |   })
  22 | 
  23 |   test('should show error message for invalid credentials', async ({ page }) => {
  24 |     await page.getByLabel('Email').fill('admin@coop.com')
  25 |     await page.getByLabel('Password').fill('wrongpassword')
  26 |     await page.getByRole('button', { name: 'Sign In' }).click()
  27 | 
  28 |     await expect(page.locator('text=Invalid email or password')).toBeVisible()
  29 |   })
  30 | 
  31 |   test('should allow user to logout', async ({ page }) => {
  32 |     // Login
  33 |     await page.getByLabel('Email').fill('admin@coop.com')
  34 |     await page.getByLabel('Password').fill('admin123')
  35 |     await page.getByRole('button', { name: 'Sign In' }).click()
  36 |     await expect(page.locator('text=Dashboard').first()).toBeVisible()
  37 | 
  38 |     // Click logout
  39 |     await page.getByRole('button', { name: 'Sign Out' }).click()
  40 | 
  41 |     // Verify redirected back to login page
> 42 |     await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  43 |   })
  44 | })
  45 | 
```