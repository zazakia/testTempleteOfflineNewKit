/**
 * ─── Cash on Hand Page ───────────────────────────────────────
 * Track physical cash holdings and transactions.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { cashTransactionRepo } from '../../lib/db'
import { Plus, Search, Save, Wallet } from 'lucide-react'

export function CashOnHandPage() {
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ particulars: '', type: 'receipt' as const, amount: 0, remarks: '' })

  useEffect(() => {
    cashTransactionRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'transactionDate', direction: 'desc' }] })
      .then(r => { if ('items' in r) setTxns(r.items) })
      .finally(() => setLoading(false))
  }, [])

  const balance = txns.reduce((s: number, t: any) => {
    if (t.type === 'receipt' || t.type === 'collection') return s + t.amount
    if (t.type === 'disbursement' || t.type === 'remittance') return s - t.amount
    return s
  }, 0)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await cashTransactionRepo.create({ ...form, transactionDate: Date.now(), tenantId: 'default', recordedBy: 'admin', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ particulars: '', type: 'receipt', amount: 0, remarks: '' })
      const r = await cashTransactionRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'transactionDate', direction: 'desc' }] })
      if ('items' in r) setTxns(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-600">Cash on Hand</p>
          <p className="mt-1 text-2xl font-bold text-green-700">₱{balance.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{txns.length}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Cash Transactions" action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New Transaction</Button>} />
        {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : txns.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No cash transactions recorded</p>
        ) : (
          <div className="space-y-2">
            {txns.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div>
                  <p className="text-sm text-gray-500">{new Date(t.transactionDate).toLocaleDateString()}</p>
                  <p className="font-medium text-gray-900">{t.particulars}</p>
                  {t.remarks && <p className="text-xs text-gray-400">{t.remarks}</p>}
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${t.type === 'receipt' || t.type === 'collection' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'receipt' || t.type === 'collection' ? '+' : '-'}₱{t.amount.toLocaleString()}
                  </p>
                  <Badge color={t.type === 'receipt' || t.type === 'collection' ? 'green' : 'red'} size="sm">{t.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Cash Transaction" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          <Input label="Particulars" required value={form.particulars} onChange={(e) => setForm(f => ({ ...f, particulars: e.target.value }))} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="receipt">Receipt (in)</option><option value="disbursement">Disbursement (out)</option>
              <option value="collection">Collection (in)</option><option value="remittance">Remittance (out)</option>
            </select></div>
          <Input label="Amount" type="number" required value={String(form.amount)} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Remarks" value={form.remarks} onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
