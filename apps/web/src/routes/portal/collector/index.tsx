/**
 * ─── Collector Portal — Field Collection Dashboard ──────────
 * Daily collection sheet, route optimization, and remittance.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { loanRepo, paymentRepo, remittanceRepo, collectionLogRepo, collectorRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { CollectionService } from '@repo/entity-collection'
import { Save, DollarSign, ClipboardList, ArrowUpCircle, MapPin, ChevronRight, CheckCircle } from 'lucide-react'

export function CollectorPortal() {
  const { user } = useAuth()
  const collectorId = user?.collectorId ?? 'c1'
  const [loans, setLoans] = useState<any[]>([])
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [dailyLog, setDailyLog] = useState<any>(null)
  const [showRemit, setShowRemit] = useState(false)
  const [remitAmount, setRemitAmount] = useState(0)
  const [collector, setCollector] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [loanRes, collectorRes] = await Promise.all([
          loanRepo.findMany({ page: 1, pageSize: 200, filter: [{ field: 'collectorId', operator: 'eq', value: collectorId }], sort: [{ field: 'updatedAt', direction: 'desc' }] }),
          collectorRepo.findById(collectorId),
        ])
        if ('items' in loanRes) setLoans(loanRes.items)
        setCollector(collectorRes)
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [collectorId])

  async function handlePayment() {
    if (!selectedLoan) return
    setSavingPayment(true)
    try {
      await paymentRepo.create({
        loanId: selectedLoan.id, borrowerId: selectedLoan.borrowerId,
        collectorId, amount: paymentAmount, paymentDate: Date.now(),
        paymentType: 'regular', tenantId: 'default', createdBy: collectorId, updatedBy: collectorId,
      })
      await loanRepo.update(selectedLoan.id, {
        version: selectedLoan.version, dpd: 0, isDelinquent: false, lastPaymentDate: Date.now(),
      })
      setShowPayment(false)
      const r = await loanRepo.findMany({ page: 1, pageSize: 200, filter: [{ field: 'collectorId', operator: 'eq', value: collectorId }] })
      if ('items' in r) setLoans(r.items)
    } catch (error) { console.error(error) }
    finally { setSavingPayment(false) }
  }

  async function handleRemit() {
    setSavingPayment(true)
    try {
      await remittanceRepo.create({
        collectorId, amount: remitAmount, remittanceDate: Date.now(),
        status: 'pending', tenantId: 'default', createdBy: collectorId, updatedBy: collectorId,
      })
      setShowRemit(false)
    } catch (error) { console.error(error) }
    finally { setSavingPayment(false) }
  }

  const activeLoans = loans.filter((l: any) => l.status === 'active' || l.status === 'disbursed')
  const todaysTotal = activeLoans.reduce((s: number, l: any) => s + (l.installmentAmount ?? 0), 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Collection Dashboard — {collector?.fullName ?? collectorId}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          · {activeLoans.length} assigned loans · Today's target: ₱{todaysTotal.toLocaleString()}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-3">
        <Button onClick={() => setShowRemit(true)} icon={<ArrowUpCircle className="h-4 w-4" />}>Submit Remittance</Button>
      </div>

      {/* Route / Collection Sheet */}
      <Card>
        <CardHeader title="Collection Sheet" description="Today's collection route — ordered by route index">
          <div className="flex gap-2">
            <Badge color="green">{activeLoans.length} stops</Badge>
            <Badge color="blue">₱{todaysTotal.toLocaleString()} expected</Badge>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading collection sheet...</div>
        ) : activeLoans.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">No loans assigned for collection today</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 sticky top-0 bg-white">
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2 pr-2">Borrower</th>
                <th className="pb-2 pr-2">Loan #</th>
                <th className="pb-2 pr-2 text-right">Installment</th>
                <th className="pb-2 pr-2 text-center">DPD</th>
                <th className="pb-2 pr-2 text-center">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {activeLoans.map((loan: any, i: number) => (
                  <tr key={loan.id} className={loan.isDelinquent ? 'bg-red-50' : ''}>
                    <td className="py-2 pr-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-2 font-medium">{loan.borrowerId}</td>
                    <td className="py-2 pr-2 font-mono text-xs">{loan.loanNumber}</td>
                    <td className="py-2 pr-2 text-right font-medium">₱{loan.installmentAmount?.toLocaleString()}</td>
                    <td className="py-2 pr-2 text-center">
                      {loan.isDelinquent ? <span className="text-red-600 font-medium">{loan.dpd}d</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <Badge color={loan.status === 'active' ? 'green' : 'gray'} size="sm">{loan.status}</Badge>
                    </td>
                    <td className="py-2 text-right">
                      <Button size="sm" variant="outline"
                        onClick={() => { setSelectedLoan(loan); setPaymentAmount(loan.installmentAmount ?? 0); setShowPayment(true) }}
                        icon={<DollarSign className="h-3 w-3" />}>
                        Collect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Collect Payment Modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)}
        title="Record Payment" description={`Loan ${selectedLoan?.loanNumber} — ${selectedLoan?.borrowerId}`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowPayment(false)}>Cancel</Button>
          <Button onClick={handlePayment} loading={savingPayment} icon={<Save className="h-4 w-4" />}>Record Payment</Button></>}>
        <div className="space-y-3">
          <Input label="Amount (₱)" type="number" value={String(paymentAmount)}
            onChange={(e) => setPaymentAmount(Number(e.target.value))} />
          <p className="text-xs text-gray-400">Suggested: ₱{selectedLoan?.installmentAmount?.toLocaleString()} (installment amount)</p>
        </div>
      </Modal>

      {/* Remittance Modal */}
      <Modal open={showRemit} onClose={() => setShowRemit(false)}
        title="Submit Remittance" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowRemit(false)}>Cancel</Button>
          <Button onClick={handleRemit} loading={savingPayment} icon={<ArrowUpCircle className="h-4 w-4" />}>Submit</Button></>}>
        <div className="space-y-3">
          <Input label="Amount (₱)" type="number" value={String(remitAmount)}
            onChange={(e) => setRemitAmount(Number(e.target.value))} />
          <p className="text-xs text-gray-400">Total collected today: ₱{todaysTotal.toLocaleString()}</p>
        </div>
      </Modal>
    </div>
  )
}
