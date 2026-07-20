import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  // Never open browser windows during tests
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    // Disable GPU, sandbox, and extensions for CI/reliability
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-extensions'],
    },
  },
  // Only run chromium, headless
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', headless: true } },
  ],
  // Don't open report after tests
  reporter: [['list'], ['html', { open: 'never' }]],
})
