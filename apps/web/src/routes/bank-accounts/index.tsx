/**
 * ─── Bank Accounts Page ──────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Button, Input, Modal } from '@repo/ui-core'
import { bankAccountRepo, bankTransactionRepo } from '../../lib/db'
import { Plus, ChevronLeft, ChevronRight, Save, Landmark } from 'lucide-react'

export function BankAccountListPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ bankName: '', accountName: '', accountNumber: '', startingBalance: 0 })

  useEffect(() => {
    bankAccountRepo.findMany({ page: 1, pageSize: 50 }).then(r => {
      if ('items' in r) setAccounts(r.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await bankAccountRepo.create({ ...form, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ bankName: '', accountName: '', accountNumber: '', startingBalance: 0 })
      const r = await bankAccountRepo.findMany({ page: 1, pageSize: 50 })
      if ('items' in r) setAccounts(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-600">Total Bank Accounts</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{accounts.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            ₱{accounts.reduce((s, a: any) => s + (a.startingBalance ?? 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader title="Bank Accounts" action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Account</Button>} />
        {loading ? <div className="p-4 text-center text-gray-400">Loading...</div> : accounts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No bank accounts yet</div>
        ) : (
          <div className="space-y-3">
            {accounts.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2"><Landmark className="h-5 w-5 text-blue-600" /></div>
                  <div><p className="font-medium text-gray-900">{a.bankName}</p><p className="text-sm text-gray-500">{a.accountName} · {a.accountNumber}</p></div>
                </div>
                <p className="text-lg font-bold text-gray-900">₱{(a.startingBalance ?? 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Bank Account" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Bank Name" required value={form.bankName} onChange={(e) => setForm(f => ({ ...f, bankName: e.target.value }))} />
          <Input label="Account Name" required value={form.accountName} onChange={(e) => setForm(f => ({ ...f, accountName: e.target.value }))} />
          <Input label="Account Number" required value={form.accountNumber} onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
          <Input label="Starting Balance" type="number" value={String(form.startingBalance)} onChange={(e) => setForm(f => ({ ...f, startingBalance: Number(e.target.value) }))} />
        </form>
      </Modal>
    </div>
  )
}
