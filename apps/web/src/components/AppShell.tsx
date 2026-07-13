/**
 * ─── App Shell ───────────────────────────────────────────────
 * Main application layout with sidebar, topbar, and content area.
 */

import React, { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useOnlineStatus } from '@repo/ui-core'
import {
  LayoutDashboard,
  Users,
  Banknote,
  PiggyBank,
  ScrollText,
  FileText,
  Receipt,
  BookOpen,
  ListTree,
  Menu,
  X,
  RefreshCw,
  WifiOff,
  CloudOff,
  UserCheck,
  ArrowUpCircle,
  Landmark,
  Wallet,
  BarChart3,
  Settings2,
  Building2,
  MapPin,
  Layers,
  Globe,
  Droplets,
  Truck,
  UsersRound,
  Tags,
  LogOut,
} from 'lucide-react'
import { useSyncStore, useAppStore } from '../store/app'
import { cn, Button } from '@repo/ui-core'
import { useAuth } from '../context/AuthContext'
import { ToastContainer } from './ToastContainer'
import { useFeatureFlag, useFlagContext } from '../context/FeatureFlagContext'
import { useDynamicNav } from '../hooks/useDynamicNav'
import type { DynamicNavItem } from '../hooks/useDynamicNav'

/** Resolve a Lucide icon string to a component */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Banknote, PiggyBank, ScrollText,
  FileText, Receipt, BookOpen, ListTree, UserCheck,
  ArrowUpCircle, Landmark, Wallet, BarChart3, Settings2,
  MapPin, RefreshCw, Building2, Globe, Layers, Tags,
  Droplets, Truck, UsersRound,
}
function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Layers
  return <Icon className={className ?? 'h-5 w-5'} />
}

/** Static nav items (not entity-driven) */
const staticNavSections = [
  {
    label: 'Analytics',
    items: [
      { label: 'Reports', icon: 'BarChart3', path: '/reports' },
      { label: 'Trial Balance', icon: 'BookOpen', path: '/accounting/trial-balance' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Settings', icon: 'Settings2', path: '/settings' },
      { label: 'Advanced', icon: 'Settings2', path: '/settings/advanced' },
      { label: 'Computations', icon: 'Settings2', path: '/settings/coop-computations' },
      { label: 'Pending Approvals', icon: 'FileText', path: '/pending-approvals' },
      { label: 'Governance', icon: 'Building2', path: '/governance' },
      { label: 'Sync Center', icon: 'RefreshCw', path: '/sync-center' },
    ],
  },
]

export const AppShell = React.memo(function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { online } = useOnlineStatus()
  const { pendingCount } = useSyncStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Feature flags — evaluated reactively per user/tenant/env
  const showAnalytics = useFeatureFlag('export.csv')
  const showSyncCenter = useFeatureFlag('sync.enabled')
  const showDebugInfo = useFeatureFlag('debug.error-details')
  const flagCtx = useFlagContext()

  // Dynamic navigation from EntityRegistry metadata (merged with static items)
  const dynamicSections = useDynamicNav()
  const allSections = useMemo(() => {
    const merged: Array<{ label: string; items: DynamicNavItem[] }> = dynamicSections.map(s => ({
      ...s,
      items: [...s.items],
    }))
    for (const staticSec of staticNavSections) {
      const existing = merged.find(s => s.label === staticSec.label)
      const staticItems = staticSec.items as DynamicNavItem[]
      if (existing) {
        // Deduplicate: only add items not already present
        for (const item of staticItems) {
          if (!existing.items.some(i => i.path === item.path)) {
            existing.items.push(item)
          }
        }
      } else {
        merged.push({ label: staticSec.label, items: [...staticItems] })
      }
    }
    return merged
  }, [dynamicSections])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <span className="text-sm font-bold text-white">CE</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">CoopERP</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {allSections.map((section) => {
            // Feature-gate: hide Analytics if CSV export disabled
            if (section.label === 'Analytics' && !showAnalytics) return null

            const filteredItems = section.items.filter((item: DynamicNavItem) => {
              if (item.path === '/sync-center' && !showSyncCenter) return false
              return true
            })
            if (filteredItems.length === 0) return null

            return (
              <div key={section.label} className="mb-4">
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {filteredItems.map((item: DynamicNavItem) => {
                    const isActive = item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path)
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-gray-100',
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <NavIcon name={item.icon} />
                          <span>{item.label}</span>
                          {item.badge != null && item.badge > 0 && (
                            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* Offline indicator */}
        <div className="border-t border-gray-200 p-4">
          {!online ? (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              <WifiOff className="h-4 w-4" />
              <span>Offline — changes will sync when connected</span>
            </div>
          ) : pendingCount > 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{pendingCount} pending changes</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500">
              <CloudOff className="h-4 w-4" />
              <span>All changes synced</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden" role="main" aria-label="Page content">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          {!online && (
            <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          )}
          {pendingCount > 0 && online && (
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Syncing ({pendingCount})
            </div>
          )}
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout()
                    navigate({ to: '/login' })
                  }}
                  icon={<LogOut className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Debug: feature flag status (only in dev) */}
        {showDebugInfo && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-1 text-xs text-amber-700">
            [FF] env={flagCtx.environment} tenant={flagCtx.tenantId}
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <ToastContainer />
      </main>
    </div>
  )
})
