/**
 * ─── Expenses Page ───────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Button, Input, Modal, Badge } from '@repo/ui-core'
import { expenseRepo, expenseCategoryRepo } from '../../lib/db'
import { Plus, Search, ChevronLeft, ChevronRight, Save } from 'lucide-react'

const PAGE_SIZE = 20

export function ExpensesListPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ category: '', description: '', amount: 0, expenseDate: Date.now(), payee: '' })

  useEffect(() => {
    setLoading(true)
    expenseRepo.findMany({ page, pageSize: PAGE_SIZE, search: search || undefined, sort: [{ field: 'expenseDate', direction: 'desc' }] })
      .then(r => { if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await expenseRepo.create({ ...form, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ category: '', description: '', amount: 0, expenseDate: Date.now(), payee: '' })
      const r = await expenseRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'expenseDate', direction: 'desc' }] })
      if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const totalExpenses = items.reduce((s: number, e: any) => s + e.amount, 0)

  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm text-purple-600">Total Expenses (This Page)</p>
          <p className="mt-1 text-2xl font-bold text-purple-700">₱{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Expenses" action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New Expense</Button>} />
        <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payee</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>))}</tr>
            )) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No expenses recorded</td></tr>
            ) : items.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(e.expenseDate).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-3"><Badge color="purple" size="sm">{e.category}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-[300px] truncate">{e.description || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{e.payee || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">₱{(e.amount ?? 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        {total > PAGE_SIZE && <div className="mt-4 flex justify-between"><p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / PAGE_SIZE)}</p>
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} icon={<ChevronRight className="h-4 w-4" />}>Next</Button></div></div>}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Expense" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Category" required value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Payee" value={form.payee} onChange={(e) => setForm(f => ({ ...f, payee: e.target.value }))} />
          <Input label="Amount (₱)" type="number" required value={String(form.amount)} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Expense Date" type="date" value={String(form.expenseDate)} onChange={(e) => setForm(f => ({ ...f, expenseDate: new Date(e.target.value).getTime() }))} />
        </form>
      </Modal>
    </div>
  )
}
