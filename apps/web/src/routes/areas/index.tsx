/**
 * ─── Areas Page ──────────────────────────────────────────────
 * Geographic area management with detail/edit/create views.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { areaRepo } from '../../lib/db'
import { Plus, Save, MapPin } from 'lucide-react'

export function AreasListPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [detailItem, setDetailItem] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', aoId: '' })

  useEffect(() => {
    areaRepo.findMany({ page: 1, pageSize: 100 }).then(r => {
      if ('items' in r) setItems(r.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await areaRepo.create({ ...form, is_active: true, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ name: '', code: '', aoId: '' })
      const r = await areaRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setItems(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  async function handleToggleActive(area: any) {
    await areaRepo.update(area.id, { version: area.version, is_active: !area.is_active })
    const r = await areaRepo.findMany({ page: 1, pageSize: 100 })
    if ('items' in r) setItems(r.items)
  }

  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-600">Total Areas</p>
          <p className="text-2xl font-bold text-blue-700">{items.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-gray-900">{items.filter((a: any) => a.is_active !== false).length}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Areas / Zones" description="Geographic areas for collection routes"
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Area</Button>} />
        {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No areas defined</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((area: any) => (
              <div key={area.id} className="rounded-lg border bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setDetailItem(area)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <p className="font-medium text-gray-900">{area.name}</p>
                  </div>
                  <Badge color={area.is_active !== false ? 'green' : 'gray'}>{area.is_active !== false ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-xs text-gray-400">{area.code ? `Code: ${area.code}` : 'No code'} · AO: {area.aoId || 'Unassigned'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Area" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          <Input label="Area Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Code" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} />
          <Input label="Area Officer ID" value={form.aoId} onChange={(e) => setForm(f => ({ ...f, aoId: e.target.value }))} />
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)}
        title={detailItem?.name ?? 'Area Details'} size="sm"
        footer={<Button variant="secondary" onClick={() => { handleToggleActive(detailItem); setDetailItem(null) }}>
          Toggle Active</Button>}>
        {detailItem && (
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {detailItem.name}</p>
            <p><strong>Code:</strong> {detailItem.code || '—'}</p>
            <p><strong>AO ID:</strong> {detailItem.aoId || '—'}</p>
            <p><strong>Status:</strong> {detailItem.is_active !== false ? 'Active' : 'Inactive'}</p>
            <p><strong>Created:</strong> {new Date(detailItem.createdAt).toLocaleDateString()}</p>
            <p><strong>Version:</strong> v{detailItem.version}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
