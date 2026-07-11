/**
 * ─── Water Station Customers ─────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { wsCustomerRepo } from '../../lib/db'
import { Plus, Search, ChevronLeft, ChevronRight, Save, Droplets } from 'lucide-react'

export function WsCustomersPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', isMember: false, memberId: '' })

  useEffect(() => {
    setLoading(true)
    wsCustomerRepo.findMany({ page, pageSize: 20, search: search || undefined })
      .then(r => { if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await wsCustomerRepo.create({ ...form, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ name: '', phone: '', address: '', isMember: false, memberId: '' })
      const r = await wsCustomerRepo.findMany({ page: 1, pageSize: 20 })
      if ('items' in r) { setItems(r.items); setTotal(r.total ?? 0) }
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Water Station Customers" description={`${total} customers`}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Customer</Button>} />
        <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="space-y-2">
          {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No water station customers yet</p>
          ) : items.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2"><Droplets className="h-5 w-5 text-blue-600" /></div>
                <div><p className="font-medium text-gray-900">{c.name}</p><p className="text-sm text-gray-500">{c.phone || c.address || '—'}</p></div>
              </div>
              <Badge color={c.isMember ? 'green' : 'gray'}>{c.isMember ? 'Member' : 'Non-member'}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add WS Customer" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          <Input label="Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
