import { test, expect } from '@playwright/test'

test.describe('Savings Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
    await page.waitForTimeout(1000)
  })

  test('should allow recording deposit and withdrawal transactions and show updated balance', async ({ page }) => {
    // 1. Navigate to savings page
    await page.getByRole('link', { name: 'Savings', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Savings Passbook' })).toBeVisible()

    // 2. Click New Transaction button
    await page.getByRole('button', { name: 'New Transaction' }).click()
    await expect(page.getByRole('heading', { name: 'Record Savings Transaction' })).toBeVisible()

    // 3. Fill deposit details
    await page.getByLabel('Member ID').fill('MEM-SAVINGS-1')
    await page.getByLabel('Account ID').fill('ACC-SAVINGS-1')
    await page.getByLabel('Amount (₱)').fill('5000')
    await page.getByRole('button', { name: 'Save' }).click()

    // 4. Verify deposit transaction and balance update
    await expect(page.locator('text=Total Savings Balance')).toBeVisible()
    await expect(page.locator('text=₱5,000').first()).toBeVisible()
    await expect(page.locator('table')).toContainText('Deposit')
    await expect(page.locator('table')).toContainText('MEM-SAVINGS-1')

    // 5. Record withdrawal transaction
    await page.getByRole('button', { name: 'New Transaction' }).click()
    await page.getByLabel('Member ID').fill('MEM-SAVINGS-1')
    await page.getByLabel('Account ID').fill('ACC-SAVINGS-1')
    await page.locator('select').selectOption('withdrawal')
    await page.getByLabel('Amount (₱)').fill('2000')
    await page.getByRole('button', { name: 'Save' }).click()

    // 6. Verify withdrawal transaction and updated balance
    await expect(page.locator('text=₱3,000').first()).toBeVisible() // 5000 - 2000 = 3000 balance
    await expect(page.locator('table')).toContainText('Withdrawal')
  })
})
