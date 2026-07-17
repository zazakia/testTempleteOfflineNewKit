/**
 * ─── Laundry Orders List Page ─────────────────────────────────
 * Work order tracking for the Laundry Shop Management System.
 */

import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryOrderRepo } from '../../../lib/db'
import type { LaundryOrder } from '@repo/entity-laundry'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_PRIORITY_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@repo/entity-laundry'
import { Plus, Search, ChevronLeft, ChevronRight, ScrollText } from 'lucide-react'

const PAGE_SIZE = 20

export function LaundryOrdersPage() {
  const [orders, setOrders] = useState<LaundryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = []
      if (statusFilter) filter.push({ field: 'orderStatus', operator: 'eq' as const, value: statusFilter })

      const result = await laundryOrderRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'orderDate', direction: 'desc' }],
      })
      if ('items' in result) {
        setOrders(result.items as LaundryOrder[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load laundry orders:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { loadOrders() }, [loadOrders])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Laundry Orders"
          description={`${total} order${total !== 1 ? 's' : ''}`}
          action={
            <Button icon={<Plus className="h-4 w-4" />}>New Order</Button>
          }
        />

        <div className="mb-4 flex flex-col gap-3 px-6 sm:flex-row">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order code or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ScrollText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      {search || statusFilter ? 'No orders match your filters' : 'No orders yet. Create your first order!'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-green-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-blue-700">{o.orderCode}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{o.customerName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{o.orderDate}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{ORDER_PRIORITY_LABELS[o.orderPriority]}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">₱{o.totalAmount.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={PAYMENT_STATUS_COLORS[o.paymentStatus]}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={ORDER_STATUS_COLORS[o.orderStatus]}>
                        {ORDER_STATUS_LABELS[o.orderStatus]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between px-6 pb-4">
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
