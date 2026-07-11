/**
 * ─── GenericList Component ───────────────────────────────────
 * Metadata-driven data table. Reads entity definition from
 * EntityRegistry and renders a sortable, searchable, filterable list.
 *
 * Usage:
 *   <GenericList entityName="member" />
 *
 * To customize columns per tenant, add a "listColumns" field
 * to the tenant's metadata: metadata.ui.customFields.member_listColumns
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { EntityRegistry, type BaseEntity } from '@repo/core'
import { Card, CardHeader, cn } from '@repo/ui-core'
import { useOnlineStatus } from '@repo/ui-core'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useFeatureFlag } from '../context/FeatureFlagContext'

// ─── Types ──────────────────────────────────────────────────

interface ColumnDef {
  key: string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
  width?: string
}

interface GenericListProps {
  entityName: string
  repo: { findMany: (q: any) => Promise<any> }
  columns?: ColumnDef[]
  defaultSort?: { field: string; direction: 'asc' | 'desc' }
  searchFields?: string[]
  filter?: Array<{ field: string; operator: string; value: unknown }>
  onRowClick?: (id: string) => void
  title?: string
  pageSize?: number
}

// ─── Default Column Inference ───────────────────────────────

function inferColumns(entityName: string): ColumnDef[] {
  try {
    const def = EntityRegistry.get(entityName)
    // Common columns for any entity
    const base: ColumnDef[] = [
      { key: 'id', label: 'ID', width: 'w-32' },
    ]

    // Add entity-specific known fields based on name pattern
    const knownFields: Record<string, ColumnDef[]> = {
      member: [
        { key: 'membershipNumber', label: 'Membership #' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'membershipStatus', label: 'Status' },
      ],
      customer: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status' },
        { key: 'company', label: 'Company' },
      ],
      loan: [
        { key: 'loanNumber', label: 'Loan #' },
        { key: 'borrowerId', label: 'Borrower ID' },
        { key: 'principalAmount', label: 'Principal' },
        { key: 'status', label: 'Status' },
        { key: 'dpd', label: 'Days Past Due' },
      ],
      loan_application: [
        { key: 'borrowerId', label: 'Borrower' },
        { key: 'amountApplied', label: 'Amount' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'status', label: 'Status' },
      ],
      payment: [
        { key: 'borrowerId', label: 'Borrower' },
        { key: 'amount', label: 'Amount' },
        { key: 'paymentDate', label: 'Date' },
        { key: 'paymentType', label: 'Type' },
      ],
      share_capital_transactions: [
        { key: 'memberId', label: 'Member' },
        { key: 'transactionType', label: 'Type' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
      ],
      savings_transactions: [
        { key: 'memberId', label: 'Member' },
        { key: 'type', label: 'Type' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
      ],
      journal_entries: [
        { key: 'entryDate', label: 'Date' },
        { key: 'referenceNumber', label: 'Ref #' },
        { key: 'description', label: 'Description' },
        { key: 'totalDebit', label: 'Debit' },
        { key: 'totalCredit', label: 'Credit' },
      ],
      chart_of_accounts: [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'accountType', label: 'Type' },
      ],
      collector: [
        { key: 'fullName', label: 'Name' },
        { key: 'is_active', label: 'Active' },
      ],
      remittance: [
        { key: 'amount', label: 'Amount' },
        { key: 'remittanceDate', label: 'Date' },
        { key: 'status', label: 'Status' },
      ],
    }

    return knownFields[entityName] ?? base
  } catch {
    return [{ key: 'id', label: 'ID' }]
  }
}

// ─── Helpers ────────────────────────────────────────────────

function formatCell(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (value > 999999) return value.toLocaleString()
    if (Number.isInteger(value)) return String(value)
    return value.toFixed(2)
  }
  // Date timestamps
  if (typeof value === 'number' && value > 1e12) {
    return new Date(value).toLocaleDateString()
  }
  return String(value)
}

// ─── Component ──────────────────────────────────────────────

export function GenericList({
  entityName,
  repo,
  columns: customColumns,
  defaultSort,
  searchFields,
  filter,
  onRowClick,
  title,
  pageSize = 20,
}: GenericListProps) {
  const columns = customColumns ?? useMemo(() => inferColumns(entityName), [entityName])
  const showExport = useFeatureFlag('export.csv')

  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>(defaultSort?.field ?? 'createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSort?.direction ?? 'desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const entityLabel = useMemo(() => {
    try { return EntityRegistry.get(entityName).ui.labelPlural }
    catch { return entityName }
  }, [entityName])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query: any = {
        page,
        pageSize,
        sort: [{ field: sortField, direction: sortDir }],
      }
      if (search) query.search = search
      if (filter?.length) query.filter = filter

      const result = await repo.findMany(query)
      setItems(result.items ?? [])
      setTotal(result.total ?? 0)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [repo, page, pageSize, sortField, sortDir, search, filter])

  useEffect(() => { loadData() }, [loadData])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {title ?? entityLabel} ({total})
          </h2>
        </div>
      </CardHeader>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${entityLabel.toLowerCase()}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        {showExport && (
          <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Export CSV
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="px-6 py-4 text-sm text-red-600 bg-red-50">
          {error}
          <button onClick={loadData} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500',
                    col.sortable !== false && 'cursor-pointer hover:text-gray-700',
                    col.width,
                  )}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <ArrowUpDown className={cn(
                        'h-3 w-3',
                        sortField === col.key ? 'text-green-600' : 'text-gray-300'
                      )} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  <span className="mt-2 block">Loading...</span>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  No {entityLabel.toLowerCase()} found
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id as string ?? idx}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-green-50',
                  )}
                  onClick={() => onRowClick?.(item.id as string)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                      {col.render
                        ? col.render(item[col.key], item)
                        : formatCell(item[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
