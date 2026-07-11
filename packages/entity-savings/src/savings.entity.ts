import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { SavingsTransaction } from './savings.schema'

export const SavingsEntity: EntityDefinition<SavingsTransaction> = {
  name: 'savings_transaction',
  ui: { label: 'Savings', labelPlural: 'Savings', icon: 'PiggyBank', routePath: 'savings', color: 'green', showInNav: true, navOrder: 25 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true },
  rbac: { enabled: true, permissionPrefix: 'savings' },
  hooks: {}, pagination: 'cursor',
  tenant: { enabled: true },
  softDelete: { enabled: true },
}
EntityRegistry.register(SavingsEntity)
