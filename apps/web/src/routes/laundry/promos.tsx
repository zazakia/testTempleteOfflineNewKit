/**
 * ─── Laundry Promo Codes ─────────────────────────────────────
 * Create & manage promotions, discount codes, seasonal campaigns.
 * Proposal reference: Section 9 — Loyalty & Promotions
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryPromoCodeRepo } from '../../lib/db'
import type { PromoCode } from '@repo/entity-laundry'
import { PROMO_TYPE_LABELS, PROMO_STATUS_LABELS, PROMO_TARGET_LABELS } from '@repo/entity-laundry'
import { Plus, Ticket, Search, Save, ArrowLeft, Check, X } from 'lucide-react'

export function LaundryPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: '', name: '', description: '', promoType: 'discount_percent' as string,
    value: '', minOrderAmount: '0', maxDiscountCap: '',
    target: 'all_customers' as string, eligibleTiers: '' as string,
    maxUses: '100', maxUsesPerCustomer: '1',
    startsAt: new Date().toISOString().slice(0,10),
    endsAt: new Date(Date.now()+30*86400000).toISOString().slice(0,10),
    campaign: '', notes: '',
    freeItemThreshold: '', freeItemCount: '1',
    branchIds: '', // comma-separated branch IDs, blank = all branches
  })
  const h = (f: string, v: string) => setForm({ ...form, [f]: v })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await laundryPromoCodeRepo.findMany({ page: 1, pageSize: 200, sort: [{ field: 'endsAt', direction: 'desc' }] })
    setPromos(('items' in res ? res.items : []) as PromoCode[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true)
    try {
      await laundryPromoCodeRepo.create({
        tenantId: 'default', code: form.code.toUpperCase(), name: form.name,
        description: form.description || undefined, promoType: form.promoType as any,
        value: parseFloat(form.value) || 0,
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxDiscountCap: form.maxDiscountCap ? parseFloat(form.maxDiscountCap) : undefined,
        target: form.target as any,
        eligibleTiers: form.eligibleTiers ? form.eligibleTiers.split(',').map(t => t.trim()) : undefined,
        status: 'active', maxUses: parseInt(form.maxUses) || 100, currentUses: 0,
        maxUsesPerCustomer: parseInt(form.maxUsesPerCustomer) || 1,
        freeItemThreshold: form.freeItemThreshold ? parseInt(form.freeItemThreshold) : undefined,
        freeItemCount: form.freeItemCount ? parseInt(form.freeItemCount) : 1,
        branchIds: form.branchIds ? form.branchIds.split(',').map(b => b.trim()).filter(Boolean) : undefined,
        startsAt: new Date(form.startsAt).getTime(),
        endsAt: new Date(form.endsAt).getTime(),
        campaign: form.campaign || undefined, notes: form.notes || undefined,
      } as any)
      setShowForm(false)
      setForm({ ...form, code: '', name: '', value: '', campaign: '', freeItemThreshold: '', branchIds: '' })
      load()
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  const toggleStatus = async (promo: PromoCode) => {
    try {
      await laundryPromoCodeRepo.update(promo.id, {
        status: promo.status === 'active' ? 'paused' : 'active',
        version: promo.version,
      } as any)
      load()
    } catch (err: any) { setError(err.message) }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Promo Codes" description={`${promos.filter(p => p.status === 'active').length} active`} action={
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>
            {showForm ? 'Cancel' : 'Create Promo'}
          </Button>
        } />

        {showForm && (
          <form onSubmit={handleCreate} className="p-4 mb-4 border-b space-y-4 bg-gray-50 rounded-lg">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="grid grid-cols-3 gap-4">
              <div><label className="mb-1 block text-xs font-medium">Code <span className="text-red-500">*</span></label><Input value={form.code} onChange={(e) => h('code', e.target.value)} required maxLength={20} placeholder="SUMMER20" /></div>
              <div className="col-span-2"><label className="mb-1 block text-xs font-medium">Name <span className="text-red-500">*</span></label><Input value={form.name} onChange={(e) => h('name', e.target.value)} required placeholder="Summer Sale 20% Off" /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="mb-1 block text-xs font-medium">Type</label><select value={form.promoType} onChange={(e) => h('promoType', e.target.value)} className="w-full rounded-lg border px-2 py-1.5 text-xs">{Object.entries(PROMO_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-medium">Value</label><Input type="number" value={form.value} onChange={(e) => h('value', e.target.value)} required /></div>
              <div><label className="mb-1 block text-xs font-medium">Min Order</label><Input type="number" value={form.minOrderAmount} onChange={(e) => h('minOrderAmount', e.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium">Max Cap</label><Input type="number" value={form.maxDiscountCap} onChange={(e) => h('maxDiscountCap', e.target.value)} /></div>
            </div>
            {form.promoType === 'free_item' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-xs font-medium">Buy (threshold)</label><Input type="number" value={form.freeItemThreshold} onChange={(e) => h('freeItemThreshold', e.target.value)} placeholder="10" min="1" /></div>
                <div><label className="mb-1 block text-xs font-medium">Get Free</label><Input type="number" value={form.freeItemCount} onChange={(e) => h('freeItemCount', e.target.value)} placeholder="1" min="1" /></div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div><label className="mb-1 block text-xs font-medium">Target</label><select value={form.target} onChange={(e) => h('target', e.target.value)} className="w-full rounded-lg border px-2 py-1.5 text-xs">{Object.entries(PROMO_TARGET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-medium">Campaign</label><Input value={form.campaign} onChange={(e) => h('campaign', e.target.value)} placeholder="Summer 2026" /></div>
              <div><label className="mb-1 block text-xs font-medium">Tiers (comma-sep)</label><Input value={form.eligibleTiers} onChange={(e) => h('eligibleTiers', e.target.value)} placeholder="silver,gold" /></div>
              <div><label className="mb-1 block text-xs font-medium">Branch IDs (blank=all)</label><Input value={form.branchIds} onChange={(e) => h('branchIds', e.target.value)} placeholder="branch-id-1,branch-id-2" /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="mb-1 block text-xs font-medium">Max Uses</label><Input type="number" value={form.maxUses} onChange={(e) => h('maxUses', e.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium">Per Customer</label><Input type="number" value={form.maxUsesPerCustomer} onChange={(e) => h('maxUsesPerCustomer', e.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium">Starts</label><Input type="date" value={form.startsAt} onChange={(e) => h('startsAt', e.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium">Ends</label><Input type="date" value={form.endsAt} onChange={(e) => h('endsAt', e.target.value)} /></div>
            </div>
            <div className="flex justify-end"><Button type="submit" disabled={saving} icon={<Save className="h-4 w-4" />}>{saving ? 'Creating...' : 'Create Promo'}</Button></div>
          </form>
        )}

        <div className="divide-y">
          {loading ? <p className="p-4 text-sm text-gray-500">Loading...</p> : promos.length === 0 ? <p className="p-4 text-sm text-gray-500"><Ticket className="mx-auto mb-2 h-10 w-10 text-gray-300" />No promo codes</p> :
            promos.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-green-700 text-lg">{p.code}</span>
                    <Badge color={p.status === 'active' ? 'green' : p.status === 'scheduled' ? 'blue' : p.status === 'expired' ? 'gray' : 'yellow'} size="sm">{PROMO_STATUS_LABELS[p.status]}</Badge>
                  </div>
                  <p className="text-sm font-medium mt-1">{p.name}</p>
                  <p className="text-xs text-gray-500">{PROMO_TYPE_LABELS[p.promoType]} · {PROMO_TARGET_LABELS[p.target]} · {p.currentUses}/{p.maxUses} used</p>
                  {p.promoType === 'free_item' && p.freeItemThreshold && <p className="text-xs text-purple-600 font-medium">Buy {p.freeItemThreshold} Get {p.freeItemCount ?? 1} Free</p>}
                  {p.campaign && <p className="text-xs text-purple-600">Campaign: {p.campaign}</p>}
                  {p.branchIds && p.branchIds.length > 0 && <p className="text-xs text-blue-600">{p.branchIds.length} branch(es)</p>}
                  {!p.branchIds || p.branchIds.length === 0 ? <p className="text-xs text-green-600">All Branches</p> : null}
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500">{new Date(p.endsAt).toLocaleDateString()}</span>
                  {p.status !== 'expired' && (
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(p)}>{p.status === 'active' ? 'Pause' : 'Activate'}</Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
