/**
 * ─── Water Station Deliveries ────────────────────────────────
 * Track water delivery transactions, container management, and payments.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { wsDeliveryRepo, wsContainerRepo, wsPaymentRepo, wsCustomerRepo } from '../../lib/db'
import { Plus, Search, ChevronLeft, ChevronRight, Save, Truck, Droplets, Container, Receipt } from 'lucide-react'

export function WsDeliveriesPage() {
  const [tab, setTab] = useState<'deliveries' | 'containers' | 'payments'>('deliveries')
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [containers, setContainers] = useState<any[]>([])
  const [wsPayments, setWsPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delivery form
  const [delForm, setDelForm] = useState({ customerId: '', gallons: 0, pricePerGallon: 40, totalAmount: 0 })
  // Container form
  const [conForm, setConForm] = useState({ customerId: '', containerType: '', quantityOwned: 0, quantityLoaned: 0 })
  // Payment form
  const [payForm, setPayForm] = useState({ customerId: '', deliveryId: '', amount: 0, paymentMethod: 'cash' })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      wsDeliveryRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'deliveryDate', direction: 'desc' }] }),
      wsContainerRepo.findMany({ page: 1, pageSize: 100 }),
      wsPaymentRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'paymentDate', direction: 'desc' }] }),
    ]).then(([d, c, p]) => {
      if ('items' in d) setDeliveries(d.items)
      if ('items' in c) setContainers(c.items)
      if ('items' in p) setWsPayments(p.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreateDelivery(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const totalAmount = delForm.gallons * delForm.pricePerGallon
      await wsDeliveryRepo.create({
        ...delForm, totalAmount, deliveryDate: Date.now(), status: 'delivered',
        tenantId: 'default', createdBy: 'admin', updatedBy: 'admin',
      })
      setShowModal(false); setDelForm({ customerId: '', gallons: 0, pricePerGallon: 40, totalAmount: 0 })
      const r = await wsDeliveryRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'deliveryDate', direction: 'desc' }] })
      if ('items' in r) setDeliveries(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  async function handleCreateContainer(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await wsContainerRepo.create({ ...conForm, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setConForm({ customerId: '', containerType: '', quantityOwned: 0, quantityLoaned: 0 })
      const r = await wsContainerRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setContainers(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await wsPaymentRepo.create({ ...payForm, paymentDate: Date.now(), tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setPayForm({ customerId: '', deliveryId: '', amount: 0, paymentMethod: 'cash' })
      const r = await wsPaymentRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'paymentDate', direction: 'desc' }] })
      if ('items' in r) setWsPayments(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const totalDelivered = deliveries.reduce((s: number, d: any) => s + (d.gallons ?? 0), 0)
  const totalRevenue = deliveries.reduce((s: number, d: any) => s + (d.totalAmount ?? 0), 0)

  const tabs = [
    { id: 'deliveries' as const, label: 'Deliveries', icon: <Truck className="h-4 w-4" />, count: deliveries.length },
    { id: 'containers' as const, label: 'Containers', icon: <Container className="h-4 w-4" />, count: containers.length },
    { id: 'payments' as const, label: 'Payments', icon: <Receipt className="h-4 w-4" />, count: wsPayments.length },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Water Station</h1>
        <p className="text-sm text-gray-500">{totalDelivered.toLocaleString()} gallons delivered · ₱{totalRevenue.toLocaleString()} revenue</p>
      </div>

      <div className="mb-6 flex gap-3">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{t.icon} {t.label} <Badge color="blue" size="sm">{t.count}</Badge></button>
        ))}
      </div>

      <Card>
        <CardHeader title={tab === 'deliveries' ? 'Deliveries' : tab === 'containers' ? 'Containers' : 'Payments'}
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>
            {tab === 'deliveries' ? 'New Delivery' : tab === 'containers' ? 'Add Container' : 'Record Payment'}</Button>} />

        {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : (
          <>
            {tab === 'deliveries' && (deliveries.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No deliveries recorded</p>
            ) : (
              <div className="space-y-2">
                {deliveries.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2"><Droplets className="h-4 w-4 text-blue-600" /></div>
                      <div>
                        <p className="font-medium text-gray-900">{d.customerId}</p>
                        <p className="text-xs text-gray-500">{new Date(d.deliveryDate).toLocaleDateString()} · {d.gallons} gal @ ₱{d.pricePerGallon}/gal</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₱{(d.totalAmount ?? 0).toLocaleString()}</p>
                      <Badge color={d.status === 'delivered' ? 'green' : 'yellow'} size="sm">{d.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {tab === 'containers' && (containers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No containers tracked</p>
            ) : (
              <div className="space-y-2">
                {containers.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                    <div><p className="font-medium text-gray-900">{c.customerId}</p><p className="text-xs text-gray-500">{c.containerType}</p></div>
                    <div className="text-right text-sm"><p>Owned: <strong>{c.quantityOwned}</strong></p><p>Loaned: <strong>{c.quantityLoaned}</strong></p></div>
                  </div>
                ))}
              </div>
            ))}

            {tab === 'payments' && (wsPayments.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {wsPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                    <div><p className="font-medium text-gray-900">{p.customerId}</p><p className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()} · {p.paymentMethod}</p></div>
                    <p className="font-bold text-green-600">₱{(p.amount ?? 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={tab === 'deliveries' ? 'New Delivery' : tab === 'containers' ? 'Add Container' : 'Record Payment'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={tab === 'deliveries' ? handleCreateDelivery : tab === 'containers' ? handleCreateContainer : handleCreatePayment}
            loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          {tab === 'deliveries' && (
            <><Input label="Customer ID" required value={delForm.customerId} onChange={(e) => setDelForm(f => ({ ...f, customerId: e.target.value }))} />
              <Input label="Gallons" type="number" required value={String(delForm.gallons)} onChange={(e) => setDelForm(f => ({ ...f, gallons: Number(e.target.value) }))} />
              <Input label="Price per Gallon (₱)" type="number" value={String(delForm.pricePerGallon)} onChange={(e) => setDelForm(f => ({ ...f, pricePerGallon: Number(e.target.value) }))} />
              <p className="text-xs text-gray-400">Total: ₱{(delForm.gallons * delForm.pricePerGallon).toLocaleString()}</p></>
          )}
          {tab === 'containers' && (
            <><Input label="Customer ID" required value={conForm.customerId} onChange={(e) => setConForm(f => ({ ...f, customerId: e.target.value }))} />
              <Input label="Container Type" required value={conForm.containerType} onChange={(e) => setConForm(f => ({ ...f, containerType: e.target.value }))} />
              <Input label="Quantity Owned" type="number" value={String(conForm.quantityOwned)} onChange={(e) => setConForm(f => ({ ...f, quantityOwned: Number(e.target.value) }))} />
              <Input label="Quantity Loaned" type="number" value={String(conForm.quantityLoaned)} onChange={(e) => setConForm(f => ({ ...f, quantityLoaned: Number(e.target.value) }))} /></>
          )}
          {tab === 'payments' && (
            <><Input label="Customer ID" required value={payForm.customerId} onChange={(e) => setPayForm(f => ({ ...f, customerId: e.target.value }))} />
              <Input label="Delivery ID (optional)" value={payForm.deliveryId} onChange={(e) => setPayForm(f => ({ ...f, deliveryId: e.target.value }))} />
              <Input label="Amount" type="number" required value={String(payForm.amount)} onChange={(e) => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))} />
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={payForm.paymentMethod} onChange={(e) => setPayForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="cash">Cash</option><option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option><option value="credit">Credit</option>
                </select></div></>
          )}
        </form>
      </Modal>
    </div>
  )
}
