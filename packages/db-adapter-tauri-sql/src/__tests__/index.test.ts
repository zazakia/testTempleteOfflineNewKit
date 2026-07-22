import { describe, it, expect } from 'vitest'
import type { BaseEntity } from '@repo/core'

describe('createTauriSqlRepository', () => {
  it('exports a factory function', async () => {
    const mod = await import('../index')
    expect(mod.createTauriSqlRepository).toBeDefined()
    expect(typeof mod.createTauriSqlRepository).toBe('function')
  })

  it('returns a Repository with all expected methods', async () => {
    const { createTauriSqlRepository } = await import('../index')
    const repo = createTauriSqlRepository<BaseEntity>('test')

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
    const { createTauriSqlRepository } = await import('../index')
    const repo = createTauriSqlRepository<BaseEntity>('test')

    await expect(repo.findById('any')).rejects.toThrow(/not yet implemented/i)
    await expect(repo.findMany({ limit: 10 })).rejects.toThrow(/not yet implemented/i)
    await expect(repo.create({} as any)).rejects.toThrow(/not yet implemented/i)
    await expect(repo.update('any', {} as any)).rejects.toThrow(/not yet implemented/i)
    await expect(repo.delete('any')).rejects.toThrow(/not yet implemented/i)
    await expect(repo.count({})).rejects.toThrow(/not yet implemented/i)
  })

  it('accepts dbPath option', async () => {
    const { createTauriSqlRepository } = await import('../index')
    const repo = createTauriSqlRepository<BaseEntity>('test', { dbPath: 'custom.db' })
    expect(repo).toBeDefined()
    await expect(repo.findById('x')).rejects.toThrow(/not yet implemented/i)
  })
})
