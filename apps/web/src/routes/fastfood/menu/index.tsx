/**
 * ─── Fast Food Menu Page ────────────────────────────────────
 * Crispy King menu management.
 */
import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { ckMenuItemRepo } from '../../../lib/db'
import type { MenuItem } from '@repo/entity-fastfood'
import { MENU_CATEGORY_LABELS, MENU_STATUS_LABELS } from '@repo/entity-fastfood'
import { Plus, Search, UtensilsCrossed } from 'lucide-react'

export function FastFoodMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const filter: any[] = []
    if (category) filter.push({ field: 'category', operator: 'eq' as const, value: category })
    const result = await ckMenuItemRepo.findMany({
      page: 1, pageSize: 100,
      filter: filter.length > 0 ? filter : undefined,
      search: search || undefined,
      sort: [{ field: 'sortOrder', direction: 'asc' }],
    })
    if ('items' in result) setItems(result.items as MenuItem[])
    setLoading(false)
  }, [search, category])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Menu" description={`${items.length} items`} action={
          <Link to="/fastfood/menu/new"><Button icon={<Plus className="h-4 w-4" />}>Add Item</Button></Link>
        } />
        <div className="mb-4 flex gap-3 px-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {Object.entries(MENU_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? <p className="col-span-full text-center text-gray-500">Loading...</p> :
           items.length === 0 ? <p className="col-span-full text-center text-gray-500"><UtensilsCrossed className="mx-auto mb-2 h-10 w-10 text-gray-300" />No menu items</p> :
           items.map((item) => (
            <div key={item.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs text-gray-500">{item.itemCode}</span>
                <Badge color={item.status === 'available' ? 'green' : item.status === 'sold_out' ? 'red' : 'gray'} size="sm">{MENU_STATUS_LABELS[item.status]}</Badge>
              </div>
              <h4 className="font-semibold text-gray-900">{item.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{MENU_CATEGORY_LABELS[item.category]}</p>
              <p className="text-lg font-bold text-green-700">₱{item.price.toFixed(2)}</p>
              {item.isFeatured && <Badge color="yellow" size="sm" className="mt-1">Featured</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
