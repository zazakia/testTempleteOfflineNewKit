/**
 * ─── Create Changelog Entry Page ────────────────────────────
 * Form to add a new entry to the changelog / roadmap.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { changelogRepo } from '../../lib/db'
import {
  ChangelogCategorySchema,
  ChangelogStatusSchema,
  AffectedPlatformSchema,
  CHANGELOG_CATEGORY_LABELS,
  CHANGELOG_STATUS_LABELS,
  PLATFORM_LABELS,
} from '@repo/entity-changelog'
import type { ChangelogCategory, ChangelogStatus, AffectedPlatform } from '@repo/entity-changelog'
import { Save, ArrowLeft, Check, Plus, X } from 'lucide-react'

const ALL_CATEGORIES = ChangelogCategorySchema.options as readonly ChangelogCategory[]
const ALL_STATUSES = ChangelogStatusSchema.options as readonly ChangelogStatus[]
const ALL_PLATFORMS = AffectedPlatformSchema.options as readonly AffectedPlatform[]

export function CreateChangelogEntryPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    version: '',
    title: '',
    category: 'feature' as ChangelogCategory,
    status: 'planned' as ChangelogStatus,
    description: '',
    purpose: '',
    impactNotes: '',
    affectedPlatforms: ['all'] as AffectedPlatform[],
    affectedModules: [] as { name: string; changeType: 'added' | 'modified' | 'removed' | 'fixed'; note?: string }[],
    releasedAt: new Date().toISOString().split('T')[0] ?? '',
    author: '',
    contributors: [] as string[],
    relatedLinks: [] as string[],
    isBreaking: false,
    migrationRequired: false,
    migrationNotes: '',
    tags: [] as string[],
  })

  // Dynamic list helpers
  const [newContributor, setNewContributor] = useState('')
  const [newLink, setNewLink] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newModuleName, setNewModuleName] = useState('')
  const [newModuleChangeType, setNewModuleChangeType] = useState<'added' | 'modified' | 'removed' | 'fixed'>('added')
  const [newModuleNote, setNewModuleNote] = useState('')

  const togglePlatform = (p: AffectedPlatform) => {
    setForm((prev) => {
      if (p === 'all') return { ...prev, affectedPlatforms: ['all'] }
      const withoutAll = prev.affectedPlatforms.filter((x) => x !== 'all')
      if (withoutAll.includes(p)) {
        const next = withoutAll.filter((x) => x !== p)
        return { ...prev, affectedPlatforms: next.length === 0 ? ['all'] : next }
      }
      return { ...prev, affectedPlatforms: [...withoutAll, p] }
    })
  }

  const addContributor = () => {
    if (newContributor.trim()) {
      setForm((prev) => ({ ...prev, contributors: [...prev.contributors, newContributor.trim()] }))
      setNewContributor('')
    }
  }

  const addLink = () => {
    if (newLink.trim()) {
      setForm((prev) => ({ ...prev, relatedLinks: [...prev.relatedLinks, newLink.trim()] }))
      setNewLink('')
    }
  }

  const addTag = () => {
    if (newTag.trim()) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim().toLowerCase()] }))
      setNewTag('')
    }
  }

  const addModule = () => {
    if (newModuleName.trim()) {
      setForm((prev) => ({
        ...prev,
        affectedModules: [
          ...prev.affectedModules,
          { name: newModuleName.trim(), changeType: newModuleChangeType, note: newModuleNote.trim() || undefined },
        ],
      }))
      setNewModuleName('')
      setNewModuleNote('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      await changelogRepo.create({
        tenantId: 'default',
        releaseVersion: form.version,
        title: form.title,
        category: form.category,
        status: form.status,
        description: form.description,
        purpose: form.purpose,
        impactNotes: form.impactNotes || undefined,
        affectedPlatforms: form.affectedPlatforms,
        affectedModules: form.affectedModules,
        releasedAt: new Date(form.releasedAt).getTime(),
        author: form.author,
        contributors: form.contributors.length > 0 ? form.contributors : undefined,
        relatedLinks: form.relatedLinks.length > 0 ? form.relatedLinks : undefined,
        isBreaking: form.isBreaking,
        migrationRequired: form.migrationRequired,
        migrationNotes: form.migrationNotes || undefined,
        tags: form.tags,
      } as any)
      setSuccess(true)
      setTimeout(() => navigate({ to: '/changelog' }), 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create changelog entry')
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
            <h2 className="text-xl font-semibold text-gray-900">Entry Created!</h2>
            <p className="mt-2 text-gray-500">Redirecting to changelog...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Add Changelog Entry"
          description="Record a new feature, bugfix, enhancement, or change"
          action={
            <Button variant="outline" onClick={() => navigate({ to: '/changelog' })} icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {/* Version & Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Version <span className="text-red-500">*</span></label>
              <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.2.0" required />
              <p className="mt-1 text-xs text-gray-400">Semver: major.minor.patch</p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Multi-Branch Support" required maxLength={200} />
            </div>
          </div>

          {/* Category, Status, Date, Author */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ChangelogCategory })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CHANGELOG_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ChangelogStatus })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{CHANGELOG_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Release Date <span className="text-red-500">*</span></label>
              <Input type="date" value={form.releasedAt} onChange={(e) => setForm({ ...form, releasedAt: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Author <span className="text-red-500">*</span></label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Your name" required maxLength={200} />
            </div>
          </div>

          {/* Description & Purpose */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of what changed. Supports markdown..."
              rows={6} required minLength={10} maxLength={10000}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="mt-1 text-xs text-gray-400">{form.description.length}/10000</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Purpose <span className="text-red-500">*</span></label>
            <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="Why this change was made — motivation and goals..."
              rows={3} required minLength={10} maxLength={5000}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Impact Notes</label>
            <textarea value={form.impactNotes} onChange={(e) => setForm({ ...form, impactNotes: e.target.value })}
              placeholder="What users/developers need to know about this change..."
              rows={3} maxLength={5000}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Platforms */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Affected Platforms</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <button key={p} type="button"
                  onClick={() => togglePlatform(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    form.affectedPlatforms.includes(p)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Affected Modules */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Affected Modules</label>
            <div className="flex gap-2 mb-2">
              <Input value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} placeholder="@repo/entity-..." className="flex-1" />
              <select value={newModuleChangeType} onChange={(e) => setNewModuleChangeType(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-28">
                <option value="added">Added</option>
                <option value="modified">Modified</option>
                <option value="removed">Removed</option>
                <option value="fixed">Fixed</option>
              </select>
              <Input value={newModuleNote} onChange={(e) => setNewModuleNote(e.target.value)} placeholder="Note (optional)" className="w-40" />
              <Button type="button" size="sm" variant="outline" onClick={addModule} icon={<Plus className="h-3 w-3" />}>Add</Button>
            </div>
            {form.affectedModules.length > 0 && (
              <div className="space-y-1 rounded-lg border border-gray-200 p-2">
                {form.affectedModules.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm">
                    <span><strong className="font-mono">{m.name}</strong> — <Badge color="blue" size="sm">{m.changeType}</Badge>{m.note ? ` — ${m.note}` : ''}</span>
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, affectedModules: prev.affectedModules.filter((_, j) => j !== i) }))}
                      className="text-red-400 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contributors, Links, Tags */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Contributors */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contributors</label>
              <div className="flex gap-2 mb-2">
                <Input value={newContributor} onChange={(e) => setNewContributor(e.target.value)} placeholder="Name" className="flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={addContributor} icon={<Plus className="h-3 w-3" />}>Add</Button>
              </div>
              {form.contributors.map((c, i) => (
                <div key={i} className="mb-1 flex items-center justify-between rounded bg-gray-50 px-3 py-1 text-sm">
                  {c}
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, contributors: prev.contributors.filter((_, j) => j !== i) }))}
                    className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            {/* Links */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Related Links</label>
              <div className="flex gap-2 mb-2">
                <Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://..." type="url" className="flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={addLink} icon={<Plus className="h-3 w-3" />}>Add</Button>
              </div>
              {form.relatedLinks.map((l, i) => (
                <div key={i} className="mb-1 flex items-center justify-between rounded bg-gray-50 px-3 py-1 text-sm">
                  <a href={l} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">{l}</a>
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, relatedLinks: prev.relatedLinks.filter((_, j) => j !== i) }))}
                    className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="tag-name" className="flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={addTag} icon={<Plus className="h-3 w-3" />}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {form.tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {t}
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, j) => j !== i) }))}
                      className="text-blue-400 hover:text-blue-600"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Breaking & Migration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={form.isBreaking} onChange={(e) => setForm({ ...form, isBreaking: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm font-medium text-gray-700">This is a <strong className="text-red-600">breaking change</strong></span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={form.migrationRequired} onChange={(e) => setForm({ ...form, migrationRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <span className="text-sm font-medium text-gray-700">Database <strong className="text-orange-600">migration required</strong></span>
              </label>
            </div>
            {form.migrationRequired && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Migration Instructions</label>
                <textarea value={form.migrationNotes} onChange={(e) => setForm({ ...form, migrationNotes: e.target.value })}
                  placeholder="SQL commands, data migration steps, or Supabase CLI commands..."
                  rows={3} maxLength={5000}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/changelog' })}>Cancel</Button>
            <Button type="submit" disabled={saving} icon={saving ? undefined : <Save className="h-4 w-4" />}>
              {saving ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
