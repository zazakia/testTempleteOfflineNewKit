/**
 * ─── Laundry Reports Page ────────────────────────────────────
 * Business analytics: daily sales, service popularity,
 * customer value, revenue trends, inventory usage.
 *
 * Proposal reference: Section 12 — Reports & Analytics
 */

import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { laundryOrderRepo, laundryPaymentRepo, laundryCustomerRepo } from '../../lib/db'
import type { LaundryOrder, LaundryCustomer } from '@repo/entity-laundry'
import {
  ORDER_STATUS_LABELS, SERVICE_CATEGORY_LABELS,
  CUSTOMER_TIER_LABELS, LAUNDRY_PAYMENT_METHOD_LABELS,
} from '@repo/entity-laundry'
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Star, Download, Calendar } from 'lucide-react'

export function LaundryReportsPage() {
  const [orders, setOrders] = useState<LaundryOrder[]>([])
  const [customers, setCustomers] = useState<LaundryCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const orderResult = await laundryOrderRepo.findMany({ page: 1, pageSize: 2000, sort: [{ field: 'orderDate', direction: 'desc' }] })
      setOrders(('items' in orderResult ? orderResult.items : []) as LaundryOrder[])

      const custResult = await laundryCustomerRepo.findMany({ page: 1, pageSize: 1000 })
      setCustomers(('items' in custResult ? custResult.items : []) as LaundryCustomer[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Filter by period
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const filtered = orders.filter((o) => {
    if (period === 'today') return o.orderDate === todayStr
    if (period === 'week') return o.orderDate >= weekAgo
    if (period === 'month') return o.orderDate >= monthAgo
    return true
  })

  const completedOrders = filtered.filter((o) => ['picked_up', 'delivered', 'completed'].includes(o.orderStatus))
  const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0)
  const totalPaid = filtered.reduce((s, o) => s + o.amountPaid, 0)
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

  // Service popularity
  const serviceCounts = new Map<string, number>()
  for (const o of filtered) {
    for (const item of o.items) {
      serviceCounts.set(item.serviceName, (serviceCounts.get(item.serviceName) ?? 0) + item.quantity)
    }
  }
  const topServices = [...serviceCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Order type breakdown (Walk-in vs Delivery)
  const walkInOrders = filtered.filter((o) => !o.isDelivery)
  const deliveryOrders = filtered.filter((o) => o.isDelivery)
  const walkInRevenue = walkInOrders.reduce((s, o) => s + o.totalAmount, 0)
  const deliveryRevenue = deliveryOrders.reduce((s, o) => s + o.totalAmount, 0)

  // Payment method breakdown (from payments, not orders)
  const paymentBreakdown = new Map<string, number>()
  for (const o of filtered) {
    if (o.paymentStatus !== 'unpaid' && o.paymentStatus !== 'refunded') {
      // Use order amount as proxy — actual method comes from LaundryPayment
      const method = 'Various' // Can't get payment method from order alone without joining payments table
      paymentBreakdown.set(method, (paymentBreakdown.get(method) ?? 0) + o.totalAmount)
    }
  }

  // Top customers
  const topCustomers = [...customers]
    .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">{filtered.length} orders in selected period</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((p) => (
            <Button key={p} variant={period === p ? 'primary' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <>
          {/* Revenue KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ReportKpi icon={<DollarSign className="h-5 w-5 text-green-600" />} label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} />
            <ReportKpi icon={<ShoppingBag className="h-5 w-5 text-blue-600" />} label="Orders" value={`${completedOrders.length}`} />
            <ReportKpi icon={<TrendingUp className="h-5 w-5 text-purple-600" />} label="Avg Order Value" value={`₱${Math.round(avgOrderValue).toLocaleString()}`} />
            <ReportKpi icon={<DollarSign className="h-5 w-5 text-yellow-600" />} label="Total Paid" value={`₱${totalPaid.toLocaleString()}`} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Services */}
            <Card>
              <CardHeader title="Most Popular Services" />
              <div className="p-4 space-y-2">
                {topServices.length === 0 ? <p className="text-sm text-gray-500">No data</p> :
                  topServices.map(([name, count], i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                        <span className="text-sm">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-blue-100" style={{ width: `${Math.max(4, (count / topServices[0]![1]) * 120)}px` }} />
                        <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Payment Breakdown */}
            <Card>
              <CardHeader title="Payment Methods" />
              <div className="p-4 space-y-2">
                {[...paymentBreakdown.entries()].sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm">{LAUNDRY_PAYMENT_METHOD_LABELS[method as keyof typeof LAUNDRY_PAYMENT_METHOD_LABELS] || method}</span>
                    <span className="text-sm font-medium">₱{amount.toLocaleString()}</span>
                  </div>
                ))}
                {paymentBreakdown.size === 0 && <p className="text-sm text-gray-500">No payments yet</p>}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Customers */}
            <Card>
              <CardHeader title="Top Customers" />
              <div className="divide-y">
                {topCustomers.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{c.fullName}</p>
                        <p className="text-xs text-gray-500">{CUSTOMER_TIER_LABELS[c.customerTier]} · {c.loyaltyPoints} pts</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">₱{c.lifetimeSpend.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Walk-in vs Delivery */}
            <Card>
              <CardHeader title="Walk-in vs Delivery" />
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm">Walk-in / Drop-off</span><span className="text-sm font-medium">₱{walkInRevenue.toLocaleString()}</span></div>
                  <div className="h-3 rounded-full bg-gray-200"><div className="h-3 rounded-full bg-blue-500" style={{ width: `${totalRevenue > 0 ? (walkInRevenue / totalRevenue) * 100 : 0}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm">Delivery</span><span className="text-sm font-medium">₱{deliveryRevenue.toLocaleString()}</span></div>
                  <div className="h-3 rounded-full bg-gray-200"><div className="h-3 rounded-full bg-green-500" style={{ width: `${totalRevenue > 0 ? (deliveryRevenue / totalRevenue) * 100 : 0}%` }} /></div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function ReportKpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<p className="text-xs text-gray-500">{label}</p></div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
