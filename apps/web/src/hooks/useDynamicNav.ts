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
  '/members': 'Membership',
  '/share-capital': 'Membership',
  '/savings': 'Membership',
  '/customers': 'CRM',
  '/loans': 'Lending',
  '/loan-applications': 'Lending',
  '/loan-products': 'Lending',
  '/payments': 'Lending',
  '/accounting': 'Finance',
  '/collectors': 'Operations',
  '/remittances': 'Operations',
  '/collection-groups': 'Operations',
  '/bank-accounts': 'Operations',
  '/expenses': 'Operations',
  '/expense-categories': 'Operations',
  '/cash-on-hand': 'Operations',
  '/bank-transactions': 'Operations',
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
}

/** Static nav items that aren't entity-driven */
const STATIC_NAV: DynamicNavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', icon: 'LayoutDashboard', path: '/', color: 'blue' }],
  },
]

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
 * Generate navigation sections from EntityRegistry metadata.
 * Reactive — re-computes when entities change (e.g., feature flag toggles).
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

    // Build sections sorted by group name, items sorted by navOrder
    const sections: DynamicNavSection[] = [
      ...STATIC_NAV,
      ...Array.from(groups.entries())
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
