/**
 * ─── Member Entity Definition ────────────────────────────────
 * Self-registers with the Entity Registry on import.
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { Member } from './member.schema'
import { MemberHooks } from './member.hooks'
import { MemberPolicies } from './member.policies'

export const MemberEntity: EntityDefinition<Member> = {
  name: 'member',

  ui: {
    label: 'Member',
    labelPlural: 'Members',
    icon: 'Users',
    routePath: 'members',
    color: 'blue',
    showInNav: true,
    navOrder: 10,
    navGroup: 'Cooperative',
  },

  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'critical',
  },

  audit: {
    enabled: true,
    excludeFields: ['version'],
  },

  rbac: {
    enabled: true,
    permissionPrefix: 'member',
  },

  hooks: MemberHooks,

  pagination: 'cursor',

  tenant: {
    enabled: true,
    field: 'tenantId',
  },

  softDelete: {
    enabled: true,
    field: 'deletedAt',
  },
}

// Self-register on import
EntityRegistry.register(MemberEntity)
