/**
 * ─── Branch Entity Definition ───────────────────────────────
 * Self-registers with the Entity Registry on import.
 *
 * To add this entity to an app, simply:
 *   import '@repo/entity-branch'
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { Branch } from './branch.schema'
import { BranchHooks } from './branch.hooks'

/**
 * Branch entity definition.
 */
export const BranchEntity: EntityDefinition<Branch> = {
  name: 'branches',

  ui: {
    label: 'Branch',
    labelPlural: 'Branches',
    icon: 'Building2',
    routePath: 'branches',
    color: 'purple',
    showInNav: true,
    navOrder: 10,
    navGroup: 'Administration',
  },

  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'normal',
    excludeFields: ['notes'],
  },

  audit: {
    enabled: true,
    excludeFields: ['version'],
  },

  rbac: {
    enabled: true,
    permissionPrefix: 'branch',
  },

  hooks: BranchHooks,

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
EntityRegistry.register(BranchEntity)
