import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'

export const BoardResolutionEntity: EntityDefinition<any> = {
  name: 'board_resolution',
  ui: { label: 'Board Resolution', labelPlural: 'Board Resolutions', icon: 'FileText', routePath: 'governance', color: 'blue', showInNav: true, navOrder: 60, navGroup: 'Administration' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'governance' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(BoardResolutionEntity)

export const CommitteeEntity: EntityDefinition<any> = {
  name: 'committee',
  ui: { label: 'Committee', labelPlural: 'Committees', icon: 'UsersRound', routePath: 'governance', color: 'green', showInNav: false, navGroup: 'Administration' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'governance' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(CommitteeEntity)
