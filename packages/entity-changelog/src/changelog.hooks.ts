/**
 * ─── Changelog Hooks ────────────────────────────────────────
 * Lifecycle hooks for the Changelog entity.
 */

import type { EntityHooks, HookContext, EntityId } from '@repo/core'
import type { ChangelogEntry } from './changelog.schema'
import { ChangelogService } from './changelog.service'

export const ChangelogHooks: EntityHooks<ChangelogEntry> = {
  beforeCreate: async (
    input: Record<string, unknown>,
    ctx: HookContext,
  ): Promise<Record<string, unknown>> => {
    const prepared = ChangelogService.prepareForCreate(input)

    // Validate semver
    if (
      prepared.releaseVersion &&
      typeof prepared.releaseVersion === 'string' &&
      !ChangelogService.isValidSemver(prepared.releaseVersion)
    ) {
      throw new Error(
        `Invalid semantic version: "${prepared.releaseVersion}". Use format: 1.2.0 or 1.2.0-beta.1`,
      )
    }

    prepared.tenantId = ctx.tenantId
    prepared.createdBy = ctx.userId

    return prepared
  },

  afterCreate: async (
    entity: ChangelogEntry,
    ctx: HookContext,
  ): Promise<void> => {
    console.log(
      `[ChangelogHook] Created entry v${entity.releaseVersion} — "${entity.title}" by ${ctx.userId}`,
    )
  },

  beforeUpdate: async (
    _id: EntityId,
    input: Record<string, unknown>,
    _ctx: HookContext,
  ): Promise<Record<string, unknown>> => {
    // Normalize version
    if (input.releaseVersion && typeof input.releaseVersion === 'string') {
      input.releaseVersion = input.releaseVersion.replace(/^v/i, '').trim()
    }
    return input
  },

  afterUpdate: async (
    entity: ChangelogEntry,
    ctx: HookContext,
  ): Promise<void> => {
    console.log(
      `[ChangelogHook] Updated entry v${entity.releaseVersion} by ${ctx.userId}`,
    )
  },

  beforeDelete: async (
    _id: EntityId,
    _ctx: HookContext,
  ): Promise<void> => {
    // Allow deletion — changelog entries are not immutable
  },

  afterDelete: async (
    entity: ChangelogEntry,
    ctx: HookContext,
  ): Promise<void> => {
    console.log(
      `[ChangelogHook] Deleted entry v${entity.releaseVersion} by ${ctx.userId}`,
    )
  },

  beforeRead: async (
    _id: EntityId,
    _ctx: HookContext,
  ): Promise<void> => {
    // No special read logic
  },

  afterRead: async (
    entity: ChangelogEntry | null,
    _ctx: HookContext,
  ): Promise<ChangelogEntry | null> => {
    return entity
  },
}
