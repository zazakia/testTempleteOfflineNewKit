/**
 * ─── RBAC Authorization Hook ─────────────────────────────────
 * Role-Based Access Control for routes and components.
 * Reads user role from AuthContext and checks permissions.
 *
 * Usage:
 *   const { canView, canEdit, isAdmin } = useAuthorization()
 *   if (!canView('members')) return <Redirect to="/" />
 *   {isAdmin && <AdminPanel />}
 */

import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'

interface PermissionSet {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  approve: boolean
}

const ROLE_PERMISSIONS: Record<UserRole, Record<string, PermissionSet>> = {
  admin: {
    '*': { view: true, create: true, edit: true, delete: true, approve: true },
  },
  manager: {
    '*': { view: true, create: true, edit: true, delete: false, approve: true },
  },
  officer: {
    '*': { view: true, create: true, edit: true, delete: false, approve: true },
  },
  collector: {
    members:    { view: true, create: false, edit: false, delete: false, approve: false },
    loans:      { view: true, create: false, edit: false, delete: false, approve: false },
    payments:   { view: true, create: true, edit: false, delete: false, approve: false },
    collections:{ view: true, create: true, edit: true, delete: false, approve: false },
    reports:    { view: true, create: false, edit: false, delete: false, approve: false },
    '*':        { view: false, create: false, edit: false, delete: false, approve: false },
  },
  loan_encoder: {
    loans:        { view: true, create: true, edit: true, delete: false, approve: false },
    'loan-applications': { view: true, create: true, edit: true, delete: false, approve: false },
    members:      { view: true, create: false, edit: false, delete: false, approve: false },
    payments:     { view: true, create: false, edit: false, delete: false, approve: false },
    reports:      { view: true, create: false, edit: false, delete: false, approve: false },
    '*':          { view: false, create: false, edit: false, delete: false, approve: false },
  },
  payment_encoder: {
    payments:     { view: true, create: true, edit: true, delete: false, approve: false },
    members:      { view: true, create: false, edit: false, delete: false, approve: false },
    reports:      { view: true, create: false, edit: false, delete: false, approve: false },
    '*':          { view: false, create: false, edit: false, delete: false, approve: false },
  },
  expenses_encoder: {
    expenses:     { view: true, create: true, edit: true, delete: false, approve: false },
    reports:      { view: true, create: false, edit: false, delete: false, approve: false },
    '*':          { view: false, create: false, edit: false, delete: false, approve: false },
  },
  borrower: {
    portal:       { view: true, create: false, edit: false, delete: false, approve: false },
    loans:        { view: true, create: false, edit: false, delete: false, approve: false },
    payments:     { view: true, create: false, edit: false, delete: false, approve: false },
    '*':          { view: false, create: false, edit: false, delete: false, approve: false },
  },
}

/** Supported module names for permission checks */
type Module = 'members' | 'loans' | 'loan-applications' | 'payments' | 'collections' |
  'reports' | 'settings' | 'expenses' | 'portal' | 'share-capital' | 'savings' |
  'accounting' | 'governance' | '*'

export function useAuthorization() {
  const { user, isAdmin, isCollector, isBorrower, isEncoder } = useAuth()

  const role = user?.role ?? 'borrower'

  /** Check if user can view a module */
  function canView(module: Module): boolean {
    if (isAdmin || role === 'admin' || role === 'manager' || role === 'officer') return true
    const perms = ROLE_PERMISSIONS[role]
    return perms[module]?.view ?? perms['*']?.view ?? false
  }

  /** Check if user can create in a module */
  function canCreate(module: Module): boolean {
    if (isAdmin || role === 'admin' || role === 'manager') return true
    const perms = ROLE_PERMISSIONS[role]
    return perms[module]?.create ?? perms['*']?.create ?? false
  }

  /** Check if user can approve */
  function canApprove(module: Module): boolean {
    const perms = ROLE_PERMISSIONS[role]
    return perms[module]?.approve ?? perms['*']?.approve ?? false
  }

  /** Get collector-scoped filter for data queries */
  function collectorFilter(): Array<{ field: string; operator: string; value: unknown }> | undefined {
    if (role === 'collector' && user?.collectorId) {
      return [{ field: 'collectorId', operator: 'eq', value: user.collectorId }]
    }
    return undefined
  }

  /** Get borrower-scoped filter (sees only their own data) */
  function borrowerFilter(): Array<{ field: string; operator: string; value: unknown }> | undefined {
    if (role === 'borrower' && user?.memberId) {
      return [{ field: 'borrowerId', operator: 'eq', value: user.memberId }]
    }
    return undefined
  }

  return {
    role,
    isAdmin,
    isCollector,
    isBorrower,
    isEncoder,
    canView,
    canCreate,
    canApprove,
    collectorFilter,
    borrowerFilter,
  }
}
