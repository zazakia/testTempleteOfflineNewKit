import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { JournalEntry, ChartOfAccount } from './accounting.schema'

export const JournalEntryEntity: EntityDefinition<JournalEntry> = {
  name: 'journal_entry',
  ui: { label: 'Journal Entry', labelPlural: 'Journal Entries', icon: 'BookOpen', routePath: 'accounting/journal-entries', color: 'blue', showInNav: true, navOrder: 20, navGroup: 'Accounting' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'accounting' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(JournalEntryEntity)

export const ChartOfAccountEntity: EntityDefinition<ChartOfAccount> = {
  name: 'chart_of_account',
  ui: { label: 'Chart of Account', labelPlural: 'Chart of Accounts', icon: 'ListTree', routePath: 'accounting/chart-of-accounts', color: 'blue', showInNav: true, navOrder: 10, navGroup: 'Accounting' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'accounting' },
  hooks: {}, pagination: 'offset', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(ChartOfAccountEntity)
