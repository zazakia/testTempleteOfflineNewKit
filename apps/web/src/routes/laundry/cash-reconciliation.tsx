/**
 * ─── Daily Cash Reconciliation ───────────────────────────────
 * End-of-day cash count vs system totals, variance tracking.
 * Proposal reference: Section 7 — Payment & Billing
 */

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryOrderRepo } from '../../lib/db'
import type { LaundryOrder } from '@repo/entity-laundry'
import { LaundryOrderService } from '@repo/entity-laundry'
import { DollarSign, Calculator, Save, Check, AlertTriangle, RefreshCw } from 'lucide-react'

export function LaundryCashReconciliationPage() {
  const [loading, setLoading] = useState(true)
  const [todayOrders, setTodayOrders] = useState<LaundryOrder[]>([])
  const [openingCash, setOpeningCash] = useState('1000')
  const [closingCash, setClosingCash] = useState('')
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const today = new Date().toISOString().slice(0, 10)
    const res = await laundryOrderRepo.findMany({ page: 1, pageSize: 500, sort: [{ field: 'orderDate', direction: 'desc' }] })
    const all = ('items' in res ? res.items : []) as LaundryOrder[]
    setTodayOrders(all.filter((o) => o.orderDate === today))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // System totals
  const cashOrders = todayOrders.filter((o) => o.paymentStatus !== 'unpaid')
  const systemCash = cashOrders.reduce((s, o) => s + o.totalAmount, 0)
  const systemGcash = 0 // payment method tracking needs payment entity join
  const totalSystem = systemCash + systemGcash
  const orderCount = todayOrders.length
  const totalCollected = todayOrders.reduce((s, o) => s + o.amountPaid, 0)

  // Cash variance
  const actualClosing = parseFloat(closingCash) || 0
  const expectedClosing = parseFloat(openingCash) + totalCollected
  const variance = actualClosing - expectedClosing

  const format = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  if (saved) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card><div className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div>
          <h2 className="text-xl font-semibold">Reconciliation Saved</h2>
          <p className="text-gray-500">Closing Cash: {format(actualClosing)} · Variance: {format(variance)}</p>
          <Button variant="outline" onClick={() => { setSaved(false); setClosingCash(''); }} className="mt-4">New Reconciliation</Button>
        </div></Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader title="Daily Cash Reconciliation" description={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} action={
          <Button onClick={load} variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
        } />
        <div className="p-4 space-y-6">
          {loading ? <p className="text-gray-500">Loading today's orders...</p> : (
            <>
              {/* System Summary */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <h3 className="text-sm font-semibold uppercase text-gray-500 flex items-center gap-2"><Calculator className="h-4 w-4" />System Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Orders Today:</span> <span className="font-bold">{orderCount}</span></div>
                  <div><span className="text-gray-500">Collected (All):</span> <span className="font-bold">{format(totalCollected)}</span></div>
                  <div><span className="text-gray-500">System Cash:</span> <span className="font-bold text-green-600">{format(systemCash)}</span></div>
                  <div><span className="text-gray-500">System GCash/Maya:</span> <span className="font-bold">{format(systemGcash)}</span></div>
                </div>
              </div>

              {/* Cash Input */}
              <div className="space-y-4">
                <div><label className="mb-1 block text-sm font-medium">Opening Cash Float</label><Input type="number" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Actual Closing Cash (manual count)</label><Input type="number" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} placeholder="Count the cash drawer..." /></div>

                {closingCash && (
                  <div className={`rounded-lg p-4 ${Math.abs(variance) < 50 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {Math.abs(variance) < 50 ? <Check className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                      <span className={`font-bold ${Math.abs(variance) < 50 ? 'text-green-700' : 'text-red-700'}`}>
                        {Math.abs(variance) < 50 ? 'Balanced!' : 'Variance Detected'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-600">Expected Cash:</span><br /><span className="font-bold">{format(expectedClosing)}</span></div>
                      <div><span className="text-gray-600">Actual Cash:</span><br /><span className="font-bold">{format(actualClosing)}</span></div>
                      <div className="col-span-2"><span className="text-gray-600">Variance:</span> <span className={`font-bold text-lg ${Math.abs(variance) < 50 ? 'text-green-600' : 'text-red-600'}`}>{format(variance)}</span></div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={() => setSaved(true)} disabled={!closingCash} className="w-full" icon={<Save className="h-4 w-4" />}>
                Save Reconciliation
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Today's Orders Quick View */}
      {todayOrders.length > 0 && (
        <Card>
          <CardHeader title={`Today's Orders (${orderCount})`} />
          <div className="divide-y max-h-72 overflow-y-auto">
            {todayOrders.map((o) => (
              <Link key={o.id} to={`/laundry/orders/${o.id}`} className="flex justify-between p-3 text-sm hover:bg-gray-50">
                <div>
                  <span className="font-medium">{o.orderCode}</span>
                  <span className="text-gray-500 ml-2">{o.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{format(o.totalAmount)}</span>
                  <Badge color={o.paymentStatus === 'paid' ? 'green' : o.paymentStatus === 'partial' ? 'yellow' : 'red'} size="sm">{o.paymentStatus}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
