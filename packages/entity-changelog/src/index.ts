/**
 * ─── Entity Changelog — Barrel Export ──────────────────────
 * Application roadmap and changelog tracking module.
 *
 * Tracks every update, feature, bugfix, and change across the
 * entire application lifecycle. Serves as both a developer
 * roadmap and a user-facing changelog.
 *
 * Importing this module automatically:
 *  1. Registers ChangelogEntry with the Entity Registry
 *  2. Adds "Changelog" to the sidebar under "Administration"
 *  3. Enables sync, audit, and RBAC for changelog_entries
 */

// Self-register
export { ChangelogEntity } from './changelog.entity'

// Types
export type {
  ChangelogEntry,
  ChangelogCategory,
  ChangelogStatus,
  AffectedPlatform,
  AffectedModule,
} from './changelog.schema'

// Schemas
export {
  CreateChangelogEntrySchema,
  UpdateChangelogEntrySchema,
  ChangelogQuerySchema,
  ChangelogCategorySchema,
  ChangelogStatusSchema,
  AffectedPlatformSchema,
  AffectedModuleSchema,
  CHANGELOG_CATEGORY_LABELS,
  CHANGELOG_CATEGORY_COLORS,
  CHANGELOG_CATEGORY_ICONS,
  CHANGELOG_STATUS_LABELS,
  CHANGELOG_STATUS_COLORS,
  PLATFORM_LABELS,
} from './changelog.schema'

// Business logic
export { ChangelogService } from './changelog.service'
export type { ChangelogSummary } from './changelog.service'

// Hooks
export { ChangelogHooks } from './changelog.hooks'
