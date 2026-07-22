import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { Loan, LoanProduct, LoanApplication, Payment } from './loan.schema'
import { LoanHooks } from './loan.hooks'
import { LoanPolicies } from './loan.policies'

export const LoanEntity: EntityDefinition<Loan> = {
  name: 'loan',
  ui: { label: 'Loan', labelPlural: 'Loans', icon: 'ScrollText', routePath: 'loans', color: 'purple', showInNav: true, navOrder: 30, navGroup: 'Lending' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'critical' },
  audit: { enabled: true, excludeFields: ['version', 'dpd'] },
  rbac: { enabled: true, permissionPrefix: 'loan' },
  hooks: LoanHooks, pagination: 'cursor',
  tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(LoanEntity)

export const LoanProductEntity: EntityDefinition<LoanProduct> = {
  name: 'loan_product',
  ui: { label: 'Loan Product', labelPlural: 'Loan Products', icon: 'Tags', routePath: 'lending/loan-products', color: 'blue', showInNav: true, navOrder: 10, navGroup: 'Lending' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'loan_product' },
  hooks: {}, pagination: 'offset', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(LoanProductEntity)

export const LoanApplicationEntity: EntityDefinition<LoanApplication> = {
  name: 'loan_application',
  ui: { label: 'Loan Application', labelPlural: 'Loan Applications', icon: 'FileText', routePath: 'loan-applications', color: 'yellow', showInNav: true, navOrder: 20, navGroup: 'Lending' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'loan_application' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(LoanApplicationEntity)

export const PaymentEntity: EntityDefinition<Payment> = {
  name: 'payment',
  ui: { label: 'Payment', labelPlural: 'Payments', icon: 'Receipt', routePath: 'payments', color: 'green', showInNav: true, navOrder: 40, navGroup: 'Lending' },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'critical' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'payment' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(PaymentEntity)
