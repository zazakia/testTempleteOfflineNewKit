/**
 * ─── Bank Account Detail ─────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { bankAccountRepo, bankTransactionRepo } from '../../lib/db'
import { ChevronLeft, Plus, Save, Landmark } from 'lucide-react'

export function BankAccountDetailPage() {
  const params = useParams({ from: '/bank-accounts/$id' })
  const id = (params as any).id ?? ''
  const navigate = useNavigate()
  const [account, setAccount] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ transactionDate: Date.now(), type: 'deposit', amount: 0, particulars: '', remarks: '' })

  useEffect(() => {
    if (!id) return
    Promise.all([
      bankAccountRepo.findById(id),
      bankTransactionRepo.findMany({ page: 1, pageSize: 100, filter: [{ field: 'bankAccountId', operator: 'eq', value: id }], sort: [{ field: 'transactionDate', direction: 'desc' }] }),
    ]).then(([a, t]) => {
      setAccount(a)
      if ('items' in t) setTransactions(t.items)
    })
  }, [id])

  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await bankTransactionRepo.create({ ...form, bankAccountId: id, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ transactionDate: Date.now(), type: 'deposit', amount: 0, particulars: '', remarks: '' })
      const r = await bankTransactionRepo.findMany({ page: 1, pageSize: 100, filter: [{ field: 'bankAccountId', operator: 'eq', value: id }], sort: [{ field: 'transactionDate', direction: 'desc' }] })
      if ('items' in r) setTransactions(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  if (!account) return <div className="p-6"><Button variant="ghost" onClick={() => navigate({ to: '/bank-accounts' })} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button><p className="mt-4 text-gray-400">Loading...</p></div>

  const balance = transactions.reduce((s: number, t: any) => {
    return t.type === 'deposit' ? s + t.amount : s - t.amount
  }, account.startingBalance ?? 0)

  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/bank-accounts' })} icon={<ChevronLeft className="h-4 w-4" />}>Back to Accounts</Button>
      
      <div className="mt-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Landmark className="h-8 w-8 text-blue-600" />
          <div><h1 className="text-2xl font-semibold text-gray-900">{account.bankName}</h1>
            <p className="text-sm text-gray-500">{account.accountName} · {account.accountNumber}</p></div>
        </div>
        <div className="text-right"><p className="text-sm text-gray-500">Current Balance</p><p className="text-2xl font-bold text-green-600">₱{balance.toLocaleString()}</p></div>
      </div>

      <Card>
        <CardHeader title="Transactions" description={`${transactions.length} transactions`}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New Transaction</Button>} />
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between border-b border-gray-100 py-2 px-2 hover:bg-gray-50">
                <div><p className="text-sm text-gray-500">{new Date(t.transactionDate).toLocaleDateString()}</p>
                  <p className="text-sm font-medium text-gray-900">{t.particulars}</p></div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'deposit' ? '+' : '-'}₱{t.amount.toLocaleString()}
                  </p>
                  <Badge color={t.type === 'deposit' ? 'green' : 'red'} size="sm">{t.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Bank Transaction" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleTransaction} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select></div>
          <Input label="Amount" type="number" required value={String(form.amount)} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Particulars" required value={form.particulars} onChange={(e) => setForm(f => ({ ...f, particulars: e.target.value }))} />
          <Input label="Remarks" value={form.remarks} onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
