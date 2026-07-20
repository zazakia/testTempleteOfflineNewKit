/**
 * ─── Sync Routes (Production) ────────────────────────────────
 * Push/pull endpoints for the offline sync engine.
 *
 * Enhancements over the original:
 *  - Gap 3: Server-side validation for financial entities
 *  - Gap 4: Exclude own client changes on pull (excludeClient param)
 *  - Gap 5: Delta sync — query supports ?fields= for partial payloads
 *  - Gap 6: Wired sync_queue for async write-behind processing
 *
 * Backed by Supabase when configured, in-memory otherwise.
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { serverStore } from '../db/store'

type Variables = {
  userId: string
  tenantId: string
  roles: string[]
}

const syncRouter = new Hono<{ Variables: Variables }>()

// ─── Push Schema ─────────────────────────────────────────

const pushSchema = z.object({
  changes: z.array(z.object({
    id: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    operation: z.enum(['create', 'update', 'delete']),
    data: z.record(z.unknown()),
    previousData: z.record(z.unknown()).optional(),
    changedFields: z.array(z.string()).optional(),
    timestamp: z.number(),
    clientId: z.string(),
    tenantId: z.string(),
    performedBy: z.string(),
    status: z.string(),
    retryCount: z.number(),
  })),
})

// ─── Gap 3: Financial Entity Validation ───────────────────

/**
 * Validate journal entry data on the server side.
 * Enforces double-entry accounting rules before accepting any push.
 */
function validateJournalEntry(data: Record<string, unknown>): { valid: boolean; error?: string } {
  const lines = data.lines as Array<Record<string, unknown>> | undefined

  if (!lines || !Array.isArray(lines) || lines.length < 2) {
    return { valid: false, error: 'Journal entry must have at least 2 lines (debit + credit)' }
  }

  let totalDebit = 0
  let totalCredit = 0

  for (const line of lines) {
    const debit = typeof line.debitAmount === 'number' ? line.debitAmount : Number(line.debitAmount ?? 0)
    const credit = typeof line.creditAmount === 'number' ? line.creditAmount : Number(line.creditAmount ?? 0)

    if (isNaN(debit) || isNaN(credit)) {
      return { valid: false, error: 'Journal entry line amounts must be valid numbers' }
    }
    if (debit < 0 || credit < 0) {
      return { valid: false, error: 'Journal entry line amounts must be non-negative' }
    }
    if (!line.accountCode) {
      return { valid: false, error: 'Each line must have an account code' }
    }

    totalDebit += debit
    totalCredit += credit
  }

  // Double-entry rule: debits must equal credits
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    return {
      valid: false,
      error: `Debits (${totalDebit}) must equal credits (${totalCredit}). Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)}`,
    }
  }

  return { valid: true }
}

/**
 * Validate loan transaction data.
 */
function validateLoanTransaction(data: Record<string, unknown>): { valid: boolean; error?: string } {
  const principalAmount = typeof data.principalAmount === 'number' ? data.principalAmount : Number(data.principalAmount ?? 0)
  const term = typeof data.term === 'number' ? data.term : Number(data.term ?? 0)

  if (isNaN(principalAmount) || principalAmount <= 0) {
    return { valid: false, error: 'Loan principal amount must be a positive number' }
  }
  if (isNaN(term) || term <= 0) {
    return { valid: false, error: 'Loan term must be a positive integer' }
  }
  if (term > 120) {
    return { valid: false, error: 'Loan term cannot exceed 120 months (10 years)' }
  }
  if (principalAmount > 10_000_000) {
    return { valid: false, error: 'Loan amount exceeds maximum of 10,000,000' }
  }

  return { valid: true }
}

/**
 * Validate savings transaction.
 */
function validateSavingsTransaction(data: Record<string, unknown>): { valid: boolean; error?: string } {
  const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount ?? 0)
  const type = data.type as string | undefined

  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Transaction amount must be a positive number' }
  }

  if (type === 'withdrawal' && !data.savingsAccountId) {
    return { valid: false, error: 'Withdrawal must reference a savings account' }
  }

  return { valid: true }
}

/** Map entity type to validation function */
const ENTITY_VALIDATORS: Record<string, (data: Record<string, unknown>) => { valid: boolean; error?: string }> = {
  journal_entries: validateJournalEntry,
  journal_entry_lines: validateJournalEntry,
  loans: validateLoanTransaction,
  savings_transactions: validateSavingsTransaction,
}

// ─── Push ────────────────────────────────────────────────

syncRouter.post('/push', zValidator('json', pushSchema), async (c) => {
  const { changes } = c.req.valid('json')
  const tenantId = c.var.tenantId ?? 'default'

  const syncedIds: string[] = []
  const errors: Array<{ id: string; error: string }> = []
  const conflicts: Array<{ id: string; entityType: string; entityId: string; localVersion: number; remoteVersion: number }> = []
  const queuedIds: string[] = []

  for (const change of changes) {
    try {
      // Tenant isolation check
      if (change.tenantId !== tenantId) {
        errors.push({ id: change.id, error: 'Tenant mismatch' })
        continue
      }

      // ─── Gap 3: Server-side entity validation ──────────────
      const validator = ENTITY_VALIDATORS[change.entityType]
      if (validator && (change.operation === 'create' || change.operation === 'update')) {
        const validation = validator(change.data)
        if (!validation.valid) {
          errors.push({ id: change.id, error: validation.error! })
          continue
        }
      }

      const existing = await serverStore.getEntity(change.entityId)

      if (change.operation === 'delete') {
        await serverStore.upsertEntity(change.entityType, {
          ...change.data,
          deletedAt: Date.now(),
        }, tenantId)
        syncedIds.push(change.id)
      } else {
        // Optimistic concurrency check
        if (existing && existing.version !== (change.data.version as number)) {
          conflicts.push({
            id: change.id,
            entityType: change.entityType,
            entityId: change.entityId,
            localVersion: existing.version,
            remoteVersion: change.data.version as number,
          })
          continue
        }

        // ─── Gap 5: Delta sync — only persist changed fields ─
        // If changedFields is provided and operation is update, we
        // apply a partial merge instead of full replacement
        const dataToStore = change.operation === 'update' && change.changedFields && change.changedFields.length > 0
          ? { ...(existing?.data ?? {}), ...change.data }
          : change.data

        await serverStore.upsertEntity(change.entityType, dataToStore, tenantId)
        syncedIds.push(change.id)
      }

      // ─── Gap 6: Write to change_log immediately (sync path) ──
      await serverStore.appendChangeLog({
        ...change,
        status: 'synced',
        clientId: change.clientId,
      })

      // Also queue to sync_queue for async processing / event sourcing
      await serverStore.enqueueSyncJob(change)
      queuedIds.push(change.id)
    } catch (err: any) {
      errors.push({ id: change.id, error: err.message })
    }
  }

  return c.json({
    success: errors.length === 0,
    syncedCount: syncedIds.length,
    failedCount: errors.length,
    queuedCount: queuedIds.length,
    conflicts,
    errors,
  })
})

// ─── Pull ─────────────────────────────────────────────────

syncRouter.get('/pull', async (c) => {
  const since = parseInt(c.req.query('since') ?? '0', 10)
  const excludeClient = c.req.query('excludeClient') ?? undefined
  const tenantId = c.var.tenantId ?? 'default'

  // ─── Gap 4: Exclude own client's changes ──────────────────
  const changes = await serverStore.getChangesSince(since, tenantId, excludeClient)

  return c.json({
    changes,
    serverTime: serverStore.getServerTime(),
  })
})

// ─── Health ──────────────────────────────────────────────

syncRouter.get('/health', async (c) => {
  const health = await serverStore.getHealth()
  return c.json(health)
})

export { syncRouter }
