/**
 * ─── Laundry Order Aggregate ─────────────────────────────────
 * DDD Aggregate Root for laundry orders.
 * Enforces all invariants, controls state transitions,
 * and emits domain events.
 *
 * Built on Money value object — no raw numbers for financials.
 */

import { Money, DomainError } from '@repo/core'
import type { LaundryOrder, LaundryOrderItem, OrderStatus, OrderPriority } from '../laundry.schema'
import { LaundryOrderService } from './laundry.service'
import { eventBus } from '@repo/core'

// ─── State Machine ────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  dropped_off: ['sorted', 'cancelled'],
  sorted: ['in_process', 'cancelled'],
  in_process: ['quality_check', 'cancelled'],
  quality_check: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['picked_up', 'delivered', 'cancelled'],
  picked_up: ['completed'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
}

// ─── Domain Events ────────────────────────────────────────

export interface OrderPlacedEvent {
  type: 'laundry.order.placed'
  orderId: string
  customerId: string
  totalAmount: Money
  priority: OrderPriority
  timestamp: number
}

export interface OrderStatusChangedEvent {
  type: 'laundry.order.status_changed'
  orderId: string
  from: OrderStatus
  to: OrderStatus
  timestamp: number
}

export interface PaymentRecordedEvent {
  type: 'laundry.payment.recorded'
  orderId: string
  customerId: string
  amount: Money
  newBalance: Money
  timestamp: number
}

export type LaundryDomainEvent = OrderPlacedEvent | OrderStatusChangedEvent | PaymentRecordedEvent

// ─── Aggregate Root ──────────────────────────────────────

export class LaundryOrderAggregate {
  private _status: OrderStatus
  private _items: LaundryOrderItem[]
  private _amountPaid: Money
  private _balance: Money
  private _totalAmount: Money
  public readonly orderId: string
  public readonly customerId: string
  public readonly priority: OrderPriority
  private _pendingEvents: LaundryDomainEvent[] = []

  constructor(
    order: Pick<LaundryOrder, 'id' | 'customerId' | 'orderStatus' | 'orderPriority' | 'items' | 'totalAmount' | 'amountPaid' | 'balance'>,
  ) {
    this.orderId = order.id
    this.customerId = order.customerId
    this._status = order.orderStatus as OrderStatus
    this.priority = order.orderPriority as OrderPriority
    this._items = [...order.items]
    this._totalAmount = Money.fromDecimal(order.totalAmount)
    this._amountPaid = Money.fromDecimal(order.amountPaid ?? 0)
    this._balance = Money.fromDecimal(order.balance ?? order.totalAmount)
  }

  // ─── Status ────────────────────────────────────────────

  get status(): OrderStatus { return this._status }

  get canAdvance(): boolean {
    return VALID_TRANSITIONS[this._status].length > 0
  }

  get allowedNextStatuses(): OrderStatus[] {
    return [...VALID_TRANSITIONS[this._status]]
  }

  /** Advance the order to the next status. Throws if invalid transition. */
  advanceStatus(newStatus: OrderStatus): void {
    const allowed = VALID_TRANSITIONS[this._status]
    if (!allowed.includes(newStatus)) {
      throw new DomainError(
        `Cannot transition order ${this.orderId} from "${this._status}" to "${newStatus}". ` +
        `Allowed: ${allowed.join(', ') || 'none'}`
      )
    }

    const from = this._status
    this._status = newStatus
    this._pendingEvents.push({
      type: 'laundry.order.status_changed',
      orderId: this.orderId, from, to: newStatus, timestamp: Date.now(),
    })
  }

  // ─── Items ─────────────────────────────────────────────

  get items(): ReadonlyArray<LaundryOrderItem> { return this._items }

  /** Add an item. Only allowed in 'dropped_off' status. */
  addItem(item: LaundryOrderItem): void {
    if (this._status !== 'dropped_off') {
      throw new DomainError('Items can only be added when order is in "dropped_off" status')
    }
    this._items.push(item)
    this.recalculateTotal()
  }

  /** Remove an item. Only allowed in 'dropped_off' status. */
  removeItem(index: number): void {
    if (this._status !== 'dropped_off') {
      throw new DomainError('Items can only be removed when order is in "dropped_off" status')
    }
    if (index < 0 || index >= this._items.length) {
      throw new DomainError('Invalid item index')
    }
    this._items.splice(index, 1)
    this.recalculateTotal()
  }

  // ─── Payments ──────────────────────────────────────────

  get amountPaid(): Money { return this._amountPaid }
  get balance(): Money { return this._balance }
  get totalAmount(): Money { return this._totalAmount }

  /** Record a payment. Returns Money still owed. */
  recordPayment(amount: Money): Money {
    if (amount.isZero()) {
      throw new DomainError('Payment amount must be greater than zero')
    }
    if (amount.isGreaterThan(this._balance)) {
      throw new DomainError(
        `Payment ${amount.toPHP()} exceeds balance ${this._balance.toPHP()}`
      )
    }

    this._amountPaid = this._amountPaid.add(amount)
    this._balance = this._balance.subtract(amount)

    this._pendingEvents.push({
      type: 'laundry.payment.recorded',
      orderId: this.orderId,
      customerId: this.customerId,
      amount,
      newBalance: this._balance,
      timestamp: Date.now(),
    })

    return this._balance
  }

  /** Check if fully paid */
  get isFullyPaid(): boolean {
    return this._balance.isZero()
  }

  // ─── Priority Surcharge ────────────────────────────────

  /** Apply priority surcharge based on the order's priority level */
  applyPrioritySurcharge(config?: { expressMultiplier?: number; rushMultiplier?: number }): Money {
    const multiplier = this.priority === 'express' ? (config?.expressMultiplier ?? 1.5) :
                       this.priority === 'rush' ? (config?.rushMultiplier ?? 2.0) : 1
    if (multiplier === 1) return Money.zero()

    const surcharge = this._totalAmount.multiply(multiplier - 1)
    this._totalAmount = this._totalAmount.add(surcharge)
    this._balance = this._totalAmount.subtract(this._amountPaid)
    return surcharge
  }

  // ─── Events ────────────────────────────────────────────

  /** Get all pending domain events and clear them */
  flushEvents(): LaundryDomainEvent[] {
    const events = [...this._pendingEvents]
    this._pendingEvents = []
    return events
  }

  /** Publish pending events to the event bus */
  async publishEvents(): Promise<void> {
    const events = this.flushEvents()
    for (const event of events) {
      await eventBus.emit(event.type, event).catch(() => {})
    }
  }

  // ─── Snapshot ──────────────────────────────────────────

  /** Export current state for persistence */
  toSnapshot(): Partial<LaundryOrder> {
    return {
      id: this.orderId,
      orderStatus: this._status,
      items: [...this._items],
      totalAmount: this._totalAmount.toDecimal(),
      amountPaid: this._amountPaid.toDecimal(),
      balance: this._balance.toDecimal(),
      paymentStatus: this.isFullyPaid ? 'paid' : this._amountPaid.isZero() ? 'unpaid' : 'partial',
    }
  }

  // ─── Private ────────────────────────────────────────────

  private recalculateTotal(): void {
    const { subtotal } = LaundryOrderService.computeItemTotals(this._items)
    this._totalAmount = Money.fromDecimal(subtotal)
    this._balance = this._totalAmount.subtract(this._amountPaid)
  }
}
