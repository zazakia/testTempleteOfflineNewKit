/**
 * ─── Changelog Schema ───────────────────────────────────────
 * Types and Zod schemas for the Changelog / Roadmap entity.
 *
 * Tracks every update, feature, bugfix, and change in the app
 * with full metadata: version, date, category, description, purpose,
 * affected modules, status, author, and more.
 *
 * Serves dual purpose:
 *   1. Development roadmap (status: planned → in-progress → released)
 *   2. User-facing changelog (what's new in each version)
 */

import { z } from 'zod'
import {
  createQuerySchema,
  createUpdateSchema,
  notesSchema,
} from '@repo/core'

// ─── Types ───────────────────────────────────────────────────

/** Category of change */
export type ChangelogCategory =
  | 'feature'
  | 'enhancement'
  | 'bugfix'
  | 'breaking'
  | 'infrastructure'
  | 'security'
  | 'performance'
  | 'documentation'
  | 'deprecation'

/** Status in the release lifecycle */
export type ChangelogStatus =
  | 'planned'
  | 'in-progress'
  | 'released'
  | 'rolled-back'
  | 'cancelled'

/** Affected platform */
export type AffectedPlatform = 'web' | 'mobile' | 'desktop' | 'api' | 'database' | 'all'

/** An affected module / package */
export interface AffectedModule {
  /** Package or app name (e.g. "@repo/entity-clinic") */
  name: string
  /** Type of change */
  changeType: 'added' | 'modified' | 'removed' | 'fixed'
  /** Brief note about what changed in this module */
  note?: string
}

/**
 * A single changelog entry — one release or planned change.
 */
export interface ChangelogEntry {
  id: string
  tenantId: string

  // ─── Core Metadata ────────────────────────────────────

  /** Semantic version (e.g. "1.5.0") */
  releaseVersion: string
  /** Short, human-readable title (e.g. "Multi-Branch Support") */
  title: string
  /** Which category of change */
  category: ChangelogCategory
  /** Current status in the release pipeline */
  status: ChangelogStatus

  // ─── Detailed Content ─────────────────────────────────

  /** Full markdown description of what changed */
  description: string
  /** Why this change was made — the motivation and goals */
  purpose: string
  /** What users / developers need to know (upgrade notes, etc.) */
  impactNotes?: string

  // ─── Module / Platform Tracking ───────────────────────

  /** Which platforms are affected */
  affectedPlatforms: AffectedPlatform[]
  /** Specific packages or apps touched (structured) */
  affectedModules: AffectedModule[]

  // ─── Metadata ─────────────────────────────────────────

  /** ISO timestamp of when the release was published (or planned date) */
  releasedAt: number
  /** Who authored / implemented this change */
  author: string
  /** List of people who contributed */
  contributors?: string[]
  /** Links to GitHub issues, PRs, or external docs */
  relatedLinks?: string[]
  /** Whether this is a breaking change */
  isBreaking: boolean
  /** Whether database migration is required */
  migrationRequired: boolean
  /** Migration instructions if applicable */
  migrationNotes?: string
  /** Tags for filtering (e.g. ["cooperative", "lending", "mobile"]) */
  tags: string[]

  // ─── Base entity fields ───────────────────────────────

  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

// ─── Zod Schemas ────────────────────────────────────────────

export const ChangelogCategorySchema = z.enum([
  'feature',
  'enhancement',
  'bugfix',
  'breaking',
  'infrastructure',
  'security',
  'performance',
  'documentation',
  'deprecation',
])

export const ChangelogStatusSchema = z.enum([
  'planned',
  'in-progress',
  'released',
  'rolled-back',
  'cancelled',
])

export const AffectedPlatformSchema = z.enum([
  'web',
  'mobile',
  'desktop',
  'api',
  'database',
  'all',
])

export const AffectedModuleSchema = z.object({
  name: z.string().min(1, 'Module name is required').max(200),
  changeType: z.enum(['added', 'modified', 'removed', 'fixed']),
  note: z.string().max(500).optional(),
})

export const AffectedModuleArraySchema = z
  .array(AffectedModuleSchema)
  .default([])

/**
 * Schema for creating a new changelog entry.
 */
export const CreateChangelogEntrySchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  releaseVersion: z
    .string()
    .min(1, 'Version is required')
    .max(20, 'Version too long')
    .regex(
      /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/,
      'Version must follow semver (e.g. 1.2.0, 1.2.0-beta.1)',
    ),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  category: ChangelogCategorySchema,
  status: ChangelogStatusSchema.default('planned'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description too long'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(5000),
  impactNotes: z.string().max(5000).optional(),
  affectedPlatforms: z.array(AffectedPlatformSchema).default(['all']),
  affectedModules: AffectedModuleArraySchema,
  releasedAt: z.number().positive('Release date is required'),
  author: z.string().min(1, 'Author is required').max(200),
  contributors: z.array(z.string().max(200)).optional(),
  relatedLinks: z.array(z.string().url('Invalid URL')).optional(),
  isBreaking: z.boolean().default(false),
  migrationRequired: z.boolean().default(false),
  migrationNotes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).default([]),
})

/**
 * Schema for updating a changelog entry.
 */
export const UpdateChangelogEntrySchema = createUpdateSchema({
  releaseVersion: z
    .string()
    .min(1)
    .max(20)
    .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/)
    .optional(),
  title: z.string().min(1).max(200).optional(),
  category: ChangelogCategorySchema.optional(),
  status: ChangelogStatusSchema.optional(),
  description: z.string().min(10).max(10000).optional(),
  purpose: z.string().min(10).max(5000).optional(),
  impactNotes: z.string().max(5000).optional(),
  affectedPlatforms: z.array(AffectedPlatformSchema).optional(),
  affectedModules: AffectedModuleArraySchema.optional(),
  releasedAt: z.number().positive().optional(),
  author: z.string().min(1).max(200).optional(),
  contributors: z.array(z.string().max(200)).optional(),
  relatedLinks: z.array(z.string().url('Invalid URL')).optional(),
  isBreaking: z.boolean().optional(),
  migrationRequired: z.boolean().optional(),
  migrationNotes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).optional(),
})

/**
 * Schema for querying changelog entries.
 */
export const ChangelogQuerySchema = createQuerySchema({
  category: ChangelogCategorySchema.optional(),
  status: ChangelogStatusSchema.optional(),
  isBreaking: z.boolean().optional(),
  migrationRequired: z.boolean().optional(),
  releaseVersion: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
})

// ─── Display Helpers ────────────────────────────────────────

export const CHANGELOG_CATEGORY_LABELS: Record<ChangelogCategory, string> = {
  feature: 'Feature',
  enhancement: 'Enhancement',
  bugfix: 'Bug Fix',
  breaking: 'Breaking Change',
  infrastructure: 'Infrastructure',
  security: 'Security',
  performance: 'Performance',
  documentation: 'Documentation',
  deprecation: 'Deprecation',
}

export const CHANGELOG_CATEGORY_COLORS: Record<
  ChangelogCategory,
  'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray'
> = {
  feature: 'green',
  enhancement: 'blue',
  bugfix: 'yellow',
  breaking: 'red',
  infrastructure: 'purple',
  security: 'red',
  performance: 'yellow',
  documentation: 'gray',
  deprecation: 'yellow',
}

export const CHANGELOG_CATEGORY_ICONS: Record<ChangelogCategory, string> = {
  feature: 'Sparkles',
  enhancement: 'ArrowUp',
  bugfix: 'Bug',
  breaking: 'AlertTriangle',
  infrastructure: 'Server',
  security: 'Shield',
  performance: 'Zap',
  documentation: 'BookOpen',
  deprecation: 'Trash2',
}

export const CHANGELOG_STATUS_LABELS: Record<ChangelogStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  released: 'Released',
  'rolled-back': 'Rolled Back',
  cancelled: 'Cancelled',
}

export const CHANGELOG_STATUS_COLORS: Record<
  ChangelogStatus,
  'blue' | 'yellow' | 'green' | 'red' | 'gray'
> = {
  planned: 'blue',
  'in-progress': 'yellow',
  released: 'green',
  'rolled-back': 'red',
  cancelled: 'gray',
}

export const PLATFORM_LABELS: Record<AffectedPlatform, string> = {
  web: 'Web App',
  mobile: 'Mobile App',
  desktop: 'Desktop App',
  api: 'API',
  database: 'Database',
  all: 'All Platforms',
}
