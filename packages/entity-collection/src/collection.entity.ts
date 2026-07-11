import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { Collector, CollectionGroup, CollectionLog, Remittance, Area } from './collection.schema'

export const CollectorEntity: EntityDefinition<Collector> = {
  name: 'collector',
  ui: { label: 'Collector', labelPlural: 'Collectors', icon: 'UserCheck', routePath: 'collectors', color: 'blue', showInNav: true, navOrder: 50 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'collector' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(CollectorEntity)

export const CollectionGroupEntity: EntityDefinition<CollectionGroup> = {
  name: 'collection_group',
  ui: { label: 'Collection Group', labelPlural: 'Collection Groups', icon: 'Layers', routePath: 'settings/collection-groups', color: 'green', showInNav: false, navGroup: 'Administration' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'collection' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(CollectionGroupEntity)

export const RemittanceEntity: EntityDefinition<Remittance> = {
  name: 'remittance',
  ui: { label: 'Remittance', labelPlural: 'Remittances', icon: 'ArrowUpCircle', routePath: 'remittances', color: 'green', showInNav: true, navOrder: 55 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'collection' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(RemittanceEntity)

export const AreaEntity: EntityDefinition<Area> = {
  name: 'area',
  ui: { label: 'Area', labelPlural: 'Areas', icon: 'MapPin', routePath: 'areas', color: 'blue', showInNav: false, navGroup: 'Administration' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'collection' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(AreaEntity)
