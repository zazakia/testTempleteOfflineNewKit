import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start on login page in a logged out state
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should display login page and allow login with demo credentials', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()

    // Fill login form
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Verify redirection to Dashboard
    await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
  })

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should allow user to logout', async ({ page }) => {
    // Login
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.locator('text=Dashboard').first()).toBeVisible()

    // Click logout
    await page.getByRole('button', { name: 'Sign Out' }).click()

    // Verify redirected back to login page
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })
})
