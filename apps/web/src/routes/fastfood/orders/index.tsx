/**
 * ─── Fast Food Orders Page ──────────────────────────────────
 * Crispy King order management with status tracking.
 */
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { ckOrderRepo } from '../../../lib/db'
import type { Order } from '@repo/entity-fastfood'
import { ORDER_TYPE_LABELS, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@repo/entity-fastfood'
import { Plus, ClipboardList } from 'lucide-react'

export function FastFoodOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await ckOrderRepo.findMany({ page: 1, pageSize: 50, sort: [{ field: 'orderedAt', direction: 'desc' }] })
    if ('items' in result) setOrders(result.items as Order[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const statusColor = (s: string) => {
    const m: Record<string, 'green' | 'yellow' | 'blue' | 'red' | 'gray'> = { pending:'yellow', preparing:'blue', ready:'green', served:'green', completed:'green', cancelled:'red' }
    return m[s] ?? 'gray'
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Orders" description={`${orders.length} orders`} action={
          <Link to="/fastfood/orders/new"><Button icon={<Plus className="h-4 w-4" />}>New Order</Button></Link>
        } />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Time</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr> :
               orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500"><ClipboardList className="mx-auto mb-2 h-10 w-10 text-gray-300" />No orders yet</td></tr> :
               orders.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate({ to: `/fastfood/orders/${o.id}` })}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-medium">{o.orderNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{ORDER_TYPE_LABELS[o.orderType]}</td>
                  <td className="px-4 py-3 text-sm">{o.customerName || 'Walk-in'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">₱{o.totalAmount.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</td>
                  <td className="whitespace-nowrap px-4 py-3"><Badge color={statusColor(o.status)} size="sm">{ORDER_STATUS_LABELS[o.status]}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(o.orderedAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
