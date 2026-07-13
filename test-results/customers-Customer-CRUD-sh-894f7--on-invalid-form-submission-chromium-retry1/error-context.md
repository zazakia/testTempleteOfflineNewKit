# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customers.spec.ts >> Customer CRUD >> should show validation errors on invalid form submission
- Location: e2e\customers.spec.ts:96:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Name is required')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Name is required')

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
  - button "Back to Customers":
    - img
    - text: Back to Customers
  - heading "Add Customer" [level=3]
  - paragraph: Create a new customer record
  - text: Full Name*
  - textbox "Full Name*":
    - /placeholder: John Doe
  - text: Email*
  - textbox "Email*":
    - /placeholder: john@company.com
  - text: Phone
  - textbox "Phone":
    - /placeholder: +1 555-0123
  - text: Company
  - textbox "Company":
    - /placeholder: Acme Inc.
  - text: Website
  - textbox "Website":
    - /placeholder: https://acme.com
  - text: Status
  - combobox:
    - option "Active" [selected]
    - option "Inactive"
    - option "Lead"
    - option "Churned"
  - text: Tags
  - textbox "Tags":
    - /placeholder: vip, enterprise, support (comma-separated)
  - paragraph: Separate tags with commas
  - text: Notes
  - textbox "Any additional notes..."
  - button "Cancel"
  - button "Save Customer":
    - img
    - text: Save Customer
```

# Test source

```ts
  3   | test.describe('Customer CRUD', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/login')
  6   |     await page.evaluate(() => localStorage.clear())
  7   |     await page.reload()
  8   |     await page.getByLabel('Email').fill('admin@coop.com')
  9   |     await page.getByLabel('Password').fill('admin123')
  10  |     await page.getByRole('button', { name: 'Sign In' }).click()
  11  |     await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
  12  |     await page.waitForTimeout(1000)
  13  |   })
  14  | 
  15  |   test('should display dashboard', async ({ page }) => {
  16  |     await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
  17  |     await expect(page.getByRole('link', { name: 'Customers', exact: true })).toBeVisible()
  18  |   })
  19  | 
  20  |   test('should navigate to customers list', async ({ page }) => {
  21  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  22  |     await expect(page).toHaveURL(/\/customers/)
  23  |   })
  24  | 
  25  |   test('should create a new customer', async ({ page }) => {
  26  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  27  |     await page.click('text=Add Customer')
  28  | 
  29  |     await page.fill('input[name="name"]', 'Test User')
  30  |     await page.fill('input[name="email"]', 'test@example.com')
  31  |     await page.fill('input[name="company"]', 'Test Corp')
  32  |     await page.click('text=Save Customer')
  33  | 
  34  |     // Should navigate to the detail page
  35  |     await expect(page.locator('text=Test User')).toBeVisible()
  36  |   })
  37  | 
  38  |   test('should create and then edit a customer', async ({ page }) => {
  39  |     // Create
  40  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  41  |     await page.click('text=Add Customer')
  42  |     await page.fill('input[name="name"]', 'Edit Test')
  43  |     await page.fill('input[name="email"]', 'edit@test.com')
  44  |     await page.click('text=Save Customer')
  45  | 
  46  |     // Edit
  47  |     await page.getByRole('button', { name: 'Edit', exact: true }).click()
  48  |     await page.fill('input[name="name"]', '')
  49  |     await page.fill('input[name="name"]', 'Edited Name')
  50  |     await page.getByRole('button', { name: 'Save', exact: true }).click()
  51  | 
  52  |     await expect(page.locator('text=Edited Name')).toBeVisible()
  53  |   })
  54  | 
  55  |   test('should search for customers', async ({ page }) => {
  56  |     // Create two customers
  57  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  58  |     await page.click('text=Add Customer')
  59  |     await page.fill('input[name="name"]', 'Search Customer A')
  60  |     await page.fill('input[name="email"]', 'searcha@test.com')
  61  |     await page.click('text=Save Customer')
  62  | 
  63  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  64  |     await page.click('text=Add Customer')
  65  |     await page.fill('input[name="name"]', 'Search Customer B')
  66  |     await page.fill('input[name="email"]', 'searchb@test.com')
  67  |     await page.click('text=Save Customer')
  68  | 
  69  |     // Search
  70  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  71  |     await page.getByPlaceholder('Search by name, email, or company...').fill('Search Customer A')
  72  |     await page.waitForTimeout(500)
  73  |     await expect(page.locator('table')).toContainText('Search Customer A')
  74  |     await expect(page.locator('table')).not.toContainText('Search Customer B')
  75  |   })
  76  | 
  77  |   test('should delete a customer', async ({ page }) => {
  78  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  79  |     await page.click('text=Add Customer')
  80  |     await page.fill('input[name="name"]', 'Delete Me')
  81  |     await page.fill('input[name="email"]', 'delete@test.com')
  82  |     await page.click('text=Save Customer')
  83  | 
  84  |     // Delete
  85  |     page.on('dialog', async dialog => {
  86  |       expect(dialog.message()).toContain('Are you sure you want to delete')
  87  |       await dialog.accept()
  88  |     })
  89  |     await page.getByRole('button', { name: 'Delete', exact: true }).click()
  90  | 
  91  |     // Verify redirected back to customers page and customer is deleted
  92  |     await expect(page).toHaveURL(/\/customers/)
  93  |     await expect(page.locator('table')).not.toContainText('Delete Me')
  94  |   })
  95  | 
  96  |   test('should show validation errors on invalid form submission', async ({ page }) => {
  97  |     await page.getByRole('link', { name: 'Customers', exact: true }).click()
  98  |     await page.click('text=Add Customer')
  99  |     // Submit empty form
  100 |     await page.click('text=Save Customer')
  101 | 
  102 |     // Verify Zod validation messages
> 103 |     await expect(page.locator('text=Name is required')).toBeVisible()
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  104 |     await expect(page.locator('text=Invalid email address')).toBeVisible()
  105 |   })
  106 | })
  107 | 
```