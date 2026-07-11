/**
 * ─── Cooperative Dashboard ───────────────────────────────────
 * Key performance indicators and quick links for cooperative management.
 */

import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader } from '@repo/ui-core'
import { memberRepo, loanRepo, checkDbHealth } from '../lib/db'
import { useOnlineStatus } from '@repo/ui-core'
import { Users, Banknote, ScrollText, Receipt, PiggyBank, RefreshCw, LayoutDashboard } from 'lucide-react'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalLoans: number
  activeLoans: number
  totalPayments: number
  dbHealth: { ok: boolean; tableCount: number; totalRecords: number }
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0, activeMembers: 0,
    totalLoans: 0, activeLoans: 0, totalPayments: 0,
    dbHealth: { ok: false, tableCount: 0, totalRecords: 0 },
  })
  const [loading, setLoading] = useState(true)
  const { online } = useOnlineStatus()

  useEffect(() => {
    async function load() {
      try {
        const [memberCount, activeMemberCount, loanCount, activeLoanCount, health] = await Promise.all([
          memberRepo.count({}),
          memberRepo.count({ filter: [{ field: 'membershipStatus', operator: 'eq', value: 'active' }] }),
          loanRepo.count({}),
          loanRepo.count({ filter: [{ field: 'status', operator: 'eq', value: 'active' }] }),
          checkDbHealth(),
        ])
        setStats({
          totalMembers: memberCount,
          activeMembers: activeMemberCount,
          totalLoans: loanCount,
          activeLoans: activeLoanCount,
          totalPayments: 0,
          dbHealth: health,
        })
      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Members', value: stats.totalMembers, icon: <Users className="h-6 w-6" />, color: 'bg-blue-500', link: '/members' },
    { label: 'Active Members', value: stats.activeMembers, icon: <Users className="h-6 w-6" />, color: 'bg-green-500', link: '/members' },
    { label: 'Active Loans', value: stats.activeLoans, icon: <ScrollText className="h-6 w-6" />, color: 'bg-purple-500', link: '/loans' },
    { label: 'Total Loans', value: stats.totalLoans, icon: <Banknote className="h-6 w-6" />, color: 'bg-yellow-500', link: '/loans' },
  ]

  const quickLinks = [
    { label: 'Register Member', icon: <Users className="h-5 w-5" />, path: '/members/new', color: 'text-blue-600' },
    { label: 'Loan Application', icon: <FileTextIcon />, path: '/loan-applications/new', color: 'text-purple-600' },
    { label: 'Record Payment', icon: <Receipt className="h-5 w-5" />, path: '/payments', color: 'text-green-600' },
    { label: 'Journal Entry', icon: <LayoutDashboard className="h-5 w-5" />, path: '/accounting/journal-entries/new', color: 'text-orange-600' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Cooperative Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {online ? '🟢 Online' : '🔴 Offline'} · {stats.dbHealth.tableCount} tables · {stats.dbHealth.totalRecords} records stored locally
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.link}>
            <div className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {loading ? <span className="animate-pulse">—</span> : card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-lg ${card.color} bg-opacity-10 p-3 text-${card.color.split('-')[1]}-600`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.label} to={link.path}>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md">
                <div className={link.color}>{link.icon}</div>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="System Health" />
          <dl className="space-y-2">
            <HealthItem label="Database" value={stats.dbHealth.ok ? '✅ Connected' : '❌ Error'} />
            <HealthItem label="Tables" value={String(stats.dbHealth.tableCount)} />
            <HealthItem label="Total Records" value={stats.dbHealth.totalRecords.toLocaleString()} />
            <HealthItem label="Sync Status" value={online ? '🟢 Online' : '🔴 Offline'} />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Module Guide" description="Click a module in the sidebar to get started" />
          <div className="space-y-3">
            <ModuleGuideItem step="1" title="Members" desc="Register cooperative members with full profiles" status="ready" />
            <ModuleGuideItem step="2" title="Share Capital" desc="Manage member share subscriptions" status="ready" />
            <ModuleGuideItem step="3" title="Loan Applications" desc="Accept and process loan applications" status="ready" />
            <ModuleGuideItem step="4" title="Loan Disbursement" desc="Disburse approved loans" status="ready" />
            <ModuleGuideItem step="5" title="Collections" desc="Record payments and manage collectors" status="ready" />
            <ModuleGuideItem step="6" title="Accounting" desc="Chart of accounts and journal entries" status="ready" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

function FileTextIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ModuleGuideItem({ step, title, desc, status }: { step: string; title: string; desc: string; status: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
        {step}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {status === 'ready' && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Ready</span>}
    </div>
  )
}
