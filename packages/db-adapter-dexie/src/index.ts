/**
 * ─── Dexie.js DB Adapter ─────────────────────────────────────
 * Implements the Repository interface for IndexedDB via Dexie.
 * Used by the web app (PWA).
 */

import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ConflictError,
} from '@repo/core'
import type {
  BaseEntity,
  CreateInput,
  UpdateInput,
  QueryParams,
  QueryResultType,
  Repository,
  WriteOptions,
  CursorQuery,
  CursorResult,
  OffsetQuery,
  OffsetResult,
  EntityId,
  TimestampMillis,
  ChangeLogEntry,
  FilterRule,
} from '@repo/core'
import { isCursorQuery, MiddlewarePipeline, EntityRegistry } from '@repo/core'
import type { MiddlewareContext, HookContext, EntityHooks } from '@repo/core'

// ─── Database Class ────────────────────────────────────────

class OfflineDatabase extends Dexie {
  public changeLog!: Table<ChangeLogEntry, string>

  constructor(dbName: string) {
    super(dbName)

    // ─── Cooperative ERP Schema ──────────────────────────────
    // Core domain: Members & Profiles
    this.version(1).stores({
      // System
      changeLog: '++id, entityType, entityId, status, timestamp, tenantId',
      user_profiles: 'id, email, role, is_active, createdAt, updatedAt, deletedAt',
      app_settings: 'id, key, scope, is_active, createdAt, updatedAt, deletedAt',
      action_logs: 'id, entityType, entityId, action, performedBy, timestamp, createdAt, [entityType+entityId], [performedBy+timestamp]',
      feature_flags: 'id, key, enabled, category, sort_order, createdAt, updatedAt, deletedAt',
      role_permissions: 'id, role, permission_key, enabled, createdAt, updatedAt, deletedAt, [role+permission_key]',

      // Member Management
      members: 'id, tenantId, membershipNumber, membershipStatus, membershipType, collectorId, areaId, firstName, lastName, fullName, phone, email, barangay, cityMunicipality, province, createdAt, updatedAt, deletedAt, [tenantId+deletedAt], [tenantId+membershipStatus], [membershipNumber]',
      member_dependents: 'id, memberId, name, relationship, dateOfBirth, createdAt, updatedAt, deletedAt, [memberId]',

      // Share Capital
      share_capital_transactions: 'id, memberId, transactionType, shareType, date, accountCode, amount, runningBalanceShares, runningBalanceAmount, referenceNumber, recordedBy, createdAt, updatedAt, deletedAt, [memberId], [memberId+date]',

      // Savings & Deposits
      savings_accounts: 'id, memberId, accountType, accountNumber, balance, interestRate, status, openedDate, createdAt, updatedAt, deletedAt, [memberId]',
      savings_transactions: 'id, savingsAccountId, memberId, type, amount, date, referenceId, notes, createdAt, updatedAt, deletedAt, [memberId], [savingsAccountId+date]',

      // Loan Management
      loan_products: 'id, productType, label, is_active, defaultRatePercent, defaultTerm, defaultFrequency, sortOrder, createdAt, updatedAt, deletedAt',
      loan_applications: 'id, borrowerId, productId, amountApplied, amountApproved, purpose, applicationDate, status, approvedBy, approvedAt, notes, createdAt, updatedAt, deletedAt, [borrowerId], [status+applicationDate]',
      loans: 'id, borrowerId, loanNumber, loanType, principalAmount, interestRate, interestType, term, termUnit, frequency, totalAmount, installmentAmount, releaseDate, firstPaymentDate, maturityDate, status, collectorId, isDelinquent, delinquentSince, dpd, agingBucket, encodedBy, approvedBy, approvedAt, notes, createdAt, updatedAt, deletedAt, [borrowerId], [status], [collectorId+status], [borrowerId+status]',
      payment_schedules: 'id, loanId, dueDate, scheduledAmount, principalAmount, interestAmount, feesAmount, status, createdAt, updatedAt, deletedAt, [loanId], [loanId+status], [loanId+dueDate]',
      payments: 'id, loanId, borrowerId, scheduleId, collectorId, amount, paymentDate, paymentType, receiptNumber, notes, encodedAt, createdAt, updatedAt, deletedAt, [loanId], [borrowerId], [collectorId+paymentDate], [paymentDate]',
      loan_penalties: 'id, loanId, amount, penaltyDate, reason, createdAt, updatedAt, deletedAt, [loanId], [loanId+penaltyDate]',
      guarantors: 'id, loanId, applicationId, guarantorName, contactNo, relationship, memberId, createdAt, updatedAt, deletedAt, [loanId], [memberId]',

      // Collections
      collectors: 'id, fullName, authId, is_active, createdAt, updatedAt, deletedAt',
      collection_groups: 'id, name, collectorId, collectionDay, groupType, areaId, is_active, createdAt, updatedAt, deletedAt, [collectorId], [areaId]',
      collection_logs: 'id, collectorId, logDate, totalCollected, cashOnHandStart, cashOnHandEnd, notes, createdAt, updatedAt, deletedAt, [collectorId+logDate]',
      remittances: 'id, collectorId, amount, remittanceDate, status, approvedBy, notes, createdAt, updatedAt, deletedAt, [collectorId], [status]',
      areas: 'id, name, code, parentAreaId, aoId, is_active, createdAt, updatedAt, deletedAt, [parentAreaId]',

      // Accounting
      chart_of_accounts: 'id, code, name, accountType, normalBalance, parentCode, isHeader, is_active, sortOrder, createdAt, updatedAt, deletedAt, [accountType], [code]',
      journal_entries: 'id, entryDate, referenceNumber, description, entryType, sourceTable, sourceId, postedBy, isPosted, totalDebit, totalCredit, fiscalYear, fiscalMonth, createdAt, updatedAt, deletedAt, [entryDate], [referenceNumber], [sourceTable+sourceId], [fiscalYear+fiscalMonth]',
      journal_entry_lines: 'id, journalEntryId, accountCode, accountName, debitAmount, creditAmount, description, businessUnitId, moduleSourceTable, moduleSourceId, createdAt, updatedAt, deletedAt, [journalEntryId], [accountCode]',
      financial_periods: 'id, fiscalYear, fiscalMonth, periodStart, periodEnd, isClosed, closedAt, createdAt, updatedAt, deletedAt, [fiscalYear]',
      financial_snapshots: 'id, snapshotDate, totalAssets, totalEquity, totalLiabilities, loanLossReserve, operatingRevenue, financialCosts, createdAt, updatedAt, deletedAt',

      // Payroll
      employees: 'id, name, role, baseSalary, is_active, createdAt, updatedAt, deletedAt',
      payrolls: 'id, employeeId, periodStart, periodEnd, baseSalary, deductions, allowances, netPay, status, createdAt, updatedAt, deletedAt, [employeeId], [status+periodStart]',

      // Governance
      committees: 'id, name, type, is_active, createdAt, updatedAt, deletedAt',
      committee_members: 'id, committeeId, memberId, position, termStart, termEnd, is_active, createdAt, updatedAt, deletedAt, [committeeId], [memberId]',
      board_resolutions: 'id, resolutionNumber, title, description, resolutionDate, type, status, approvedBy, referenceEntityType, referenceEntityId, createdAt, updatedAt, deletedAt, [resolutionNumber]',
      meeting_attendance: 'id, memberId, meetingType, meetingDate, isPresent, notes, createdAt, updatedAt, deletedAt, [memberId]',

      // Statutory Funds
      statutory_fund_allocations: 'id, fiscalYear, fiscalMonth, fundType, amount, percentage, notes, performedBy, createdAt, updatedAt, deletedAt, [fiscalYear+fundType]',

      // Cash & Bank
      cash_transactions: 'id, transactionDate, particulars, type, amount, remarks, recordedBy, createdAt, updatedAt, deletedAt, [transactionDate], [type]',
      bank_accounts: 'id, bankName, accountName, accountNumber, startingBalance, createdAt, updatedAt, deletedAt',
      bank_transactions: 'id, bankAccountId, transactionDate, type, amount, particulars, remarks, createdAt, updatedAt, deletedAt, [bankAccountId], [bankAccountId+transactionDate]',

      // Expenses
      expenses: 'id, category, description, payee, tin, invoiceNumber, vatAmount, amount, expenseDate, frequency, encodedBy, createdAt, updatedAt, deletedAt, [category+expenseDate], [expenseDate]',
      expense_categories: 'id, name, is_active, createdAt, updatedAt, deletedAt',

      // File Cases (Legal)
      file_cases: 'id, loanId, borrowerId, caseNumber, filedDate, status, notes, filedBy, createdAt, updatedAt, deletedAt, [borrowerId], [status]',

      // Business Units / Modules
      business_units: 'id, name, slug, moduleId, is_active, description, createdAt, updatedAt, deletedAt, [slug]',
      module_transactions: 'id, moduleId, businessUnitId, sourceTable, sourceId, amount, transactionType, postedAt, fiscalYear, fiscalMonth, createdAt, updatedAt, deletedAt, [sourceTable+sourceId], [moduleId]',

      // Water Station Module
      ws_customers: 'id, name, phone, address, isMember, memberId, is_active, createdAt, updatedAt, deletedAt, [memberId]',
      ws_deliveries: 'id, customerId, deliveryDate, gallons, pricePerGallon, totalAmount, status, createdAt, updatedAt, deletedAt, [customerId], [deliveryDate]',
      ws_containers: 'id, customerId, containerType, quantityOwned, quantityLoaned, createdAt, updatedAt, deletedAt, [customerId]',
      ws_payments: 'id, customerId, deliveryId, paymentDate, amount, paymentMethod, createdAt, updatedAt, deletedAt, [customerId], [paymentDate]',
      ws_expenses: 'id, category, amount, expenseDate, description, createdAt, updatedAt, deletedAt',

      // Legacy (keep for compatibility)
      customer: 'id, tenantId, email, status, company, createdAt, updatedAt, deletedAt, [tenantId+deletedAt], [tenantId+status], [tenantId+createdAt]',
    })

    // ─── v2: Tenant Metadata Store ───────────────────────
    // JSON/JSONB blob per tenant for runtime customization
    this.version(2).stores({
      tenant_metadata: 'tenantId',
    })

    this.changeLog = this.table('changeLog')
  }
}

// ─── Global DB Instance ────────────────────────────────────

let globalDb: OfflineDatabase | null = null

function getDb(dbName?: string): OfflineDatabase {
  if (!globalDb) {
    globalDb = new OfflineDatabase(dbName ?? 'OfflineFirstApp')
  }
  return globalDb
}

// ─── Helper Functions ──────────────────────────────────────

/**
 * Apply filter rules to a Dexie collection.
 * Returns a filtered collection.
 */
async function applyFilters<T>(
  collection: Dexie.Collection<T, string>,
  filter?: FilterRule[],
  search?: string,
  includeDeleted?: boolean,
): Promise<Dexie.Collection<T, string>> {
  let result = collection
  
  if (!includeDeleted) {
    // For soft-delete filtering, we need to filter in-memory since
    // we may not have an index on deletedAt
    result = result.filter((item: any) => item.deletedAt === null) as any
  }

  if (filter && filter.length > 0) {
    for (const rule of filter) {
      switch (rule.operator) {
        case 'eq':
          // Try to use indexed where if possible
          try {
            const table = (result as any)._table
            if (table) {
              const whereResult = await table.where(rule.field).equals(rule.value).toArray()
              // This approach is limited - for simplicity, filter in memory
              result = result.filter((item: any) => item[rule.field] === rule.value) as any
            }
          } catch {
            result = result.filter((item: any) => item[rule.field] === rule.value) as any
          }
          break
        case 'neq':
          result = result.filter((item: any) => item[rule.field] !== rule.value) as any
          break
        case 'contains':
          result = result.filter((item: any) => {
            const val = item[rule.field]
            return typeof val === 'string' && 
              val.toLowerCase().includes(String(rule.value as string).toLowerCase())
          }) as any
          break
        case 'gt':
          result = result.filter((item: any) => item[rule.field] > (rule.value as number)) as any
          break
        case 'gte':
          result = result.filter((item: any) => item[rule.field] >= (rule.value as number)) as any
          break
        case 'lt':
          result = result.filter((item: any) => item[rule.field] < (rule.value as number)) as any
          break
        case 'lte':
          result = result.filter((item: any) => item[rule.field] <= (rule.value as number)) as any
          break
        case 'in':
          result = result.filter((item: any) => 
            (rule.value as unknown[]).includes(item[rule.field])
          ) as any
          break
        case 'startsWith':
          result = result.filter((item: any) => {
            const val = item[rule.field]
            return typeof val === 'string' && 
              val.toLowerCase().startsWith(String(rule.value as string).toLowerCase())
          }) as any
          break
      }
    }
  }

  if (search) {
    const searchLower = search.toLowerCase()
    result = result.filter((item: any) => {
      return (
        (item.name && String(item.name).toLowerCase().includes(searchLower)) ||
        (item.email && String(item.email).toLowerCase().includes(searchLower))
      )
    }) as any
  }

  return result
}

/**
 * Sort items in memory.
 */
function applySort<T>(items: T[], sort?: { field: string; direction: 'asc' | 'desc' }[]): T[] {
  if (!sort || sort.length === 0) {
    return items.reverse() // newest first by default
  }

  return [...items].sort((a, b) => {
    for (const rule of sort) {
      const aVal = (a as any)[rule.field]
      const bVal = (b as any)[rule.field]
      if (aVal == null && bVal == null) continue
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (aVal < bVal) return rule.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return rule.direction === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * Write a change log entry for sync.
 */
async function writeChangeLog(
  operation: 'create' | 'update' | 'delete',
  entityName: string,
  entityId: EntityId,
  data: Record<string, unknown>,
  previousData: Record<string, unknown> | undefined,
  options?: WriteOptions,
): Promise<void> {
  if (options?.skipSync) return

  const db = getDb()
  const entry: ChangeLogEntry = {
    id: uuidv4(),
    entityType: entityName,
    entityId,
    operation,
    data,
    previousData,
    timestamp: options?.performedAt ?? Date.now(),
    clientId: 'web-client',
    tenantId: (data.tenantId as string) ?? 'default',
    performedBy: options?.performedBy ?? 'system',
    status: 'pending',
    retryCount: 0,
  }

  await db.changeLog.add(entry)
}

// ─── Entity Table Manager ──────────────────────────────────

const entityTables = new Map<string, string>()

/**
 * Register the Dexie table name for an entity.
 * Called by createDexieRepository.
 */
function ensureTableSchema(entityName: string, extraIndexes?: string[]): void {
  // Schema must be defined upfront in the Dexie version() call.
  // For new entities, we'd need to handle schema migration.
  // For now, we check if the table exists and throw if not.
  const db = getDb()
  if (!db.tables.some((t) => t.name === entityName)) {
    throw new DatabaseError(
      `Entity table "${entityName}" is not defined in the Dexie schema. ` +
      `Add it to the version() call in OfflineDatabase constructor. ` +
      `Schema format: 'id, tenantId, ...indexes'`
    )
  }
}

// ─── Repository Factory ────────────────────────────────────

/**
 * Factory for building a MiddlewareContext per operation.
 * Called on every CRUD op so context (e.g. tenantId) is always fresh.
 */
export type ContextFactory = () => Pick<MiddlewareContext, 'userId' | 'tenantId' | 'timestamp' | 'metadata'>

/**
 * Options for createDexieRepository.
 */
export interface DexieRepositoryOptions {
  /** Custom database name (defaults to 'OfflineFirstApp') */
  dbName?: string
  /** Middleware pipeline — tenant isolation, audit, etc. */
  middleware?: MiddlewarePipeline<BaseEntity>
  /** Provides per-operation context (userId, tenantId from auth) */
  contextFactory?: ContextFactory
}

/**
 * Create a Dexie-backed Repository for a given entity.
 *
 * Usage:
 *   const customerRepo = createDexieRepository<Customer>('customer')
 *   const customers = await customerRepo.findMany({ limit: 50 })
 *
 * With tenant middleware:
 *   const pipeline = new MiddlewarePipeline()
 *   pipeline.use(createTenantMiddleware('customer'))
 *   const repo = createDexieRepository<Customer>('customer', { middleware: pipeline, contextFactory })
 */
export function createDexieRepository<T extends BaseEntity>(
  entityName: string,
  options?: DexieRepositoryOptions,
): Repository<T> {
  const db = getDb(options?.dbName)
  const pipeline = options?.middleware
  const contextFactory = options?.contextFactory
  
  // Verify the table exists (schema must be defined in OfflineDatabase constructor)
  ensureTableSchema(entityName)

  const table = db.table<T, string>(entityName)

  /** Resolve entity hooks from the EntityRegistry (if registered) */
  let hooks: EntityHooks<BaseEntity> | undefined
  try {
    if (EntityRegistry.has(entityName)) {
      hooks = EntityRegistry.get(entityName).hooks as EntityHooks<BaseEntity>
    }
  } catch {
    // Entity not registered — hooks are optional
    hooks = undefined
  }

  /** Convert MiddlewareContext to HookContext for hook calls */
  function toHookCtx(mwCtx: MiddlewareContext): HookContext {
    return {
      userId: mwCtx.userId,
      tenantId: mwCtx.tenantId,
      timestamp: mwCtx.timestamp,
      metadata: mwCtx.metadata,
    }
  }

  /**
   * Build a full MiddlewareContext for the current operation.
   * Falls back to safe defaults if no contextFactory is provided.
   */
  function buildCtx(
    operation: MiddlewareContext['operation'],
  ): MiddlewareContext {
    const base = contextFactory?.() ?? { userId: undefined as string | undefined, tenantId: undefined as string | undefined, timestamp: undefined as number | undefined, metadata: undefined as Record<string, unknown> | undefined }
    return {
      userId: base.userId ?? 'anonymous',
      tenantId: base.tenantId ?? 'default',
      timestamp: base.timestamp ?? Date.now(),
      entityName,
      operation,
      metadata: base.metadata,
    }
  }

  // ─── Repository Implementation ───────────────────────

  return {
    async findById(id: EntityId, _options?: WriteOptions): Promise<T | null> {
      try {
        const ctx = buildCtx('read')

        // Run before-read hooks
        if (hooks?.beforeRead) {
          await hooks.beforeRead(id, toHookCtx(ctx))
        }

        if (pipeline) {
          await pipeline.runBeforeRead(id, ctx)
        }

        let item: T | null = await table.get(id) ?? null
        if (!item) return null
        if (item.deletedAt) return null

        // Run after-read hooks (can transform the returned entity)
        if (hooks?.afterRead) {
          item = await hooks.afterRead(item, toHookCtx(ctx)) as T | null
        }

        if (pipeline) {
          return await pipeline.runAfterRead(item, ctx) as T | null
        }

        return item
      } catch (error) {
        if (error instanceof AppError) throw error
        throw new DatabaseError(`Failed to find ${entityName} by id`, { id, error })
      }
    },

    async findMany(query: QueryParams<T>, _options?: WriteOptions): Promise<QueryResultType<T>> {
      try {
        const ctx = buildCtx('read')

        // Let middleware mutate the query (e.g., inject tenant filter)
        let effectiveQuery = query
        if (pipeline) {
          effectiveQuery = await pipeline.runBeforeQuery(
            query as unknown as Record<string, unknown>,
            ctx,
          ) as unknown as QueryParams<T>
        }

        // Get all items from table
        let allItems = await table.toArray()

        // Apply filters in memory
        let filtered = allItems
        if (!effectiveQuery.includeDeleted) {
          filtered = filtered.filter((item) => item.deletedAt === null)
        }

        if (effectiveQuery.filter) {
          for (const rule of effectiveQuery.filter) {
            filtered = filtered.filter((item) => {
              const itemVal = (item as any)[rule.field]
              switch (rule.operator) {
                case 'eq': return itemVal === rule.value as string
                case 'neq': return itemVal !== rule.value as string
                case 'gt': return itemVal > (rule.value as number)
                case 'gte': return itemVal >= (rule.value as number)
                case 'lt': return itemVal < (rule.value as number)
                case 'lte': return itemVal <= (rule.value as number)
                case 'contains':
                  return typeof itemVal === 'string' && 
                    itemVal.toLowerCase().includes(String(rule.value as string).toLowerCase())
                case 'startsWith':
                  return typeof itemVal === 'string' && 
                    itemVal.toLowerCase().startsWith(String(rule.value as string).toLowerCase())
                case 'in':
                  return (rule.value as unknown[]).includes(itemVal)
                case 'between':
                  if (Array.isArray(rule.value) && rule.value.length === 2) {
                    return itemVal >= rule.value[0] && itemVal <= rule.value[1]
                  }
                  return true
                default:
                  return true
              }
            })
          }
        }

        if (effectiveQuery.search) {
          const searchLower = effectiveQuery.search.toLowerCase()
          filtered = filtered.filter((item) => {
            const itemAny = item as any
            return (
              (itemAny.name && String(itemAny.name).toLowerCase().includes(searchLower)) ||
              (itemAny.email && String(itemAny.email).toLowerCase().includes(searchLower))
            )
          })
        }

        // Apply sorting
        if (effectiveQuery.sort && effectiveQuery.sort.length > 0) {
          filtered = applySort(filtered, effectiveQuery.sort)
        } else {
          filtered = filtered.reverse() // newest first
        }

        const total = filtered.length

        // Apply pagination
        if (isCursorQuery(effectiveQuery)) {
          const limit = effectiveQuery.limit ?? 50
          let startIndex = 0

          if (effectiveQuery.cursor) {
            const cursorIndex = filtered.findIndex((item) => item.id === effectiveQuery.cursor)
            if (cursorIndex >= 0) {
              startIndex = cursorIndex + 1
            }
          }

          const items = filtered.slice(startIndex, startIndex + limit)
          const nextCursor = items.length === limit ? items[items.length - 1]?.id : undefined

          const result: QueryResultType<T> = { items, nextCursor, total }
          if (pipeline) {
            const afterItems = await pipeline.runAfterQuery(items, ctx)
            return { items: afterItems as unknown as T[], nextCursor, total } as CursorResult<T>
          }
          return result
        } else {
          const offsetQuery = effectiveQuery as OffsetQuery
          const page = offsetQuery.page ?? 1
          const pageSize = offsetQuery.pageSize ?? 50
          const offset = (page - 1) * pageSize

          const items = filtered.slice(offset, offset + pageSize)

          let finalItems: T[] = items
          if (pipeline) {
            finalItems = await pipeline.runAfterQuery(items, ctx) as unknown as T[]
          }

          return {
            items: finalItems,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          }
        }
      } catch (error) {
        if (error instanceof AppError) throw error
        throw new DatabaseError(`Failed to query ${entityName}`, { query, error })
      }
    },

    async create(input: CreateInput<T>, options?: WriteOptions): Promise<T> {
      const ctx = buildCtx('create')

      // Run before-create middleware (e.g., tenant isolation injects tenantId)
      let preparedInput = input as unknown as Record<string, unknown>
      if (pipeline) {
        preparedInput = await pipeline.runBeforeCreate(preparedInput, ctx)
      }

      const timestamp = options?.performedAt ?? ctx.timestamp
      const userId = options?.performedBy ?? ctx.userId

      // Run before-create hooks (business logic: validation, normalization)
      if (hooks?.beforeCreate) {
        const hookCtx = toHookCtx(ctx)
        preparedInput = await hooks.beforeCreate(preparedInput, hookCtx)
      }

      const entity = {
        ...preparedInput,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
        version: 1,
        createdBy: userId,
        updatedBy: userId,
      } as unknown as T

      try {
        await table.add(entity as any)

        await writeChangeLog(
          'create',
          entityName,
          entity.id,
          entity as unknown as Record<string, unknown>,
          undefined,
          options,
        )

        // Run after-create hooks (side effects: notifications, analytics)
        if (hooks?.afterCreate) {
          await hooks.afterCreate(entity, toHookCtx(ctx))
        }

        // Run after-create middleware
        if (pipeline) {
          await pipeline.runAfterCreate(entity, ctx)
        }

        return entity
      } catch (error) {
        if (pipeline) {
          await pipeline.handleError(
            error instanceof Error ? error : new DatabaseError(String(error)),
            ctx,
          )
        }
        throw new DatabaseError(`Failed to create ${entityName}`, { input, error })
      }
    },

    async update(id: EntityId, input: UpdateInput<T>, options?: WriteOptions): Promise<T> {
      const ctx = buildCtx('update')

      try {
        const existing = await table.get(id)
        if (!existing) {
          throw new NotFoundError(entityName, id)
        }

        // Run before-update middleware (e.g., prevent tenantId change)
        let preparedInput = input as unknown as Record<string, unknown>
        if (pipeline) {
          preparedInput = await pipeline.runBeforeUpdate(id, preparedInput, ctx)
        }

        // Run before-update hooks (business logic)
        if (hooks?.beforeUpdate) {
          preparedInput = await hooks.beforeUpdate(id, preparedInput, toHookCtx(ctx))
        }

        // Optimistic concurrency check
        const inputVersion = (preparedInput as any).version ?? input.version
        if (inputVersion !== existing.version) {
          throw new ConflictError(entityName, id, inputVersion, existing.version)
        }

        const timestamp = options?.performedAt ?? ctx.timestamp
        const userId = options?.performedBy ?? ctx.userId

        const previousData = { ...existing } as unknown as Record<string, unknown>

        const updated = {
          ...existing,
          ...preparedInput,
          id,
          createdAt: existing.createdAt,
          createdBy: existing.createdBy,
          updatedAt: timestamp,
          updatedBy: userId,
          version: existing.version + 1,
        } as unknown as T

        await table.put(updated as any)

        await writeChangeLog(
          'update',
          entityName,
          id,
          updated as unknown as Record<string, unknown>,
          previousData,
          options,
        )

        // Run after-update hooks
        if (hooks?.afterUpdate) {
          await hooks.afterUpdate(updated, toHookCtx(ctx))
        }

        // Run after-update middleware
        if (pipeline) {
          await pipeline.runAfterUpdate(updated, ctx)
        }

        return updated
      } catch (error) {
        if (pipeline) {
          await pipeline.handleError(
            error instanceof Error ? error : new DatabaseError(String(error)),
            ctx,
          )
        }
        if (error instanceof AppError) throw error
        throw new DatabaseError(`Failed to update ${entityName}`, { id, input, error })
      }
    },

    async delete(id: EntityId, options?: WriteOptions): Promise<void> {
      const ctx = buildCtx('delete')

      try {
        const existing = await table.get(id)
        if (!existing) {
          throw new NotFoundError(entityName, id)
        }

        // Run before-delete middleware
        if (pipeline) {
          await pipeline.runBeforeDelete(id, ctx)
        }

        // Run before-delete hooks
        if (hooks?.beforeDelete) {
          await hooks.beforeDelete(id, toHookCtx(ctx))
        }

        const timestamp = options?.performedAt ?? ctx.timestamp
        const userId = options?.performedBy ?? ctx.userId

        // Soft delete
        const updated = {
          ...existing,
          deletedAt: timestamp,
          updatedAt: timestamp,
          updatedBy: userId,
          version: existing.version + 1,
        } as T

        await table.put(updated as any)

        await writeChangeLog(
          'delete',
          entityName,
          id,
          { id, deletedAt: timestamp },
          { ...existing } as unknown as Record<string, unknown>,
          options,
        )

        // Run after-delete hooks
        if (hooks?.afterDelete) {
          await hooks.afterDelete(updated, toHookCtx(ctx))
        }

        // Run after-delete middleware
        if (pipeline) {
          await pipeline.runAfterDelete(updated, ctx)
        }
      } catch (error) {
        if (pipeline) {
          await pipeline.handleError(
            error instanceof Error ? error : new DatabaseError(String(error)),
            ctx,
          )
        }
        if (error instanceof AppError) throw error
        throw new DatabaseError(`Failed to delete ${entityName}`, { id, error })
      }
    },

    async count(query: Pick<CursorQuery, 'filter' | 'search' | 'includeDeleted'>): Promise<number> {
      try {
        const ctx = buildCtx('read')

        // Let middleware inject tenant filter on the query
        let effectiveQuery = query as Record<string, unknown>
        if (pipeline) {
          effectiveQuery = await pipeline.runBeforeQuery(effectiveQuery, ctx)
        }

        let items = await table.toArray()

        if (!(effectiveQuery as any).includeDeleted) {
          items = items.filter((item) => item.deletedAt === null)
        }

        if ((effectiveQuery as any).filter) {
          for (const rule of (effectiveQuery as any).filter) {
            if (rule.operator === 'eq') {
              items = items.filter((item) => (item as any)[rule.field] === rule.value)
            }
          }
        }

        return items.length
      } catch (error) {
        throw new DatabaseError(`Failed to count ${entityName}`, { query, error })
      }
    },
  }
}

/**
 * Get the underlying Dexie database instance.
 */
export function getDatabase(): OfflineDatabase {
  return getDb()
}

/**
 * Close the database connection.
 */
export function closeDatabase(): void {
  if (globalDb) {
    globalDb.close()
    globalDb = null
  }
}

/**
 * Reset the database (for testing).
 */
export async function resetDatabase(): Promise<void> {
  if (globalDb) {
    const tables = globalDb.tables
    for (const table of tables) {
      await table.clear()
    }
  }
}
