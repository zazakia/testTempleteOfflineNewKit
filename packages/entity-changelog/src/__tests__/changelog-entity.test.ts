import { describe, it, expect, beforeEach } from 'vitest'
import { EntityRegistry } from '@repo/core'

// The import side-effect registers the entity
import '../changelog.entity'

describe('ChangelogEntity', () => {
  beforeEach(() => {
    // Entity may already be registered from side-effect import
  })

  it('is registered with the EntityRegistry', () => {
    expect(EntityRegistry.has('changelog_entries')).toBe(true)
  })

  it('has correct entity definition', () => {
    const def = EntityRegistry.get('changelog_entries')

    expect(def.name).toBe('changelog_entries')
    expect(def.ui.label).toBe('Changelog Entry')
    expect(def.ui.labelPlural).toBe('Changelog')
    expect(def.ui.icon).toBe('Clock')
    expect(def.ui.navGroup).toBe('Administration')
    expect(def.ui.showInNav).toBe(true)

    expect(def.sync.enabled).toBe(true)
    expect(def.sync.conflictStrategy).toBe('lww')
    expect(def.sync.priority).toBe('background')

    expect(def.audit.enabled).toBe(true)

    expect(def.rbac.enabled).toBe(true)
    expect(def.rbac.permissionPrefix).toBe('changelog')

    expect(def.pagination).toBe('offset')

    expect(def.tenant.enabled).toBe(true)
    expect(def.tenant.field).toBe('tenantId')

    expect(def.softDelete.enabled).toBe(true)
    expect(def.softDelete.field).toBe('deletedAt')
  })

  it('has hooks attached', () => {
    const def = EntityRegistry.get('changelog_entries')
    expect(def.hooks).toBeDefined()
    expect(def.hooks.beforeCreate).toBeDefined()
    expect(def.hooks.afterCreate).toBeDefined()
  })
})
