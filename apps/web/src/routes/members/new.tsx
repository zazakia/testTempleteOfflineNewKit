/**
 * ─── Create Member Page ──────────────────────────────────────
 * Registration form for new cooperative members.
 * Validates with Zod, writes to local Dexie DB.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { memberRepo } from '../../lib/db'
import { CreateMemberSchema } from '@repo/entity-member'
import { ChevronLeft, Save, UserPlus } from 'lucide-react'

interface FormErrors { [key: string]: string }

export function CreateMemberPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', nameExtension: '',
    phone: '', email: '',
    barangay: '', cityMunicipality: '', province: '', zipCode: '',
    membershipNumber: '',
    membershipType: 'regular' as const,
    pmesCompleted: false,
    employer: '', tinNumber: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const parsed = CreateMemberSchema.parse({
        tenantId: 'default',
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        nameExtension: formData.nameExtension || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        barangay: formData.barangay || undefined,
        cityMunicipality: formData.cityMunicipality || undefined,
        province: formData.province || undefined,
        zipCode: formData.zipCode || undefined,
        membershipNumber: formData.membershipNumber,
        membershipType: formData.membershipType,
        pmesCompleted: formData.pmesCompleted,
        employer: formData.employer || undefined,
        tinNumber: formData.tinNumber || undefined,
      })

      const member = await memberRepo.create(parsed)
      navigate({ to: '/members/$id', params: { id: member.id } })
    } catch (error: any) {
      if (error?.issues) {
        const formErrors: FormErrors = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.')
          formErrors[path] = issue.message
        }
        setErrors(formErrors)
      } else {
        setErrors({ _form: error?.message ?? 'An unexpected error occurred' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/members' })}
          icon={<ChevronLeft className="h-4 w-4" />}>Back to Members</Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader title="Register New Member"
          description="Enroll a new cooperative member. Fields marked with * are required." />

        <form onSubmit={handleSubmit} className="space-y-8">
          {errors._form && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors._form}</div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="First Name *" required placeholder="Juan" value={formData.firstName}
                onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))} error={errors.firstName} />
              <Input label="Middle Name" placeholder="Santos" value={formData.middleName}
                onChange={(e) => setFormData(f => ({ ...f, middleName: e.target.value }))} />
              <Input label="Last Name *" required placeholder="Dela Cruz" value={formData.lastName}
                onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))} error={errors.lastName} />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Contact</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone" type="tel" placeholder="0917XXXXXXX" value={formData.phone}
                onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Email" type="email" placeholder="juan@email.com" value={formData.email}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Address</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Barangay" placeholder="Barangay" value={formData.barangay}
                onChange={(e) => setFormData(f => ({ ...f, barangay: e.target.value }))} />
              <Input label="City/Municipality" placeholder="City" value={formData.cityMunicipality}
                onChange={(e) => setFormData(f => ({ ...f, cityMunicipality: e.target.value }))} />
              <Input label="Province" placeholder="Province" value={formData.province}
                onChange={(e) => setFormData(f => ({ ...f, province: e.target.value }))} />
            </div>
          </div>

          {/* Membership Details */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Membership Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Membership Number *" required placeholder="COOP-2026-0001" value={formData.membershipNumber}
                onChange={(e) => setFormData(f => ({ ...f, membershipNumber: e.target.value }))} error={errors.membershipNumber} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
                <select value={formData.membershipType}
                  onChange={(e) => setFormData(f => ({ ...f, membershipType: e.target.value as any }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="regular">Regular</option>
                  <option value="associate">Associate</option>
                </select>
              </div>
              <Input label="TIN Number" placeholder="XXX-XXX-XXX" value={formData.tinNumber}
                onChange={(e) => setFormData(f => ({ ...f, tinNumber: e.target.value }))} />
              <Input label="Employer" placeholder="Company Name" value={formData.employer}
                onChange={(e) => setFormData(f => ({ ...f, employer: e.target.value }))} />
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="pmesCompleted" checked={formData.pmesCompleted}
                  onChange={(e) => setFormData(f => ({ ...f, pmesCompleted: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <label htmlFor="pmesCompleted" className="text-sm text-gray-700">PMES Completed</label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/members' })}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Register Member</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
