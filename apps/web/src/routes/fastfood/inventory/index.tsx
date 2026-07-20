/**
 * ─── Fast Food Inventory Page ───────────────────────────────
 * Crispy King branch-level stock tracking.
 */
import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { ckInventoryRepo } from '../../../lib/db'
import type { InventoryItem } from '@repo/entity-fastfood'
import { INVENTORY_STATUS_LABELS } from '@repo/entity-fastfood'
import { FastFoodService } from '@repo/entity-fastfood'
import { Plus, Package, AlertTriangle } from 'lucide-react'

export function FastFoodInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await ckInventoryRepo.findMany({ page: 1, pageSize: 200, sort: [{ field: 'name', direction: 'asc' }] })
    if ('items' in result) setItems(result.items as InventoryItem[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const lowStock = FastFoodService.getLowStockItems(items)

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Inventory" description={`${items.length} items · ${lowStock.length} low stock alerts`} action={
          <Link to="/fastfood/inventory/new"><Button icon={<Plus className="h-4 w-4" />}>Add Item</Button></Link>
        } />
        {lowStock.length > 0 && (
          <div className="mx-4 mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">{lowStock.length} items need restocking</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Qty on Hand</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reorder Pt</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr> :
               items.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500"><Package className="mx-auto mb-2 h-10 w-10 text-gray-300" />No inventory items</td></tr> :
               items.map((item) => (
                <tr key={item.id} className={item.quantityOnHand <= item.reorderPoint ? 'bg-yellow-50' : ''}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{item.category}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm">{item.quantityOnHand} {item.unit}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{item.reorderPoint} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.supplier || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge color={item.status === 'in_stock' ? 'green' : item.status === 'low_stock' ? 'yellow' : 'red'} size="sm">
                      {INVENTORY_STATUS_LABELS[item.status]}
                    </Badge>
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
