/**
 * ─── Savings Page ────────────────────────────────────────────
 * Member savings passbook with running balance.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { savingsRepo } from '../../lib/db'
import type { SavingsTransaction } from '@repo/entity-savings'
import { CreateSavingsTransactionSchema, SavingsService, SAVINGS_TYPE_LABELS } from '@repo/entity-savings'
import { Plus, Search, ChevronLeft, ChevronRight, Save } from 'lucide-react'

const PAGE_SIZE = 25

export function SavingsListPage() {
  const [txns, setTxns] = useState<SavingsTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const [form, setForm] = useState({ memberId: '', savingsAccountId: '', type: 'deposit' as const, amount: 0, date: Date.now() })

  const totalBalance = txns.reduce((sum, t) => {
    if (t.type === 'deposit' || t.type === 'interest' || t.type === 'dividend') return sum + t.amount
    if (t.type === 'withdrawal') return sum - t.amount
    return sum
  }, 0)

  useEffect(() => {
    setLoading(true)
    savingsRepo.findMany({
      page, pageSize: PAGE_SIZE, search: search || undefined,
      sort: [{ field: 'date', direction: 'desc' }],
    }).then(r => {
      if ('items' in r) { setTxns(r.items as SavingsTransaction[]); setTotal(r.total ?? 0) }
    }).finally(() => setLoading(false))
  }, [page, search])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const parsed = CreateSavingsTransactionSchema.parse(form)
      await savingsRepo.create({
        ...parsed, tenantId: 'default', recordedBy: 'admin',
        createdBy: 'admin', updatedBy: 'admin',
      } as any)
      setShowModal(false)
      setForm({ memberId: '', savingsAccountId: '', type: 'deposit', amount: 0, date: Date.now() })
      const r = await savingsRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'date', direction: 'desc' }] })
      if ('items' in r) { setTxns(r.items as SavingsTransaction[]); setTotal(r.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      {/* Balance Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-600">Total Savings Balance</p>
          <p className="mt-1 text-2xl font-bold text-green-700">₱{totalBalance.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Savings Passbook" description={`${total} transaction${total !== 1 ? 's' : ''}`}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New Transaction</Button>} />

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search by member ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Deposit</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Withdrawal</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                ))}</tr>
              )) : txns.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No savings transactions yet</td></tr>
              ) : txns.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{tx.memberId}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge color={
                      tx.type === 'deposit' || tx.type === 'interest' ? 'green' :
                      tx.type === 'withdrawal' ? 'red' : 'gray'
                    } size="sm">{SAVINGS_TYPE_LABELS[tx.type]}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-green-600">
                    {(tx.type === 'deposit' || tx.type === 'interest' || tx.type === 'dividend') ? `₱${tx.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-red-600">
                    {tx.type === 'withdrawal' || tx.type === 'transfer_out' ? `₱${tx.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400">{tx.referenceId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title="Record Savings Transaction" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Member ID" required value={form.memberId}
            onChange={(e) => setForm(f => ({ ...f, memberId: e.target.value }))} />
          <Input label="Account ID" required value={form.savingsAccountId}
            onChange={(e) => setForm(f => ({ ...f, savingsAccountId: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm">
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="interest">Interest</option>
            </select>
          </div>
          <Input label="Amount (₱)" type="number" required value={String(form.amount)}
            onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
        </form>
      </Modal>
    </div>
  )
}
