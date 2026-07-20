/**
 * ─── Create Branch Page ──────────────────────────────────────
 * Form to register a new branch/office for the cooperative.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { branchRepo } from '../../lib/db'
import { CreateBranchSchema } from '@repo/entity-branch'
import type { Branch } from '@repo/entity-branch'
import { Building2, Save, ArrowLeft, Check } from 'lucide-react'

export function CreateBranchPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    branchCode: '',
    name: '',
    address: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    phone: '',
    email: '',
    managerName: '',
    isMainBranch: false,
    status: 'active' as const,
    notes: '',
    coordinates: '',
  })

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Build input for the repository
      const input: any = {
        tenantId: 'default', // Will be overridden by tenant middleware
        branchCode: form.branchCode,
        name: form.name,
        address: form.address || undefined,
        barangay: form.barangay || undefined,
        cityMunicipality: form.cityMunicipality || undefined,
        province: form.province || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        managerName: form.managerName || undefined,
        isMainBranch: form.isMainBranch,
        status: form.status,
        notes: form.notes || undefined,
        coordinates: form.coordinates || undefined,
      }

      await branchRepo.create(input)
      setSuccess(true)
      setTimeout(() => navigate({ to: '/branches' }), 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create branch')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card>
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Branch Created!</h2>
            <p className="mt-2 text-gray-500">Redirecting to branches list...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Add Branch"
          description="Register a new office or branch location"
          action={
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/branches' })}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Section: Basic Info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Branch Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.branchCode}
                  onChange={(e) => handleChange('branchCode', e.target.value.toUpperCase())}
                  placeholder="e.g., BAT-MAIN"
                  required
                  maxLength={20}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Batangas Cooperative — Lipa Branch"
                  required
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* Section: Address */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Address
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <Input
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Rizal Street"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Barangay</label>
                <Input
                  value={form.barangay}
                  onChange={(e) => handleChange('barangay', e.target.value)}
                  placeholder="Barangay"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  City / Municipality
                </label>
                <Input
                  value={form.cityMunicipality}
                  onChange={(e) => handleChange('cityMunicipality', e.target.value)}
                  placeholder="City or Municipality"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
                <Input
                  value={form.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  placeholder="Province"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Management */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Contact &amp; Management
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="09123456789"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="branch@coop.com"
                  type="email"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Branch Manager
                </label>
                <Input
                  value={form.managerName}
                  onChange={(e) => handleChange('managerName', e.target.value)}
                  placeholder="Full name"
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* Section: Settings */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Settings
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isMainBranch"
                  checked={form.isMainBranch}
                  onChange={(e) => handleChange('isMainBranch', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isMainBranch" className="text-sm font-medium text-gray-700">
                  This is the Main / Head Office
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Additional Notes
            </h3>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional information about this branch..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/branches' })}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              icon={saving ? undefined : <Save className="h-4 w-4" />}
            >
              {saving ? 'Saving...' : 'Save Branch'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
