/**
 * ─── Branch Detail Page ──────────────────────────────────────
 * View and edit a single branch. Shows branch info, stats, and actions.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { branchRepo } from '../../lib/db'
import type { Branch } from '@repo/entity-branch'
import {
  BRANCH_STATUS_LABELS,
  BRANCH_STATUS_COLORS,
  UpdateBranchSchema,
} from '@repo/entity-branch'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Save,
  ArrowLeft,
  Trash2,
  Edit3,
  X,
} from 'lucide-react'

export function BranchDetailPage() {
  const { id } = useParams({ from: '/branches/$id' })
  const navigate = useNavigate()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editForm, setEditForm] = useState<Partial<Branch>>({})

  const loadBranch = useCallback(async () => {
    setLoading(true)
    try {
      const record = await branchRepo.findById(id)
      setBranch(record)
      if (record) {
        setEditForm({
          name: record.name,
          branchCode: record.branchCode,
          address: record.address,
          barangay: record.barangay,
          cityMunicipality: record.cityMunicipality,
          province: record.province,
          phone: record.phone,
          email: record.email,
          managerName: record.managerName,
          isMainBranch: record.isMainBranch,
          status: record.status,
          notes: record.notes,
          coordinates: record.coordinates,
        })
      }
    } catch (err) {
      console.error('Failed to load branch:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadBranch() }, [loadBranch])

  const handleSave = async () => {
    if (!branch) return
    setSaving(true)
    setError(null)
    try {
      const updated = await branchRepo.update(id, {
        ...editForm,
        version: branch.version,
      } as any)
      setBranch(updated)
      setEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update branch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!branch) return
    if (!confirm(`Are you sure you want to delete branch "${branch.name}"? This is a soft-delete and can be recovered.`)) return
    try {
      await branchRepo.delete(id)
      navigate({ to: '/branches' })
    } catch (err: any) {
      setError(err.message || 'Failed to delete branch')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-gray-500">Loading branch...</p>
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900">Branch not found</h2>
          <p className="mt-1 text-sm text-gray-500">This branch may have been deleted.</p>
          <Button variant="outline" onClick={() => navigate({ to: '/branches' })} className="mt-4">
            Back to Branches
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title={editing ? 'Edit Branch' : branch.name}
          description={`Branch Code: ${branch.branchCode}`}
          action={
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    icon={<X className="h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/branches' })}
                    icon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    icon={<Edit3 className="h-4 w-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    icon={<Trash2 className="h-4 w-4 text-red-500" />}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          }
        />

        {error && (
          <div className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {editing ? (
          /* Edit Mode */
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Branch Code</label>
                <Input
                  value={editForm.branchCode ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, branchCode: e.target.value.toUpperCase() })}
                  maxLength={20}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  maxLength={200}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <Input
                  value={editForm.address ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  maxLength={500}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Barangay</label>
                <Input
                  value={editForm.barangay ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, barangay: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City/Municipality</label>
                <Input
                  value={editForm.cityMunicipality ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, cityMunicipality: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
                <Input
                  value={editForm.province ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={editForm.phone ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <Input
                  value={editForm.email ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  type="email"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Manager</label>
                <Input
                  value={editForm.managerName ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editIsMain"
                  checked={editForm.isMainBranch ?? false}
                  onChange={(e) => setEditForm({ ...editForm, isMainBranch: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="editIsMain" className="text-sm font-medium text-gray-700">
                  Main / Head Office
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editForm.status ?? 'active'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editForm.notes ?? ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6 p-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge color={BRANCH_STATUS_COLORS[branch.status]}>
                {BRANCH_STATUS_LABELS[branch.status]}
              </Badge>
              {branch.isMainBranch && <Badge color="purple">Main Office</Badge>}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Location */}
              {(branch.address || branch.cityMunicipality || branch.province) && (
                <div className="flex gap-3 rounded-lg border border-gray-200 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Address
                    </p>
                    <p className="text-sm text-gray-900">
                      {[branch.address, branch.barangay, branch.cityMunicipality, branch.province]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {branch.phone && (
                <div className="flex gap-3 rounded-lg border border-gray-200 p-4">
                  <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{branch.phone}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {branch.email && (
                <div className="flex gap-3 rounded-lg border border-gray-200 p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{branch.email}</p>
                  </div>
                </div>
              )}

              {/* Manager */}
              {branch.managerName && (
                <div className="flex gap-3 rounded-lg border border-gray-200 p-4">
                  <User className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Branch Manager
                    </p>
                    <p className="text-sm text-gray-900">{branch.managerName}</p>
                  </div>
                </div>
              )}

              {/* Opened Date */}
              {branch.openedDate && (
                <div className="flex gap-3 rounded-lg border border-gray-200 p-4">
                  <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Opened</p>
                    <p className="text-sm text-gray-900">
                      {new Date(branch.openedDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {branch.notes && (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Notes</p>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{branch.notes}</p>
              </div>
            )}

            {/* Meta */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-400">
                Created {new Date(branch.createdAt).toLocaleDateString()} · Updated{' '}
                {new Date(branch.updatedAt).toLocaleDateString()} · Version {branch.version}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
