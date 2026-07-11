/**
 * ─── Root App Component ──────────────────────────────────────
 */

import { useEffect } from 'react'
import { Providers } from './providers'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { initializeSeedData } from './lib/seed-init'
import { seedFullDatabase } from './lib/seed-data-full'

export function App() {
  useEffect(() => {
    // Seed chart of accounts first (lightweight)
    initializeSeedData().then(() => {
      // Then seed full demo data
      seedFullDatabase()
    })
  }, [])

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
