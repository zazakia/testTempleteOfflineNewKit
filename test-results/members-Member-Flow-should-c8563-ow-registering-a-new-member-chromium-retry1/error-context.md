# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: members.spec.ts >> Member Flow >> should display members list and allow registering a new member
- Location: e2e\members.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Juan Santos Dela Cruz' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Juan Santos Dela Cruz' })

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
  - button "Back":
    - img
    - text: Back
  - heading [level=1]
  - paragraph: MEM-1783872415087 · Joined N/A
  - text: Active
  - heading "Personal Information" [level=3]
  - term: Full Name
  - definition: —
  - term: Membership Number
  - definition: MEM-1783872415087
  - term: Membership Type
  - definition: Regular
  - term: Status
  - definition: Active
  - term: Phone
  - definition: "09171234567"
  - term: Email
  - definition: juan.delacruz@coop.com
  - term: Barangay
  - definition: Brgy 1
  - term: City/Municipality
  - definition: Manila
  - term: Province
  - definition: Metro Manila
  - term: Civil Status
  - definition: —
  - term: TIN Number
  - definition: —
  - term: Employer
  - definition: —
  - heading "Activity" [level=3]
  - term: Version
  - definition: v1
  - term: Created
  - definition: 7/13/2026
  - term: Updated
  - definition: 7/13/2026
  - heading "Actions" [level=3]
  - button "Share Capital":
    - img
    - text: Share Capital
  - button "Savings":
    - img
    - text: Savings
  - button "Apply for Loan":
    - img
    - text: Apply for Loan
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Member Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Standard login first
  6  |     await page.goto('/login')
  7  |     await page.getByLabel('Email').fill('admin@coop.com')
  8  |     await page.getByLabel('Password').fill('admin123')
  9  |     await page.getByRole('button', { name: 'Sign In' }).click()
  10 |     await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
  11 |     await page.waitForTimeout(1000)
  12 |   })
  13 | 
  14 |   test('should display members list and allow registering a new member', async ({ page }) => {
  15 |     // 1. Navigate to members page
  16 |     await page.getByRole('link', { name: 'Members', exact: true }).click()
  17 |     await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible()
  18 | 
  19 |     // 2. Click Add Member
  20 |     await page.getByRole('button', { name: 'Add Member' }).click()
  21 |     await expect(page).toHaveURL(/\/members\/new/)
  22 |     await expect(page.getByRole('heading', { name: 'Register New Member' })).toBeVisible()
  23 | 
  24 |     // 3. Fill the registration form
  25 |     const membershipNum = `MEM-${Date.now()}`
  26 |     await page.getByLabel('First Name *').fill('Juan')
  27 |     await page.getByLabel('Middle Name').fill('Santos')
  28 |     await page.getByLabel('Last Name *').fill('Dela Cruz')
  29 |     await page.getByLabel('Phone').fill('09171234567')
  30 |     await page.getByLabel('Email').fill('juan.delacruz@coop.com')
  31 |     await page.getByLabel('Barangay').fill('Brgy 1')
  32 |     await page.getByLabel('City/Municipality').fill('Manila')
  33 |     await page.getByLabel('Province').fill('Metro Manila')
  34 |     await page.getByLabel('Membership Number *').fill(membershipNum)
  35 |     await page.getByRole('button', { name: 'Register Member' }).click()
  36 | 
  37 |     // 4. Verify detail page is rendered
> 38 |     await expect(page.getByRole('heading', { name: 'Juan Santos Dela Cruz' })).toBeVisible()
     |                                                                                ^ Error: expect(locator).toBeVisible() failed
  39 |     await expect(page.locator(`text=${membershipNum}`)).toBeVisible()
  40 | 
  41 |     // 5. Navigate back to members list and verify search works
  42 |     await page.getByRole('button', { name: 'Back' }).click()
  43 |     await page.getByPlaceholder('Search by name, member ID, or phone...').fill(membershipNum)
  44 |     await page.waitForTimeout(500)
  45 |     await expect(page.locator('table')).toContainText(membershipNum)
  46 |     await expect(page.locator('table')).toContainText('Juan Santos Dela Cruz')
  47 |   })
  48 | })
  49 | 
```