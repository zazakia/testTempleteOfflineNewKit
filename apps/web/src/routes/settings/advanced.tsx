/**
 * ─── Advanced Settings ───────────────────────────────────────
 * Role access, audit trail viewer, feature flags, business rules, period closing.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { Save, Shield, Eye, Flag, Settings2, Lock, Calendar } from 'lucide-react'
import { getDatabase } from '@repo/db-dexie'

type AdvancedTab = 'role-access' | 'audit-trail' | 'feature-flags' | 'business-rules' | 'period-closing'

export function AdvancedSettingsPage() {
  const [activeTab, setActiveTab] = useState<AdvancedTab>('role-access')

  const tabs = [
    { id: 'role-access' as AdvancedTab, label: 'Role Access', icon: <Shield className="h-4 w-4" /> },
    { id: 'audit-trail' as AdvancedTab, label: 'Audit Trail', icon: <Eye className="h-4 w-4" /> },
    { id: 'feature-flags' as AdvancedTab, label: 'Feature Flags', icon: <Flag className="h-4 w-4" /> },
    { id: 'business-rules' as AdvancedTab, label: 'Business Rules', icon: <Settings2 className="h-4 w-4" /> },
    { id: 'period-closing' as AdvancedTab, label: 'Period Closing', icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Advanced Settings</h1>
        <p className="text-sm text-gray-500">Configure security, rules, and system settings</p>
      </div>
      <div className="flex gap-6">
        <div className="w-44 shrink-0 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${activeTab === t.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          {activeTab === 'role-access' && <RoleAccessSettings />}
          {activeTab === 'audit-trail' && <AuditTrailSettings />}
          {activeTab === 'feature-flags' && <FeatureFlagsSettings />}
          {activeTab === 'business-rules' && <BusinessRulesSettings />}
          {activeTab === 'period-closing' && <PeriodClosingSettings />}
        </div>
      </div>
    </div>
  )
}

const ROLES = ['admin', 'manager', 'officer', 'collector', 'borrower', 'loan_encoder', 'payment_encoder', 'expenses_encoder']
const PERMISSIONS = ['members.*', 'members.read', 'members.create', 'members.update', 'members.delete',
  'loans.*', 'loans.read', 'loans.create', 'loans.approve', 'loans.disburse',
  'payments.*', 'payments.create', 'payments.read',
  'accounting.*', 'accounting.read', 'accounting.create',
  'collection.*', 'settings.*', 'reports.*']

function RoleAccessSettings() {
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>({
    admin: PERMISSIONS.map(p => p), manager: ['members.*', 'loans.*', 'payments.*', 'reports.*', 'collection.*'],
    officer: ['members.read', 'members.create', 'loans.read', 'payments.read'],
    collector: ['loans.read', 'payments.create', 'collection.*'],
    borrower: ['loans.read', 'payments.read'],
    loan_encoder: ['loans.create', 'loans.read', 'members.read'],
    payment_encoder: ['payments.create', 'payments.read', 'loans.read'],
    expenses_encoder: ['payments.create'],
  })

  function togglePerm(role: string, perm: string) {
    setRolePerms(prev => {
      const current = prev[role] ?? []
      const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm]
      return { ...prev, [role]: updated }
    })
  }

  return (
    <Card>
      <CardHeader title="Role-Based Access Control" description="Manage permissions per role" />
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500"><th className="pb-2 pr-2 sticky top-0 bg-white">Permission</th>
            {ROLES.map(r => <th key={r} className="pb-2 pr-2 text-center sticky top-0 bg-white capitalize">{r.replace('_', ' ')}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {PERMISSIONS.map(perm => (
              <tr key={perm} className="hover:bg-gray-50">
                <td className="py-1.5 pr-2 text-xs font-mono">{perm}</td>
                {ROLES.map(r => (
                  <td key={r} className="py-1.5 pr-2 text-center">
                    <input type="checkbox" checked={rolePerms[r]?.includes(perm) ?? false}
                      onChange={() => togglePerm(r, perm)} className="h-4 w-4 rounded border-gray-300 text-green-600" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AuditTrailSettings() {
  const [logs, setLogs] = useState<any[]>([])
  useEffect(() => {
    try {
      const db = getDatabase()
      db.table('action_logs')?.toArray().then((allLogs: any[]) => setLogs(allLogs.slice(-50).reverse())).catch(() => {})
    } catch { /* table may not exist */ }
  }, [])

  return (
    <Card>
      <CardHeader title="Audit Trail" description="Recent system activity" />
      {logs.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No audit logs available</p>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Time</th><th className="pb-2 pr-2">Entity</th><th className="pb-2 pr-2">Action</th><th className="pb-2">User</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l: any, i: number) => (
                <tr key={l.id ?? i}>
                  <td className="py-1.5 pr-2 text-gray-400">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
                  <td className="py-1.5 pr-2">{l.entityType ?? '—'}</td>
                  <td className="py-1.5 pr-2">{l.action ?? '—'}</td>
                  <td className="py-1.5">{l.performedBy ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function FeatureFlagsSettings() {
  const flags = [
    { key: 'sync.enabled', label: 'Background Sync', enabled: true },
    { key: 'sync.realtime', label: 'Real-time Sync', enabled: false },
    { key: 'audit.enabled', label: 'Audit Trail', enabled: true },
    { key: 'export.csv', label: 'CSV Export', enabled: true },
    { key: 'export.pdf', label: 'PDF Export', enabled: false },
    { key: 'customer.bulk-import', label: 'Bulk Import', enabled: false },
    { key: 'debug.error-details', label: 'Detailed Errors', enabled: false },
  ]
  const [flagStates, setFlagStates] = useState<Record<string, boolean>>(
    Object.fromEntries(flags.map(f => [f.key, f.enabled]))
  )

  return (
    <Card>
      <CardHeader title="Feature Flags" description="Toggle features at runtime" />
      <div className="space-y-2">
        {flags.map(f => (
          <div key={f.key} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
            <div><p className="font-medium text-gray-900">{f.label}</p><p className="text-xs text-gray-400">{f.key}</p></div>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input type="checkbox" checked={flagStates[f.key] ?? false}
                onChange={() => setFlagStates(s => ({ ...s, [f.key]: !s[f.key] }))}
                className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BusinessRulesSettings() {
  const [rules, setRules] = useState({
    maxLoanAmount: 500000, minInterestRate: 6, maxInterestRate: 24,
    latePenaltyRate: 0.5, maxLoanTerm: 60, minCapitalSub: 1000,
  })

  return (
    <Card>
      <CardHeader title="Business Rules" description="Configure cooperative policy parameters" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Max Loan Amount (₱)" type="number" value={String(rules.maxLoanAmount)}
          onChange={(e) => setRules(r => ({ ...r, maxLoanAmount: Number(e.target.value) }))} />
        <Input label="Min Interest Rate (%)" type="number" value={String(rules.minInterestRate)}
          onChange={(e) => setRules(r => ({ ...r, minInterestRate: Number(e.target.value) }))} />
        <Input label="Max Interest Rate (%)" type="number" value={String(rules.maxInterestRate)}
          onChange={(e) => setRules(r => ({ ...r, maxInterestRate: Number(e.target.value) }))} />
        <Input label="Late Penalty (% per day)" type="number" value={String(rules.latePenaltyRate)}
          onChange={(e) => setRules(r => ({ ...r, latePenaltyRate: Number(e.target.value) }))} />
        <Input label="Max Loan Term (months)" type="number" value={String(rules.maxLoanTerm)}
          onChange={(e) => setRules(r => ({ ...r, maxLoanTerm: Number(e.target.value) }))} />
        <Input label="Min Capital Subscription (₱)" type="number" value={String(rules.minCapitalSub)}
          onChange={(e) => setRules(r => ({ ...r, minCapitalSub: Number(e.target.value) }))} />
      </div>
    </Card>
  )
}

function PeriodClosingSettings() {
  const [closedPeriods, setClosedPeriods] = useState<string[]>([])

  function togglePeriod(period: string) {
    setClosedPeriods(prev => prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period])
  }

  const currentYear = new Date().getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(currentYear, i).toLocaleString('default', { month: 'long' }),
    value: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
  }))

  return (
    <Card>
      <CardHeader title="Period Closing" description="Close fiscal periods to prevent further modifications" />
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Fiscal Year: {currentYear}</p>
        {months.map(m => (
          <div key={m.value} className="flex items-center justify-between rounded-lg border bg-white px-4 py-2">
            <span className="text-sm">{m.label}</span>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input type="checkbox" checked={closedPeriods.includes(m.value)}
                onChange={() => togglePeriod(m.value)}
                className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-500 peer-checked:after:translate-x-full" />
              {closedPeriods.includes(m.value) && <span className="ml-3 text-xs text-red-600">Closed</span>}
            </label>
          </div>
        ))}
      </div>
    </Card>
  )
}
