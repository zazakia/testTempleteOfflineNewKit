/**
 * ─── Branch Hooks ────────────────────────────────────────────
 * Lifecycle hooks for the Branch entity.
 */

import type { EntityHooks, HookContext, EntityId } from '@repo/core'
import type { Branch } from './branch.schema'
import { BranchService } from './branch.service'

export const BranchHooks: EntityHooks<Branch> = {
  beforeCreate: async (
    input: Record<string, unknown>,
    ctx: HookContext,
  ): Promise<Record<string, unknown>> => {
    // Apply business logic transformations
    const prepared = BranchService.prepareForCreate(input)

    // Validate business rules
    const validation = BranchService.validate(prepared as Partial<Branch>)
    if (!validation.valid) {
      throw new Error(`Branch validation failed: ${validation.reason}`)
    }

    // Enforce tenant isolation
    prepared.tenantId = ctx.tenantId
    prepared.createdBy = ctx.userId

    return prepared
  },

  afterCreate: async (entity: Branch, ctx: HookContext): Promise<void> => {
    console.log(
      `[BranchHook] Created branch ${entity.branchCode} (${entity.id}) by ${ctx.userId}`,
    )
  },

  beforeUpdate: async (
    id: EntityId,
    input: Record<string, unknown>,
    ctx: HookContext,
  ): Promise<Record<string, unknown>> => {
    // Normalize branch code if being updated
    if (input.branchCode && typeof input.branchCode === 'string') {
      input.branchCode = input.branchCode.toUpperCase().trim()
    }

    // Normalize name
    if (input.name && typeof input.name === 'string') {
      input.name = input.name
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    }

    return input
  },

  afterUpdate: async (entity: Branch, ctx: HookContext): Promise<void> => {
    console.log(
      `[BranchHook] Updated branch ${entity.branchCode} (${entity.id}) by ${ctx.userId}`,
    )
  },

  beforeDelete: async (id: EntityId, ctx: HookContext): Promise<void> => {
    console.log(
      `[BranchHook] Deleting branch ${id} by ${ctx.userId}`,
    )
  },

  afterDelete: async (entity: Branch, ctx: HookContext): Promise<void> => {
    console.log(
      `[BranchHook] Deleted branch ${entity.branchCode} (${entity.id}) by ${ctx.userId}`,
    )
  },

  beforeRead: async (_id: EntityId, _ctx: HookContext): Promise<void> => {
    // No special read logic
  },

  afterRead: async (
    entity: Branch | null,
    _ctx: HookContext,
  ): Promise<Branch | null> => {
    return entity
  },
}
