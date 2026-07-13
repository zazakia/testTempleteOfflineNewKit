/**
 * ─── Clinic Appointments List Page ───────────────────────────
 * Today's schedule and appointment management for the clinic.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { clinicAppointmentRepo } from '../../../lib/db'
import type { ClinicAppointment } from '@repo/entity-clinic'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@repo/entity-clinic'
import { Plus, Search, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20
const today = new Date().toISOString().slice(0, 10)

export function ClinicAppointmentsPage() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState(today)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = []
      if (statusFilter) filter.push({ field: 'status', operator: 'eq' as const, value: statusFilter })
      if (dateFilter) filter.push({ field: 'appointmentDate', operator: 'eq' as const, value: dateFilter })

      const result = await clinicAppointmentRepo.findMany({
        page,
        pageSize: PAGE_SIZE,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'appointmentTime', direction: 'asc' }],
      })

      if ('items' in result) {
        setAppointments(result.items as ClinicAppointment[])
        setTotal(result.total ?? 0)
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, dateFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, statusFilter, dateFilter])

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Appointments"
          description={`${total} appointment${total !== 1 ? 's' : ''}`}
          action={
            <Link to="/clinic/appointments/new">
              <Button icon={<Plus className="h-4 w-4" />}>Schedule Appointment</Button>
            </Link>
          }
        />

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="sm:w-44" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search by appointment code..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="arrived">Arrived</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => setDateFilter(today)}>Today</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Patient ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Chief Complaint</th>
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
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No appointments found for this date.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="cursor-pointer transition-colors hover:bg-purple-50"
                    onClick={() => navigate({ to: '/clinic/appointments/$id', params: { id: apt.id } })}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-purple-700">{apt.appointmentCode}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{apt.appointmentTime}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{apt.patientId.slice(0, 8)}...</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 capitalize">{apt.appointmentType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{apt.chiefComplaint || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={APPOINTMENT_STATUS_COLORS[apt.status]}>{APPOINTMENT_STATUS_LABELS[apt.status]}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <Link to="/clinic/appointments/$id" params={{ id: apt.id }}
                        className="font-medium text-purple-600 hover:text-purple-800"
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
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
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
