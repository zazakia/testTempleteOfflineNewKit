/**
 * ─── Member List Page ────────────────────────────────────────
 * Complete member list with search, filter by status/type/barangay,
 * and pagination for Philippine cooperative members.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { memberRepo } from '../../lib/db'
import type { Member } from '@repo/entity-member'
import {
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_COLORS,
  MEMBERSHIP_TYPE_LABELS,
} from '@repo/entity-member'
import { Plus, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react'

const PAGE_SIZE = 20

export function MemberListPage() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [barangayFilter, setBarangayFilter] = useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const filter: Array<{ field: string; operator: 'eq' | 'contains'; value: string }> = []
      if (statusFilter) filter.push({ field: 'membershipStatus', operator: 'eq', value: statusFilter })
      if (typeFilter) filter.push({ field: 'membershipType', operator: 'eq', value: typeFilter })
      if (barangayFilter) filter.push({ field: 'barangay', operator: 'contains', value: barangayFilter })

      const result = await memberRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'dateJoined', direction: 'desc' }],
      })

      if ('items' in result) {
        setMembers(result.items as Member[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, typeFilter, barangayFilter])

  useEffect(() => { loadMembers() }, [loadMembers])
  useEffect(() => { setPage(1) }, [search, statusFilter, typeFilter, barangayFilter])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Members"
          description={`${total} member${total !== 1 ? 's' : ''} total`}
          action={
            <Link to="/members/new">
              <Button icon={<Plus className="h-4 w-4" />}>Add Member</Button>
            </Link>
          }
        />

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, member ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="associate">Associate</option>
          </select>
          <Input
            placeholder="Barangay..."
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="max-w-[160px]"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Barangay</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    {search || statusFilter || typeFilter || barangayFilter
                      ? 'No members match your search'
                      : 'No members yet. Register your first member!'}
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => navigate({ to: '/members/$id', params: { id: member.id } })}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">{member.membershipNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{member.fullName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{MEMBERSHIP_TYPE_LABELS[member.membershipType]}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={MEMBERSHIP_STATUS_COLORS[member.membershipStatus]}>
                        {MEMBERSHIP_STATUS_LABELS[member.membershipStatus]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{member.barangay || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{member.phone || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <Link to="/members/$id" params={{ id: member.id }} className="font-medium text-green-600 hover:text-green-800" onClick={(e) => e.stopPropagation()}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
