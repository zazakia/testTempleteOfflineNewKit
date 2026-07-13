import { test, expect } from '@playwright/test'

test.describe('Customer CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
    await page.waitForTimeout(1000)
  })

  test('should display dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Customers', exact: true })).toBeVisible()
  })

  test('should navigate to customers list', async ({ page }) => {
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await expect(page).toHaveURL(/\/customers/)
  })

  test('should create a new customer', async ({ page }) => {
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.click('text=Add Customer')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="company"]', 'Test Corp')
    await page.click('text=Save Customer')

    // Should navigate to the detail page
    await expect(page.locator('text=Test User')).toBeVisible()
  })

  test('should create and then edit a customer', async ({ page }) => {
    // Create
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.click('text=Add Customer')
    await page.fill('input[name="name"]', 'Edit Test')
    await page.fill('input[name="email"]', 'edit@test.com')
    await page.click('text=Save Customer')

    // Edit
    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    await page.fill('input[name="name"]', '')
    await page.fill('input[name="name"]', 'Edited Name')
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.locator('text=Edited Name')).toBeVisible()
  })

  test('should search for customers', async ({ page }) => {
    // Create two customers
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.click('text=Add Customer')
    await page.fill('input[name="name"]', 'Search Customer A')
    await page.fill('input[name="email"]', 'searcha@test.com')
    await page.click('text=Save Customer')

    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.click('text=Add Customer')
    await page.fill('input[name="name"]', 'Search Customer B')
    await page.fill('input[name="email"]', 'searchb@test.com')
    await page.click('text=Save Customer')

    // Search
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.getByPlaceholder('Search by name, email, or company...').fill('Search Customer A')
    await page.waitForTimeout(500)
    await expect(page.locator('table')).toContainText('Search Customer A')
    await expect(page.locator('table')).not.toContainText('Search Customer B')
  })

  test('should delete a customer', async ({ page }) => {
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.click('text=Add Customer')
    await page.fill('input[name="name"]', 'Delete Me')
    await page.fill('input[name="email"]', 'delete@test.com')
    await page.click('text=Save Customer')

    // Delete
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete')
      await dialog.accept()
    })
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    // Verify redirected back to customers page and customer is deleted
    await expect(page).toHaveURL(/\/customers/)
    await expect(page.locator('table')).not.toContainText('Delete Me')
  })

  test('should show validation errors on invalid form submission', async ({ page }) => {
    await page.getByRole('link', { name: 'Customers', exact: true }).click()
    await page.click('text=Add Customer')
    // Submit empty form
    await page.click('text=Save Customer')

    // Verify Zod validation messages
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Invalid email address')).toBeVisible()
  })
})
