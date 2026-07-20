/**
 * ─── Changelog / Roadmap Page ────────────────────────────────
 * Timeline view of all updates, features, and changes.
 * Grouped by status: Planned → In Progress → Released.
 * Toggle between timeline and table views.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
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
import type { ChangelogSummary } from '@repo/entity-changelog'
import {
  Plus,
  Search,
  Filter,
  List,
  GitCommitHorizontal,
  AlertTriangle,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Bug,
} from 'lucide-react'

export function ChangelogPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [summary, setSummary] = useState<ChangelogSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline')

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const filter: any[] = []
      if (categoryFilter) filter.push({ field: 'category', operator: 'eq' as const, value: categoryFilter })
      if (statusFilter) filter.push({ field: 'status', operator: 'eq' as const, value: statusFilter })

      const result = await changelogRepo.findMany({
        page: 1,
        pageSize: 500,
        filter: filter.length > 0 ? filter : undefined,
        search: search || undefined,
        sort: [{ field: 'releasedAt', direction: 'desc' }],
      })

      if ('items' in result) {
        const items = result.items as ChangelogEntry[]
        setEntries(items)
        setSummary(ChangelogService.computeSummary(items))
      }
    } catch (err) {
      console.error('Failed to load changelog:', err)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, statusFilter])

  useEffect(() => { loadEntries() }, [loadEntries])

  const roadmap = ChangelogService.buildRoadmap(entries)

  return (
    <div className="p-6">
      <Card>
        <CardHeader
          title="Changelog & Roadmap"
          description={summary ? `${summary.totalEntries} entries · ${summary.totalReleases} releases · Latest: v${summary.latestVersion ?? '—'}` : 'Loading...'}
          action={
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-0.5">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <GitCommitHorizontal className="mr-1 inline h-3.5 w-3.5" />
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="mr-1 inline h-3.5 w-3.5" />
                  Table
                </button>
              </div>
              <Link to="/changelog/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Entry
                </Button>
              </Link>
            </div>
          }
        />

        {/* Summary Stats */}
        {summary && (
          <div className="mb-4 grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 lg:grid-cols-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{summary.totalReleases}</p>
              <p className="text-xs text-blue-600">Releases</p>
            </div>
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">{summary.totalEntries}</p>
              <p className="text-xs text-purple-600">Entries</p>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{summary.upcomingCount}</p>
              <p className="text-xs text-green-600">Upcoming</p>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{summary.breakingChanges}</p>
              <p className="text-xs text-red-600">Breaking</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{summary.migrationsRequired}</p>
              <p className="text-xs text-orange-600">Migrations</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-lg font-bold text-gray-700">
                {summary.latestVersion ? `v${summary.latestVersion}` : '—'}
              </p>
              <p className="text-xs text-gray-600">Latest</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 px-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by title, version, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            <option value="feature">Feature</option>
            <option value="enhancement">Enhancement</option>
            <option value="bugfix">Bug Fix</option>
            <option value="breaking">Breaking Change</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
            <option value="documentation">Documentation</option>
            <option value="deprecation">Deprecation</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="released">Released</option>
            <option value="rolled-back">Rolled Back</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading changelog...</div>
        ) : viewMode === 'timeline' ? (
          /* Timeline View */
          <div className="space-y-8 p-4">
            {/* Planned */}
            {roadmap.planned.length > 0 && (
              <TimelineSection
                title="Planned"
                subtitle="Upcoming features and changes"
                icon={<Clock className="h-5 w-5 text-blue-600" />}
                color="blue"
                entries={roadmap.planned}
                onEntryClick={(id) => navigate({ to: `/changelog/${id}` })}
              />
            )}

            {/* In Progress */}
            {roadmap.inProgress.length > 0 && (
              <TimelineSection
                title="In Progress"
                subtitle="Currently being worked on"
                icon={<Sparkles className="h-5 w-5 text-yellow-600" />}
                color="yellow"
                entries={roadmap.inProgress}
                onEntryClick={(id) => navigate({ to: `/changelog/${id}` })}
              />
            )}

            {/* Released */}
            {roadmap.released.length > 0 && (
              <TimelineSection
                title="Released"
                subtitle="Shipped to production"
                icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                color="green"
                entries={roadmap.released}
                onEntryClick={(id) => navigate({ to: `/changelog/${id}` })}
              />
            )}

            {/* Other */}
            {roadmap.other.length > 0 && (
              <TimelineSection
                title="Other"
                subtitle="Rolled back or cancelled"
                icon={<AlertTriangle className="h-5 w-5 text-gray-600" />}
                color="gray"
                entries={roadmap.other}
                onEntryClick={(id) => navigate({ to: `/changelog/${id}` })}
              />
            )}

            {entries.length === 0 && (
              <div className="py-16 text-center">
                <GitCommitHorizontal className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm text-gray-500">No changelog entries yet</p>
                <Link to="/changelog/new">
                  <Button variant="outline" size="sm" className="mt-3">
                    Create First Entry
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Released</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Author</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => navigate({ to: `/changelog/${entry.id}` })}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-blue-700">
                          v{entry.releaseVersion}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{entry.title}</span>
                          {entry.isBreaking && (
                            <Badge color="red" size="sm">Breaking</Badge>
                          )}
                          {entry.migrationRequired && (
                            <Badge color="yellow" size="sm">Migration</Badge>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge color={CHANGELOG_CATEGORY_COLORS[entry.category]} size="sm">
                          {CHANGELOG_CATEGORY_LABELS[entry.category]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge color={CHANGELOG_STATUS_COLORS[entry.status]} size="sm">
                          {CHANGELOG_STATUS_LABELS[entry.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {new Date(entry.releasedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {entry.author}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/** Timeline section: a group of entries with a header */
function TimelineSection({
  title,
  subtitle,
  icon,
  color,
  entries,
  onEntryClick,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'yellow' | 'green' | 'gray'
  entries: ChangelogEntry[]
  onEntryClick: (id: string) => void
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500' },
  }
  const c = colorMap[color]

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-lg ${c.bg} p-2`}>{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <span className="ml-auto rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">
          {entries.length}
        </span>
      </div>

      <div className={`ml-6 border-l-2 ${c.border} space-y-6 pl-8`}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            onClick={() => onEntryClick(entry.id)}
          >
            {/* Dot */}
            <div
              className={`absolute -left-[41px] top-5 h-3 w-3 rounded-full ${c.dot} border-2 border-white ring-2 ring-${color}-200`}
            />

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700">v{entry.releaseVersion}</span>
              <Badge color={CHANGELOG_CATEGORY_COLORS[entry.category]} size="sm">
                {CHANGELOG_CATEGORY_LABELS[entry.category]}
              </Badge>
              {entry.isBreaking && <Badge color="red" size="sm">Breaking</Badge>}
            </div>

            <h4 className="font-semibold text-gray-900">{entry.title}</h4>
            <p className="mt-1 text-sm text-gray-600 line-clamp-3">{entry.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>{new Date(entry.releasedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>·</span>
              <span>{entry.author}</span>
              {entry.affectedPlatforms.length > 0 && (
                <>
                  <span>·</span>
                  <span>{entry.affectedPlatforms.map((p) => PLATFORM_LABELS[p] ?? p).join(', ')}</span>
                </>
              )}
              {entry.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span className="flex gap-1">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
