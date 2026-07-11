/**
 * ─── Governance Entity Tests ─────────────────────────────────
 * Tests for committee, board resolution, and meeting attendance.
 */

import { describe, it, expect } from 'vitest'
import { EntityRegistry } from '@repo/core'

// Import entities to register them
import '../index'

describe('Governance Entities', () => {
  it('should have board_resolution entity registered', () => {
    expect(EntityRegistry.has('board_resolution')).toBe(true)
  })

  it('should have committee entity registered', () => {
    expect(EntityRegistry.has('committee')).toBe(true)
  })

  it('should register within entity registry', () => {
    const all = EntityRegistry.list()
    expect(all).toContain('board_resolution')
    expect(all).toContain('committee')
  })
})
