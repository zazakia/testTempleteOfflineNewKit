/**
 * ─── Payments Page ───────────────────────────────────────────
 * Record and track loan payments with receipt generation.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { paymentRepo, loanRepo } from '../../lib/db'
import type { Payment } from '@repo/entity-loan'
import { Plus, Search, ChevronLeft, ChevronRight, Save, Receipt } from 'lucide-react'

const PAGE_SIZE = 20

export function PaymentListPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ loanId: '', amount: 0, paymentDate: Date.now(), receiptNumber: '' })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    setLoading(true)
    paymentRepo.findMany({
      page, pageSize: PAGE_SIZE, search: search || undefined,
      sort: [{ field: 'paymentDate', direction: 'desc' }],
    }).then(result => {
      if ('items' in result) { setPayments(result.items as Payment[]); setTotal(result.total ?? 0) }
    }).finally(() => setLoading(false))
  }, [page, search])

  async function handleRecordPayment() {
    setSaving(true)
    try {
      const payment = await paymentRepo.create({
        loanId: form.loanId, amount: form.amount, paymentDate: form.paymentDate,
        receiptNumber: form.receiptNumber || undefined,
        paymentType: 'regular', tenantId: 'default',
        createdBy: 'system', updatedBy: 'system',
      } as any)
      // Update loan balance
      const loan = await loanRepo.findById(form.loanId)
      if (loan) {
        await loanRepo.update(form.loanId, {
          version: loan.version, dpd: 0, isDelinquent: false, lastPaymentDate: form.paymentDate,
        } as any)
      }
      setShowModal(false)
      setForm({ loanId: '', amount: 0, paymentDate: Date.now(), receiptNumber: '' })
      setPage(1)
      // Reload
      const result = await paymentRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'paymentDate', direction: 'desc' }] })
      if ('items' in result) { setPayments(result.items as Payment[]); setTotal(result.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Payment Collections" description={`${total} payment${total !== 1 ? 's' : ''} recorded`}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Record Payment</Button>} />

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search by loan ID or receipt..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Loan ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Borrower</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Receipt #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                  ))}</tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  {search ? 'No payments match your search' : 'No payments recorded yet'}
                </td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">{p.loanId?.slice(0, 8)}...</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{p.borrowerId || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">₱{p.amount.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm capitalize text-gray-500">{p.paymentType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400">{p.receiptNumber || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                icon={<ChevronLeft className="h-4 w-4" />}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title="Record Payment" description="Enter payment details" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleRecordPayment} loading={saving} icon={<Save className="h-4 w-4" />}>Save Payment</Button>
        </>}>
        <div className="space-y-3">
          <Input label="Loan ID" required value={form.loanId}
            onChange={(e) => setForm(f => ({ ...f, loanId: e.target.value }))} />
          <Input label="Amount (₱)" type="number" required value={String(form.amount)}
            onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Payment Date" type="date" value={String(form.paymentDate)}
            onChange={(e) => setForm(f => ({ ...f, paymentDate: new Date(e.target.value).getTime() }))} />
          <Input label="Receipt Number" value={form.receiptNumber}
            onChange={(e) => setForm(f => ({ ...f, receiptNumber: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
