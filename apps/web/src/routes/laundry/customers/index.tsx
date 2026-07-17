/**
 * ─── Laundry Customers List Page ──────────────────────────────
 * Customer registry for the Laundry Shop Management System.
 * Offline-first: reads from local IndexedDB via Dexie.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryCustomerRepo } from '../../../lib/db'
import type { LaundryCustomer } from '@repo/entity-laundry'
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TIER_LABELS, CUSTOMER_TIER_COLORS } from '@repo/entity-laundry'
import { Plus, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react'

const PAGE_SIZE = 20

export function LaundryCustomersPage() {
  const [customers, setCustomers] = useState<LaundryCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await laundryCustomerRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        sort: [{ field: 'lastName', direction: 'asc' }],
      })
      if ('items' in result) {
        setCustomers(result.items as LaundryCustomer[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load laundry customers:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadCustomers() }, [loadCustomers])
  useEffect(() => { setPage(1) }, [search])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Laundry Customers"
          description={`${total} customer${total !== 1 ? 's' : ''} registered`}
          action={
            <Button icon={<Plus className="h-4 w-4" />}>New Customer</Button>
          }
        />

        <div className="mb-4 px-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, code, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lifetime Spend</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Points</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      {search ? 'No customers match your search' : 'No customers yet. Register your first customer!'}
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-blue-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-blue-700">{c.customerCode}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.phone || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{CUSTOMER_TYPE_LABELS[c.customerType]}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={CUSTOMER_TIER_COLORS[c.customerTier]}>
                        {CUSTOMER_TIER_LABELS[c.customerTier]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">₱{c.lifetimeSpend.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.loyaltyPoints.toLocaleString()}</td>
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
