/**
 * ─── Clinic Patient Detail Page ──────────────────────────────
 * View detailed patient record for the Clinic Management System.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Badge } from '@repo/ui-core'
import { clinicPatientRepo } from '../../../lib/db'
import type { ClinicPatient } from '@repo/entity-clinic'
import { PATIENT_STATUS_LABELS, PATIENT_STATUS_COLORS } from '@repo/entity-clinic'
import { ChevronLeft, Edit3 } from 'lucide-react'

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500 sm:w-48 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value || <span className="text-gray-400">—</span>}</dd>
    </div>
  )
}

export function ClinicPatientDetailPage() {
  const params = useParams({ from: '/clinic/patients/$id' })
  const id = (params as any).id ?? ''
  const navigate = useNavigate()
  const [patient, setPatient] = useState<ClinicPatient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await clinicPatientRepo.findById(id)
        setPatient(result)
      } catch (error) {
        console.error('Failed to load patient:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-500">Patient not found.</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/clinic/patients' })}>Back to Patients</Button>
          </div>
        </Card>
      </div>
    )
  }

  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/clinic/patients' })}
          icon={<ChevronLeft className="h-4 w-4" />}>Back to Patients</Button>
      </div>

      {/* Patient Summary Card */}
      <Card>
        <CardHeader
          title={patient.fullName}
          description={`${patient.patientCode} · ${age ? `${age} years old` : ''} · ${patient.sex}`}
          action={
            <div className="flex gap-2 items-center">
              <Badge color={PATIENT_STATUS_COLORS[patient.status]}>
                {PATIENT_STATUS_LABELS[patient.status]}
              </Badge>
              <Button size="sm" variant="outline" icon={<Edit3 className="h-4 w-4" />}>Edit</Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Personal Information */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h3>
            <dl>
              <DetailRow label="Full Name" value={patient.fullName} />
              <DetailRow label="Patient Code" value={patient.patientCode} />
              <DetailRow label="Date of Birth" value={patient.dateOfBirth} />
              <DetailRow label="Age" value={age ? `${age} years` : undefined} />
              <DetailRow label="Sex" value={patient.sex} />
              <DetailRow label="Blood Type" value={patient.bloodType} />
            </dl>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
            <dl>
              <DetailRow label="Phone" value={patient.phone} />
              <DetailRow label="Email" value={patient.email} />
              <DetailRow label="Address" value={patient.address} />
              <DetailRow label="Barangay" value={patient.barangay} />
              <DetailRow label="City/Municipality" value={patient.city} />
              <DetailRow label="Province" value={patient.province} />
            </dl>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Emergency Contact</h3>
            <dl>
              <DetailRow label="Name" value={patient.emergencyContactName} />
              <DetailRow label="Phone" value={patient.emergencyContactPhone} />
              <DetailRow label="Relationship" value={patient.emergencyContactRelation} />
            </dl>
          </div>

          {/* Medical History */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Medical History</h3>
            <dl>
              <DetailRow label="Known Allergies" value={patient.allergies} />
              <DetailRow label="Chronic Conditions" value={patient.chronicConditions} />
              <DetailRow label="Notes" value={patient.notes} />
            </dl>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" icon={<Edit3 className="h-4 w-4" />}>
          New Appointment
        </Button>
        <Button variant="outline">
          View Consultation Records
        </Button>
        <Button variant="outline">
          View Billing History
        </Button>
      </div>

      {/* Record info */}
      <p className="text-xs text-gray-400">
        Created: {new Date(patient.createdAt).toLocaleString()} ·
        Last updated: {new Date(patient.updatedAt).toLocaleString()} ·
        Version: {patient.version}
      </p>
    </div>
  )
}
