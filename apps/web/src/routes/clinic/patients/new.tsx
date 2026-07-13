/**
 * ─── Register New Clinic Patient Page ────────────────────────
 * Form to register a new patient in the Clinic Management System.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { clinicPatientRepo } from '../../../lib/db'
import { CreateClinicPatientSchema } from '@repo/entity-clinic'
import { ChevronLeft, Save } from 'lucide-react'

interface FormErrors { [key: string]: string }

export function ClinicNewPatientPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    patientCode: `PT-${Date.now()}`,
    firstName: '',
    lastName: '',
    sex: 'male' as const,
    dateOfBirth: '',
    bloodType: 'unknown' as const,
    phone: '',
    email: '',
    address: '',
    barangay: '',
    city: '',
    province: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    allergies: '',
    chronicConditions: '',
    status: 'active' as const,
    notes: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const parsed = CreateClinicPatientSchema.parse({
        tenantId: 'default',
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        barangay: formData.barangay || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelation: formData.emergencyContactRelation || undefined,
        allergies: formData.allergies || undefined,
        chronicConditions: formData.chronicConditions || undefined,
        notes: formData.notes || undefined,
      })

      const patient = await clinicPatientRepo.create(parsed as any)
      navigate({ to: '/clinic/patients/$id', params: { id: patient.id } })
    } catch (error: any) {
      if (error?.issues) {
        const formErrors: FormErrors = {}
        for (const issue of error.issues) formErrors[issue.path.join('.')] = issue.message
        setErrors(formErrors)
      } else {
        setErrors({ _form: error?.message ?? 'Failed to save patient' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/clinic/patients' })}
          icon={<ChevronLeft className="h-4 w-4" />}>
          Back to Patients
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader title="Register New Patient" description="Add a new patient to the clinic registry" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors._form && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors._form}</div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Patient Code" name="patientCode" required value={formData.patientCode}
                onChange={set('patientCode')} error={errors.patientCode} helperText="Auto-generated, editable" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex <span className="text-red-500">*</span></label>
                <select value={formData.sex} onChange={set('sex')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input label="First Name" name="firstName" required value={formData.firstName}
                onChange={set('firstName')} error={errors.firstName} />
              <Input label="Last Name" name="lastName" required value={formData.lastName}
                onChange={set('lastName')} error={errors.lastName} />
              <Input label="Date of Birth" name="dateOfBirth" required type="date" value={formData.dateOfBirth}
                onChange={set('dateOfBirth')} error={errors.dateOfBirth} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select value={formData.bloodType} onChange={set('bloodType')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt === 'unknown' ? 'Unknown' : bt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={set('phone')} error={errors.phone} />
              <Input label="Email" name="email" type="email" value={formData.email} onChange={set('email')} error={errors.email} />
              <div className="sm:col-span-2">
                <Input label="Address" name="address" value={formData.address} onChange={set('address')} error={errors.address} />
              </div>
              <Input label="Barangay" name="barangay" value={formData.barangay} onChange={set('barangay')} />
              <Input label="City/Municipality" name="city" value={formData.city} onChange={set('city')} />
              <Input label="Province" name="province" value={formData.province} onChange={set('province')} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Emergency Contact</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Name" value={formData.emergencyContactName} onChange={set('emergencyContactName')} />
              <Input label="Phone" type="tel" value={formData.emergencyContactPhone} onChange={set('emergencyContactPhone')} />
              <Input label="Relationship" value={formData.emergencyContactRelation} onChange={set('emergencyContactRelation')} />
            </div>
          </div>

          {/* Medical History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Medical History</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Known Allergies</label>
                <textarea rows={2} placeholder="e.g., Penicillin, Aspirin..." value={formData.allergies}
                  onChange={set('allergies')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                <textarea rows={2} placeholder="e.g., Diabetes Type 2, Hypertension..." value={formData.chronicConditions}
                  onChange={set('chronicConditions')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} placeholder="Additional notes..." value={formData.notes} onChange={set('notes')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/clinic/patients' })}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Register Patient</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
