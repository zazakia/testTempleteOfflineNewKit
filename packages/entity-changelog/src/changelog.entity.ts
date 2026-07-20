/**
 * ─── Changelog Entity Definition ────────────────────────────
 * Self-registers with the Entity Registry.
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { ChangelogEntry } from './changelog.schema'
import { ChangelogHooks } from './changelog.hooks'

export const ChangelogEntity: EntityDefinition<ChangelogEntry> = {
  name: 'changelog_entries',

  ui: {
    label: 'Changelog Entry',
    labelPlural: 'Changelog',
    icon: 'Clock',
    routePath: 'changelog',
    color: 'blue',
    showInNav: true,
    navOrder: 96,
    navGroup: 'Administration',
  },

  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'background',
  },

  audit: {
    enabled: true,
    excludeFields: ['version'],
  },

  rbac: {
    enabled: true,
    permissionPrefix: 'changelog',
  },

  hooks: ChangelogHooks,

  pagination: 'offset',

  tenant: {
    enabled: true,
    field: 'tenantId',
  },

  softDelete: {
    enabled: true,
    field: 'deletedAt',
  },
}

// ─── Self-Register ───────────────────────────────────────────
EntityRegistry.register(ChangelogEntity)
