/**
 * ─── Desktop Database Setup (Tauri SQL) ──────────────────────
 * Metadata-driven framework wired for Tauri desktop app.
 * Same architecture as apps/web/src/lib/db.ts but using tauri-sql adapter.
 */

import { createTauriSqlRepository } from '@repo/db-tauri-sql'
import { MiddlewarePipeline } from '@repo/core'
import type { Repository, BaseEntity } from '@repo/core'
import { createTenantMiddleware, TenantMetadataStore, MetadataResolver } from '@repo/multi-tenant'
import type { TenantMetadataRepository } from '@repo/multi-tenant'
import type { TenantMetadata } from '@repo/core'
import { createAuditMiddleware, getAuditStore } from '@repo/audit-trail'
import { LoanService, ApprovalEngine } from '@repo/entity-loan'
import type { Customer } from '@repo/entity-customer'
import type { Member } from '@repo/entity-member'
import type { Loan, LoanProduct, LoanApplication, Payment } from '@repo/entity-loan'

import '@repo/entity-customer'
import '@repo/entity-member'
import '@repo/entity-loan'
import '@repo/entity-savings'
import '@repo/entity-share-capital'
import '@repo/entity-accounting'
import '@repo/entity-collection'
import '@repo/entity-governance'

const tenantContextFactory = () => ({
  userId: 'desktop-user',
  tenantId: 'default',
  timestamp: Date.now(),
})

function createRepo<T extends BaseEntity>(entityName: string): Repository<T> {
  const pipeline = new MiddlewarePipeline<BaseEntity>()
  pipeline.use(createTenantMiddleware(entityName))
  pipeline.use(createAuditMiddleware(entityName))
  return createTauriSqlRepository<T>(entityName, {})
}

export const customerRepo = createRepo<Customer>('customer')
export const memberRepo = createRepo<Member>('members')
export const loanRepo = createRepo<Loan>('loans')
export const loanProductRepo = createRepo<LoanProduct>('loan_products')
export const loanApplicationRepo = createRepo<LoanApplication>('loan_applications')
export const paymentRepo = createRepo<Payment>('payments')

function createMetadataRepo(): TenantMetadataRepository {
  return {
    async get(tenantId: string): Promise<TenantMetadata | undefined> {
      // TODO: implement via tauri-plugin-sql
      return undefined
    },
    async put(record: TenantMetadata): Promise<void> {
      // TODO: implement via tauri-plugin-sql
    },
  }
}

export const metadataStore = new TenantMetadataStore(createMetadataRepo())
export const metadataResolver = new MetadataResolver(metadataStore)
export const approvalEngine = new ApprovalEngine(metadataResolver)
LoanService.configure(metadataResolver)
