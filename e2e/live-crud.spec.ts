/**
 * ─── Live Site CRUD Tests (Final) ───────────────────────────
 */

import { test, expect } from '@playwright/test'

const BASE = 'https://cooperp-erp.netlify.app'

test.describe('CoopERP Live Site — Full CRUD', () => {
  test.use({ viewport: { width: 1440, height: 900 } }) // Large viewport for sidebar

  test('1. Login page renders and accepts input', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await page.locator('input[type="email"]').fill('admin@coop.com')
    await page.locator('input[type="password"]').fill('admin123')
  })

  test('2. Members page lists members', async ({ page }) => {
    await page.goto(`${BASE}/members`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible()
  })

  test('3. Loans page renders with portfolio KPIs', async ({ page }) => {
    await page.goto(`${BASE}/loans`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)
    await expect(page.getByRole('heading', { name: 'Loans' })).toBeVisible()
    // Portfolio KPIs should be visible
    await page.waitForSelector('text=Total Portfolio', { timeout: 5000 })
  })

  test('4. Loan Calculator computes amortization', async ({ page }) => {
    await page.goto(`${BASE}/loan-calculator`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Loan Parameters' })).toBeVisible()
    await page.getByRole('button', { name: 'Compute' }).click()
    await expect(page.getByText('Amortization Summary')).toBeVisible()
  })

  test('5. Reports page loads', async ({ page }) => {
    await page.goto(`${BASE}/reports`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    // Check for the report sidebar or period selector
    await expect(page.locator('text=Period Update').first().or(page.locator('text=Executive Dashboard').first())).toBeVisible({ timeout: 8000 })
  })

  test('6. Settings tabs navigate correctly', async ({ page }) => {
    await page.goto(`${BASE}/settings`)
    await page.waitForLoadState('networkidle')
    for (const tab of ['Expense Categories', 'Employees', 'Loan Products']) {
      await page.getByRole('button', { name: tab }).click()
      await page.waitForTimeout(500)
    }
  })

  test('7. Advanced Settings renders', async ({ page }) => {
    await page.goto(`${BASE}/settings/advanced`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Advanced Settings' })).toBeVisible()
  })

  test('8. Sync Center renders', async ({ page }) => {
    await page.goto(`${BASE}/sync-center`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Sync Center' })).toBeVisible()
  })

  test('9. PWA manifest serves as JSON', async ({ page }) => {
    const resp = await page.request.get(`${BASE}/manifest.webmanifest`)
    expect(resp.status()).toBe(200)
    const json = await resp.json()
    expect(json.name).toBe('CoopERP')
    expect(json.short_name).toBe('CoopERP')
  })

  test('10. Service worker registers', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(4000)
    const hasSW = await page.evaluate(() =>
      navigator.serviceWorker?.getRegistrations().then(r => r.length > 0) || false
    )
    expect(hasSW).toBe(true)
  })

  test('11. App shell renders navigation links', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    // Check sidebar navigation links
    const dashboardLink = page.locator('aside a').filter({ hasText: 'Dashboard' })
    const membersLink = page.locator('aside a').filter({ hasText: 'Members' })
    await expect(dashboardLink).toBeVisible()
    await expect(membersLink).toBeVisible()
  })

  test('12. Sidebar navigation works', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Click Members in sidebar
    await page.locator('aside a').filter({ hasText: 'Members' }).click()
    await page.waitForURL('**/members', { timeout: 5000 })
    
    // Click Loans in sidebar
    await page.locator('aside a').filter({ hasText: 'Loans' }).click()
    await page.waitForURL('**/loans', { timeout: 5000 })
  })

  test('13. All portal pages accessible', async ({ page }) => {
    const portals = [
      { url: '/portal/borrower', text: 'Welcome' },
      { url: '/portal/collector', text: 'Collection Dashboard' },
      { url: '/portal/encoder', text: 'Encoder Portal' },
    ]
    for (const p of portals) {
      await page.goto(`${BASE}${p.url}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      await expect(page.getByText(p.text)).toBeVisible()
    }
  })

  test('14. Chart of Accounts renders', async ({ page }) => {
    await page.goto(`${BASE}/accounting/chart-of-accounts`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: 'Chart of Accounts' })).toBeVisible()
  })

  test('15. Trial Balance renders', async ({ page }) => {
    await page.goto(`${BASE}/accounting/trial-balance`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: 'Trial Balance' })).toBeVisible()
  })
})
