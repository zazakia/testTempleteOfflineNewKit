/**
 * ─── Encoder Portal ─────────────────────────────────────────
 * Unified dashboard for loan, payment, and expense encoders.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { loanRepo, paymentRepo, expenseRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { Plus, Save, ScrollText, Receipt, Wallet, CheckCircle } from 'lucide-react'

export function EncoderPortal() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'loan' | 'payment' | 'expense'>('payment')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Payment form
  const [payForm, setPayForm] = useState({ loanId: '', amount: 0, receiptNumber: '' })
  // Expense form
  const [expForm, setExpForm] = useState({ category: '', description: '', amount: 0, payee: '' })

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await paymentRepo.create({
        ...payForm, paymentDate: Date.now(), paymentType: 'regular',
        tenantId: 'default', createdBy: user?.id ?? 'encoder', updatedBy: user?.id ?? 'encoder',
      })
      setShowModal(false); setPayForm({ loanId: '', amount: 0, receiptNumber: '' })
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  async function handleExpense(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await expenseRepo.create({
        ...expForm, expenseDate: Date.now(),
        tenantId: 'default', encodedBy: user?.id ?? 'encoder', createdBy: user?.id ?? 'encoder', updatedBy: user?.id ?? 'encoder',
      })
      setShowModal(false); setExpForm({ category: '', description: '', amount: 0, payee: '' })
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Encoder Portal — {user?.fullName ?? 'Encoder'}</h1>

      <div className="mb-6 flex gap-3">
        {(['payment', 'loan', 'expense'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
            {t === 'payment' ? <Receipt className="h-4 w-4" /> : t === 'loan' ? <ScrollText className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            {t === 'payment' ? 'Record Payment' : t === 'loan' ? 'Encode Loan' : 'Record Expense'}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={tab === 'payment' ? 'Quick Payment' : tab === 'loan' ? 'Quick Loan' : 'Quick Expense'}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New</Button>} />
        
        <div className="py-12 text-center text-gray-400">
          <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-3" />
          <p className="text-lg font-medium text-gray-500">Quick Encoding Tool</p>
          <p className="mt-1 text-sm">
            {tab === 'payment' ? 'Record payments against loans with receipt numbers.' :
             tab === 'loan' ? 'Encode new loan applications for members.' :
             'Record cooperative expenses with categories.'}
          </p>
          <p className="mt-2 text-xs text-gray-300">Click "New" above to start encoding.</p>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={tab === 'payment' ? 'Record Payment' : tab === 'loan' ? 'New Loan' : 'Record Expense'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={tab === 'expense' ? handleExpense : handlePayment} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          {tab === 'payment' && (
            <><Input label="Loan ID" required value={payForm.loanId} onChange={(e) => setPayForm(f => ({ ...f, loanId: e.target.value }))} />
              <Input label="Amount" type="number" required value={String(payForm.amount)} onChange={(e) => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))} />
              <Input label="Receipt #" value={payForm.receiptNumber} onChange={(e) => setPayForm(f => ({ ...f, receiptNumber: e.target.value }))} /></>
          )}
          {tab === 'expense' && (
            <><Input label="Category" required value={expForm.category} onChange={(e) => setExpForm(f => ({ ...f, category: e.target.value }))} />
              <Input label="Description" value={expForm.description} onChange={(e) => setExpForm(f => ({ ...f, description: e.target.value }))} />
              <Input label="Payee" value={expForm.payee} onChange={(e) => setExpForm(f => ({ ...f, payee: e.target.value }))} />
              <Input label="Amount" type="number" required value={String(expForm.amount)} onChange={(e) => setExpForm(f => ({ ...f, amount: Number(e.target.value) }))} /></>
          )}
          {tab === 'loan' && (
            <p className="text-sm text-gray-500">Use the <strong>Loan Applications</strong> or <strong>Loans</strong> section in the main navigation for full loan encoding.</p>
          )}
        </form>
      </Modal>
    </div>
  )
}
