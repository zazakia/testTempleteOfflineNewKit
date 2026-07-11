/**
 * ─── Seed Initialization ─────────────────────────────────────
 * Seeds default data on first launch (tracked via localStorage).
 */

import { chartOfAccountRepo } from './db'
import { DEFAULT_CHART_OF_ACCOUNTS } from './seed-data'

const SEED_KEY = 'cooperp_seeded_v1'

export async function initializeSeedData(): Promise<void> {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEED_KEY)) return

  try {
    console.log('[Seed] Initializing default data...')

    // Seed Chart of Accounts
    const existing = await chartOfAccountRepo.count({})
    if (existing === 0) {
      for (const account of DEFAULT_CHART_OF_ACCOUNTS) {
        await chartOfAccountRepo.create({
          ...account,
          tenantId: 'default',
          createdBy: 'system',
          updatedBy: 'system',
        } as any)
      }
      console.log(`[Seed] Created ${DEFAULT_CHART_OF_ACCOUNTS.length} chart of accounts`)
    }

    localStorage.setItem(SEED_KEY, 'true')
    console.log('[Seed] Initialization complete')
  } catch (error) {
    console.error('[Seed] Error:', error)
  }
}
