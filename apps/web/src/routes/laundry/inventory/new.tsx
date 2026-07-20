/**
 * ─── New Inventory Item ──────────────────────────────────────
 * Add supplies: detergent, softener, packaging, etc.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { laundryInventoryRepo } from '../../../lib/db'
import { INVENTORY_CATEGORY_LABELS } from '@repo/entity-laundry'
import { Save, ArrowLeft, Check } from 'lucide-react'
import { LaundryInventoryService } from '@repo/entity-laundry'

export function CreateLaundryInventoryPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    itemCode: '', name: '', category: 'detergent' as string,
    unit: 'liter' as string, quantityOnHand: '', minStockLevel: '5',
    maxStockLevel: '100', costPerUnit: '', supplierName: '',
    expirationDate: '', notes: '',
  })
  const h = (f: string, v: string) => setForm({ ...form, [f]: v })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true)
    try {
      const qty = parseFloat(form.quantityOnHand) || 0
      await laundryInventoryRepo.create({
        tenantId: 'default', itemCode: form.itemCode, name: form.name,
        category: form.category as any, unit: form.unit as any,
        quantityOnHand: qty,
        minStockLevel: parseFloat(form.minStockLevel) || 5,
        maxStockLevel: parseFloat(form.maxStockLevel) || 100,
        costPerUnit: parseFloat(form.costPerUnit) || 0,
        supplierName: form.supplierName || undefined,
        expirationDate: form.expirationDate || undefined,
        status: LaundryInventoryService.computeStatus(qty, parseFloat(form.minStockLevel) || 5),
        notes: form.notes || undefined,
      } as any)
      setSuccess(true); setTimeout(() => navigate({ to: '/laundry/inventory' }), 1000)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  if (success) return <div className="flex h-full items-center justify-center p-6"><Card><div className="p-12 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div><h2 className="text-xl font-semibold">Item Added!</h2></div></Card></div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader title="Add Inventory Item" action={<Button variant="outline" onClick={() => navigate({ to: '/laundry/inventory' })} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>} />
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Item Code <span className="text-red-500">*</span></label><Input value={form.itemCode} onChange={(e) => h('itemCode', e.target.value)} required maxLength={20} /></div>
            <div><label className="mb-1 block text-sm font-medium">Name <span className="text-red-500">*</span></label><Input value={form.name} onChange={(e) => h('name', e.target.value)} required maxLength={200} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Category</label><select value={form.category} onChange={(e) => h('category', e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">{Object.entries(INVENTORY_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium">Unit</label><select value={form.unit} onChange={(e) => h('unit', e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="liter">Liter</option><option value="kilogram">Kilogram</option><option value="piece">Piece</option><option value="pack">Pack</option><option value="box">Box</option><option value="bottle">Bottle</option></select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Quantity</label><Input type="number" value={form.quantityOnHand} onChange={(e) => h('quantityOnHand', e.target.value)} min="0" step="0.01" /></div>
            <div><label className="mb-1 block text-sm font-medium">Min Stock</label><Input type="number" value={form.minStockLevel} onChange={(e) => h('minStockLevel', e.target.value)} min="0" /></div>
            <div><label className="mb-1 block text-sm font-medium">Max Stock</label><Input type="number" value={form.maxStockLevel} onChange={(e) => h('maxStockLevel', e.target.value)} min="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Cost Per Unit</label><Input type="number" value={form.costPerUnit} onChange={(e) => h('costPerUnit', e.target.value)} min="0" step="0.01" /></div>
            <div><label className="mb-1 block text-sm font-medium">Supplier</label><Input value={form.supplierName} onChange={(e) => h('supplierName', e.target.value)} maxLength={200} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Expiration Date</label><Input type="date" value={form.expirationDate} onChange={(e) => h('expirationDate', e.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium">Notes</label><Input value={form.notes} onChange={(e) => h('notes', e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/laundry/inventory' })}>Cancel</Button>
            <Button type="submit" disabled={saving} icon={<Save className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
