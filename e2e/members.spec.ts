import { test, expect } from '@playwright/test'

test.describe('Member Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Standard login first
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@coop.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Cooperative Dashboard' })).toBeVisible()
    await page.waitForTimeout(1000)
  })

  test('should display members list and allow registering a new member', async ({ page }) => {
    // 1. Navigate to members page
    await page.getByRole('link', { name: 'Members', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible()

    // 2. Click Add Member
    await page.getByRole('button', { name: 'Add Member' }).click()
    await expect(page).toHaveURL(/\/members\/new/)
    await expect(page.getByRole('heading', { name: 'Register New Member' })).toBeVisible()

    // 3. Fill the registration form
    const membershipNum = `MEM-${Date.now()}`
    await page.getByLabel('First Name *').fill('Juan')
    await page.getByLabel('Middle Name').fill('Santos')
    await page.getByLabel('Last Name *').fill('Dela Cruz')
    await page.getByLabel('Phone').fill('09171234567')
    await page.getByLabel('Email').fill('juan.delacruz@coop.com')
    await page.getByLabel('Barangay').fill('Brgy 1')
    await page.getByLabel('City/Municipality').fill('Manila')
    await page.getByLabel('Province').fill('Metro Manila')
    await page.getByLabel('Membership Number *').fill(membershipNum)
    await page.getByRole('button', { name: 'Register Member' }).click()

    // 4. Verify detail page is rendered
    await expect(page.getByRole('heading', { name: 'Juan Santos Dela Cruz' })).toBeVisible()
    await expect(page.locator(`text=${membershipNum}`)).toBeVisible()

    // 5. Navigate back to members list and verify search works
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByPlaceholder('Search by name, member ID, or phone...').fill(membershipNum)
    await page.waitForTimeout(500)
    await expect(page.locator('table')).toContainText(membershipNum)
    await expect(page.locator('table')).toContainText('Juan Santos Dela Cruz')
  })
})
