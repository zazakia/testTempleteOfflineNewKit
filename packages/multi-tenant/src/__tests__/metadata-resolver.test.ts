import { describe, it, expect, beforeEach } from 'vitest'
import { TenantMetadataStore, type TenantMetadataRepository } from '../metadata-store'
import { MetadataResolver } from '../metadata-resolver'
import type { TenantMetadata } from '@repo/core'

class MockTenantMetadataRepository implements TenantMetadataRepository {
  private store = new Map<string, TenantMetadata>()

  async get(tenantId: string): Promise<TenantMetadata | undefined> {
    return this.store.get(tenantId)
  }

  async put(record: TenantMetadata): Promise<void> {
    this.store.set(record.tenantId, record)
  }
}

describe('TenantMetadataStore', () => {
  let repo: MockTenantMetadataRepository
  let store: TenantMetadataStore

  beforeEach(() => {
    repo = new MockTenantMetadataRepository()
    store = new TenantMetadataStore(repo)
  })

  it('should set and get full tenant metadata', async () => {
    const meta = { loan: { minAmount: 1000 } }
    await store.set('tenant-1', meta)

    const result = await store.get('tenant-1')
    expect(result).toEqual(meta)

    const exists = await store.exists('tenant-1')
    expect(exists).toBe(true)
  })

  it('should get and set individual fields using dot-path notation', async () => {
    await store.set('tenant-2', {
      loan: {
        maxAmount: 50000,
        rules: {
          allowMultiple: true,
        },
      },
    })

    const maxAmount = await store.getField<number>('tenant-2', 'loan.maxAmount')
    expect(maxAmount).toBe(50000)

    const allowMultiple = await store.getField<boolean>('tenant-2', 'loan.rules.allowMultiple')
    expect(allowMultiple).toBe(true)

    // Set nested field
    await store.setField('tenant-2', 'loan.rules.allowMultiple', false)
    const allowMultipleAfter = await store.getField<boolean>('tenant-2', 'loan.rules.allowMultiple')
    expect(allowMultipleAfter).toBe(false)
  })
})

describe('MetadataResolver', () => {
  let repo: MockTenantMetadataRepository
  let store: TenantMetadataStore
  let resolver: MetadataResolver

  beforeEach(() => {
    repo = new MockTenantMetadataRepository()
    store = new TenantMetadataStore(repo)
    resolver = new MetadataResolver(store)
  })

  it('should return default loan interest formula if none configured', async () => {
    const formula = await resolver.getLoanInterestFormula('tenant-3', 'declining_balance')
    expect(formula.roundingMode).toBe('nearest_cent')
    expect(formula.rateMultiplier).toBe(1)
  })

  it('should resolve customized tenant-specific values when set', async () => {
    await store.set('tenant-3', {
      loan: {
        interestFormulas: {
          declining_balance: {
            roundingMode: 'down',
            rateMultiplier: 1.2,
          },
        },
      },
    })

    const formula = await resolver.getLoanInterestFormula('tenant-3', 'declining_balance')
    expect(formula.roundingMode).toBe('down')
    expect(formula.rateMultiplier).toBe(1.2)
  })

  it('should resolve default approval workflows', async () => {
    const workflow = await resolver.getApprovalWorkflow('tenant-4', 'loan')
    expect(workflow.steps).toHaveLength(2)
    expect(workflow.steps[0]!.role).toBe('loan_encoder')
    expect(workflow.steps[1]!.role).toBe('manager')
  })

  it('should resolve customized tenant-specific workflows', async () => {
    await store.set('tenant-4', {
      approvalWorkflows: {
        loan: {
          steps: [
            { role: 'officer', action: 'verify' },
            { role: 'board', action: 'approve' },
          ],
        },
      },
    })

    const workflow = await resolver.getApprovalWorkflow('tenant-4', 'loan')
    expect(workflow.steps).toHaveLength(2)
    expect(workflow.steps[0]!.role).toBe('officer')
    expect(workflow.steps[1]!.role).toBe('board')
  })
})
