/**
 * ─── Collection Service Tests ────────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { CollectionService } from '../collection.service'

describe('CollectionService', () => {
  describe('computeCashAccountability', () => {
    it('should compute correct ending cash', () => {
      const result = CollectionService.computeCashAccountability({
        cashOnHandStart: 1000, totalCollected: 5000, cashOnHandEnd: 6000,
      })
      expect(result.expectedEndingCash).toBe(6000)
      expect(result.difference).toBe(0)
      expect(result.isBalanced).toBe(true)
    })

    it('should detect variance', () => {
      const result = CollectionService.computeCashAccountability({
        cashOnHandStart: 1000, totalCollected: 5000, cashOnHandEnd: 5900,
      })
      expect(result.isBalanced).toBe(false)
      expect(result.difference).toBe(-100)
    })

    it('should handle zero start', () => {
      const result = CollectionService.computeCashAccountability({
        cashOnHandStart: 0, totalCollected: 0, cashOnHandEnd: 0,
      })
      expect(result.isBalanced).toBe(true)
    })
  })

  describe('validateRemittanceAmount', () => {
    it('should validate within range', () => {
      expect(CollectionService.validateRemittanceAmount(5000, 10000).valid).toBe(true)
    })

    it('should reject exceeding total collected', () => {
      expect(CollectionService.validateRemittanceAmount(15000, 10000).valid).toBe(false)
    })

    it('should reject zero or negative', () => {
      expect(CollectionService.validateRemittanceAmount(0, 10000).valid).toBe(false)
    })
  })

  describe('computeEfficiencyRate', () => {
    it('should compute 100% when collected equals expected', () => {
      expect(CollectionService.computeEfficiencyRate(10000, 10000)).toBe(100)
    })

    it('should compute 50% when half collected', () => {
      expect(CollectionService.computeEfficiencyRate(5000, 10000)).toBe(50)
    })

    it('should return 0 when expected is 0', () => {
      expect(CollectionService.computeEfficiencyRate(0, 0)).toBe(0)
    })
  })

  describe('computeCollectorPerformance', () => {
    const collector = { id: 'c1', fullName: 'Juan', is_active: true, tenantId: 'default', phone: '123', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' }
    const logs = [{ id: 'l1', collectorId: 'c1', totalCollected: 5000, cashOnHandStart: 0, cashOnHandEnd: 5000, logDate: Date.now(), tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' }]
    const remittances = [{ id: 'r1', collectorId: 'c1', amount: 4000, remittanceDate: Date.now(), status: 'approved' as const, tenantId: 'default', createdAt: 0, updatedAt: 0, deletedAt: null, version: 1, createdBy: 'sys', updatedBy: 'sys' }]

    it('should compute collector performance', () => {
      const result = CollectionService.computeCollectorPerformance(collector, logs, remittances)
      expect(result.collectorName).toBe('Juan')
      expect(result.totalCollected).toBe(5000)
      expect(result.totalRemitted).toBe(4000)
      expect(result.outstanding).toBe(1000)
      expect(result.logCount).toBe(1)
    })

    it('should handle empty logs', () => {
      const result = CollectionService.computeCollectorPerformance(collector, [], [])
      expect(result.totalCollected).toBe(0)
      expect(result.outstanding).toBe(0)
    })
  })

  describe('optimizeRoute', () => {
    it('should sort by route index', () => {
      const members = [
        { id: 'm1', name: 'Ana', routeIndex: 3 },
        { id: 'm2', name: 'Juan', routeIndex: 1 },
        { id: 'm3', name: 'Pedro', routeIndex: 2 },
      ]
      const result = CollectionService.optimizeRoute(members)
      expect(result[0]!.name).toBe('Juan')
      expect(result[1]!.name).toBe('Pedro')
      expect(result[2]!.name).toBe('Ana')
    })

    it('should handle members without route index', () => {
      const members = [{ id: 'm1', name: 'Ana' }, { id: 'm2', name: 'Juan' }]
      const result = CollectionService.optimizeRoute(members)
      expect(result).toHaveLength(2)
    })
  })

  describe('computeDailyTarget', () => {
    it('should compute target from scheduled payments', () => {
      const result = CollectionService.computeDailyTarget([1000, 2000, 1500])
      expect(result.total).toBe(4500)
      expect(result.count).toBe(3)
      expect(result.average).toBe(1500)
    })

    it('should handle empty payments', () => {
      const result = CollectionService.computeDailyTarget([])
      expect(result.total).toBe(0)
      expect(result.average).toBe(0)
    })
  })

  describe('generateReceiptNumber', () => {
    it('should generate formatted receipt', () => {
      const receipt = CollectionService.generateReceiptNumber('RCP', Date.now(), 1)
      expect(receipt).toMatch(/^RCP-\d{8}-0001$/)
    })
  })
})
