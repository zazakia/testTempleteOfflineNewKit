/**
 * ─── Loan Detail Page ────────────────────────────────────────
 * Full loan view with payment schedule, collection history,
 * delinquency tracking, and actions (record payment, restructure).
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Card, CardHeader, Button, Badge, Input, Modal } from '@repo/ui-core'
import { loanRepo, paymentRepo } from '../../lib/db'
import type { Loan, Payment } from '@repo/entity-loan'
import { LOAN_STATUS_LABELS, LOAN_STATUS_COLORS, FREQUENCY_LABELS, LoanService } from '@repo/entity-loan'
import { ChevronLeft, Receipt, AlertTriangle, TrendingUp, Save } from 'lucide-react'

export function LoanDetailPage() {
  const params = useParams({ from: '/loans/$id' })
  const id = (params as any).id ?? ''
  const navigate = useNavigate()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentDate, setPaymentDate] = useState(Date.now())
  const [savingPayment, setSavingPayment] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const [loanResult, paymentResult] = await Promise.all([
          loanRepo.findById(id),
          paymentRepo.findMany({ page: 1, pageSize: 1000, filter: [{ field: 'loanId', operator: 'eq', value: id }] }),
        ])
        setLoan(loanResult)
        if ('items' in paymentResult) setPayments(paymentResult.items as Payment[])
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  async function handleRecordPayment() {
    if (!loan) return
    setSavingPayment(true)
    try {
      await paymentRepo.create({
        loanId: loan.id,
        borrowerId: loan.borrowerId,
        amount: paymentAmount,
        paymentDate,
        paymentType: 'regular',
        tenantId: 'default',
        createdBy: 'system',
        updatedBy: 'system',
      } as any)
      // Update loan DPD
      const dpd = LoanService.computeDPD(paymentDate)
      await loanRepo.update(loan.id, {
        version: loan.version,
        dpd: 0,
        isDelinquent: false,
        lastPaymentDate: paymentDate,
      } as any)
      setShowPaymentModal(false)
      // Reload
      const [updatedLoan, updatedPayments] = await Promise.all([
        loanRepo.findById(id),
        paymentRepo.findMany({ page: 1, pageSize: 1000, filter: [{ field: 'loanId', operator: 'eq', value: id }] }),
      ])
      setLoan(updatedLoan)
      if ('items' in updatedPayments) setPayments(updatedPayments.items as Payment[])
    } catch (error) { console.error(error) }
    finally { setSavingPayment(false) }
  }

  if (loading) return (
    <div className="p-6"><div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-gray-200" /><div className="h-64 rounded-xl bg-gray-200" /></div></div>
  )

  if (!loan) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/loans' })} icon={<ChevronLeft className="h-4 w-4" />}>Back to Loans</Button>
      <div className="mt-8 text-center"><h2 className="text-lg font-semibold text-gray-900">Loan not found</h2></div>
    </div>
  )

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const dpd = LoanService.computeDPD(payments[payments.length - 1]?.paymentDate)
  const agingBucket = LoanService.computeAgingBucket(dpd)
  const isDelinquent = dpd >= 1

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/loans' })}
            icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Loan {loan.loanNumber}</h1>
            <p className="text-sm text-gray-500">Borrower: {loan.borrowerId} · {FREQUENCY_LABELS[loan.frequency]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={LOAN_STATUS_COLORS[loan.status]}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
          {isDelinquent && (
            <Badge color="red">
              <AlertTriangle className="mr-1 h-3 w-3" /> {dpd} days past due
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-2">
        <Button onClick={() => { setPaymentAmount(loan.installmentAmount ?? 0); setShowPaymentModal(true); }}
          icon={<Receipt className="h-4 w-4" />}>Record Payment</Button>
      </div>

      {/* Loan Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Principal" value={`₱${loan.principalAmount?.toLocaleString()}`} />
        <SummaryCard label="Installment" value={`₱${loan.installmentAmount?.toLocaleString()}`} />
        <SummaryCard label="Interest Rate" value={`${loan.interestRate}% (${loan.interestType})`} />
        <SummaryCard label="Term" value={`${loan.term} ${loan.termUnit}`} />
        <SummaryCard label="Total Paid" value={`₱${totalPaid.toLocaleString()}`} color="text-green-600" />
        <SummaryCard label="Balance" value={`₱${Math.max(0, (loan.principalAmount ?? 0) - totalPaid).toLocaleString()}`} />
        <SummaryCard label="Days Past Due" value={`${dpd}`} color={isDelinquent ? 'text-red-600' : 'text-gray-900'} />
        <SummaryCard label="Aging Bucket" value={agingBucket} color={isDelinquent ? 'text-red-600' : 'text-gray-900'} />
      </div>

      {loan.notes && (
        <Card className="mb-6">
          <CardHeader title="Notes" />
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{loan.notes}</p>
        </Card>
      )}

      {/* Payment Schedule & History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment History */}
        <Card>
          <CardHeader title="Payment History" description={`${payments.length} payment${payments.length !== 1 ? 's' : ''} recorded`} />
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No payments recorded yet</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-500">
                  <th className="pb-2 pr-2">Date</th><th className="pb-2 pr-2 text-right">Amount</th><th className="pb-2 pr-2">Type</th><th className="pb-2">Receipt</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.sort((a, b) => b.paymentDate - a.paymentDate).map(p => (
                    <tr key={p.id}>
                      <td className="py-2 pr-2 text-gray-900">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="py-2 pr-2 text-right font-medium text-gray-900">₱{p.amount.toLocaleString()}</td>
                      <td className="py-2 pr-2 text-gray-500 capitalize">{p.paymentType}</td>
                      <td className="py-2 text-gray-400">{p.receiptNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader title="Loan Details" />
          <dl className="space-y-3">
            <DetailItem label="Release Date" value={loan.releaseDate ? new Date(loan.releaseDate).toLocaleDateString() : '—'} />
            <DetailItem label="First Payment" value={loan.firstPaymentDate ? new Date(loan.firstPaymentDate).toLocaleDateString() : '—'} />
            <DetailItem label="Maturity Date" value={loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : '—'} />
            <DetailItem label="Collector" value={loan.collectorId || 'Not assigned'} />
            <DetailItem label="Approved By" value={loan.approvedBy || '—'} />
            <DetailItem label="Encoded By" value={loan.encodedBy || '—'} />
            <DetailItem label="Version" value={`v${loan.version}`} />
            <DetailItem label="Created" value={new Date(loan.createdAt).toLocaleDateString()} />
          </dl>
        </Card>
      </div>

      {/* Record Payment Modal */}
      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)}
        title="Record Payment" description={`Loan ${loan.loanNumber} — ${loan.borrowerId}`} size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} loading={savingPayment} icon={<Save className="h-4 w-4" />}>Save Payment</Button>
          </>
        }>
        <div className="space-y-4">
          <Input label="Amount (₱)" type="number" value={String(paymentAmount)}
            onChange={(e) => setPaymentAmount(Number(e.target.value))} />
          <Input label="Payment Date" type="date" value={String(paymentDate)}
            onChange={(e) => setPaymentDate(new Date(e.target.value).getTime())} />
          <p className="text-sm text-gray-500">Suggested: ₱{loan.installmentAmount?.toLocaleString()} (installment amount)</p>
        </div>
      </Modal>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}
