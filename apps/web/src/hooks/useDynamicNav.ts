/**
 * ─── Dynamic Navigation Hook ─────────────────────────────────
 * Generates nav items from EntityRegistry metadata.
 * Each registered entity with showInNav=true becomes a nav link.
 * Grouped by navGroup (from entity definition) or inferred from routePath.
 *
 * This replaces hardcoded navSections[] in AppShell.tsx.
 */

import { useMemo } from 'react'
import { EntityRegistry } from '@repo/core'
import type { EntityDefinition, EntityUIConfig } from '@repo/core'
import { featureFlags } from '@repo/feature-flags'

export interface DynamicNavItem {
  label: string
  icon: string
  path: string
  color: string
  badge?: number
}

export interface DynamicNavSection {
  label: string
  items: DynamicNavItem[]
}

/** Map routePath prefix to nav group label (fallback when entity has no navGroup) */
const ROUTE_TO_GROUP: Record<string, string> = {
  '/members': 'Cooperative',
  '/share-capital': 'Cooperative',
  '/savings': 'Cooperative',
  '/customers': 'Cooperative',
  '/loans': 'Lending',
  '/loan-applications': 'Lending',
  '/loan-products': 'Lending',
  '/lending': 'Lending',
  '/payments': 'Lending',
  '/accounting': 'Accounting',
  '/collections': 'Collections',
  '/collectors': 'Collections',
  '/remittances': 'Collections',
  '/collection-groups': 'Collections',
  '/bank-accounts': 'Accounting',
  '/expenses': 'Accounting',
  '/expense-categories': 'Accounting',
  '/cash-on-hand': 'Accounting',
  '/bank-transactions': 'Accounting',
  '/reports': 'Analytics',
  '/settings': 'Administration',
  '/sync-center': 'Administration',
  '/areas': 'Administration',
  '/pending-approvals': 'Administration',
  '/governance': 'Administration',
  '/file-cases': 'Administration',
  '/payroll': 'Administration',
  '/portal': 'Portals',
  '/water-station': 'Water Station',
  '/clinic': 'Clinic',
  '/driving-school': 'Driving School',
  '/laundry': 'Laundry',
  '/fastfood': 'Fast Food',
  '/branches': 'Administration',
  '/changelog': 'Administration',
}

/** Static nav items that aren't entity-driven */
const STATIC_NAV: DynamicNavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', icon: 'LayoutDashboard', path: '/', color: 'blue' }],
  },
]

/** Static items added to specific groups (not entity-driven) */
const STATIC_GROUP_ITEMS: Record<string, DynamicNavItem[]> = {
  'Laundry': [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: '/laundry', color: 'blue' },
    { label: 'Reports', icon: 'BarChart3', path: '/laundry/reports', color: 'green' },
  ],
}

/** Compute nav group from entity UI config */
function getNavGroup(ui: EntityUIConfig): string {
  if (ui.navGroup) return ui.navGroup
  // Normalize: ensure leading slash for matching
  const path = ui.routePath.startsWith('/') ? ui.routePath : '/' + ui.routePath
  // Fallback: infer from routePath
  for (const [prefix, group] of Object.entries(ROUTE_TO_GROUP)) {
    if (path.startsWith(prefix)) return group
  }
  return 'Other'
}

/**
 * Map nav groups to feature flags.
 * Only groups whose flag is enabled will appear in the sidebar.
 */
const NAV_GROUP_FLAGS: Record<string, string> = {
  'Cooperative': 'module.cooperative',
  'Lending': 'module.cooperative',
  'Accounting': 'module.cooperative',
  'Collections': 'module.cooperative',
  'Analytics': 'module.cooperative',
  'Portals': 'module.cooperative',
  'Water Station': 'module.water-station',
  'Clinic': 'module.clinic',
  'Laundry': 'module.laundry',
  'Driving School': 'module.driving-school',
  'Fast Food': 'module.fastfood',
}

/**
 * Generate navigation sections from EntityRegistry metadata.
 * Filters by feature flags — only enabled modules appear.
 */
export function useDynamicNav(): DynamicNavSection[] {
  return useMemo(() => {
    const entities = EntityRegistry.getNavEntities()

    // Group by navGroup
    const groups = new Map<string, DynamicNavItem[]>()
    for (const entity of entities) {
      const group = getNavGroup(entity.ui)
      if (!groups.has(group)) groups.set(group, [])
      groups.get(group)!.push({
        label: entity.ui.labelPlural ?? entity.ui.label,
        icon: entity.ui.icon ?? 'Layers',
        path: entity.ui.routePath.startsWith('/') ? entity.ui.routePath : `/${entity.ui.routePath}`,
        color: entity.ui.color ?? 'blue',
      })
    }

    // Filter groups by feature flags
    const enabledGroups = new Map<string, DynamicNavItem[]>()
    for (const [group, items] of groups.entries()) {
      const flagKey = NAV_GROUP_FLAGS[group]
      if (!flagKey || featureFlags.isEnabled(flagKey)) {
        enabledGroups.set(group, items)
      }
    }

    // Inject static group items (Dashboard, Reports) into enabled groups
    for (const [group, staticItems] of Object.entries(STATIC_GROUP_ITEMS)) {
      const flagKey = NAV_GROUP_FLAGS[group]
      if (!flagKey || featureFlags.isEnabled(flagKey)) {
        const existing = enabledGroups.get(group) ?? []
        enabledGroups.set(group, [...staticItems, ...existing])
      }
    }

    // Build sections sorted by group name, items sorted by navOrder
    const sections: DynamicNavSection[] = [
      ...STATIC_NAV,
      ...Array.from(enabledGroups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, items]) => ({
          label,
          items: items.sort((a, b) => {
            const aOrder = entities.find(e => e.ui.routePath === a.path.replace(/^\//, ''))?.ui.navOrder ?? 999
            const bOrder = entities.find(e => e.ui.routePath === b.path.replace(/^\//, ''))?.ui.navOrder ?? 999
            return aOrder - bOrder
          }),
        })),
    ]

    return sections
  }, [])
}
