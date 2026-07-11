/**
 * ─── File Cases Page ─────────────────────────────────────────
 * Legal case tracking for delinquent loans.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { fileCaseRepo } from '../../lib/db'
import { Plus, Search, ChevronLeft, ChevronRight, Save, Scale } from 'lucide-react'

const PAGE_SIZE = 20

export function FileCasesListPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ loanId: '', borrowerId: '', caseNumber: '', notes: '' })

  useEffect(() => {
    setLoading(true)
    const filter: any[] = statusFilter ? [{ field: 'status', operator: 'eq', value: statusFilter }] : []
    fileCaseRepo.findMany({ page, pageSize: PAGE_SIZE, filter: filter.length > 0 ? filter : undefined, sort: [{ field: 'filedDate', direction: 'desc' }] })
      .then(r => { if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await fileCaseRepo.create({ ...form, status: 'open', filedDate: Date.now(), tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ loanId: '', borrowerId: '', caseNumber: '', notes: '' })
      const r = await fileCaseRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'filedDate', direction: 'desc' }] })
      if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const statusColors: Record<string, 'red' | 'green' | 'yellow' | 'blue'> = { open: 'red', resolved: 'green', dismissed: 'gray' }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="File Cases" description="Legal case tracking for delinquent loans"
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>New Case</Button>} />
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search case number or borrower..." className="pl-10" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All</option><option value="open">Open</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Case #</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Borrower</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Loan ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Filed Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>))}</tr>
            )) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No file cases</td></tr>
            ) : items.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">{c.caseNumber}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{c.borrowerId}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.loanId?.slice(0, 8)}...</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(c.filedDate).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-3"><Badge color={statusColors[c.status] ?? 'gray'}>{c.status}</Badge></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New File Case" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>File Case</Button></>}>
        <form className="space-y-3">
          <Input label="Case Number" required value={form.caseNumber} onChange={(e) => setForm(f => ({ ...f, caseNumber: e.target.value }))} />
          <Input label="Borrower ID" required value={form.borrowerId} onChange={(e) => setForm(f => ({ ...f, borrowerId: e.target.value }))} />
          <Input label="Loan ID" value={form.loanId} onChange={(e) => setForm(f => ({ ...f, loanId: e.target.value }))} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
