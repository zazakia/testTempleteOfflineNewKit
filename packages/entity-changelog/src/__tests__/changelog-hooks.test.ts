import { describe, it, expect, vi } from 'vitest'
import { ChangelogHooks } from '../changelog.hooks'
import type { HookContext, EntityId } from '@repo/core'
import type { ChangelogEntry } from '../changelog.schema'

// ─── Helpers ──────────────────────────────────────────────────

function makeCtx(overrides: Partial<HookContext> = {}): HookContext {
  return {
    userId: 'test-user',
    tenantId: 'test-tenant',
    timestamp: Date.now(),
    metadata: {},
    ...overrides,
  }
}

function makeEntry(overrides: Partial<ChangelogEntry> = {}): ChangelogEntry {
  return {
    id: 'e1',
    tenantId: 't1',
    releaseVersion: '1.0.0',
    title: 'Test Entry',
    category: 'feature',
    status: 'released',
    description: 'A test entry.',
    purpose: 'Testing hooks.',
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

// ─── beforeCreate ─────────────────────────────────────────────

describe('beforeCreate', () => {
  it('prepares input and injects tenantId/createdBy', async () => {
    const input = {
      title: '  My Feature  ',
      releaseVersion: 'v1.2.3',
      tags: [],
    }
    const ctx = makeCtx({ tenantId: 't-123', userId: 'admin' })

    const result = await ChangelogHooks.beforeCreate!(input, ctx)

    expect(result.title).toBe('My Feature')
    expect(result.releaseVersion).toBe('1.2.3')
    expect(result.tenantId).toBe('t-123')
    expect(result.createdBy).toBe('admin')
    expect(result.tags).toEqual([])
  })

  it('throws on invalid semver', async () => {
    const input = {
      title: 'Bad Version',
      releaseVersion: 'not.semver',
      tags: [],
    }
    const ctx = makeCtx()

    await expect(
      ChangelogHooks.beforeCreate!(input, ctx),
    ).rejects.toThrow(/Invalid semantic version/)
  })

  it('accepts valid semver', async () => {
    const input = {
      title: 'Good Version',
      releaseVersion: '3.0.0-rc.1',
      tags: [],
    }
    const ctx = makeCtx()

    const result = await ChangelogHooks.beforeCreate!(input, ctx)
    expect(result.releaseVersion).toBe('3.0.0-rc.1')
  })
})

// ─── afterCreate ──────────────────────────────────────────────

describe('afterCreate', () => {
  it('logs creation without throwing', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const entry = makeEntry({ releaseVersion: '2.0.0', title: 'Big Update' })
    const ctx = makeCtx({ userId: 'dev' })

    await expect(
      ChangelogHooks.afterCreate!(entry, ctx),
    ).resolves.toBeUndefined()

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Big Update'),
    )
    spy.mockRestore()
  })
})

// ─── beforeUpdate ─────────────────────────────────────────────

describe('beforeUpdate', () => {
  it('strips leading v from version', async () => {
    const input = { releaseVersion: 'v5.0.0' }
    const result = await ChangelogHooks.beforeUpdate!('e1', input, makeCtx())
    expect(result.releaseVersion).toBe('5.0.0')
  })

  it('passes through non-version fields unchanged', async () => {
    const input = { title: 'Updated', releaseVersion: '1.0.0' }
    const result = await ChangelogHooks.beforeUpdate!('e1', input, makeCtx())
    expect(result.title).toBe('Updated')
    expect(result.releaseVersion).toBe('1.0.0')
  })

  it('handles missing releaseVersion gracefully', async () => {
    const input = { title: 'Only Title' }
    const result = await ChangelogHooks.beforeUpdate!('e1', input, makeCtx())
    expect(result.title).toBe('Only Title')
  })
})

// ─── afterUpdate ──────────────────────────────────────────────

describe('afterUpdate', () => {
  it('logs update without throwing', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const entry = makeEntry({ releaseVersion: '3.0.0' })
    const ctx = makeCtx({ userId: 'admin' })

    await expect(
      ChangelogHooks.afterUpdate!(entry, ctx),
    ).resolves.toBeUndefined()
    spy.mockRestore()
  })
})

// ─── beforeDelete ─────────────────────────────────────────────

describe('beforeDelete', () => {
  it('allows deletion without throwing', async () => {
    await expect(
      ChangelogHooks.beforeDelete!('e1', makeCtx()),
    ).resolves.toBeUndefined()
  })
})

// ─── afterDelete ──────────────────────────────────────────────

describe('afterDelete', () => {
  it('logs deletion', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const entry = makeEntry({ releaseVersion: '4.0.0' })
    const ctx = makeCtx({ userId: 'super-admin' })

    await expect(
      ChangelogHooks.afterDelete!(entry, ctx),
    ).resolves.toBeUndefined()
    spy.mockRestore()
  })
})

// ─── beforeRead / afterRead ───────────────────────────────────

describe('beforeRead', () => {
  it('is a no-op', async () => {
    await expect(
      ChangelogHooks.beforeRead!('e1', makeCtx()),
    ).resolves.toBeUndefined()
  })
})

describe('afterRead', () => {
  it('returns entity as-is', async () => {
    const entry = makeEntry()
    const result = await ChangelogHooks.afterRead!(entry, makeCtx())
    expect(result).toBe(entry)
  })

  it('passes null through', async () => {
    const result = await ChangelogHooks.afterRead!(null as any, makeCtx())
    expect(result).toBeNull()
  })
})
