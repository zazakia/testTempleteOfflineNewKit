/**
 * ─── Driving Enrollments List Page ────────────────────────────
 * Enrollment tracking for the Driving School Management System.
 */

import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { drivingEnrollmentRepo } from '../../../lib/db'
import type { DrivingEnrollment } from '@repo/entity-driving-school'
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS } from '@repo/entity-driving-school'
import { Plus, Search, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'

const PAGE_SIZE = 20

export function DrivingEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<DrivingEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const loadEnrollments = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = []
      if (statusFilter) filter.push({ field: 'status', operator: 'eq' as const, value: statusFilter })

      const result = await drivingEnrollmentRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'enrollmentDate', direction: 'desc' }],
      })
      if ('items' in result) {
        setEnrollments(result.items as DrivingEnrollment[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load enrollments:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { loadEnrollments() }, [loadEnrollments])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Driving Enrollments"
          description={`${total} enrollment${total !== 1 ? 's' : ''}`}
          action={
            <Button icon={<Plus className="h-4 w-4" />}>New Enrollment</Button>
          }
        />

        <div className="mb-4 flex flex-col gap-3 px-6 sm:flex-row">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by enrollment code or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(ENROLLMENT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      {search || statusFilter ? 'No enrollments match your filters' : 'No enrollments yet. Create your first enrollment!'}
                    </p>
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-yellow-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-blue-700">{e.enrollmentCode}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{e.studentName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{e.courseName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{e.instructorName || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">₱{e.totalFee.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-red-600 font-medium">₱{e.balance.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{e.sessionsAttended}/{e.sessionsTotal} sessions</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={ENROLLMENT_STATUS_COLORS[e.status]}>
                        {ENROLLMENT_STATUS_LABELS[e.status]}
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
