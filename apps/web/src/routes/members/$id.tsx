/**
 * ─── Member Detail Page ──────────────────────────────────────
 * View and edit cooperative member profile.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Badge } from '@repo/ui-core'
import { memberRepo } from '../../lib/db'
import type { Member } from '@repo/entity-member'
import { MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_COLORS, MEMBERSHIP_TYPE_LABELS, CIVIL_STATUS_LABELS } from '@repo/entity-member'
import { ChevronLeft, Edit3, Trash2, User } from 'lucide-react'

export function MemberDetailPage() {
  const params = useParams({ from: '/members/$id' })
  const id = (params as any).id ?? ''
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await memberRepo.findById(id)
        setMember(result)
      } catch (error) {
        console.error('Failed to load member:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Member not found</h2>
            <p className="mt-2 text-sm text-gray-500">This member may have been deleted.</p>
            <Button className="mt-4" variant="secondary" onClick={() => navigate({ to: '/members' })}>
              Back to Members
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/members' })}
            icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{member.fullName}</h1>
            <p className="text-sm text-gray-500">
              {member.membershipNumber} · Joined {member.dateJoined ? new Date(member.dateJoined).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={MEMBERSHIP_STATUS_COLORS[member.membershipStatus]} size="sm">
            {MEMBERSHIP_STATUS_LABELS[member.membershipStatus]}
          </Badge>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader title="Personal Information" />
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Full Name" value={member.fullName} />
            <InfoField label="Membership Number" value={member.membershipNumber} />
            <InfoField label="Membership Type" value={MEMBERSHIP_TYPE_LABELS[member.membershipType]} />
            <InfoField label="Status" value={MEMBERSHIP_STATUS_LABELS[member.membershipStatus]} />
            <InfoField label="Phone" value={member.phone} />
            <InfoField label="Email" value={member.email} />
            <InfoField label="Barangay" value={member.barangay} />
            <InfoField label="City/Municipality" value={member.cityMunicipality} />
            <InfoField label="Province" value={member.province} />
            <InfoField label="Civil Status" value={member.civilStatus ? CIVIL_STATUS_LABELS[member.civilStatus] : '—'} />
            <InfoField label="TIN Number" value={member.tinNumber} />
            <InfoField label="Employer" value={member.employer} />
            {member.pmesCompleted && <InfoField label="PMES Completed" value={member.pmesDate ? new Date(member.pmesDate).toLocaleDateString() : 'Yes'} />}
          </dl>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Activity" />
            <dl className="space-y-3">
              <MetaItem label="Version" value={`v${member.version}`} />
              <MetaItem label="Created" value={new Date(member.createdAt).toLocaleDateString()} />
              <MetaItem label="Updated" value={new Date(member.updatedAt).toLocaleDateString()} />
            </dl>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Actions" />
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" size="sm"
                onClick={() => navigate({ to: '/share-capital' })}
                icon={<User className="h-4 w-4" />}>Share Capital</Button>
              <Button variant="secondary" className="w-full justify-start" size="sm"
                onClick={() => navigate({ to: '/savings' })}
                icon={<User className="h-4 w-4" />}>Savings</Button>
              <Button variant="secondary" className="w-full justify-start" size="sm"
                onClick={() => navigate({ to: '/loans/new' })}
                icon={<User className="h-4 w-4" />}>Apply for Loan</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}
