/**
 * ─── Laundry Shop Dashboard ─────────────────────────────────
 * Main overview for laundry shop staff. Shows real-time KPIs,
 * today's summary, pending actions, and quick-access shortcuts.
 *
 * Proposal reference: Sections 2, 10, 11, 12
 */

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { laundryOrderRepo, laundryCustomerRepo, laundryPaymentRepo, laundryInventoryRepo } from '../../lib/db'
import type { LaundryOrder, LaundryCustomer, LaundryInventory } from '@repo/entity-laundry'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_PRIORITY_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, CUSTOMER_TIER_LABELS, INVENTORY_STATUS_COLORS } from '@repo/entity-laundry'
import { LaundryOrderService, LaundryInventoryService, LaundryCustomerService } from '@repo/entity-laundry'
import {
  LayoutDashboard, ShoppingBag, Users, DollarSign, Package, AlertTriangle,
  Clock, CheckCircle2, TrendingUp, ArrowRight, Plus, RefreshCw,
  Timer, Truck, Wallet, Star,
} from 'lucide-react'

export function LaundryDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [todayOrders, setTodayOrders] = useState<LaundryOrder[]>([])
  const [pendingPickup, setPendingPickup] = useState<LaundryOrder[]>([])
  const [overdueOrders, setOverdueOrders] = useState<LaundryOrder[]>([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [lowStockItems, setLowStockItems] = useState<LaundryInventory[]>([])
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [todayOrderCount, setTodayOrderCount] = useState(0)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)

      // All orders
      const orderResult = await laundryOrderRepo.findMany({
        page: 1, pageSize: 500,
        sort: [{ field: 'orderDate', direction: 'desc' }],
      })
      const allOrders = ('items' in orderResult ? orderResult.items : []) as LaundryOrder[]

      // Today's orders
      const todayOrdersList = allOrders.filter((o) => o.orderDate === today)
      setTodayOrders(todayOrdersList)

      // Pending pickup — ready_for_pickup status
      setPendingPickup(allOrders.filter((o) => o.orderStatus === 'ready_for_pickup'))

      // Overdue — past promised date, not yet picked up
      setOverdueOrders(allOrders.filter((o) =>
        ['dropped_off','sorted','in_process','quality_check','ready_for_pickup'].includes(o.orderStatus) &&
        LaundryOrderService.isOverdue(o.promisedPickupDate, o.promisedPickupTime)
      ))

      // Today's revenue
      const todayPayments = allOrders
        .filter((o) => o.orderDate === today && o.paymentStatus !== 'unpaid')
        .reduce((sum, o) => sum + o.amountPaid, 0)
      setTodayRevenue(todayPayments)
      setTodayOrderCount(todayOrdersList.length)

      // Customer count
      const custCount = await laundryCustomerRepo.count({ filter: [] })
      setTotalCustomers(custCount)

      // Low stock
      const invResult = await laundryInventoryRepo.findMany({ page: 1, pageSize: 500 })
      const invItems = ('items' in invResult ? invResult.items : []) as LaundryInventory[]
      setLowStockItems(LaundryInventoryService.getLowStockItems(invItems))
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const rushCount = todayOrders.filter((o) => o.orderPriority === 'rush').length
  const expressCount = todayOrders.filter((o) => o.orderPriority === 'express').length
  const unpaidCount = todayOrders.filter((o) => o.paymentStatus === 'unpaid').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laundry Dashboard</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button onClick={loadDashboard} loading={loading} icon={<RefreshCw className="h-4 w-4" />} variant="outline">
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        <KpiCard icon={<ShoppingBag className="h-5 w-5 text-blue-600" />} label="Today's Orders" value={todayOrderCount} color="blue" />
        <KpiCard icon={<DollarSign className="h-5 w-5 text-green-600" />} label="Today's Revenue" value={`₱${todayRevenue.toLocaleString()}`} color="green" />
        <KpiCard icon={<CheckCircle2 className="h-5 w-5 text-purple-600" />} label="Ready for Pickup" value={pendingPickup.length} color="purple" />
        <KpiCard icon={<AlertTriangle className="h-5 w-5 text-red-600" />} label="Overdue" value={overdueOrders.length} color="red" />
        <KpiCard icon={<Timer className="h-5 w-5 text-yellow-600" />} label="Rush Orders" value={rushCount} color="yellow" />
        <KpiCard icon={<Package className="h-5 w-5 text-orange-600" />} label="Low Stock Items" value={lowStockItems.length} color="yellow" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          <Link to="/laundry/orders/new">
            <QuickAction icon={<Plus className="h-5 w-5" />} label="New Order" color="bg-blue-100 text-blue-700" />
          </Link>
          <Link to="/laundry/customers/new">
            <QuickAction icon={<Users className="h-5 w-5" />} label="New Customer" color="bg-green-100 text-green-700" />
          </Link>
          <Link to="/laundry/payments">
            <QuickAction icon={<Wallet className="h-5 w-5" />} label="Process Payment" color="bg-purple-100 text-purple-700" />
          </Link>
          <Link to="/laundry/inventory">
            <QuickAction icon={<Package className="h-5 w-5" />} label="Check Inventory" color="bg-yellow-100 text-yellow-700" />
          </Link>
        </div>
      </Card>

      {/* Today's Orders + Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Orders */}
        <Card>
          <CardHeader title={`Today's Orders (${todayOrderCount})`} action={
            <Link to="/laundry/orders"><Button variant="outline" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          } />
          <div className="divide-y">
            {loading ? <p className="p-4 text-sm text-gray-500">Loading...</p> :
             todayOrders.length === 0 ? <p className="p-4 text-sm text-gray-500">No orders today yet.</p> :
             todayOrders.slice(0, 8).map((o) => (
              <Link key={o.id} to={`/laundry/orders/${o.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.customerName || 'Walk-in'}</p>
                  <p className="text-xs text-gray-500">{o.orderCode} · {ORDER_PRIORITY_LABELS[o.orderPriority]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">₱{o.totalAmount.toFixed(0)}</span>
                  <Badge color={ORDER_STATUS_COLORS[o.orderStatus]} size="sm">{ORDER_STATUS_LABELS[o.orderStatus]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <div className="space-y-4">
          {/* Overdue */}
          {overdueOrders.length > 0 && (
            <Card>
              <CardHeader title={`⚠ Overdue Orders (${overdueOrders.length})`} />
              <div className="divide-y">
                {overdueOrders.slice(0, 5).map((o) => (
                  <Link key={o.id} to={`/laundry/orders/${o.id}`} className="flex items-center justify-between p-3 hover:bg-red-50">
                    <div>
                      <p className="text-sm font-medium">{o.customerName || 'Walk-in'} — {o.orderCode}</p>
                      <p className="text-xs text-red-600">Promised: {o.promisedPickupDate} {o.promisedPickupTime}</p>
                    </div>
                    <Badge color="red" size="sm">Overdue</Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Ready for Pickup */}
          {pendingPickup.length > 0 && (
            <Card>
              <CardHeader title={`✅ Ready for Pickup (${pendingPickup.length})`} />
              <div className="divide-y">
                {pendingPickup.slice(0, 5).map((o) => (
                  <Link key={o.id} to={`/laundry/orders/${o.id}`} className="flex items-center justify-between p-3 hover:bg-green-50">
                    <div>
                      <p className="text-sm font-medium">{o.customerName || 'Walk-in'} — {o.orderCode}</p>
                      <p className="text-xs text-gray-500">{o.items.length} items · ₱{o.totalAmount.toFixed(0)}</p>
                    </div>
                    <Badge color="green" size="sm">Ready</Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Low Stock */}
          {lowStockItems.length > 0 && (
            <Card>
              <CardHeader title={`📦 Low Stock (${lowStockItems.length})`} />
              <div className="divide-y">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-yellow-600">{item.quantityOnHand} {item.unit} remaining</p>
                    </div>
                    <Badge color="yellow" size="sm">Reorder</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader title="Business Summary" />
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          <StatRow icon={<Users className="h-4 w-4 text-blue-500" />} label="Total Customers" value={totalCustomers} />
          <StatRow icon={<ShoppingBag className="h-4 w-4 text-green-500" />} label="Today Orders" value={todayOrderCount} />
          <StatRow icon={<DollarSign className="h-4 w-4 text-purple-500" />} label="Today Revenue" value={`₱${todayRevenue.toLocaleString()}`} />
          <StatRow icon={<TrendingUp className="h-4 w-4 text-orange-500" />} label="Avg Order Value" value={`₱${todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount).toLocaleString() : '0'}`} />
        </div>
      </Card>
    </div>
  )
}

/** Mini KPI card */
function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const bgMap: Record<string, string> = { blue: 'bg-blue-50 border-blue-200', green: 'bg-green-50 border-green-200', purple: 'bg-purple-50 border-purple-200', red: 'bg-red-50 border-red-200', yellow: 'bg-yellow-50 border-yellow-200', orange: 'bg-orange-50 border-orange-200' }
  return (
    <div className={`rounded-xl border p-4 ${bgMap[color] || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-1">{icon}<p className="text-xs text-gray-600">{label}</p></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

/** Quick action button */
function QuickAction({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl p-4 ${color} hover:opacity-80 transition-opacity cursor-pointer`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

/** Stat row */
function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}
