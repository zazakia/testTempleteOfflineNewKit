/**
 * ─── LaundryOrderAggregate Tests ────────────────────────────
 * DDD Aggregate Root tests — verifies all invariants.
 */

import { describe, it, expect } from 'vitest'
import { Money, DomainError } from '@repo/core'
import { LaundryOrderAggregate } from '../laundry.aggregate'
import type { OrderPlacedEvent, OrderStatusChangedEvent, PaymentRecordedEvent } from '../laundry.aggregate'

const makeOrder = () => new LaundryOrderAggregate({
  id: 'order-1', customerId: 'cust-1',
  orderStatus: 'dropped_off', orderPriority: 'normal',
  items: [
    { serviceId: 's1', serviceName: 'Wash & Dry', quantity: 2, unitPrice: 80, lineTotal: 160 },
    { serviceId: 's2', serviceName: 'Iron', quantity: 1, unitPrice: 50, lineTotal: 50 },
  ],
  totalAmount: 210, amountPaid: 0, balance: 210,
})

describe('LaundryOrderAggregate', () => {
  describe('status transitions', () => {
    it('allows valid transitions', () => {
      const order = makeOrder()
      expect(order.status).toBe('dropped_off')
      expect(order.allowedNextStatuses).toEqual(['sorted', 'cancelled'])

      order.advanceStatus('sorted')
      expect(order.status).toBe('sorted')

      order.advanceStatus('in_process')
      expect(order.status).toBe('in_process')

      order.advanceStatus('quality_check')
      expect(order.status).toBe('quality_check')

      order.advanceStatus('ready_for_pickup')
      expect(order.status).toBe('ready_for_pickup')
    })

    it('prevents invalid transitions', () => {
      const order = makeOrder()
      expect(() => order.advanceStatus('in_process')).toThrow(DomainError)
      expect(() => order.advanceStatus('ready_for_pickup')).toThrow(DomainError)
      expect(() => order.advanceStatus('completed')).toThrow(DomainError)
    })

    it('produces status change events', () => {
      const order = makeOrder()
      order.advanceStatus('sorted')
      const events = order.flushEvents()
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('laundry.order.status_changed')
      const e = events[0] as OrderStatusChangedEvent
      expect(e.from).toBe('dropped_off')
      expect(e.to).toBe('sorted')
    })
  })

  describe('items invariant', () => {
    it('allows adding items when dropped_off', () => {
      const order = makeOrder()
      order.addItem({ serviceId: 's3', serviceName: 'Fold', quantity: 3, unitPrice: 20, lineTotal: 60 })
      expect(order.items).toHaveLength(3)
    })

    it('prevents adding items after status change', () => {
      const order = makeOrder()
      order.advanceStatus('sorted')
      expect(() => order.addItem({ serviceId: 's3', serviceName: 'X', quantity: 1, unitPrice: 10, lineTotal: 10 }))
        .toThrow(DomainError)
    })

    it('allows removing items when dropped_off', () => {
      const order = makeOrder()
      order.removeItem(0)
      expect(order.items).toHaveLength(1)
    })

    it('recalculates total after item changes', () => {
      const order = makeOrder()
      expect(order.totalAmount.toDecimal()).toBe(210)
      order.addItem({ serviceId: 's3', serviceName: 'Fold', quantity: 1, unitPrice: 30, lineTotal: 30 })
      expect(order.totalAmount.toDecimal()).toBe(240)
    })
  })

  describe('payments', () => {
    it('records payment and reduces balance', () => {
      const order = makeOrder()
      const remaining = order.recordPayment(Money.fromDecimal(100))
      expect(remaining.toDecimal()).toBe(110)
      expect(order.amountPaid.toDecimal()).toBe(100)
      expect(order.balance.toDecimal()).toBe(110)
      expect(order.isFullyPaid).toBe(false)
    })

    it('detects fully paid', () => {
      const order = makeOrder()
      order.recordPayment(Money.fromDecimal(210))
      expect(order.isFullyPaid).toBe(true)
      expect(order.balance.isZero()).toBe(true)
    })

    it('prevents overpayment', () => {
      const order = makeOrder()
      expect(() => order.recordPayment(Money.fromDecimal(300))).toThrow(DomainError)
    })

    it('prevents zero payment', () => {
      const order = makeOrder()
      expect(() => order.recordPayment(Money.zero())).toThrow(DomainError)
    })

    it('produces payment event', () => {
      const order = makeOrder()
      order.recordPayment(Money.fromDecimal(50))
      const events = order.flushEvents() as PaymentRecordedEvent[]
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('laundry.payment.recorded')
      expect(events[0]!.amount.toDecimal()).toBe(50)
      expect(events[0]!.newBalance.toDecimal()).toBe(160)
    })
  })

  describe('priority surcharge', () => {
    it('normal priority has no surcharge', () => {
      const order = makeOrder()
      const surcharge = order.applyPrioritySurcharge()
      expect(surcharge.toDecimal()).toBe(0)
    })

    it('can be created with different priorities', () => {
      const rushOrder = new LaundryOrderAggregate({
        id: 'order-2', customerId: 'c1',
        orderStatus: 'dropped_off', orderPriority: 'rush',
        items: [{ serviceId: 's1', serviceName: 'Wash', quantity: 1, unitPrice: 100, lineTotal: 100 }],
        totalAmount: 100, amountPaid: 0, balance: 100,
      })
      const surcharge = rushOrder.applyPrioritySurcharge()
      expect(surcharge.toDecimal()).toBe(100) // 100% of 100
      expect(rushOrder.totalAmount.toDecimal()).toBe(200)
    })
  })

  describe('snapshot', () => {
    it('exports correct state for persistence', () => {
      const order = makeOrder()
      order.recordPayment(Money.fromDecimal(50))
      const snap = order.toSnapshot()
      expect(snap.orderStatus).toBe('dropped_off')
      expect(snap.totalAmount).toBe(210)
      expect(snap.amountPaid).toBe(50)
      expect(snap.balance).toBe(160)
      expect(snap.paymentStatus).toBe('partial')
      expect(snap.items).toHaveLength(2)
    })
  })
})
