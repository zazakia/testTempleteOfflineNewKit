/**
 * ─── Changelog Entry Detail Page ────────────────────────────
 * Full detail view of a single changelog entry.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { changelogRepo } from '../../lib/db'
import type { ChangelogEntry } from '@repo/entity-changelog'
import {
  CHANGELOG_CATEGORY_LABELS,
  CHANGELOG_CATEGORY_COLORS,
  CHANGELOG_CATEGORY_ICONS,
  CHANGELOG_STATUS_LABELS,
  CHANGELOG_STATUS_COLORS,
  PLATFORM_LABELS,
} from '@repo/entity-changelog'
import { ChangelogService } from '@repo/entity-changelog'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  User,
  Tag,
  Link as LinkIcon,
  AlertTriangle,
  Database,
  Globe,
  Package,
  ExternalLink,
} from 'lucide-react'

export function ChangelogDetailPage() {
  const { id } = useParams({ from: '/changelog/$id' })
  const navigate = useNavigate()
  const [entry, setEntry] = useState<ChangelogEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const loadEntry = useCallback(async () => {
    setLoading(true)
    try {
      const record = await changelogRepo.findById(id)
      setEntry(record)
    } catch (err) {
      console.error('Failed to load entry:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadEntry() }, [loadEntry])

  const handleDelete = async () => {
    if (!entry) return
    if (!confirm(`Delete changelog entry "v${entry.releaseVersion} — ${entry.title}"?`)) return
    try {
      await changelogRepo.delete(id)
      navigate({ to: '/changelog' })
    } catch (err: any) {
      console.error('Failed to delete:', err)
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center p-6"><p className="text-gray-500">Loading entry...</p></div>
  }

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Entry not found</h2>
          <Button variant="outline" onClick={() => navigate({ to: '/changelog' })} className="mt-4">Back to Changelog</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader
          title={`v${entry.releaseVersion} — ${entry.title}`}
          description={`${CHANGELOG_CATEGORY_LABELS[entry.category]} · ${CHANGELOG_STATUS_LABELS[entry.status]}`}
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/changelog' })} icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: `/changelog/${id}/edit` })} icon={<Edit3 className="h-4 w-4" />}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} icon={<Trash2 className="h-4 w-4 text-red-500" />}>
                Delete
              </Button>
            </div>
          }
        />

        <div className="space-y-6 p-4">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <Badge color={CHANGELOG_CATEGORY_COLORS[entry.category]} size="md">
              {CHANGELOG_CATEGORY_LABELS[entry.category]}
            </Badge>
            <Badge color={CHANGELOG_STATUS_COLORS[entry.status]} size="md">
              {CHANGELOG_STATUS_LABELS[entry.status]}
            </Badge>
            {entry.isBreaking && (
              <Badge color="red" size="md">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" /> Breaking Change
              </Badge>
            )}
            {entry.migrationRequired && (
              <Badge color="yellow" size="md">
                <Database className="mr-1 inline h-3.5 w-3.5" /> Migration Required
              </Badge>
            )}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{new Date(entry.releasedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{entry.author}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{entry.affectedPlatforms.map((p) => PLATFORM_LABELS[p] ?? p).join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{entry.affectedModules.length} module{entry.affectedModules.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">{tag}</span>
              ))}
            </div>
          )}

          {/* Purpose */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Purpose</h3>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-blue-900">{entry.purpose}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Description</h3>
            <div className="prose prose-sm max-w-none rounded-lg border border-gray-200 p-4">
              <p className="whitespace-pre-wrap text-sm text-gray-700">{entry.description}</p>
            </div>
          </div>

          {/* Impact Notes */}
          {entry.impactNotes && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Impact Notes</h3>
              <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                <p className="whitespace-pre-wrap text-sm text-yellow-900">{entry.impactNotes}</p>
              </div>
            </div>
          )}

          {/* Migration Notes */}
          {entry.migrationRequired && entry.migrationNotes && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-500">⚠ Migration Required</h3>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="whitespace-pre-wrap font-mono text-sm text-red-900">{entry.migrationNotes}</p>
              </div>
            </div>
          )}

          {/* Affected Modules */}
          {entry.affectedModules.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Affected Modules</h3>
              <div className="space-y-1">
                {entry.affectedModules.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2 text-sm">
                    <Badge color={
                      m.changeType === 'added' ? 'green' :
                      m.changeType === 'removed' ? 'red' :
                      m.changeType === 'fixed' ? 'yellow' : 'blue'
                    } size="sm">{m.changeType}</Badge>
                    <span className="font-mono font-medium text-gray-900">{m.name}</span>
                    {m.note && <span className="text-gray-500">— {m.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {entry.contributors && entry.contributors.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Contributors ({entry.contributors.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {entry.contributors.map((c) => (
                  <span key={c} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Related Links */}
          {entry.relatedLinks && entry.relatedLinks.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Related Links</h3>
              <div className="space-y-1">
                {entry.relatedLinks.map((link) => (
                  <a key={link} href={link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer meta */}
          <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
            Created {new Date(entry.createdAt).toLocaleDateString()} · Updated {new Date(entry.updatedAt).toLocaleDateString()} · Entity v{entry.version}
          </div>
        </div>
      </Card>
    </div>
  )
}
