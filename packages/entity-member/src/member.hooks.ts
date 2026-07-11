/**
 * ─── Member Hooks ───────────────────────────────────────────
 * Lifecycle hooks for Member entity.
 */

import type { EntityHooks, HookContext, EntityId } from '@repo/core'
import type { Member } from './member.schema'
import { MemberService } from './member.service'

export const MemberHooks: EntityHooks<Member> = {
  beforeCreate: async (input, ctx) => {
    // Auto-compute full name
    if (input.firstName && input.lastName) {
      input.fullName = MemberService.formatFullName(
        input.firstName as string,
        input.lastName as string,
        input.middleName as string | undefined,
        input.nameExtension as string | undefined,
      )
    }

    // Enforce tenant
    input.tenantId = ctx.tenantId
    input.createdBy = ctx.userId

    return input
  },

  afterCreate: async (entity) => {
    console.log(`[MemberHook] Created member ${entity.id}: ${entity.fullName}`)
  },

  beforeUpdate: async (id, input) => {
    // If name fields changed, recompute fullName
    if (input.firstName || input.lastName || input.middleName || input.nameExtension) {
      // We can't read the existing entity here (no repo access in hooks by design)
      // The fullName recomputation would happen in the service layer
    }
    return input
  },

  afterUpdate: async (entity) => {
    console.log(`[MemberHook] Updated member ${entity.id}`)
  },

  beforeDelete: async (id) => {
    console.log(`[MemberHook] Deleting member ${id}`)
  },

  afterDelete: async (entity) => {
    console.log(`[MemberHook] Deleted member ${entity.id}`)
  },

  afterRead: async (entity) => {
    if (!entity) return null
    // Add computed age
    if (entity.dateOfBirth) {
      return {
        ...entity,
        _age: MemberService.computeAge(entity.dateOfBirth),
      } as Member
    }
    return entity
  },
}
