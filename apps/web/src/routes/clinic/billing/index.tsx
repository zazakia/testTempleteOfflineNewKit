/**
 * ─── Clinic Billing List Page ─────────────────────────────────
 * Billing records management for the Clinic Management System.
 * Uses Philippine Peso (₱) as currency.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { clinicBillingRepo } from '../../../lib/db'
import type { ClinicBilling } from '@repo/entity-clinic'
import { BILLING_STATUS_LABELS, BILLING_STATUS_COLORS } from '@repo/entity-clinic'
import { Plus, Search, ChevronLeft, ChevronRight, Receipt } from 'lucide-react'

const PAGE_SIZE = 20

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

export function ClinicBillingPage() {
  const navigate = useNavigate()
  const [bills, setBills] = useState<ClinicBilling[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = []
      if (statusFilter) filter.push({ field: 'status', operator: 'eq' as const, value: statusFilter })

      const result = await clinicBillingRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'billingDate', direction: 'desc' }],
      })

      if ('items' in result) {
        setBills(result.items as ClinicBilling[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load billing records:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Billing Records"
          description={`${total} billing record${total !== 1 ? 's' : ''}`}
          action={
            <Link to="/clinic/billing/new">
              <Button icon={<Plus className="h-4 w-4" />}>New Bill</Button>
            </Link>
          }
        />

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search by billing code..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Fully Paid</option>
            <option value="waived">Waived</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Billing Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount Paid</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                  ))}</tr>
                ))
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No billing records found.</p>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="cursor-pointer transition-colors hover:bg-green-50"
                    onClick={() => navigate({ to: '/clinic/billing/$id', params: { id: bill.id } })}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-green-700">{bill.billingCode}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{bill.billingDate}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-gray-900">{formatPHP(bill.totalAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-green-600">{formatPHP(bill.amountPaid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-red-600">{formatPHP(bill.balance)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={BILLING_STATUS_COLORS[bill.status]}>{BILLING_STATUS_LABELS[bill.status]}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <Link to="/clinic/billing/$id" params={{ id: bill.id }}
                        className="font-medium text-green-600 hover:text-green-800"
                        onClick={(e) => e.stopPropagation()}>View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages} ({total} total)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="h-4 w-4" />}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
