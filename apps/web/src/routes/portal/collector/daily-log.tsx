/**
 * ─── Collector Daily Log ─────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { collectionLogRepo, paymentRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { ChevronLeft, Save, ClipboardList, Clock } from 'lucide-react'

export function CollectorDailyLogPage() {
  const { user } = useAuth()
  const collectorId = user?.collectorId ?? 'c1'
  const [logs, setLogs] = useState<any[]>([])
  const [todayLog, setTodayLog] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ cashOnHandStart: 0, cashOnHandEnd: 0, notes: '' })
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      collectionLogRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'collectorId', operator: 'eq', value: collectorId }], sort: [{ field: 'logDate', direction: 'desc' }] }),
      paymentRepo.findMany({ page: 1, pageSize: 1000, filter: [{ field: 'collectorId', operator: 'eq', value: collectorId }] }),
    ]).then(([l, p]) => {
      if ('items' in l) { setLogs(l.items); const today = l.items.find((log: any) => {
        const logDate = new Date(log.logDate).toDateString()
        return logDate === new Date().toDateString()
      }); setTodayLog(today ?? null) }
      if ('items' in p) setPayments(p.items)
    })
  }, [collectorId])

  const todayTotal = payments.filter((p: any) => new Date(p.paymentDate).toDateString() === new Date().toDateString())
    .reduce((s: number, p: any) => s + p.amount, 0)

  async function handleCreateLog(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await collectionLogRepo.create({
        collectorId, logDate: Date.now(), totalCollected: todayTotal,
        cashOnHandStart: form.cashOnHandStart, cashOnHandEnd: form.cashOnHandEnd,
        notes: form.notes || undefined, tenantId: 'default', createdBy: collectorId, updatedBy: collectorId,
      })
      setShowModal(false)
      const r = await collectionLogRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'collectorId', operator: 'eq', value: collectorId }], sort: [{ field: 'logDate', direction: 'desc' }] })
      if ('items' in r) setLogs(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Daily Collection Log</h1>
      <p className="text-sm text-gray-500 mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-600">Today's Collections</p>
          <p className="text-2xl font-bold text-green-700">₱{todayTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-600">Log Status</p>
          <p className="text-lg font-bold text-blue-700">{todayLog ? '✅ Logged' : '⏳ Open'}</p>
        </div>
      </div>

      {!todayLog && (
        <Button onClick={() => { setForm(f => ({ ...f, cashOnHandStart: todayTotal })); setShowModal(true) }}
          className="mb-6" icon={<Save className="h-4 w-4" />}>End of Day Log</Button>
      )}

      <Card>
        <CardHeader title="Recent Logs" />
        {logs.length === 0 ? <p className="py-8 text-center text-gray-400">No logs yet</p> : (
          <div className="space-y-2">
            {logs.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div><p className="font-medium text-gray-900">{new Date(log.logDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Start: ₱{log.cashOnHandStart?.toLocaleString()} · End: ₱{log.cashOnHandEnd?.toLocaleString()}</p></div>
                <div className="text-right"><p className="font-bold text-gray-900">₱{log.totalCollected?.toLocaleString()}</p>
                  <Badge color={log.cashOnHandEnd >= log.cashOnHandStart ? 'green' : 'red'} size="sm">
                    {log.cashOnHandEnd >= log.cashOnHandStart ? 'Balanced' : 'Variance'}</Badge></div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="End of Day Log" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreateLog} loading={saving} icon={<Save className="h-4 w-4" />}>Save Log</Button></>}>
        <form className="space-y-3">
          <Input label="Cash on Hand (Start)" type="number" value={String(form.cashOnHandStart)} onChange={(e) => setForm(f => ({ ...f, cashOnHandStart: Number(e.target.value) }))} />
          <Input label="Cash on Hand (End)" type="number" value={String(form.cashOnHandEnd)} onChange={(e) => setForm(f => ({ ...f, cashOnHandEnd: Number(e.target.value) }))} />
          <p className="text-xs text-gray-400">Total collected today: ₱{todayTotal.toLocaleString()}</p>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}
