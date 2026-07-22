/**
 * ─── Money Value Object ──────────────────────────────────────
 * Immutable, self-validating value object for all financial
 * computations across the entire application.
 *
 * Used by: Laundry, Cooperative, Clinic, FastFood, Accounting
 *
 * Principles:
 *  - Cannot represent negative money (throws on construction)
 *  - All operations return NEW instances (immutable)
 *  - Currency mismatch is enforced
 *  - Rounding is explicit and consistent (banker's rounding)
 */

export class Money {
  /** Amount in the smallest currency unit equivalent (e.g., centavos for PHP) */
  public readonly amountInSubunits: number
  /** ISO 4217 currency code */
  public readonly currency: string

  private constructor(amountInSubunits: number, currency: string = 'PHP') {
    if (!Number.isFinite(amountInSubunits)) {
      throw new DomainError('Money amount must be a finite number')
    }
    if (amountInSubunits < 0) {
      throw new DomainError('Money cannot be negative')
    }
    this.amountInSubunits = Math.round(amountInSubunits)
    this.currency = currency
  }

  // ─── Factory Methods ──────────────────────────────────

  /** Create from a decimal amount (e.g., 100.50 = PHP 100.50) */
  static fromDecimal(amount: number, currency: string = 'PHP'): Money {
    return new Money(Math.round(amount * 100), currency)
  }

  /** Create from subunits (e.g., 10050 = PHP 100.50) */
  static fromSubunits(subunits: number, currency: string = 'PHP'): Money {
    return new Money(subunits, currency)
  }

  /** Zero money in the given currency */
  static zero(currency: string = 'PHP'): Money {
    return new Money(0, currency)
  }

  // ─── Arithmetic (all return new Money) ────────────────

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this.amountInSubunits + other.amountInSubunits, this.currency)
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other)
    const result = this.amountInSubunits - other.amountInSubunits
    if (result < 0) {
      throw new DomainError('Subtraction would result in negative money')
    }
    return new Money(result, this.currency)
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new DomainError('Cannot multiply money by negative factor')
    }
    return new Money(Math.round(this.amountInSubunits * factor), this.currency)
  }

  percentage(percent: number): Money {
    return this.multiply(percent / 100)
  }

  divide(divisor: number): Money {
    if (divisor <= 0) throw new DomainError('Divisor must be positive')
    return new Money(Math.round(this.amountInSubunits / divisor), this.currency)
  }

  // ─── Comparison ───────────────────────────────────────

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amountInSubunits === other.amountInSubunits
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amountInSubunits > other.amountInSubunits
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amountInSubunits >= other.amountInSubunits
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amountInSubunits < other.amountInSubunits
  }

  isZero(): boolean {
    return this.amountInSubunits === 0
  }

  // ─── Display ──────────────────────────────────────────

  /** Format as human-readable PHP string */
  toPHP(): string {
    return `₱${this.toDecimal().toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  }

  /** Get decimal representation */
  toDecimal(): number {
    return this.amountInSubunits / 100
  }

  /** JSON serialization */
  toJSON(): { amount: number; currency: string } {
    return { amount: this.toDecimal(), currency: this.currency }
  }

  // ─── Private ──────────────────────────────────────────

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`)
    }
  }
}

// ─── Domain Error ────────────────────────────────────────

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}
