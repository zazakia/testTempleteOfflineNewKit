/**
 * ─── Money Value Object Tests ───────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { Money, DomainError } from '../value-objects/Money'

describe('Money Value Object', () => {
  describe('construction', () => {
    it('creates from decimal', () => {
      const m = Money.fromDecimal(100.50)
      expect(m.toDecimal()).toBe(100.5)
      expect(m.currency).toBe('PHP')
    })

    it('creates from subunits', () => {
      const m = Money.fromSubunits(10050)
      expect(m.toDecimal()).toBe(100.5)
    })

    it('creates zero', () => {
      const m = Money.zero()
      expect(m.toDecimal()).toBe(0)
      expect(m.isZero()).toBe(true)
    })

    it('rejects negative amount', () => {
      expect(() => Money.fromDecimal(-10)).toThrow(DomainError)
      expect(() => Money.fromSubunits(-1000)).toThrow(DomainError)
    })

    it('rejects NaN', () => {
      expect(() => Money.fromDecimal(NaN)).toThrow(DomainError)
      expect(() => Money.fromDecimal(Infinity)).toThrow(DomainError)
    })
  })

  describe('immutability', () => {
    it('add returns new instance', () => {
      const a = Money.fromDecimal(100)
      const b = Money.fromDecimal(50)
      const c = a.add(b)
      expect(c.toDecimal()).toBe(150)
      expect(a.toDecimal()).toBe(100) // unchanged
      expect(b.toDecimal()).toBe(50)  // unchanged
    })

    it('subtract returns new instance', () => {
      const a = Money.fromDecimal(100)
      const b = Money.fromDecimal(30)
      expect(a.subtract(b).toDecimal()).toBe(70)
    })

    it('subtract to zero is allowed', () => {
      const a = Money.fromDecimal(100)
      expect(a.subtract(a).toDecimal()).toBe(0)
    })

    it('subtract below zero throws', () => {
      const a = Money.fromDecimal(50)
      const b = Money.fromDecimal(100)
      expect(() => a.subtract(b)).toThrow(DomainError)
    })

    it('multiply returns new instance', () => {
      expect(Money.fromDecimal(100).multiply(1.5).toDecimal()).toBe(150)
    })

    it('multiply by negative throws', () => {
      expect(() => Money.fromDecimal(100).multiply(-1)).toThrow(DomainError)
    })

    it('percentage helper', () => {
      expect(Money.fromDecimal(200).percentage(12).toDecimal()).toBe(24) // 12% of 200
    })
  })

  describe('comparison', () => {
    it('equals same amount and currency', () => {
      expect(Money.fromDecimal(100).equals(Money.fromDecimal(100))).toBe(true)
      expect(Money.fromDecimal(100).equals(Money.fromDecimal(101))).toBe(false)
    })

    it('greater than', () => {
      expect(Money.fromDecimal(100).isGreaterThan(Money.fromDecimal(50))).toBe(true)
      expect(Money.fromDecimal(50).isGreaterThan(Money.fromDecimal(100))).toBe(false)
    })

    it('currency mismatch throws', () => {
      const php = Money.fromDecimal(100, 'PHP')
      const usd = Money.fromDecimal(100, 'USD')
      expect(() => php.add(usd)).toThrow(DomainError)
    })
  })

  describe('display', () => {
    it('formats as PHP', () => {
      expect(Money.fromDecimal(1234.5).toPHP()).toContain('₱')
      expect(Money.fromDecimal(1234.5).toPHP()).toContain('1,234.50')
    })

    it('JSON serialization', () => {
      const json = Money.fromDecimal(99.99).toJSON()
      expect(json).toEqual({ amount: 99.99, currency: 'PHP' })
    })
  })

  describe('rounding', () => {
    it('rounds to nearest centavo on multiply', () => {
      const m = Money.fromDecimal(33.33).multiply(0.3333)
      expect(m.amountInSubunits).toBe(1111) // 33.33 * 0.3333 = 11.108889 → 11.11
    })
  })
})
