/**
 * ─── Branches List Page ──────────────────────────────────────
 * Multi-branch management for cooperatives.
 * Offline-first: reads from local IndexedDB via Dexie.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { branchRepo } from '../../lib/db'
import type { Branch } from '@repo/entity-branch'
import { BRANCH_STATUS_LABELS, BRANCH_STATUS_COLORS } from '@repo/entity-branch'
import { Plus, Search, ChevronLeft, ChevronRight, Building2, MapPin, Phone } from 'lucide-react'

const PAGE_SIZE = 20

export function BranchListPage() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const loadBranches = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = []
      if (statusFilter) filter.push({ field: 'status', operator: 'eq' as const, value: statusFilter })

      const result = await branchRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'name', direction: 'asc' }],
      })

      if ('items' in result) {
        setBranches(result.items as Branch[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load branches:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { loadBranches() }, [loadBranches])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Branches"
          description={`${total} branch${total !== 1 ? 'es' : ''}`}
          action={
            <Link to="/branches/new">
              <Button icon={<Plus className="h-4 w-4" />}>Add Branch</Button>
            </Link>
          }
        />

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, code, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Branch Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Manager
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Loading branches...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm">No branches found</p>
                    {search && <p className="text-xs text-gray-400">Try adjusting your search</p>}
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate({ to: `/branches/${branch.id}` })}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-sm font-medium text-purple-700">
                        {branch.branchCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{branch.name}</span>
                        {branch.isMainBranch && (
                          <Badge color="purple" size="sm">Main</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {branch.cityMunicipality || branch.barangay
                          ? `${branch.cityMunicipality ?? ''}${branch.barangay ? `, ${branch.barangay}` : ''}`.trim()
                          : '—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {branch.managerName || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {branch.isMainBranch ? 'Main Office' : 'Satellite'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={BRANCH_STATUS_COLORS[branch.status]} size="sm">
                        {BRANCH_STATUS_LABELS[branch.status]}
                      </Badge>
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
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                icon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
