import { describe, it, expect } from 'vitest'
import { EntityRegistry } from '@repo/core'
import '../index'

describe('Water Station Entities', () => {
  it('should have ws_customer entity registered', () => {
    expect(EntityRegistry.has('ws_customer')).toBe(true)
  })

  it('should have ws_delivery entity registered', () => {
    expect(EntityRegistry.has('ws_delivery')).toBe(true)
  })
})
