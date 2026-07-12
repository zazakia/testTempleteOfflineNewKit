/**
 * ─── Loan List Page ──────────────────────────────────────────
 * Complete loan portfolio view with KPIs, filters, and pagination.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { loanRepo } from '../../lib/db'
import { buildLookups } from '../../lib/lookups'
import type { Loan } from '@repo/entity-loan'
import { LOAN_STATUS_LABELS, LOAN_STATUS_COLORS, LoanService } from '@repo/entity-loan'
import { Plus, Search, ChevronLeft, ChevronRight, ScrollText, AlertTriangle } from 'lucide-react'

const PAGE_SIZE = 20

export function LoanListPage() {
  const navigate = useNavigate()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Portfolio KPIs
  const [kpis, setKpis] = useState({ totalPortfolio: 0, activeLoans: 0, delinquentLoans: 0, totalDelinquent: 0 })
  // Human-readable name lookups
  const [lookups, setLookups] = useState<Awaited<ReturnType<typeof buildLookups>> | null>(null)

  const loadLoans = useCallback(async () => {
    setLoading(true)
    try {
      const filter: Array<{ field: string; operator: 'eq' | 'contains'; value: string | number }> = []
      if (statusFilter) filter.push({ field: 'status', operator: 'eq', value: statusFilter })

      const result = await loanRepo.findMany({
        page, pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'releaseDate', direction: 'desc' }],
      })

      if ('items' in result) {
        const items = result.items as Loan[]
        setLoans(items)
        setTotal(result.total ?? 0)

        // Compute KPIs from all loans
        const allResult = await loanRepo.findMany({ page: 1, pageSize: 10000 })
        if ('items' in allResult) {
          const all = allResult.items as Loan[]
          const active = all.filter(l => l.status === 'active' || l.status === 'disbursed')
          const delinquent = all.filter(l => l.isDelinquent)
          setKpis({
            totalPortfolio: active.reduce((s, l) => s + (l.principalAmount ?? 0), 0),
            activeLoans: active.length,
            delinquentLoans: delinquent.length,
            totalDelinquent: delinquent.reduce((s, l) => s + (l.principalAmount ?? 0), 0),
          })
        }
      }
    } catch (error) { console.error('Failed to load loans:', error) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { loadLoans() }, [loadLoans])
  useEffect(() => { setPage(1) }, [search, statusFilter])
  useEffect(() => { buildLookups().then(setLookups) }, [])

  const parRate = kpis.totalPortfolio > 0 ? ((kpis.totalDelinquent / kpis.totalPortfolio) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-6">
      {/* Portfolio KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Portfolio</p>
          <p className="mt-1 text-xl font-bold text-gray-900">₱{kpis.totalPortfolio.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Active Loans</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{kpis.activeLoans}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Delinquent</p>
          <p className={`mt-1 text-xl font-bold ${kpis.delinquentLoans > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {kpis.delinquentLoans} <span className="text-sm font-normal text-gray-400">({parRate}% PAR)</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">At-Risk Amount</p>
          <p className="mt-1 text-xl font-bold text-red-600">₱{kpis.totalDelinquent.toLocaleString()}</p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Loans"
          description={`${total} loan${total !== 1 ? 's' : ''} total`}
          action={
            <Link to="/loans/new">
              <Button icon={<Plus className="h-4 w-4" />}>New Loan</Button>
            </Link>
          }
        />

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search by loan # or borrower..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="active">Active</option>
            <option value="paid">Paid</option>
            <option value="defaulted">Defaulted</option>
            <option value="restructured">Restructured</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Loan #</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Borrower</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Principal</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Installment</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">DPD</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Release</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Maturity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                  ))}</tr>
                ))
              ) : loans.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  {search || statusFilter ? 'No loans match your search' : 'No loans yet. Disburse your first loan!'}
                </td></tr>
              ) : loans.map((loan) => (
                <tr key={loan.id} className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => navigate({ to: '/loans/$id', params: { id: loan.id } })}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">{loan.loanNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{lookups?.resolveBorrower(loan.borrowerId) ?? loan.borrowerId}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">₱{loan.principalAmount?.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">₱{loan.installmentAmount?.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <Badge color={LOAN_STATUS_COLORS[loan.status]} size="sm">{LOAN_STATUS_LABELS[loan.status]}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {loan.isDelinquent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        <AlertTriangle className="h-3 w-3" /> {loan.dpd}d
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">{loan.dpd ?? 0}d</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                    {loan.releaseDate ? new Date(loan.releaseDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                    {loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages} ({total} total)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))} icon={<ChevronLeft className="h-4 w-4" />}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
