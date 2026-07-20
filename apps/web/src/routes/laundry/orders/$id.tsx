/**
 * ─── Laundry Order Detail ────────────────────────────────────
 * View, update status, record pickup/delivery, process payment.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryOrderRepo, laundryPaymentRepo, laundryCustomerRepo } from '../../../lib/db'
import type { LaundryOrder, LaundryCustomer } from '@repo/entity-laundry'
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_PRIORITY_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, CUSTOMER_TIER_LABELS,
} from '@repo/entity-laundry'
import { LaundryOrderService, LaundryCustomerService, LaundryPaymentService } from '@repo/entity-laundry'
import {
  ArrowLeft, Edit3, Check, X, Truck, Clock, User, Calendar, ShoppingBag, DollarSign, AlertTriangle,
} from 'lucide-react'

export function LaundryOrderDetailPage() {
  const { id } = useParams({ from: '/laundry/orders/$id' })
  const navigate = useNavigate()
  const [order, setOrder] = useState<LaundryOrder | null>(null)
  const [customer, setCustomer] = useState<LaundryCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const o = await laundryOrderRepo.findById(id)
    setOrder(o)
    if (o?.customerId && o.customerId !== 'walk-in') {
      const c = await laundryCustomerRepo.findById(o.customerId)
      setCustomer(c)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const updateStatus = async (newStatus: string, extra?: Record<string, unknown>) => {
    if (!order) return
    try {
      const now = new Date().toISOString()
      const updates: any = { ...extra, version: order.version }
      if (newStatus === 'picked_up') updates.actualPickupDate = now.slice(0, 10); updates.actualPickupTime = now.slice(11, 16)
      if (newStatus === 'completed') updates.completedAt = Date.now()
      if (newStatus === 'cancelled') updates.cancelledAt = Date.now()
      const updated = await laundryOrderRepo.update(id, { ...updates, orderStatus: newStatus, version: order.version } as any)
      setOrder(updated)
    } catch (err: any) { setError(err.message) }
  }

  const processPayment = async () => {
    if (!order || !paymentAmount) return
    setPaying(true); setError(null)
    try {
      const amount = parseFloat(paymentAmount)
      if (isNaN(amount) || amount <= 0) { setError('Enter a valid amount'); setPaying(false); return }
      const newPaid = order.amountPaid + amount
      const newBalance = LaundryOrderService.computeBalance(order.totalAmount, newPaid)
      const newPStatus = LaundryOrderService.computePaymentStatus(order.totalAmount, newPaid)

      // Create payment record
      const now = new Date()
      const paymentCode = LaundryPaymentService.generatePaymentCode(Math.floor(Math.random() * 9999))
      await laundryPaymentRepo.create({
        tenantId: 'default',
        paymentCode,
        orderId: order.id,
        customerId: order.customerId,
        paymentDate: now.toISOString().slice(0, 10),
        paymentTime: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
        amount,
        paymentMethod: 'cash' as any,
        loyaltyPointsRedeemed: 0,
        loyaltyPointsEarned: LaundryCustomerService.computeLoyaltyPoints(amount),
        receivedBy: 'counter-staff',
      } as any)

      // Update order
      const updated = await laundryOrderRepo.update(id, {
        amountPaid: newPaid, balance: newBalance, paymentStatus: newPStatus, version: order.version,
      } as any)
      setOrder(updated)
      setPaymentAmount('')

      // Update customer loyalty
      if (customer) {
        const newSpend = customer.lifetimeSpend + amount
        const newPoints = customer.loyaltyPoints + LaundryCustomerService.computeLoyaltyPoints(amount)
        const newTier = LaundryCustomerService.computeTier(newSpend)
        await laundryCustomerRepo.update(customer.id, {
          lifetimeSpend: newSpend, loyaltyPoints: newPoints, customerTier: newTier,
          lastOrderDate: now.toISOString().slice(0, 10), version: customer.version,
        } as any)
        const refreshed = await laundryCustomerRepo.findById(customer.id)
        setCustomer(refreshed)
      }
    } catch (err: any) { setError(err.message) }
    finally { setPaying(false) }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading order...</div>
  if (!order) return <div className="p-6 text-center"><h2 className="text-lg font-semibold">Order not found</h2><Button variant="outline" onClick={() => navigate({ to: '/laundry/orders' })} className="mt-4">Back</Button></div>

  const isOverdue = LaundryOrderService.isOverdue(order.promisedPickupDate, order.promisedPickupTime)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader title={`Order #${order.orderCode}`} description={`${ORDER_STATUS_LABELS[order.orderStatus]} · ${ORDER_PRIORITY_LABELS[order.orderPriority]}`} action={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/laundry/orders' })} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        } />

        <div className="p-4 space-y-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge color={ORDER_STATUS_COLORS[order.orderStatus]} size="md">{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
            <Badge color={PAYMENT_STATUS_COLORS[order.paymentStatus]} size="md">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
            {order.isDelivery && <Badge color="purple" size="md"><Truck className="mr-1 inline h-3 w-3" />Delivery</Badge>}
            {isOverdue && order.orderStatus !== 'cancelled' && order.orderStatus !== 'picked_up' && order.orderStatus !== 'delivered' &&
              <Badge color="red" size="md"><AlertTriangle className="mr-1 inline h-3 w-3" />Overdue</Badge>}
          </div>

          {/* Customer & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2"><User className="h-4 w-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Customer</p><p className="font-medium">{order.customerName}</p>{customer && <p className="text-xs text-gray-400">{CUSTOMER_TIER_LABELS[customer.customerTier]} · {customer.loyaltyPoints} pts</p>}</div></div>
            <div className="flex gap-2"><Calendar className="h-4 w-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Dropped Off</p><p className="font-medium">{order.orderDate} · {order.dropOffTime}</p></div></div>
            <div className="flex gap-2"><Clock className="h-4 w-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Promised Pickup</p><p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>{order.promisedPickupDate} · {order.promisedPickupTime}</p></div></div>
            {order.actualPickupDate && <div className="flex gap-2"><Check className="h-4 w-4 text-green-500 mt-0.5" /><div><p className="text-xs text-gray-500">Actual Pickup</p><p className="font-medium">{order.actualPickupDate} · {order.actualPickupTime}</p></div></div>}
          </div>

          {/* Items */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">Items ({order.items.length})</h3>
            <div className="divide-y rounded-lg border">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between p-3 text-sm">
                  <div><span className="font-medium">{item.serviceName}</span> <span className="text-gray-500">x{item.quantity} @ ₱{item.unitPrice}</span>{item.specialInstructions && <p className="text-xs text-yellow-600">{item.specialInstructions}</p>}</div>
                  <span className="font-semibold">₱{item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg border bg-gray-50 p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₱{order.subtotal.toFixed(2)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₱{order.discountAmount.toFixed(2)}</span></div>}
            {order.taxAmount > 0 && <div className="flex justify-between"><span>VAT</span><span>₱{order.taxAmount.toFixed(2)}</span></div>}
            {order.deliveryFee > 0 && <div className="flex justify-between"><span>Delivery Fee</span><span>₱{order.deliveryFee.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>₱{order.totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Amount Paid</span><span className="text-green-600">₱{order.amountPaid.toFixed(2)}</span></div>
            {order.balance > 0 && <div className="flex justify-between font-semibold text-red-600"><span>Balance Due</span><span>₱{order.balance.toFixed(2)}</span></div>}
          </div>

          {/* Status Actions */}
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'picked_up' && order.orderStatus !== 'delivered' && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {order.orderStatus === 'dropped_off' && (
                  <Button size="sm" onClick={() => updateStatus('sorted')} icon={<Check className="h-4 w-4" />}>Mark as Sorted</Button>
                )}
                {(order.orderStatus === 'dropped_off' || order.orderStatus === 'sorted') && (
                  <Button size="sm" onClick={() => updateStatus('in_process')} icon={<Check className="h-4 w-4" />}>Start Processing</Button>
                )}
                {order.orderStatus === 'in_process' && (
                  <Button size="sm" onClick={() => updateStatus('quality_check')} icon={<Check className="h-4 w-4" />}>Quality Check</Button>
                )}
                {order.orderStatus === 'quality_check' && (
                  <Button size="sm" onClick={() => updateStatus('ready_for_pickup')} icon={<Check className="h-4 w-4" />}>Ready for Pickup</Button>
                )}
                {order.orderStatus === 'ready_for_pickup' && (
                  <>
                    <Button size="sm" onClick={() => updateStatus('picked_up')} icon={<Check className="h-4 w-4" />}>Picked Up</Button>
                    {order.isDelivery && <Button size="sm" onClick={() => updateStatus('delivered')} icon={<Truck className="h-4 w-4" />}>Delivered</Button>}
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => updateStatus('cancelled', { cancelReason: 'Staff action' })} icon={<X className="h-4 w-4" />}>Cancel Order</Button>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.balance > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-green-800"><DollarSign className="mr-1 inline h-4 w-4" />Record Payment</h3>
              <div className="flex gap-2">
                <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={`Balance: ₱${order.balance.toFixed(2)}`} className="flex-1" />
                <Button onClick={processPayment} disabled={paying || !paymentAmount}>{paying ? 'Processing...' : 'Add Payment'}</Button>
              </div>
            </div>
          )}

          {order.careInstructions && <div className="text-sm"><span className="font-semibold">Care Instructions:</span> {order.careInstructions}</div>}
          {order.notes && <div className="text-sm text-gray-500"><span className="font-semibold">Notes:</span> {order.notes}</div>}
        </div>
      </Card>
    </div>
  )
}
