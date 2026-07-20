/**
 * ─── New Laundry Service ─────────────────────────────────────
 * Add a service to the catalog with flexible pricing.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { laundryServiceRepo } from '../../../lib/db'
import { SERVICE_CATEGORY_LABELS, PRICING_UNIT_LABELS } from '@repo/entity-laundry'
import { Save, ArrowLeft, Check } from 'lucide-react'

export function CreateLaundryServicePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    serviceCode: '', name: '', description: '',
    category: 'wash_dry' as string, pricingUnit: 'per_kg' as string,
    basePrice: '', minCharge: '', turnaroundHours: '24',
    sortOrder: '0', status: 'active' as string, notes: '',
  })
  const h = (f: string, v: string) => setForm({ ...form, [f]: v })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true)
    try {
      await laundryServiceRepo.create({
        tenantId: 'default', serviceCode: form.serviceCode, name: form.name,
        description: form.description || undefined, category: form.category as any,
        pricingUnit: form.pricingUnit as any, basePrice: parseFloat(form.basePrice) || 0,
        minCharge: parseFloat(form.minCharge) || 0,
        turnaroundHours: parseInt(form.turnaroundHours) || 24,
        requiresSpecialHandling: false, sortOrder: parseInt(form.sortOrder) || 0,
        status: form.status as any, notes: form.notes || undefined,
      } as any)
      setSuccess(true)
      setTimeout(() => navigate({ to: '/laundry/services' }), 1000)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  if (success) return <div className="flex h-full items-center justify-center p-6"><Card><div className="p-12 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div><h2 className="text-xl font-semibold">Service Added!</h2></div></Card></div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader title="New Service" action={<Button variant="outline" onClick={() => navigate({ to: '/laundry/services' })} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>} />
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Code <span className="text-red-500">*</span></label><Input value={form.serviceCode} onChange={(e) => h('serviceCode', e.target.value)} required maxLength={20} /></div>
            <div><label className="mb-1 block text-sm font-medium">Name <span className="text-red-500">*</span></label><Input value={form.name} onChange={(e) => h('name', e.target.value)} required maxLength={200} /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Description</label><Input value={form.description} onChange={(e) => h('description', e.target.value)} maxLength={500} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Category</label><select value={form.category} onChange={(e) => h('category', e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">{Object.entries(SERVICE_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium">Pricing Unit</label><select value={form.pricingUnit} onChange={(e) => h('pricingUnit', e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">{Object.entries(PRICING_UNIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Base Price <span className="text-red-500">*</span></label><Input type="number" value={form.basePrice} onChange={(e) => h('basePrice', e.target.value)} required min="0" step="0.01" /></div>
            <div><label className="mb-1 block text-sm font-medium">Min Charge</label><Input type="number" value={form.minCharge} onChange={(e) => h('minCharge', e.target.value)} min="0" step="0.01" /></div>
            <div><label className="mb-1 block text-sm font-medium">Turnaround (hrs)</label><Input type="number" value={form.turnaroundHours} onChange={(e) => h('turnaroundHours', e.target.value)} min="1" max="720" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Sort Order</label><Input type="number" value={form.sortOrder} onChange={(e) => h('sortOrder', e.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium">Status</label><select value={form.status} onChange={(e) => h('status', e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="seasonal">Seasonal</option></select></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Notes</label><Input value={form.notes} onChange={(e) => h('notes', e.target.value)} /></div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/laundry/services' })}>Cancel</Button>
            <Button type="submit" disabled={saving} icon={<Save className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
