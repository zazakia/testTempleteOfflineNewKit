import { describe, it, expect } from 'vitest'
import { ChangelogService } from '../changelog.service'
import type { ChangelogEntry, ChangelogCategory, ChangelogStatus } from '../changelog.schema'

// ─── Helper ───────────────────────────────────────────────────

function makeEntry(overrides: Partial<ChangelogEntry> = {}): ChangelogEntry {
  return {
    id: 'e1',
    tenantId: 't1',
    releaseVersion: '1.0.0',
    title: 'Test Entry',
    category: 'feature' as ChangelogCategory,
    status: 'released' as ChangelogStatus,
    description: 'A test entry description.',
    purpose: 'Testing the service layer.',
    affectedPlatforms: ['web'],
    affectedModules: [],
    releasedAt: Date.now(),
    author: 'Tester',
    isBreaking: false,
    migrationRequired: false,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    version: 1,
    createdBy: 'tester',
    updatedBy: 'tester',
    ...overrides,
  }
}

// ─── prepareForCreate ─────────────────────────────────────────

describe('prepareForCreate', () => {
  it('trims title whitespace', () => {
    const result = ChangelogService.prepareForCreate({ title: '  Hello World  ' })
    expect(result.title).toBe('Hello World')
  })

  it('strips leading "v" from version', () => {
    const result = ChangelogService.prepareForCreate({ releaseVersion: 'v1.5.0' })
    expect(result.releaseVersion).toBe('1.5.0')
  })

  it('strips leading "V" from version (case-insensitive)', () => {
    const result = ChangelogService.prepareForCreate({ releaseVersion: 'V2.0.0' })
    expect(result.releaseVersion).toBe('2.0.0')
  })

  it('adds default tags array', () => {
    const result = ChangelogService.prepareForCreate({ title: 'Test' })
    expect(result.tags).toEqual([])
  })

  it('adds default affectedModules array', () => {
    const result = ChangelogService.prepareForCreate({ title: 'Test' })
    expect(result.affectedModules).toEqual([])
  })

  it('adds default affectedPlatforms', () => {
    const result = ChangelogService.prepareForCreate({ title: 'Test' })
    expect(result.affectedPlatforms).toEqual(['all'])
  })

  it('auto-detects isBreaking from category', () => {
    const result = ChangelogService.prepareForCreate({
      title: 'Some Change',
      category: 'breaking',
    })
    expect(result.isBreaking).toBe(true)
  })

  it('auto-detects isBreaking from title', () => {
    const result = ChangelogService.prepareForCreate({
      title: 'Breaking Change in API',
      category: 'enhancement',
    })
    expect(result.isBreaking).toBe(true)
  })

  it('auto-detects "BREAKING" from title (case-insensitive)', () => {
    const result = ChangelogService.prepareForCreate({
      title: 'BREAKING: New API version',
      category: 'feature',
    })
    expect(result.isBreaking).toBe(true)
  })

  it('does not auto-detect isBreaking for normal title', () => {
    const result = ChangelogService.prepareForCreate({
      title: 'Normal Enhancement',
      category: 'enhancement',
    })
    expect(result.isBreaking).toBeFalsy()
  })

  it('preserves existing tags', () => {
    const result = ChangelogService.prepareForCreate({
      title: 'Test',
      tags: ['cooperative', 'lending'],
    })
    expect(result.tags).toEqual(['cooperative', 'lending'])
  })

  it('preserves existing affectedModules', () => {
    const result = ChangelogService.prepareForCreate({
      title: 'Test',
      affectedModules: [{ name: '@repo/core', changeType: 'modified' }],
    })
    expect(result.affectedModules).toHaveLength(1)
  })
})

// ─── isValidSemver ────────────────────────────────────────────

describe('isValidSemver', () => {
  it('accepts simple version', () => {
    expect(ChangelogService.isValidSemver('1.0.0')).toBe(true)
  })

  it('accepts pre-release', () => {
    expect(ChangelogService.isValidSemver('2.0.0-beta.1')).toBe(true)
  })

  it('accepts build metadata', () => {
    expect(ChangelogService.isValidSemver('1.5.0+build123')).toBe(true)
  })

  it('accepts pre-release with build', () => {
    expect(ChangelogService.isValidSemver('3.0.0-rc.2+build.5')).toBe(true)
  })

  it('rejects single number', () => {
    expect(ChangelogService.isValidSemver('1')).toBe(false)
  })

  it('rejects two numbers', () => {
    expect(ChangelogService.isValidSemver('1.0')).toBe(false)
  })

  it('rejects text', () => {
    expect(ChangelogService.isValidSemver('not.valid.at.all')).toBe(false)
  })

  it('rejects leading v', () => {
    expect(ChangelogService.isValidSemver('v1.0.0')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(ChangelogService.isValidSemver('')).toBe(false)
  })
})

// ─── compareVersions ──────────────────────────────────────────

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(ChangelogService.compareVersions('1.0.0', '1.0.0')).toBe(0)
  })

  it('returns positive when a > b (major)', () => {
    expect(ChangelogService.compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0)
  })

  it('returns negative when a < b (major)', () => {
    expect(ChangelogService.compareVersions('1.0.0', '2.0.0')).toBeLessThan(0)
  })

  it('compares minor version', () => {
    expect(ChangelogService.compareVersions('1.5.0', '1.3.0')).toBeGreaterThan(0)
  })

  it('compares patch version', () => {
    expect(ChangelogService.compareVersions('1.0.3', '1.0.1')).toBeGreaterThan(0)
  })

  it('pre-release sorts before release', () => {
    expect(ChangelogService.compareVersions('1.0.0-alpha', '1.0.0')).toBeLessThan(0)
  })

  it('compares pre-release labels lexicographically', () => {
    expect(ChangelogService.compareVersions('1.0.0-beta', '1.0.0-alpha')).toBeGreaterThan(0)
  })

  it('handles missing parts gracefully', () => {
    // Using parse fallback: major=0, minor=0, patch=0
    const result = ChangelogService.compareVersions('', '')
    expect(result).toBe(0)
  })
})

// ─── sortByVersion ────────────────────────────────────────────

describe('sortByVersion', () => {
  it('sorts newest first', () => {
    const entries = [
      makeEntry({ releaseVersion: '1.0.0' }),
      makeEntry({ releaseVersion: '3.0.0' }),
      makeEntry({ releaseVersion: '2.0.0' }),
    ]
    const sorted = ChangelogService.sortByVersion(entries)
    expect(sorted[0]!.releaseVersion).toBe('3.0.0')
    expect(sorted[1]!.releaseVersion).toBe('2.0.0')
    expect(sorted[2]!.releaseVersion).toBe('1.0.0')
  })

  it('returns new array (does not mutate)', () => {
    const entries = [makeEntry({ releaseVersion: '1.0.0' })]
    const sorted = ChangelogService.sortByVersion(entries)
    expect(sorted).not.toBe(entries)
  })
})

// ─── sortByDate ───────────────────────────────────────────────

describe('sortByDate', () => {
  it('sorts by releasedAt descending', () => {
    const now = Date.now()
    const entries = [
      makeEntry({ releasedAt: now - 10000 }),
      makeEntry({ releasedAt: now }),
      makeEntry({ releasedAt: now - 5000 }),
    ]
    const sorted = ChangelogService.sortByDate(entries)
    expect(sorted[0]!.releasedAt).toBe(now)
    expect(sorted[2]!.releasedAt).toBe(now - 10000)
  })
})

// ─── buildRoadmap ─────────────────────────────────────────────

describe('buildRoadmap', () => {
  it('groups entries by status', () => {
    const entries = [
      makeEntry({ id: '1', status: 'planned' }),
      makeEntry({ id: '2', status: 'in-progress' }),
      makeEntry({ id: '3', status: 'released' }),
      makeEntry({ id: '4', status: 'planned' }),
      makeEntry({ id: '5', status: 'cancelled' }),
    ]
    const roadmap = ChangelogService.buildRoadmap(entries)

    expect(roadmap.planned).toHaveLength(2)
    expect(roadmap.inProgress).toHaveLength(1)
    expect(roadmap.released).toHaveLength(1)
    expect(roadmap.other).toHaveLength(1)
  })

  it('sorts planned by ascending release date', () => {
    const now = Date.now()
    const entries = [
      makeEntry({ id: '1', status: 'planned', releasedAt: now + 20000 }),
      makeEntry({ id: '2', status: 'planned', releasedAt: now + 10000 }),
    ]
    const roadmap = ChangelogService.buildRoadmap(entries)
    expect(roadmap.planned[0]!.releasedAt).toBeLessThanOrEqual(roadmap.planned[1]!.releasedAt)
  })

  it('sorts in-progress by ascending release date', () => {
    const now = Date.now()
    const entries = [
      makeEntry({ id: '1', status: 'in-progress', releasedAt: now + 20000 }),
      makeEntry({ id: '2', status: 'in-progress', releasedAt: now + 10000 }),
    ]
    const roadmap = ChangelogService.buildRoadmap(entries)
    expect(roadmap.inProgress[0]!.releasedAt).toBeLessThanOrEqual(roadmap.inProgress[1]!.releasedAt)
  })

  it('handles empty array', () => {
    const roadmap = ChangelogService.buildRoadmap([])
    expect(roadmap.planned).toHaveLength(0)
    expect(roadmap.inProgress).toHaveLength(0)
    expect(roadmap.released).toHaveLength(0)
    expect(roadmap.other).toHaveLength(0)
  })
})

// ─── computeSummary ───────────────────────────────────────────

describe('computeSummary', () => {
  it('computes correct totals', () => {
    const entries = [
      makeEntry({ id: '1', status: 'released', releaseVersion: '1.0.0', category: 'feature' }),
      makeEntry({ id: '2', status: 'released', releaseVersion: '2.0.0', category: 'feature', isBreaking: true }),
      makeEntry({ id: '3', status: 'planned', category: 'bugfix' }),
      makeEntry({ id: '4', status: 'in-progress', category: 'enhancement', migrationRequired: true }),
    ]
    const summary = ChangelogService.computeSummary(entries)

    expect(summary.totalEntries).toBe(4)
    expect(summary.totalReleases).toBe(2)
    expect(summary.latestVersion).toBe('2.0.0')
    expect(summary.breakingChanges).toBe(1)
    expect(summary.migrationsRequired).toBe(1)
    expect(summary.upcomingCount).toBe(2) // planned + in-progress
  })

  it('handles empty array', () => {
    const summary = ChangelogService.computeSummary([])
    expect(summary.totalEntries).toBe(0)
    expect(summary.totalReleases).toBe(0)
    expect(summary.latestVersion).toBeNull()
    expect(summary.breakingChanges).toBe(0)
    expect(summary.upcomingCount).toBe(0)
  })

  it('counts categories correctly', () => {
    const entries = [
      makeEntry({ id: '1', status: 'released', category: 'feature' }),
      makeEntry({ id: '2', status: 'released', category: 'feature' }),
      makeEntry({ id: '3', status: 'released', category: 'bugfix' }),
    ]
    const summary = ChangelogService.computeSummary(entries)
    expect(summary.categories.feature).toBe(2)
    expect(summary.categories.bugfix).toBe(1)
  })
})

// ─── generateReleaseNotes ─────────────────────────────────────

describe('generateReleaseNotes', () => {
  it('generates markdown notes', () => {
    const entries = [
      makeEntry({
        title: 'New Dashboard',
        category: 'feature',
        description: 'A new analytics dashboard.',
        purpose: 'Better visibility into metrics.',
        status: 'released',
      }),
    ]
    const notes = ChangelogService.generateReleaseNotes('1.2.0', entries)

    expect(notes).toContain('# Release Notes — v1.2.0')
    expect(notes).toContain('New Dashboard')
    expect(notes).toContain('A new analytics dashboard')
    expect(notes).toContain('**Purpose:** Better visibility into metrics')
  })

  it('includes migration warning when applicable', () => {
    const entries = [
      makeEntry({
        title: 'Schema Change',
        category: 'breaking',
        description: 'Database schema changed.',
        purpose: 'Support new features.',
        migrationRequired: true,
        migrationNotes: 'Run npm run migrate',
        status: 'released',
      }),
    ]
    const notes = ChangelogService.generateReleaseNotes('2.0.0', entries)

    expect(notes).toContain('⚠ Migration Required')
    expect(notes).toContain('Run npm run migrate')
  })

  it('includes impact notes', () => {
    const entries = [
      makeEntry({
        title: 'API Change',
        category: 'breaking',
        description: 'API endpoint changed.',
        purpose: 'Better performance.',
        impactNotes: 'All clients must update.',
        status: 'released',
      }),
    ]
    const notes = ChangelogService.generateReleaseNotes('2.0.0', entries)
    expect(notes).toContain('**Impact:** All clients must update.')
  })

  it('handles entries without purpose gracefully', () => {
    const entries = [
      makeEntry({
        title: 'Simple',
        category: 'feature',
        description: 'Simple change.',
        purpose: '',
        status: 'released',
      }),
    ]
    const notes = ChangelogService.generateReleaseNotes('1.0.0', entries)
    expect(notes).toContain('Simple change')
  })
})
