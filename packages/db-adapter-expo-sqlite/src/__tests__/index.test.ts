import { describe, it, expect } from 'vitest'
import type { BaseEntity, Repository } from '@repo/core'

// We cannot import the real expo-sqlite adapter because it depends on expo-sqlite.
// Instead, we validate the exported type signature and error behavior.

describe('createExpoSqliteRepository', () => {
  // Dynamically import to avoid expo-sqlite native dependency
  it('exports a factory function', async () => {
    const mod = await import('../index')
    expect(mod.createExpoSqliteRepository).toBeDefined()
    expect(typeof mod.createExpoSqliteRepository).toBe('function')
  })

  it('returns a Repository with all expected methods', async () => {
    const { createExpoSqliteRepository } = await import('../index')
    const repo = createExpoSqliteRepository<BaseEntity>('test')

    expect(repo.findById).toBeDefined()
    expect(typeof repo.findById).toBe('function')
    expect(repo.findMany).toBeDefined()
    expect(typeof repo.findMany).toBe('function')
    expect(repo.create).toBeDefined()
    expect(typeof repo.create).toBe('function')
    expect(repo.update).toBeDefined()
    expect(typeof repo.update).toBe('function')
    expect(repo.delete).toBeDefined()
    expect(typeof repo.delete).toBe('function')
    expect(repo.count).toBeDefined()
    expect(typeof repo.count).toBe('function')
  })

  it('all methods throw DatabaseError (not yet implemented)', async () => {
    const { createExpoSqliteRepository } = await import('../index')
    const repo = createExpoSqliteRepository<BaseEntity>('test')

    await expect(repo.findById('any')).rejects.toThrow(/not yet implemented/i)
    await expect(repo.findMany({ limit: 10 })).rejects.toThrow(/not yet implemented/i)
    await expect(repo.create({} as any)).rejects.toThrow(/not yet implemented/i)
    await expect(repo.update('any', {} as any)).rejects.toThrow(/not yet implemented/i)
    await expect(repo.delete('any')).rejects.toThrow(/not yet implemented/i)
    await expect(repo.count({})).rejects.toThrow(/not yet implemented/i)
  })

  it('accepts dbName option', async () => {
    const { createExpoSqliteRepository } = await import('../index')
    const repo = createExpoSqliteRepository<BaseEntity>('test', { dbName: 'custom.db' })
    expect(repo).toBeDefined()
    await expect(repo.findById('x')).rejects.toThrow(/not yet implemented/i)
  })
})
