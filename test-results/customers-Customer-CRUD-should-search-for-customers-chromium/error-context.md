# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customers.spec.ts >> Customer CRUD >> should search for customers
- Location: e2e\customers.spec.ts:55:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('Search by name, email, or company...')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation "Main navigation" [ref=e4]:
    - link "CE CoopERP" [ref=e6] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: CE
      - generic [ref=e9]: CoopERP
    - navigation [ref=e10]:
      - generic [ref=e11]:
        - paragraph [ref=e12]: Overview
        - list [ref=e13]:
          - listitem [ref=e14]:
            - link "Dashboard" [ref=e15] [cursor=pointer]:
              - /url: /
              - img [ref=e16]
              - generic [ref=e21]: Dashboard
      - generic [ref=e22]:
        - paragraph [ref=e23]: Administration
        - list [ref=e24]:
          - listitem [ref=e25]:
            - link "Board Resolutions" [ref=e26] [cursor=pointer]:
              - /url: /governance
              - img [ref=e27]
              - generic [ref=e30]: Board Resolutions
          - listitem [ref=e31]:
            - link "Settings" [ref=e32] [cursor=pointer]:
              - /url: /settings
              - img [ref=e33]
              - generic [ref=e36]: Settings
          - listitem [ref=e37]:
            - link "Advanced" [ref=e38] [cursor=pointer]:
              - /url: /settings/advanced
              - img [ref=e39]
              - generic [ref=e42]: Advanced
          - listitem [ref=e43]:
            - link "Computations" [ref=e44] [cursor=pointer]:
              - /url: /settings/coop-computations
              - img [ref=e45]
              - generic [ref=e48]: Computations
          - listitem [ref=e49]:
            - link "Pending Approvals" [ref=e50] [cursor=pointer]:
              - /url: /pending-approvals
              - img [ref=e51]
              - generic [ref=e54]: Pending Approvals
          - listitem [ref=e55]:
            - link "Sync Center" [ref=e56] [cursor=pointer]:
              - /url: /sync-center
              - img [ref=e57]
              - generic [ref=e62]: Sync Center
      - generic [ref=e63]:
        - paragraph [ref=e64]: Clinic
        - list [ref=e65]:
          - listitem [ref=e66]:
            - link "Patients" [ref=e67] [cursor=pointer]:
              - /url: /clinic/patients
              - img [ref=e68]
              - generic [ref=e73]: Patients
          - listitem [ref=e74]:
            - link "Doctors" [ref=e75] [cursor=pointer]:
              - /url: /clinic/doctors
              - img [ref=e76]
              - generic [ref=e80]: Doctors
          - listitem [ref=e81]:
            - link "Appointments" [ref=e82] [cursor=pointer]:
              - /url: /clinic/appointments
              - img [ref=e83]
              - generic [ref=e86]: Appointments
          - listitem [ref=e87]:
            - link "Consultation Records" [ref=e88] [cursor=pointer]:
              - /url: /clinic/records
              - img [ref=e89]
              - generic [ref=e92]: Consultation Records
          - listitem [ref=e93]:
            - link "Billing Records" [ref=e94] [cursor=pointer]:
              - /url: /clinic/billing
              - img [ref=e95]
              - generic [ref=e98]: Billing Records
      - generic [ref=e99]:
        - paragraph [ref=e100]: CRM
        - list [ref=e101]:
          - listitem [ref=e102]:
            - link "Customers" [active] [ref=e103] [cursor=pointer]:
              - /url: /customers
              - img [ref=e104]
              - generic [ref=e109]: Customers
      - generic [ref=e110]:
        - paragraph [ref=e111]: Finance
        - list [ref=e112]:
          - listitem [ref=e113]:
            - link "Journal Entries" [ref=e114] [cursor=pointer]:
              - /url: /accounting/journal-entries
              - img [ref=e115]
              - generic [ref=e118]: Journal Entries
          - listitem [ref=e119]:
            - link "Chart of Accounts" [ref=e120] [cursor=pointer]:
              - /url: /accounting/chart-of-accounts
              - img [ref=e121]
              - generic [ref=e124]: Chart of Accounts
      - generic [ref=e125]:
        - paragraph [ref=e126]: Lending
        - list [ref=e127]:
          - listitem [ref=e128]:
            - link "Loans" [ref=e129] [cursor=pointer]:
              - /url: /loans
              - img [ref=e130]
              - generic [ref=e133]: Loans
          - listitem [ref=e134]:
            - link "Loan Applications" [ref=e135] [cursor=pointer]:
              - /url: /loan-applications
              - img [ref=e136]
              - generic [ref=e139]: Loan Applications
          - listitem [ref=e140]:
            - link "Payments" [ref=e141] [cursor=pointer]:
              - /url: /payments
              - img [ref=e142]
              - generic [ref=e145]: Payments
      - generic [ref=e146]:
        - paragraph [ref=e147]: Membership
        - list [ref=e148]:
          - listitem [ref=e149]:
            - link "Members" [ref=e150] [cursor=pointer]:
              - /url: /members
              - img [ref=e151]
              - generic [ref=e156]: Members
          - listitem [ref=e157]:
            - link "Share Capital" [ref=e158] [cursor=pointer]:
              - /url: /share-capital
              - img [ref=e159]
              - generic [ref=e162]: Share Capital
          - listitem [ref=e163]:
            - link "Savings" [ref=e164] [cursor=pointer]:
              - /url: /savings
              - img [ref=e165]
              - generic [ref=e168]: Savings
      - generic [ref=e169]:
        - paragraph [ref=e170]: Operations
        - list [ref=e171]:
          - listitem [ref=e172]:
            - link "Collectors" [ref=e173] [cursor=pointer]:
              - /url: /collectors
              - img [ref=e174]
              - generic [ref=e178]: Collectors
          - listitem [ref=e179]:
            - link "Remittances" [ref=e180] [cursor=pointer]:
              - /url: /remittances
              - img [ref=e181]
              - generic [ref=e184]: Remittances
      - generic [ref=e185]:
        - paragraph [ref=e186]: Analytics
        - list [ref=e187]:
          - listitem [ref=e188]:
            - link "Reports" [ref=e189] [cursor=pointer]:
              - /url: /reports
              - img [ref=e190]
              - generic [ref=e192]: Reports
          - listitem [ref=e193]:
            - link "Trial Balance" [ref=e194] [cursor=pointer]:
              - /url: /accounting/trial-balance
              - img [ref=e195]
              - generic [ref=e198]: Trial Balance
    - generic [ref=e200]:
      - img [ref=e201]
      - generic [ref=e205]: All changes synced
  - main "Page content" [ref=e206]:
    - generic [ref=e208]:
      - generic [ref=e209]: Admin User
      - button "Sign Out" [ref=e210] [cursor=pointer]:
        - img [ref=e212]
        - text: Sign Out
    - generic [ref=e215]: "[FF] env=development tenant=default"
    - generic [ref=e218]:
      - generic [ref=e219]:
        - generic [ref=e220]:
          - heading "Customers" [level=3] [ref=e221]
          - paragraph [ref=e222]: 2 customers total
        - link "Add Customer" [ref=e224] [cursor=pointer]:
          - /url: /customers/new
          - button "Add Customer" [ref=e225]:
            - img [ref=e227]
            - text: Add Customer
      - generic [ref=e228]:
        - generic [ref=e229]:
          - img [ref=e230]
          - textbox "Search customers..." [ref=e234]
        - combobox [ref=e235]:
          - option "All Statuses" [selected]
          - option "Active"
          - option "Inactive"
          - option "Lead"
          - option "Churned"
      - table [ref=e237]:
        - rowgroup [ref=e238]:
          - row "Name Email Company Status Actions" [ref=e239]:
            - columnheader "Name" [ref=e240]
            - columnheader "Email" [ref=e241]
            - columnheader "Company" [ref=e242]
            - columnheader "Status" [ref=e243]
            - columnheader "Actions" [ref=e244]
        - rowgroup [ref=e245]:
          - row "Search Customer B searchb@test.com — Active Edit" [ref=e246] [cursor=pointer]:
            - cell "Search Customer B" [ref=e247]
            - cell "searchb@test.com" [ref=e248]
            - cell "—" [ref=e249]
            - cell "Active" [ref=e250]:
              - generic [ref=e251]: Active
            - cell "Edit" [ref=e252]:
              - link "Edit" [ref=e253]:
                - /url: /customers/af3103d2-0f8a-4616-a35b-0c8d119afbc2
          - row "Search Customer A searcha@test.com — Active Edit" [ref=e254] [cursor=pointer]:
            - cell "Search Customer A" [ref=e255]
            - cell "searcha@test.com" [ref=e256]
            - cell "—" [ref=e257]
            - cell "Active" [ref=e258]:
              - generic [ref=e259]: Active
            - cell "Edit" [ref=e260]:
              - link "Edit" [ref=e261]:
                - /url: /customers/3cbd47b7-a235-4d82-ad5c-89977dbe7fc2
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
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
> 71  |     await page.getByPlaceholder('Search by name, email, or company...').fill('Search Customer A')
      |                                                                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  103 |     await expect(page.locator('text=Name is required')).toBeVisible()
  104 |     await expect(page.locator('text=Invalid email address')).toBeVisible()
  105 |   })
  106 | })
  107 | 
```