/**
 * ─── Loan Applications Page ──────────────────────────────────
 * Full application list with approval workflow.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { loanApplicationRepo, loanRepo } from '../../lib/db'
import type { LoanApplication } from '@repo/entity-loan'
import { LOAN_APPLICATION_STATUS_LABELS, CreateLoanSchema, LoanService } from '@repo/entity-loan'
import { Plus, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Save } from 'lucide-react'

const PAGE_SIZE = 20

export function LoanApplicationListPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [approving, setApproving] = useState<string | null>(null)
  const [showDisburse, setShowDisburse] = useState<string | null>(null)
  const [disburseData, setDisburseData] = useState({ loanNumber: '', interestRate: 12, term: 12 })

  const loadApps = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = statusFilter ? [{ field: 'status', operator: 'eq', value: statusFilter }] : []
      const result = await loanApplicationRepo.findMany({ page, pageSize: PAGE_SIZE, filter: filter.length > 0 ? filter : undefined, sort: [{ field: 'applicationDate', direction: 'desc' }] })
      if ('items' in result) { setApps(result.items as LoanApplication[]); setTotal(result.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { loadApps() }, [loadApps])
  useEffect(() => { setPage(1) }, [statusFilter])

  async function handleApprove(app: LoanApplication) {
    setApproving(app.id)
    try {
      await loanApplicationRepo.update(app.id, { version: app.version, status: 'approved', approvedBy: 'admin', approvedAt: Date.now() } as any)
      loadApps()
    } catch (error) { console.error(error) }
    finally { setApproving(null) }
  }

  async function handleReject(app: LoanApplication) {
    try {
      await loanApplicationRepo.update(app.id, { version: app.version, status: 'rejected' } as any)
      loadApps()
    } catch (error) { console.error(error) }
  }

  async function handleDisburse(app: LoanApplication) {
    try {
      const amort = LoanService.computeDiminishingAmortization(app.amountApproved ?? app.amountApplied, disburseData.interestRate, disburseData.term)
      await loanRepo.create({
        tenantId: 'default', borrowerId: app.borrowerId, loanNumber: disburseData.loanNumber,
        applicationId: app.id, productId: app.productId,
        principalAmount: app.amountApproved ?? app.amountApplied,
        interestRate: disburseData.interestRate, interestType: 'diminishing',
        term: disburseData.term, termUnit: 'months', frequency: 'monthly',
        totalAmount: amort.totalAmount, installmentAmount: amort.monthlyPayment,
        interestAmount: amort.totalInterest, status: 'disbursed',
        releaseDate: Date.now(), encodedBy: 'admin',
        createdBy: 'admin', updatedBy: 'admin',
      } as any)
      await loanApplicationRepo.update(app.id, { version: app.version, status: 'approved', approvedAt: Date.now() } as any)
      setShowDisburse(null)
      navigate({ to: '/loans' })
    } catch (error) { console.error(error) }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Loan Applications" description={`${total} application${total !== 1 ? 's' : ''} received`}
          action={<Link to="/loan-applications/new"><Button icon={<Plus className="h-4 w-4" />}>New Application</Button></Link>} />

        <div className="mb-4 flex gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Borrower</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Purpose</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                  ))}</tr>
                ))
              ) : apps.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No loan applications yet</td></tr>
              ) : apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(app.applicationDate).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{app.borrowerId}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">₱{app.amountApplied.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge color={
                      app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' :
                      app.status === 'under_review' ? 'yellow' : 'blue'
                    } size="sm">{LOAN_APPLICATION_STATUS_LABELS[app.status]}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{app.purpose || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {app.status === 'submitted' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(app)} loading={approving === app.id}
                          icon={<CheckCircle className="h-4 w-4 text-green-600" />}>Approve</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReject(app)}
                          icon={<XCircle className="h-4 w-4 text-red-600" />}>Reject</Button>
                      </div>
                    )}
                    {app.status === 'approved' && (
                      <Button size="sm" onClick={() => setShowDisburse(app.id)} icon={<Plus className="h-4 w-4" />}>Disburse</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className="mt-4 flex justify-between">
            <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / PAGE_SIZE)}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(p => p + 1)} icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Disburse Modal */}
      <Modal open={!!showDisburse} onClose={() => setShowDisburse(null)}
        title="Disburse Loan" description="Convert approved application to a loan" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowDisburse(null)}>Cancel</Button>
          <Button onClick={() => handleDisburse(apps.find(a => a.id === showDisburse)!)} icon={<Save className="h-4 w-4" />}>Disburse Now</Button></>}>
        <div className="space-y-3">
          <Input label="Loan Number" required placeholder="LN-2026-0001" value={disburseData.loanNumber}
            onChange={(e) => setDisburseData(d => ({ ...d, loanNumber: e.target.value }))} />
          <Input label="Interest Rate (%)" type="number" value={String(disburseData.interestRate)}
            onChange={(e) => setDisburseData(d => ({ ...d, interestRate: Number(e.target.value) }))} />
          <Input label="Term (months)" type="number" value={String(disburseData.term)}
            onChange={(e) => setDisburseData(d => ({ ...d, term: Number(e.target.value) }))} />
        </div>
      </Modal>
    </div>
  )
}
