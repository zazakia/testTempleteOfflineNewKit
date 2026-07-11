import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'

export const BoardResolutionEntity: EntityDefinition<any> = {
  name: 'board_resolution',
  ui: { label: 'Board Resolution', labelPlural: 'Board Resolutions', icon: 'FileText', routePath: 'governance/resolutions', color: 'blue', showInNav: true, navOrder: 60 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'governance' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(BoardResolutionEntity)

export const CommitteeEntity: EntityDefinition<any> = {
  name: 'committee',
  ui: { label: 'Committee', labelPlural: 'Committees', icon: 'UsersRound', routePath: 'governance/committees', color: 'green', showInNav: true, navOrder: 60 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'governance' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(CommitteeEntity)
