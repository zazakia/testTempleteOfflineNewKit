/**
 * ─── Laundry Customer Detail ─────────────────────────────────
 * View customer profile, order history, loyalty status.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { laundryCustomerRepo, laundryOrderRepo } from '../../../lib/db'
import type { LaundryCustomer, LaundryOrder } from '@repo/entity-laundry'
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TIER_LABELS, CUSTOMER_TIER_COLORS } from '@repo/entity-laundry'
import { LaundryCustomerService } from '@repo/entity-laundry'
import { ArrowLeft, User, Star, ShoppingBag, Clock, TrendingUp } from 'lucide-react'

export function LaundryCustomerDetailPage() {
  const { id } = useParams({ from: '/laundry/customers/$id' })
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<LaundryCustomer | null>(null)
  const [orders, setOrders] = useState<LaundryOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const c = await laundryCustomerRepo.findById(id)
    setCustomer(c)
    if (c) {
      const oRes = await laundryOrderRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'orderDate', direction: 'desc' }] })
      const allOrders = ('items' in oRes ? oRes.items : []) as LaundryOrder[]
      setOrders(allOrders.filter((o) => o.customerId === id))
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (!customer) return <div className="p-6 text-center"><h2 className="text-lg font-semibold">Customer not found</h2><Button variant="outline" onClick={() => navigate({ to: '/laundry/customers' })} className="mt-4">Back</Button></div>

  const nextTier = customer.customerTier === 'bronze' ? 'Silver' : customer.customerTier === 'silver' ? 'Gold' : customer.customerTier === 'gold' ? 'Platinum' : null
  const nextThreshold = customer.customerTier === 'bronze' ? 5000 : customer.customerTier === 'silver' ? 20000 : customer.customerTier === 'gold' ? 50000 : null
  const progress = nextThreshold ? Math.min(100, (customer.lifetimeSpend / nextThreshold) * 100) : 100

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader title={customer.fullName} description={`${customer.customerCode} · ${CUSTOMER_TYPE_LABELS[customer.customerType]}`} action={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/laundry/customers' })} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        } />
        <div className="p-4 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge color={CUSTOMER_TIER_COLORS[customer.customerTier]} size="md">{CUSTOMER_TIER_LABELS[customer.customerTier]}</Badge>
            <Badge color={customer.status === 'active' ? 'green' : customer.status === 'blocked' ? 'red' : 'gray'} size="md">{customer.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-3 text-center">
              <ShoppingBag className="mx-auto mb-1 h-5 w-5 text-blue-500" />
              <p className="text-xl font-bold">{orders.length}</p><p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <TrendingUp className="mx-auto mb-1 h-5 w-5 text-green-500" />
              <p className="text-xl font-bold">₱{customer.lifetimeSpend.toLocaleString()}</p><p className="text-xs text-gray-500">Lifetime Spend</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Star className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
              <p className="text-xl font-bold">{customer.loyaltyPoints}</p><p className="text-xs text-gray-500">Loyalty Points</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Clock className="mx-auto mb-1 h-5 w-5 text-purple-500" />
              <p className="text-xl font-bold">{customer.firstVisitDate || '—'}</p><p className="text-xs text-gray-500">First Visit</p>
            </div>
          </div>

          {nextTier && (
            <div>
              <p className="text-sm font-medium mb-1">Progress to {nextTier}</p>
              <div className="h-3 rounded-full bg-gray-200"><div className="h-3 rounded-full bg-yellow-500 transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="text-xs text-gray-500 mt-1">₱{customer.lifetimeSpend.toLocaleString()} / ₱{nextThreshold?.toLocaleString()}</p>
            </div>
          )}

          {(customer.phone || customer.email) && (
            <div className="text-sm space-y-1">
              {customer.phone && <p><span className="font-medium">Phone:</span> {customer.phone}</p>}
              {customer.email && <p><span className="font-medium">Email:</span> {customer.email}</p>}
              {customer.address && <p><span className="font-medium">Address:</span> {[customer.address, customer.barangay, customer.city, customer.province].filter(Boolean).join(', ')}</p>}
              {customer.preferences && <p><span className="font-medium">Preferences:</span> {customer.preferences}</p>}
            </div>
          )}

          {orders.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">Recent Orders</h3>
              <div className="divide-y rounded-lg border">
                {orders.slice(0, 10).map((o) => (
                  <div key={o.id} className="flex justify-between p-3 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => navigate({ to: `/laundry/orders/${o.id}` })}>
                    <div><span className="font-medium">{o.orderCode}</span><span className="text-gray-500 ml-2">{o.orderDate}</span></div>
                    <div className="flex items-center gap-3"><span>₱{o.totalAmount.toFixed(0)}</span><Badge size="sm">{o.paymentStatus}</Badge></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
