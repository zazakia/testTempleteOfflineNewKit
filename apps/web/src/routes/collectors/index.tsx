/**
 * ─── Collector List Page ─────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { collectorRepo } from '../../lib/db'
import { CreateCollectorSchema } from '@repo/entity-collection'
import { Plus, Search, ChevronLeft, ChevronRight, Save, UserCheck } from 'lucide-react'

const PAGE_SIZE = 20

export function CollectorListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', areaId: '' })
  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    setLoading(true)
    collectorRepo.findMany({ page, pageSize: PAGE_SIZE, search: search || undefined, sort: [{ field: 'fullName', direction: 'asc' }] })
      .then(r => { if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const parsed = CreateCollectorSchema.parse(form)
      await collectorRepo.create({ ...parsed, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false)
      setForm({ fullName: '', phone: '', email: '', areaId: '' })
      const r = await collectorRepo.findMany({ page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'fullName', direction: 'asc' }] })
      if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Collectors" description={`${total} collector${total !== 1 ? 's' : ''}`}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Collector</Button>} />
        <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search collectors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 4 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>))}</tr>
            )) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">No collectors yet</td></tr>
            ) : items.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.phone || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.email || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3"><Badge color={c.is_active !== false ? 'green' : 'gray'}>{c.is_active !== false ? 'Active' : 'Inactive'}</Badge></td>
              </tr>
            ))}
          </tbody></table>
        </div>
        {totalPages > 1 && <div className="mt-4 flex justify-between"><p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
          </div></div>}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Collector" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Full Name" required value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
