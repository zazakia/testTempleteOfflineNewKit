import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await context.newPage()

  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text())
  })

  // Set auth before navigating
  await page.addInitScript(() => {
    localStorage.setItem('cooperp_user', JSON.stringify({
      id: 'u1', email: 'admin@coop.com', fullName: 'Admin User',
      role: 'admin', tenantId: 'default',
    }))
  })

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)

  // Dump full page text
  const bodyText = await page.textContent('body')
  console.log('=== Page Body Text (first 3000 chars) ===')
  console.log(bodyText?.substring(0, 3000))

  // Try to find sidebar
  const sidebarHTML = await page.evaluate(() => {
    const aside = document.querySelector('aside')
    if (!aside) return 'NO ASIDE FOUND'
    return aside.innerHTML.substring(0, 3000)
  })
  console.log('\n=== Sidebar HTML ===')
  console.log(sidebarHTML)

  await page.screenshot({ path: 'menu-screenshot.png', fullPage: false })
  console.log('\nScreenshot saved to menu-screenshot.png')

  await browser.close()
})()
