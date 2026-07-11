/**
 * ─── Remittances Page ────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { remittanceRepo, collectorRepo } from '../../lib/db'
import { CreateRemittanceSchema } from '@repo/entity-collection'
import { Plus, Search, ChevronLeft, ChevronRight, Save, CheckCircle, XCircle } from 'lucide-react'

const PAGE_SIZE = 20

export function RemittanceListPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ collectorId: '', amount: 0, remittanceDate: Date.now(), notes: '' })

  useEffect(() => {
    setLoading(true)
    const filter: any[] = statusFilter ? [{ field: 'status', operator: 'eq', value: statusFilter }] : []
    remittanceRepo.findMany({ page, pageSize: PAGE_SIZE, filter: filter.length > 0 ? filter : undefined, sort: [{ field: 'remittanceDate', direction: 'desc' }] })
      .then(r => { if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const parsed = CreateRemittanceSchema.parse(form)
      await remittanceRepo.create({ ...parsed, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ collectorId: '', amount: 0, remittanceDate: Date.now(), notes: '' })
      const r = await remittanceRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'remittanceDate', direction: 'desc' }] })
      if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  async function handleApprove(id: string, version: number) {
    await remittanceRepo.update(id, { version, status: 'approved', approvedBy: 'admin' })
    const r = await remittanceRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'remittanceDate', direction: 'desc' }] })
    if ('items' in r) setItems(r.items)
  }

  const statusColors: Record<string, 'yellow' | 'green' | 'red' | 'blue'> = { pending: 'yellow', verified: 'blue', approved: 'green', rejected: 'red' }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Remittances" description="Collector remittance tracking"
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New Remittance</Button>} />
        <div className="mb-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Collector</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>))}</tr>
            )) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No remittances yet</td></tr>
            ) : items.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(r.remittanceDate).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{r.collectorId}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">₱{r.amount.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3"><Badge color={statusColors[r.status] ?? 'gray'}>{r.status}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {r.status === 'pending' && (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleApprove(r.id, r.version)} icon={<CheckCircle className="h-4 w-4 text-green-600" />}>Approve</Button>
                      <Button variant="ghost" size="sm" icon={<XCircle className="h-4 w-4 text-red-600" />}>Reject</Button>
                    </div>
                  )}
                  {r.status === 'approved' && <span className="text-xs text-green-600">Approved</span>}
                </td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Remittance" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Collector ID" required value={form.collectorId} onChange={(e) => setForm(f => ({ ...f, collectorId: e.target.value }))} />
          <Input label="Amount (₱)" type="number" required value={String(form.amount)} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Date" type="date" value={String(form.remittanceDate)} onChange={(e) => setForm(f => ({ ...f, remittanceDate: new Date(e.target.value).getTime() }))} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
