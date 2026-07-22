import { describe, it, expect } from 'vitest'
import {
  ChangelogCategorySchema,
  ChangelogStatusSchema,
  AffectedPlatformSchema,
  AffectedModuleSchema,
  CreateChangelogEntrySchema,
  UpdateChangelogEntrySchema,
  ChangelogQuerySchema,
  CHANGELOG_CATEGORY_LABELS,
  CHANGELOG_CATEGORY_COLORS,
  CHANGELOG_CATEGORY_ICONS,
  CHANGELOG_STATUS_LABELS,
  CHANGELOG_STATUS_COLORS,
  PLATFORM_LABELS,
} from '../changelog.schema'
import type {
  ChangelogEntry,
  ChangelogCategory,
  ChangelogStatus,
  AffectedPlatform,
} from '../changelog.schema'

// ─── Constants coverage ───────────────────────────────────────

describe('CHANGELOG_CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    const categories: ChangelogCategory[] = [
      'feature', 'enhancement', 'bugfix', 'breaking',
      'infrastructure', 'security', 'performance', 'documentation', 'deprecation',
    ]
    for (const cat of categories) {
      expect(CHANGELOG_CATEGORY_LABELS[cat]).toBeDefined()
    }
  })
})

describe('CHANGELOG_CATEGORY_COLORS', () => {
  it('maps all categories to valid colors', () => {
    const validColors = ['green', 'blue', 'yellow', 'red', 'purple', 'gray']
    for (const [cat, color] of Object.entries(CHANGELOG_CATEGORY_COLORS)) {
      expect(validColors).toContain(color)
    }
  })
})

describe('CHANGELOG_CATEGORY_ICONS', () => {
  it('has icons for all categories', () => {
    expect(CHANGELOG_CATEGORY_ICONS.feature).toBe('Sparkles')
    expect(CHANGELOG_CATEGORY_ICONS.bugfix).toBe('Bug')
    expect(CHANGELOG_CATEGORY_ICONS.security).toBe('Shield')
  })
})

describe('CHANGELOG_STATUS_LABELS', () => {
  it('maps all statuses', () => {
    expect(CHANGELOG_STATUS_LABELS.planned).toBe('Planned')
    expect(CHANGELOG_STATUS_LABELS['in-progress']).toBe('In Progress')
    expect(CHANGELOG_STATUS_LABELS.released).toBe('Released')
    expect(CHANGELOG_STATUS_LABELS['rolled-back']).toBe('Rolled Back')
    expect(CHANGELOG_STATUS_LABELS.cancelled).toBe('Cancelled')
  })
})

describe('CHANGELOG_STATUS_COLORS', () => {
  it('maps all statuses to valid colors', () => {
    const validColors = ['blue', 'yellow', 'green', 'red', 'gray']
    for (const [, color] of Object.entries(CHANGELOG_STATUS_COLORS)) {
      expect(validColors).toContain(color)
    }
  })
})

describe('PLATFORM_LABELS', () => {
  it('maps all platforms', () => {
    expect(PLATFORM_LABELS.web).toBe('Web App')
    expect(PLATFORM_LABELS.mobile).toBe('Mobile App')
    expect(PLATFORM_LABELS.desktop).toBe('Desktop App')
    expect(PLATFORM_LABELS.api).toBe('API')
    expect(PLATFORM_LABELS.database).toBe('Database')
    expect(PLATFORM_LABELS.all).toBe('All Platforms')
  })
})

// ─── Schemas ──────────────────────────────────────────────────

describe('ChangelogCategorySchema', () => {
  it('accepts valid categories', () => {
    expect(ChangelogCategorySchema.parse('feature')).toBe('feature')
    expect(ChangelogCategorySchema.parse('bugfix')).toBe('bugfix')
    expect(ChangelogCategorySchema.parse('breaking')).toBe('breaking')
    expect(ChangelogCategorySchema.parse('security')).toBe('security')
  })

  it('rejects invalid categories', () => {
    expect(() => ChangelogCategorySchema.parse('invalid')).toThrow()
  })
})

describe('ChangelogStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(ChangelogStatusSchema.parse('planned')).toBe('planned')
    expect(ChangelogStatusSchema.parse('released')).toBe('released')
    expect(ChangelogStatusSchema.parse('cancelled')).toBe('cancelled')
  })

  it('rejects invalid statuses', () => {
    expect(() => ChangelogStatusSchema.parse('unknown')).toThrow()
  })
})

describe('AffectedPlatformSchema', () => {
  it('accepts valid platforms', () => {
    expect(AffectedPlatformSchema.parse('web')).toBe('web')
    expect(AffectedPlatformSchema.parse('all')).toBe('all')
  })

  it('rejects invalid platforms', () => {
    expect(() => AffectedPlatformSchema.parse('ios')).toThrow()
  })
})

describe('AffectedModuleSchema', () => {
  it('validates a valid module', () => {
    const result = AffectedModuleSchema.parse({
      name: '@repo/core',
      changeType: 'modified',
    })
    expect(result.name).toBe('@repo/core')
    expect(result.changeType).toBe('modified')
  })

  it('validates with optional note', () => {
    const result = AffectedModuleSchema.parse({
      name: '@repo/entity-clinic',
      changeType: 'added',
      note: 'New clinic module',
    })
    expect(result.note).toBe('New clinic module')
  })

  it('rejects empty name', () => {
    expect(() => AffectedModuleSchema.parse({ name: '', changeType: 'added' })).toThrow()
  })

  it('rejects invalid changeType', () => {
    expect(() => AffectedModuleSchema.parse({ name: 'test', changeType: 'invalid' })).toThrow()
  })
})

// ─── CreateChangelogEntrySchema ───────────────────────────────

describe('CreateChangelogEntrySchema', () => {
  const validEntry = {
    tenantId: 't1',
    releaseVersion: '1.5.0',
    title: 'Multi-Branch Support',
    category: 'feature' as const,
    status: 'released' as const,
    description: 'Added support for multiple branches per tenant with full isolation.',
    purpose: 'Allow cooperatives with multiple locations to manage them independently.',
    affectedPlatforms: ['web' as const, 'mobile' as const],
    affectedModules: [{ name: '@repo/entity-branch', changeType: 'added' as const }],
    releasedAt: Date.now(),
    author: 'Dev Team',
  }

  it('accepts a valid changelog entry', () => {
    const result = CreateChangelogEntrySchema.parse(validEntry)
    expect(result.title).toBe('Multi-Branch Support')
    expect(result.releaseVersion).toBe('1.5.0')
  })

  it('defaults status to planned', () => {
    const { status, ...rest } = validEntry
    const result = CreateChangelogEntrySchema.parse(rest)
    expect(result.status).toBe('planned')
  })

  it('defaults isBreaking to false', () => {
    const result = CreateChangelogEntrySchema.parse(validEntry)
    expect(result.isBreaking).toBe(false)
  })

  it('defaults migrationRequired to false', () => {
    const result = CreateChangelogEntrySchema.parse(validEntry)
    expect(result.migrationRequired).toBe(false)
  })

  it('defaults tags to empty array', () => {
    const result = CreateChangelogEntrySchema.parse(validEntry)
    expect(result.tags).toEqual([])
  })

  it('rejects empty title', () => {
    expect(() =>
      CreateChangelogEntrySchema.parse({ ...validEntry, title: '' }),
    ).toThrow()
  })

  it('rejects short description', () => {
    expect(() =>
      CreateChangelogEntrySchema.parse({ ...validEntry, description: 'Too short' }),
    ).toThrow()
  })

  it('rejects short purpose', () => {
    expect(() =>
      CreateChangelogEntrySchema.parse({ ...validEntry, purpose: 'Short' }),
    ).toThrow()
  })

  it('rejects invalid semver', () => {
    expect(() =>
      CreateChangelogEntrySchema.parse({ ...validEntry, releaseVersion: 'not-valid' }),
    ).toThrow()
  })

  it('accepts pre-release semver', () => {
    const result = CreateChangelogEntrySchema.parse({
      ...validEntry,
      releaseVersion: '2.0.0-beta.1',
    })
    expect(result.releaseVersion).toBe('2.0.0-beta.1')
  })

  it('accepts build metadata semver', () => {
    const result = CreateChangelogEntrySchema.parse({
      ...validEntry,
      releaseVersion: '1.0.0+build123',
    })
    expect(result.releaseVersion).toBe('1.0.0+build123')
  })

  it('rejects version with leading v', () => {
    // Schema requires semver format, v1.0.0 is not valid
    expect(() =>
      CreateChangelogEntrySchema.parse({ ...validEntry, releaseVersion: 'v1.0.0' }),
    ).toThrow()
  })

  it('rejects empty author', () => {
    expect(() =>
      CreateChangelogEntrySchema.parse({ ...validEntry, author: '' }),
    ).toThrow()
  })

  it('rejects invalid URL in relatedLinks', () => {
    expect(() =>
      CreateChangelogEntrySchema.parse({
        ...validEntry,
        relatedLinks: ['not-a-url'],
      }),
    ).toThrow()
  })

  it('accepts valid relatedLinks', () => {
    const result = CreateChangelogEntrySchema.parse({
      ...validEntry,
      relatedLinks: ['https://github.com/org/repo/pull/1'],
    })
    expect(result.relatedLinks).toEqual(['https://github.com/org/repo/pull/1'])
  })
})

// ─── UpdateChangelogEntrySchema ───────────────────────────────

describe('UpdateChangelogEntrySchema', () => {
  it('accepts partial update', () => {
    const result = UpdateChangelogEntrySchema.parse({
      title: 'Updated Title',
      version: 1,
    })
    expect(result.title).toBe('Updated Title')
    expect(result.version).toBe(1)
  })

  it('rejects update with only version (no fields)', () => {
    expect(() => UpdateChangelogEntrySchema.parse({ version: 1 })).toThrow()
  })

  it('rejects empty object', () => {
    expect(() => UpdateChangelogEntrySchema.parse({})).toThrow()
  })
})

// ─── ChangelogQuerySchema ─────────────────────────────────────

describe('ChangelogQuerySchema', () => {
  it('accepts filter with category', () => {
    const result = ChangelogQuerySchema.parse({
      filter: [{ field: 'category', operator: 'eq' as const, value: 'feature' }],
    })
    expect(result.filter).toHaveLength(1)
  })

  it('accepts filter with status', () => {
    const result = ChangelogQuerySchema.parse({
      filter: [{ field: 'status', operator: 'eq' as const, value: 'released' }],
    })
    expect(result.filter).toHaveLength(1)
  })

  it('accepts cursor and limit', () => {
    const result = ChangelogQuerySchema.parse({ cursor: 'abc', limit: 25 })
    expect(result.cursor).toBe('abc')
    expect(result.limit).toBe(25)
  })
})
