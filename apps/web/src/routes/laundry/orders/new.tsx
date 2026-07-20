/**
 * ─── New Laundry Order ───────────────────────────────────────
 * Drop-off form: customer lookup, service selection, weight/pieces,
 * auto-compute totals, priority selection, print receipt.
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryOrderRepo, laundryCustomerRepo, laundryServiceRepo } from '../../../lib/db'
import type { LaundryCustomer, LaundryService, LaundryOrderItem } from '@repo/entity-laundry'
import {
  SERVICE_CATEGORY_LABELS, PRICING_UNIT_LABELS, ORDER_PRIORITY_LABELS,
} from '@repo/entity-laundry'
import { LaundryOrderService, LaundryCustomerService } from '@repo/entity-laundry'
import {
  Plus, Save, ArrowLeft, Check, Search, X, ShoppingBag, User, Calendar, Clock, Truck,
} from 'lucide-react'

export function CreateLaundryOrderPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Data
  const [services, setServices] = useState<LaundryService[]>([])
  const [customers, setCustomers] = useState<LaundryCustomer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<LaundryCustomer | null>(null)

  // Order form
  const [items, setItems] = useState<(LaundryOrderItem & { _tempId: string })[]>([])
  const [priority, setPriority] = useState<'normal' | 'express' | 'rush'>('normal')
  const [isDelivery, setIsDelivery] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [totalWeight, setTotalWeight] = useState('')
  const [careInstructions, setCareInstructions] = useState('')
  const [notes, setNotes] = useState('')

  // Service selector
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [itemQty, setItemQty] = useState('1')
  const [itemSpecial, setItemSpecial] = useState('')

  const loadData = useCallback(async () => {
    const servRes = await laundryServiceRepo.findMany({ page: 1, pageSize: 200, sort: [{ field: 'sortOrder', direction: 'asc' }] })
    setServices(('items' in servRes ? servRes.items : []) as LaundryService[])
    const custRes = await laundryCustomerRepo.findMany({ page: 1, pageSize: 500, sort: [{ field: 'lastName', direction: 'asc' }] })
    setCustomers(('items' in custRes ? custRes.items : []) as LaundryCustomer[])
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Filtered customers
  const filteredCustomers = customerSearch
    ? customers.filter((c) =>
        c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.phone && c.phone.includes(customerSearch)) ||
        (c.customerCode && c.customerCode.toLowerCase().includes(customerSearch.toLowerCase()))
      ).slice(0, 10)
    : []

  // Add item
  const addItem = () => {
    const svc = services.find((s) => s.id === selectedServiceId)
    if (!svc || !itemQty) return
    const qty = parseFloat(itemQty)
    if (isNaN(qty) || qty <= 0) return
    const newItem: LaundryOrderItem & { _tempId: string } = {
      _tempId: Date.now().toString(),
      serviceId: svc.id,
      serviceName: svc.name,
      quantity: qty,
      unitPrice: svc.basePrice,
      lineTotal: Math.round(qty * svc.basePrice * 100) / 100,
      specialInstructions: itemSpecial || undefined,
    }
    setItems([...items, newItem])
    setSelectedServiceId('')
    setItemQty('1')
    setItemSpecial('')
  }

  const removeItem = (tempId: string) => setItems(items.filter((i) => i._tempId !== tempId))

  // Compute totals
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  const prioritySurcharge = LaundryOrderService.computePrioritySurcharge(subtotal, priority)
  const deliveryFee = isDelivery ? 50 : 0
  const tierDiscount = selectedCustomer ? LaundryCustomerService.getTierDiscount(selectedCustomer.customerTier) * subtotal : 0
  const vat = LaundryOrderService.computeVAT(subtotal + prioritySurcharge)
  const total = LaundryOrderService.computeTotal({ subtotal, prioritySurcharge, deliveryFee, vat, discount: tierDiscount })

  const handleSubmit = async () => {
    if (items.length === 0) { setError('Add at least one service item'); return }
    setSaving(true); setError(null)
    try {
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const pickup = LaundryOrderService.computePromisedPickup(today, priority)

      const orderCode = LaundryOrderService.generateOrderCode(Math.floor(Math.random() * 9999))

      await laundryOrderRepo.create({
        tenantId: 'default',
        orderCode,
        customerId: selectedCustomer?.id ?? 'walk-in',
        customerName: selectedCustomer?.fullName ?? 'Walk-in Customer',
        orderDate: today,
        dropOffTime: time,
        promisedPickupDate: pickup.pickupDate,
        promisedPickupTime: pickup.pickupTime,
        items: items.map(({ _tempId, ...rest }) => rest),
        totalWeight: totalWeight ? parseFloat(totalWeight) : undefined,
        subtotal,
        discountAmount: tierDiscount,
        taxAmount: vat,
        totalAmount: total,
        amountPaid: 0,
        balance: total,
        paymentStatus: 'unpaid' as const,
        orderStatus: 'dropped_off' as const,
        orderPriority: priority,
        receivedBy: 'counter-staff',
        careInstructions: careInstructions || undefined,
        isDelivery,
        deliveryAddress: deliveryAddress || undefined,
        deliveryFee,
        notes: notes || undefined,
      } as any)
      setSuccess(true)
      setTimeout(() => navigate({ to: '/laundry/orders' }), 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to create order')
    } finally { setSaving(false) }
  }

  if (success) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card><div className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div>
          <h2 className="text-xl font-semibold">Order Created!</h2>
          <p className="mt-2 text-gray-500">Total: ₱{total.toFixed(2)} · Redirecting...</p>
        </div></Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader title="New Order" description="Drop-off registration" action={
          <Button variant="outline" onClick={() => navigate({ to: '/laundry/orders' })} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        } />

        <div className="p-4 space-y-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {/* Customer Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700"><User className="mr-1 inline h-4 w-4" />Customer</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search by name or phone (leave blank for walk-in)" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="pl-10" />
            </div>
            {filteredCustomers.length > 0 && !selectedCustomer && (
              <div className="mt-1 rounded-lg border bg-white shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.fullName); }} className="w-full px-4 py-2 text-left hover:bg-blue-50 text-sm flex justify-between">
                    <span>{c.fullName}</span>
                    <span className="text-xs text-gray-500">{c.customerCode} · {c.customerTier}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedCustomer && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 p-2">
                <Badge color="blue">{selectedCustomer.fullName}</Badge>
                <Badge color={selectedCustomer.customerTier === 'platinum' ? 'purple' : 'gray'} size="sm">{selectedCustomer.customerTier}</Badge>
                <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="ml-auto text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>

          {/* Priority & Delivery */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700"><Clock className="mr-1 inline h-4 w-4" />Priority</label>
              <div className="flex gap-2">
                {(['normal','express','rush'] as const).map((p) => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${priority === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                    {ORDER_PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isDelivery} onChange={(e) => setIsDelivery(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm font-semibold"><Truck className="mr-1 inline h-4 w-4" />Delivery (+₱50)</span>
              </label>
              {isDelivery && <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Delivery address..." className="mt-2" />}
            </div>
          </div>

          {/* Service Items */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700"><ShoppingBag className="mr-1 inline h-4 w-4" />Items</label>
            <div className="flex gap-2 flex-wrap">
              <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm min-w-[180px]">
                <option value="">Select service...</option>
                {services.filter(s => s.status === 'active').map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — ₱{s.basePrice}/{s.pricingUnit}</option>
                ))}
              </select>
              <Input type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)} placeholder="Qty" className="w-20" min="0.01" step="0.01" />
              <Input value={itemSpecial} onChange={(e) => setItemSpecial(e.target.value)} placeholder="Special instructions" className="w-40" />
              <Button size="sm" onClick={addItem} disabled={!selectedServiceId} icon={<Plus className="h-4 w-4" />}>Add</Button>
            </div>
            {items.length > 0 && (
              <div className="mt-2 divide-y rounded-lg border">
                {items.map((item) => (
                  <div key={item._tempId} className="flex items-center justify-between p-2 text-sm">
                    <div>
                      <span className="font-medium">{item.serviceName}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity} @ ₱{item.unitPrice}</span>
                      {item.specialInstructions && <span className="text-xs text-yellow-600 ml-2">— {item.specialInstructions}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">₱{item.lineTotal.toFixed(2)}</span>
                      <button onClick={() => removeItem(item._tempId)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight & Instructions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Total Weight (kg)</label>
              <Input type="number" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} placeholder="Estimated kg" min="0" step="0.1" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Care Instructions</label>
              <Input value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} placeholder="e.g., gentle wash, cold water" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
          </div>

          {/* Totals */}
          <div className="rounded-lg border bg-gray-50 p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
            {prioritySurcharge > 0 && <div className="flex justify-between text-orange-600"><span>Priority Surcharge ({priority})</span><span>₱{prioritySurcharge.toFixed(2)}</span></div>}
            {deliveryFee > 0 && <div className="flex justify-between"><span>Delivery Fee</span><span>₱{deliveryFee.toFixed(2)}</span></div>}
            {tierDiscount > 0 && <div className="flex justify-between text-green-600"><span>Loyalty Discount ({selectedCustomer?.customerTier})</span><span>-₱{tierDiscount.toFixed(2)}</span></div>}
            {vat > 0 && <div className="flex justify-between"><span>VAT (12%)</span><span>₱{vat.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>₱{total.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Promised Pickup: {LaundryOrderService.computePromisedPickup(new Date().toISOString().slice(0,10), priority).pickupDate}</span>
              <span>{LaundryOrderService.computePromisedPickup(new Date().toISOString().slice(0,10), priority).pickupTime}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/laundry/orders' })}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} icon={saving ? undefined : <Save className="h-4 w-4" />}>
              {saving ? 'Saving...' : 'Create Order'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
