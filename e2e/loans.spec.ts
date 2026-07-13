import { test, expect } from '@playwright/test'

test.describe('Loan Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
    await page.waitForTimeout(1000)
  })

  test('should allow applying for a loan, computing amortization, disbursing, and recording payments', async ({ page }) => {
    // 1. Navigate to loans page
    await page.getByRole('link', { name: 'Loans', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Loans' })).toBeVisible()

    // 2. Click Add Loan button
    await page.getByRole('button', { name: 'New Loan' }).click()
    await expect(page.getByRole('heading', { name: 'Disburse New Loan' })).toBeVisible()

    // Wait for async loan products to load on the page
    await expect(page.getByText('Quick Select Product')).toBeVisible()

    // 3. Fill the loan disburse form
    const loanNum = `LN-${Date.now()}`
    await page.getByLabel('Borrower/Member ID *').fill('MEM-123456')
    await page.getByLabel('Loan Number *').fill(loanNum)
    await page.getByLabel('Principal Amount (₱) *').fill('10000')
    await page.getByLabel('Interest Rate (%) *').fill('12')
    await page.getByLabel('Term *').fill('12')

    // 4. Compute amortization and verify Summary is shown
    await page.getByRole('button', { name: 'Compute Amortization' }).click()
    await expect(page.getByText('Amortization Summary')).toBeVisible()

    // 5. Submit form to disburse
    await page.getByRole('button', { name: 'Disburse Loan' }).click()

    // 6. Verify redirected to details page with "Disbursed" status
    await expect(page.getByRole('heading', { name: `Loan ${loanNum}` })).toBeVisible()
    await expect(page.locator('text=Disbursed')).toBeVisible()
    await expect(page.locator('text=₱10,000')).toBeVisible()

    // 7. Record a payment
    await page.getByRole('button', { name: 'Record Payment' }).click()
    await expect(page.getByRole('heading', { name: 'Record Payment' })).toBeVisible()

    // Default suggested amount should be present, let's change it to 1000
    await page.getByLabel('Amount (₱)').fill('1000')
    await page.getByRole('button', { name: 'Save Payment' }).click()

    // 8. Verify payment appears in Payment History and Balance is reduced
    await expect(page.locator('table')).toContainText('₱1,000')
    await expect(page.locator('text=Total Paid')).toBeVisible()
    await expect(page.locator('text=₱9,000').first()).toBeVisible() // 10000 principal - 1000 paid = 9000 balance
  })
})
