/**
 * ─── Fast Food Daily Sales Page ─────────────────────────────
 * Crispy King end-of-day sales summary per branch.
 */
import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { ckDailySalesRepo } from '../../../lib/db'
import type { DailySales } from '@repo/entity-fastfood'
import { Plus, BarChart3 } from 'lucide-react'

export function FastFoodDailySalesPage() {
  const [sales, setSales] = useState<DailySales[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await ckDailySalesRepo.findMany({ page: 1, pageSize: 30, sort: [{ field: 'salesDate', direction: 'desc' }] })
    if ('items' in result) setSales(result.items as DailySales[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const totalNet = sales.reduce((s, d) => s + d.netSales, 0)

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Daily Sales" description={`${sales.length} days · Total Net: ₱${totalNet.toFixed(2)}`} action={
          <Link to="/fastfood/daily-sales/new"><Button icon={<Plus className="h-4 w-4" />}>Close Day</Button></Link>
        } />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Orders</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Gross Sales</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Discounts</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Net Sales</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Avg Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Dine-In</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Takeout</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Cash Var.</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr> :
               sales.length === 0 ? <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500"><BarChart3 className="mx-auto mb-2 h-10 w-10 text-gray-300" />No daily sales records</td></tr> :
               sales.map((d) => (
                <tr key={d.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{d.salesDate}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{d.orderCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">₱{d.grossSales.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-red-600">-₱{d.totalDiscounts.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">₱{d.netSales.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">₱{d.averageOrderValue.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{d.dineInCount} / ₱{d.dineInSales.toFixed(0)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">{d.takeoutCount} / ₱{d.takeoutSales.toFixed(0)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-sm ${Math.abs(d.cashVariance) > 50 ? 'text-red-600 font-bold' : ''}`}>
                    ₱{d.cashVariance.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge color={d.isClosed ? 'green' : 'yellow'} size="sm">{d.isClosed ? 'Closed' : 'Open'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
