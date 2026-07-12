/**
 * ─── Data Lookup — Human-Readable IDs ────────────────────────
 * Converts UUIDs/IDs to human-readable names for display.
 * Pre-builds lookup maps from loaded entity data.
 *
 * Usage:
 *   import { buildLookups } from './lookups'
 *   const { resolveBorrower } = await buildLookups()
 *   resolveBorrower('m1') → "Juan Dela Cruz"
 *   resolveAccount('1001') → "1001 - Cash on Hand"
 */

import { memberRepo, loanRepo, collectorRepo, chartOfAccountRepo, areaRepo } from './db'

export interface DataLookups {
  /** Resolve a member ID to full name */
  resolveMember: (id: string) => string
  /** Resolve a borrower/loan ID to member name */
  resolveBorrower: (id: string) => string
  /** Resolve a collector ID to full name */
  resolveCollector: (id: string) => string
  /** Resolve an account code to "CODE - Name" */
  resolveAccount: (code: string) => string
  /** Resolve an area ID to area name */
  resolveArea: (id: string) => string
  /** Resolve a loan ID to loan number */
  resolveLoan: (id: string) => string
  /** Map of all lookups */
  members: Map<string, string>
  collectors: Map<string, string>
  accounts: Map<string, string>
  areas: Map<string, string>
  loans: Map<string, string>
}

let _cache: DataLookups | null = null

export async function buildLookups(): Promise<DataLookups> {
  if (_cache) return _cache

  const members = new Map<string, string>()
  const collectors = new Map<string, string>()
  const accounts = new Map<string, string>()
  const areas = new Map<string, string>()
  const loans = new Map<string, string>()

  try {
    // Members → ID to fullName
    const memberResult = await memberRepo.findMany({ page: 1, pageSize: 5000 })
    if ('items' in memberResult) {
      for (const m of memberResult.items as any[]) {
        const name = m.fullName ?? m.name ?? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()
        members.set(m.id, name || m.id)
        if (m.membershipNumber) members.set(m.membershipNumber, name || m.id)
      }
    }

    // Collectors → ID to fullName
    const collectorResult = await collectorRepo.findMany({ page: 1, pageSize: 500 })
    if ('items' in collectorResult) {
      for (const c of collectorResult.items as any[]) {
        collectors.set(c.id, c.fullName ?? c.id)
      }
    }

    // Chart of Accounts → code to "CODE - Name"
    const accountResult = await chartOfAccountRepo.findMany({ page: 1, pageSize: 200 })
    if ('items' in accountResult) {
      for (const a of accountResult.items as any[]) {
        accounts.set(a.code, `${a.code} - ${a.name}`)
        accounts.set(a.id, `${a.code ?? a.id} - ${a.name}`)
      }
    }

    // Areas → ID to name
    const areaResult = await areaRepo.findMany({ page: 1, pageSize: 100 })
    if ('items' in areaResult) {
      for (const a of areaResult.items as any[]) {
        areas.set(a.id, a.name ?? a.id)
      }
    }

    // Loans → ID to loanNumber
    const loanResult = await loanRepo.findMany({ page: 1, pageSize: 5000 })
    if ('items' in loanResult) {
      for (const l of loanResult.items as any[]) {
        loans.set(l.id, l.loanNumber ?? l.id)
        if (l.loanNumber) loans.set(l.loanNumber, l.loanNumber)
      }
    }
  } catch {
    // Silently fall back to ID display if lookup fails
  }

  const resolveMember = (id: string) => members.get(id) ?? id
  const resolveBorrower = (id: string) => members.get(id) ?? id
  const resolveCollector = (id: string) => collectors.get(id) ?? id
  const resolveAccount = (code: string) => accounts.get(code) ?? code
  const resolveArea = (id: string) => areas.get(id) ?? id
  const resolveLoan = (id: string) => loans.get(id) ?? id

  _cache = { resolveMember, resolveBorrower, resolveCollector, resolveAccount, resolveArea, resolveLoan, members, collectors, accounts, areas, loans }
  return _cache
}

/** Invalidate cache (call after data changes) */
export function invalidateLookups(): void {
  _cache = null
}
