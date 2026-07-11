/**
 * ─── Daily Collection Sheet ──────────────────────────────────
 * Detailed daily collection sheet for field collectors.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { loanRepo, paymentRepo, collectionLogRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { ChevronLeft, DollarSign, Save, CheckCircle, ClipboardList } from 'lucide-react'

export function DailyCollectionSheetPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const collectorId = user?.collectorId ?? 'c1'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [loans, setLoans] = useState<any[]>([])
  const [collected, setCollected] = useState<Record<string, number>>({})
  const [showModal, setShowModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loanRepo.findMany({ page: 1, pageSize: 200, filter: [{ field: 'collectorId', operator: 'eq', value: collectorId }] }).then(r => {
      if ('items' in r) setLoans(r.items.filter((l: any) => l.status === 'active' || l.status === 'disbursed'))
    })
  }, [collectorId])

  const totalExpected = loans.reduce((s, l) => s + (l.installmentAmount ?? 0), 0)
  const totalCollected = Object.values(collected).reduce((s, v) => s + v, 0)

  async function handleCollect() {
    if (!selectedLoan) return
    setSaving(true)
    try {
      const amount = collected[selectedLoan.id] ?? selectedLoan.installmentAmount ?? 0
      await paymentRepo.create({
        loanId: selectedLoan.id, borrowerId: selectedLoan.borrowerId,
        collectorId, amount, paymentDate: Date.now(), paymentType: 'regular',
        tenantId: 'default', createdBy: collectorId, updatedBy: collectorId,
      })
      await loanRepo.update(selectedLoan.id, { version: selectedLoan.version, dpd: 0, isDelinquent: false, lastPaymentDate: Date.now() })
      setShowModal(false)
      setCollected(c => ({ ...c, [selectedLoan.id]: 0 }))
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/portal/collector' })} icon={<ChevronLeft className="h-4 w-4" />}>Back to Dashboard</Button>
      
      <div className="mt-4 mb-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-semibold text-gray-900">Daily Collection Sheet</h1>
            <p className="text-sm text-gray-500">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
          <div className="text-right"><p className="text-sm text-gray-500">Progress</p>
            <p className="text-lg font-bold text-green-600">₱{totalCollected.toLocaleString()} / ₱{totalExpected.toLocaleString()}</p></div>
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${totalExpected > 0 ? Math.min(100, (totalCollected / totalExpected) * 100) : 0}%` }} />
        </div>
      </div>

      <Card>
        <CardHeader title="Collection Sheet" description={`${loans.length} stops today`} />
        {loans.length === 0 ? (
          <div className="py-12 text-center"><ClipboardList className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-2 text-gray-500">No loans assigned for collection</p></div>
        ) : (
          <div className="space-y-2">
            {loans.map((loan, i) => (
              <div key={loan.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">{i + 1}.</span>
                  <div><p className="font-medium text-gray-900">{loan.borrowerId}</p>
                    <p className="text-xs text-gray-500">{loan.loanNumber} · DPD: {loan.dpd ?? 0}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900">₱{(loan.installmentAmount ?? 0).toLocaleString()}</p>
                  {collected[loan.id] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button size="sm" onClick={() => { setSelectedLoan(loan); setShowModal(true) }}
                      icon={<DollarSign className="h-3 w-3" />}>Collect</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Payment" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCollect} loading={saving} icon={<Save className="h-4 w-4" />}>Record</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Loan: {selectedLoan?.loanNumber} · {selectedLoan?.borrowerId}</p>
          <input type="number" placeholder="Amount" value={selectedLoan ? (collected[selectedLoan.id] ?? selectedLoan.installmentAmount ?? 0) : 0}
            onChange={(e) => selectedLoan && setCollected(c => ({ ...c, [selectedLoan.id]: Number(e.target.value) }))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-lg font-bold" />
        </div>
      </Modal>
    </div>
  )
}
