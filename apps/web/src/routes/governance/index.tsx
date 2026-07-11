/**
 * ─── Governance Page ─────────────────────────────────────────
 * Committees, board resolutions, and meeting attendance.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { committeeRepo, boardResolutionRepo } from '../../lib/db'
import { Plus, Save, UsersRound, FileText, CalendarDays } from 'lucide-react'

export function GovernancePage() {
  const [tab, setTab] = useState<'committees' | 'resolutions'>('committees')
  const [committees, setCommittees] = useState<any[]>([])
  const [resolutions, setResolutions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', type: '', resolutionNumber: '', title: '', description: '' })

  useEffect(() => {
    committeeRepo.findMany({ page: 1, pageSize: 100 }).then(r => { if ('items' in r) setCommittees(r.items) })
    boardResolutionRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'resolutionDate', direction: 'desc' }] }).then(r => {
      if ('items' in r) setResolutions(r.items)
    })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (tab === 'committees') {
        await committeeRepo.create({ ...form, is_active: true, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      } else {
        await boardResolutionRepo.create({
          resolutionNumber: form.resolutionNumber, title: form.title, description: form.description,
          resolutionDate: Date.now(), status: 'active', tenantId: 'default', createdBy: 'admin', updatedBy: 'admin',
        })
      }
      setShowModal(false); setForm({ name: '', type: '', resolutionNumber: '', title: '', description: '' })
      const r = await committeeRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setCommittees(r.items)
      const rr = await boardResolutionRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in rr) setResolutions(rr.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const tabs = [
    { id: 'committees' as const, label: 'Committees', icon: <UsersRound className="h-4 w-4" /> },
    { id: 'resolutions' as const, label: 'Board Resolutions', icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
            }`}>{t.icon} {t.label}</button>
        ))}
      </div>

      <Card>
        <CardHeader title={tab === 'committees' ? 'Committees' : 'Board Resolutions'}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>
            {tab === 'committees' ? 'Add Committee' : 'New Resolution'}</Button>} />

        {tab === 'committees' ? (
          <div className="space-y-2">
            {committees.length === 0 ? <p className="py-8 text-center text-gray-400">No committees defined</p> :
              committees.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                  <div><p className="font-medium text-gray-900">{c.name}</p><p className="text-sm text-gray-500 capitalize">{c.type || 'General'}</p></div>
                  <Badge color={c.is_active !== false ? 'green' : 'gray'}>{c.is_active !== false ? 'Active' : 'Inactive'}</Badge>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="space-y-2">
            {resolutions.length === 0 ? <p className="py-8 text-center text-gray-400">No board resolutions</p> :
              resolutions.map((r: any) => (
                <div key={r.id} className="rounded-lg border bg-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium text-gray-900">{r.resolutionNumber} — {r.title}</p>
                      <p className="text-sm text-gray-500">{r.description?.slice(0, 100)}</p></div>
                    <Badge color={r.status === 'active' ? 'green' : 'gray'}>{r.status}</Badge>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={tab === 'committees' ? 'Add Committee' : 'New Board Resolution'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          {tab === 'committees' ? (
            <><Input label="Committee Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Type" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} /></>
          ) : (
            <><Input label="Resolution Number" required value={form.resolutionNumber} onChange={(e) => setForm(f => ({ ...f, resolutionNumber: e.target.value }))} />
              <Input label="Title" required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              <Input label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></>
          )}
        </form>
      </Modal>
    </div>
  )
}
