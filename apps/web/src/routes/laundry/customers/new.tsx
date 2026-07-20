/**
 * ─── New Laundry Customer ────────────────────────────────────
 * Register a new customer with loyalty program signup.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { laundryCustomerRepo } from '../../../lib/db'
import { LaundryCustomerService } from '@repo/entity-laundry'
import { Save, ArrowLeft, Check, User, Phone, Mail, MapPin } from 'lucide-react'

export function CreateLaundryCustomerPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', barangay: '', city: '', province: '',
    customerType: 'regular' as const,
    preferences: '', deliveryAddress: '',
  })

  const handleChange = (field: string, value: string) => setForm({ ...form, [field]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true)
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`
      const code = LaundryCustomerService.generateCustomerCode(Math.floor(Math.random() * 9999))
      await laundryCustomerRepo.create({
        tenantId: 'default', customerCode: code,
        firstName: form.firstName, lastName: form.lastName, fullName,
        phone: form.phone || undefined, email: form.email || undefined,
        address: form.address || undefined, barangay: form.barangay || undefined,
        city: form.city || undefined, province: form.province || undefined,
        customerType: form.customerType, customerTier: 'bronze',
        lifetimeSpend: 0, loyaltyPoints: 0,
        preferences: form.preferences || undefined,
        deliveryAddress: form.deliveryAddress || undefined,
        firstVisitDate: new Date().toISOString().slice(0, 10),
        status: 'active',
      } as any)
      setSuccess(true)
      setTimeout(() => navigate({ to: '/laundry/customers' }), 1000)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  if (success) {
    return <div className="flex h-full items-center justify-center p-6"><Card><div className="p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Check className="h-8 w-8 text-green-600" /></div>
      <h2 className="text-xl font-semibold">Customer Registered!</h2><p className="mt-2 text-gray-500">Redirecting...</p>
    </div></Card></div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader title="New Customer" description="Register with loyalty program" action={
          <Button variant="outline" onClick={() => navigate({ to: '/laundry/customers' })} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        } />
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500"><User className="mr-1 inline h-4 w-4" />Personal Info</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium">First Name <span className="text-red-500">*</span></label><Input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required /></div>
              <div><label className="mb-1 block text-sm font-medium">Last Name <span className="text-red-500">*</span></label><Input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required /></div>
              <div><label className="mb-1 block text-sm font-medium"><Phone className="mr-1 inline h-3 w-3" />Phone</label><Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="09XX-XXX-XXXX" /></div>
              <div><label className="mb-1 block text-sm font-medium"><Mail className="mr-1 inline h-3 w-3" />Email</label><Input value={form.email} onChange={(e) => handleChange('email', e.target.value)} type="email" placeholder="customer@email.com" /></div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500"><MapPin className="mr-1 inline h-4 w-4" />Address</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium">Street Address</label><Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} /></div>
              <div><label className="mb-1 block text-sm font-medium">Barangay</label><Input value={form.barangay} onChange={(e) => handleChange('barangay', e.target.value)} /></div>
              <div><label className="mb-1 block text-sm font-medium">City</label><Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} /></div>
              <div><label className="mb-1 block text-sm font-medium">Province</label><Input value={form.province} onChange={(e) => handleChange('province', e.target.value)} /></div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">Preferences</h3>
            <div className="space-y-3">
              <div><label className="mb-1 block text-sm font-medium">Customer Type</label>
                <select value={form.customerType} onChange={(e) => handleChange('customerType', e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="walk_in">Walk-in</option><option value="regular">Regular</option><option value="corporate">Corporate</option>
                </select>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Care Preferences</label><Input value={form.preferences} onChange={(e) => handleChange('preferences', e.target.value)} placeholder="e.g., gentle cycle, no bleach, cold water" /></div>
              <div><label className="mb-1 block text-sm font-medium">Delivery Address (if different)</label><Input value={form.deliveryAddress} onChange={(e) => handleChange('deliveryAddress', e.target.value)} /></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/laundry/customers' })}>Cancel</Button>
            <Button type="submit" disabled={saving} icon={<Save className="h-4 w-4" />}>{saving ? 'Saving...' : 'Register Customer'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
