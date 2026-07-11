/**
 * ─── Pending Loan Approvals ──────────────────────────────────
 * Dedicated queue for approving loan applications.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Modal } from '@repo/ui-core'
import { loanApplicationRepo, loanRepo } from '../../lib/db'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react'

export function PendingApprovalPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<any>(null)
  const [showDisburse, setShowDisburse] = useState(false)
  const [disburseLoanNum, setDisburseLoanNum] = useState('')

  useEffect(() => {
    setLoading(true)
    loanApplicationRepo.findMany({
      page, pageSize: 20,
      filter: [{ field: 'status', operator: 'eq', value: 'submitted' }],
      sort: [{ field: 'applicationDate', direction: 'desc' }],
    }).then(r => { if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page])

  async function handleApprove(app: any) {
    await loanApplicationRepo.update(app.id, { version: app.version, status: 'approved', approvedBy: 'admin', approvedAt: Date.now() })
    const r = await loanApplicationRepo.findMany({ page: 1, pageSize: 20, filter: [{ field: 'status', operator: 'eq', value: 'submitted' }] })
    if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
  }
  async function handleReject(app: any) {
    await loanApplicationRepo.update(app.id, { version: app.version, status: 'rejected' })
    const r = await loanApplicationRepo.findMany({ page: 1, pageSize: 20, filter: [{ field: 'status', operator: 'eq', value: 'submitted' }] })
    if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
  }
  async function handleDisburse() {
    if (!detail) return
    await loanRepo.create({
      borrowerId: detail.borrowerId, loanNumber: disburseLoanNum,
      principalAmount: detail.amountApplied, interestRate: 12, interestType: 'diminishing',
      term: 12, termUnit: 'months', frequency: 'monthly',
      totalAmount: detail.amountApplied * 1.12, installmentAmount: Math.round(detail.amountApplied * 1.12 / 12),
      status: 'disbursed', releaseDate: Date.now(),
      applicationId: detail.id, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin',
    } as any)
    await loanApplicationRepo.update(detail.id, { version: detail.version, status: 'approved', approvedAt: Date.now() })
    setShowDisburse(false); setDetail(null)
    const r = await loanApplicationRepo.findMany({ page: 1, pageSize: 20, filter: [{ field: 'status', operator: 'eq', value: 'submitted' }] })
    if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
    setDisburseLoanNum('')
  }

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-semibold text-gray-900">Pending Approvals</h1>
        <p className="text-sm text-gray-500">{total} applications awaiting review</p></div>

      <Card>
        {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
          <div className="py-16 text-center"><CheckCircle className="mx-auto h-12 w-12 text-green-300" />
            <p className="mt-2 text-lg text-gray-500">No pending approvals 🎉</p><p className="text-sm text-gray-400">All caught up!</p></div>
        ) : (
          <div className="space-y-3">
            {items.map((app: any) => (
              <div key={app.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div><p className="font-medium text-gray-900">{app.borrowerId}</p>
                    <p className="text-sm text-gray-500">₱{app.amountApplied.toLocaleString()} · {new Date(app.applicationDate).toLocaleDateString()}</p></div>
                  <Badge color="yellow">Pending</Badge>
                </div>
                {app.purpose && <p className="text-sm text-gray-600 mb-3">"{app.purpose}"</p>}
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setDetail(app)} icon={<Eye className="h-4 w-4" />}>Review</Button>
                  <Button size="sm" onClick={() => { setDetail(app); setShowDisburse(true) }} icon={<CheckCircle className="h-4 w-4" />}>Approve & Disburse</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(app)} icon={<XCircle className="h-4 w-4 text-red-500" />}>Reject</Button>
                </div>
              </div>
            ))}
            {total > 20 && <div className="flex justify-between pt-2"><p className="text-sm text-gray-500">Page {page}</p>
              <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button></div></div>}
          </div>
        )}
      </Card>

      <Modal open={showDisburse} onClose={() => setShowDisburse(false)} title="Disburse Loan" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowDisburse(false)}>Cancel</Button>
          <Button onClick={handleDisburse} icon={<Save className="h-4 w-4" />}>Disburse Now</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Creating loan for <strong>{detail?.borrowerId}</strong> — ₱{detail?.amountApplied?.toLocaleString()}</p>
          <input type="text" placeholder="Loan Number (e.g. LN-2026-0011)" value={disburseLoanNum}
            onChange={(e) => setDisburseLoanNum(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </Modal>
    </div>
  )
}
