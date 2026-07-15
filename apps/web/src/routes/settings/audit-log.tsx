/**
 * ─── Audit Log Page ─────────────────────────────────────────
 * Searchable, filterable audit trail viewer.
 * Shows every CRUD operation across all entities with tamper-proof hash chaining.
 */

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader } from '@repo/ui-core'
import { getAuditStore } from '@repo/audit-trail'
import type { AuditEntry, AuditQuery } from '@repo/audit-trail'
import { Search, Filter, Download, Shield } from 'lucide-react'
import { PRINT_STYLES, printReport } from '../../lib/print'

const PAGE_SIZE = 50

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState('')
  const [chainValid, setChainValid] = useState<boolean | null>(null)

  const store = useMemo(() => getAuditStore(), [])

  useEffect(() => {
    const query: AuditQuery = { page, pageSize: PAGE_SIZE }
    if (actionFilter) query.action = actionFilter
    if (entityFilter) query.entityType = entityFilter
    if (search) query.entityId = search // search by entity ID
    store.query(query).then(setEntries)
    store.count(query).then(setTotal)
    store.verifyChain().then(r => setChainValid(r.valid))
  }, [store, page, actionFilter, entityFilter, search])

  return (
    <div className="p-6">
      <style>{PRINT_STYLES}</style>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Audit Trail</h1>
        <div className="flex items-center gap-3 no-print">
          {chainValid !== null && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              chainValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <Shield className="mr-1 inline h-3 w-3" />
              {chainValid ? 'Chain Valid' : 'Chain Broken'}
            </span>
          )}
          <button onClick={() => printReport('Audit Trail — CoopERP')}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3 no-print">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by entity ID..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
          className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="sync">Sync</option>
          <option value="export">Export</option>
        </select>
        <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1) }}
          className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All Entities</option>
          <option value="customer">Customer</option>
          <option value="member">Member</option>
          <option value="loan">Loan</option>
          <option value="payment">Payment</option>
          <option value="journal_entry">Journal Entry</option>
          <option value="share_capital_transactions">Share Capital</option>
          <option value="savings_transactions">Savings</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Entity</th>
                <th className="px-4 py-2">Entity ID</th>
                <th className="px-4 py-2">Performed By</th>
                <th className="px-4 py-2">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No audit entries found</td></tr>
              ) : entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-500">
                    {new Date(e.performedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.action === 'create' ? 'bg-green-100 text-green-700' :
                      e.action === 'delete' ? 'bg-red-100 text-red-700' :
                      e.action === 'sync' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{e.action}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{e.entityType}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500 max-w-[200px] truncate" title={e.entityId}>
                    {e.entityId}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{e.performedBy}</td>
                  <td className="px-4 py-2 font-mono text-[10px] text-gray-400 max-w-[120px] truncate" title={e.hash}>
                    {e.hash?.slice(0, 12) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <span className="text-sm text-gray-500">{total} total entries</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}
                className="rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-30">Prev</button>
              <span className="px-2 py-1 text-sm">Page {page} of {Math.ceil(total/PAGE_SIZE)}</span>
              <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/PAGE_SIZE)}
                className="rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
