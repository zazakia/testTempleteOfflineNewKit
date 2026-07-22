/**
 * ─── Feature Flags ───────────────────────────────────────────
 * Toggle features on/off per environment, tenant, or user.
 * Evaluated at runtime — no deploy needed.
 */

export type FlagTarget = 'environment' | 'tenant' | 'user' | 'percentage' | 'always'

export interface FlagRule {
  target: FlagTarget
  values?: string[]      // For tenant/user: list of IDs
  percentage?: number     // For percentage: 0-100
  environments?: string[] // For environment: 'development', 'staging', 'production'
}

export interface FeatureFlag {
  key: string
  description: string
  enabled: boolean
  rules?: FlagRule[]
  default?: boolean
}

export interface FlagContext {
  environment: string
  tenantId?: string
  userId?: string
  roles?: string[]
}

class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>()

  /** Define a feature flag */
  define(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag)
  }

  /** Define multiple flags at once */
  defineMany(flags: FeatureFlag[]): void {
    for (const flag of flags) {
      this.define(flag)
    }
  }

  /** Check if a feature is enabled for a given context */
  isEnabled(key: string, context?: FlagContext): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false

    if (!flag.enabled) return false

    if (flag.rules && flag.rules.length > 0 && context) {
      for (const rule of flag.rules) {
        switch (rule.target) {
          case 'environment':
            if (rule.environments && !rule.environments.includes(context.environment)) {
              return false
            }
            break
          case 'tenant':
            if (rule.values && context.tenantId && !rule.values.includes(context.tenantId)) {
              return false
            }
            break
          case 'user':
            if (rule.values && context.userId && !rule.values.includes(context.userId)) {
              return false
            }
            break
          case 'percentage':
            if (rule.percentage != null && context.userId) {
              const hash = this.simpleHash(context.userId)
              if (hash > rule.percentage) return false
            }
            break
          case 'always':
            break
        }
      }
    }

    return flag.default ?? true
  }

  /** Get all flags (for admin UI) */
  getAll(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  /** Toggle a flag at runtime */
  setEnabled(key: string, enabled: boolean): void {
    const flag = this.flags.get(key)
    if (flag) {
      flag.enabled = enabled
    }
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash % 100)
  }
}

export const featureFlags = new FeatureFlagManager()

// ─── Default Flags ───────────────────────────────────────
// Module Flags: Each business client system has its own on/off toggle.
// For a single-client deployment (e.g., laundry only), set only that
// module to enabled:true and all others to enabled:false.

featureFlags.defineMany([
  // ═══ Infrastructure (always ON) ═══
  {
    key: 'sync.enabled',
    description: 'Enable background sync',
    enabled: true,
    default: true,
  },
  {
    key: 'sync.realtime',
    description: 'Enable WebSocket real-time sync',
    enabled: false,
    rules: [{ target: 'environment', environments: ['development', 'staging'] }],
  },
  {
    key: 'audit.enabled',
    description: 'Enable audit trail',
    enabled: true,
    default: true,
  },
  {
    key: 'export.csv',
    description: 'Enable CSV export',
    enabled: true,
    default: true,
  },
  {
    key: 'export.pdf',
    description: 'Enable PDF export',
    enabled: false,
  },
  {
    key: 'multi-tenant',
    description: 'Enable multi-tenancy features',
    enabled: true,
    default: true,
  },
  {
    key: 'module.multi-branch',
    description: 'Enable multi-branch support (branch entities, branch filtering, per-branch reports)',
    enabled: true,
    default: true,
  },
  {
    key: 'module.changelog',
    description: 'Enable application changelog / roadmap module',
    enabled: true,
    default: true,
  },
  {
    key: 'debug.error-details',
    description: 'Show detailed error messages',
    enabled: true,
    rules: [{ target: 'environment', environments: ['development'] }],
  },

  // ═══ Cooperative ERP Modules ═══
  {
    key: 'module.cooperative',
    description: 'Enable Cooperative ERP (members, loans, savings, share capital, accounting, collections, governance)',
    enabled: true,
    default: true,
  },
  {
    key: 'module.customer',
    description: 'Enable legacy Customer CRM',
    enabled: true,
    default: true,
  },

  // ═══ Business Client Systems ═══
  {
    key: 'module.laundry',
    description: 'Enable Laundry Shop Management System (customers, orders, services, payments, inventory, multi-branch)',
    enabled: true,
    default: true,
  },
  {
    key: 'module.clinic',
    description: 'Enable Clinic Management System (patients, doctors, appointments, billing)',
    enabled: true,
    default: true,
  },
  {
    key: 'module.driving-school',
    description: 'Enable Driving School Management System (students, instructors, courses, enrollments, schedules, payments, vehicles)',
    enabled: true,
    default: true,
  },
  {
    key: 'module.fastfood',
    description: 'Enable Crispy King Fast Food POS (menu, orders, inventory, daily sales)',
    enabled: true,
    default: true,
  },
  {
    key: 'module.water-station',
    description: 'Enable Water Station Management System',
    enabled: true,
    default: true,
  },

  // ═══ Other Features ═══
  {
    key: 'customer.bulk-import',
    description: 'Enable bulk import for customers',
    enabled: false,
  },
])
