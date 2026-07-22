/**
 * ─── Share Capital Entity Definition ─────────────────────────
 */

import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { ShareCapitalTransaction } from './share-capital.schema'

export const ShareCapitalEntity: EntityDefinition<ShareCapitalTransaction> = {
  name: 'share_capital_transaction',
  ui: {
    label: 'Share Capital',
    labelPlural: 'Share Capital',
    icon: 'Banknote',
    routePath: 'share-capital',
    color: 'green',
    showInNav: true,
    navOrder: 20,
    navGroup: 'Cooperative',
  },
  sync: {
    enabled: true,
    conflictStrategy: 'lww',
    priority: 'critical',
  },
  audit: { enabled: true, excludeFields: ['version'] },
  rbac: { enabled: true, permissionPrefix: 'share_capital' },
  hooks: {},
  pagination: 'cursor',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

// Note: tenantId isn't on ShareCapitalTransaction directly,
// but it inherits from BaseEntity which has it.
EntityRegistry.register(ShareCapitalEntity)
