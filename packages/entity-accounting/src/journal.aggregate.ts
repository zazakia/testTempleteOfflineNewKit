/**
 * ─── Journal Entry Aggregate ─────────────────────────────────
 * DDD Aggregate Root for accounting journal entries.
 * Enforces the fundamental double-entry invariant:
 *   TOTAL DEBITS MUST EQUAL TOTAL CREDITS
 *
 * This is the most critical financial invariant in the system.
 * No journal entry can ever violate this rule.
 */

import { Money, DomainError } from '@repo/core'

// ─── Journal Entry Line ──────────────────────────────────

export interface JournalLine {
  accountCode: string
  accountName?: string
  debit: Money
  credit: Money
  description?: string
  /** Optional: link to source business entity */
  sourceTable?: string
  sourceId?: string
}

// ─── Aggregate Root ──────────────────────────────────────

export class JournalEntryAggregate {
  private _lines: JournalLine[] = []
  private _totalDebit: Money = Money.zero()
  private _totalCredit: Money = Money.zero()
  public readonly entryId: string
  public readonly tenantId: string
  public description: string
  public entryDate: Date

  constructor(entryId: string, tenantId: string, description: string = '', entryDate: Date = new Date()) {
    this.entryId = entryId
    this.tenantId = tenantId
    this.description = description
    this.entryDate = entryDate
  }

  // ─── Lines ─────────────────────────────────────────────

  get lines(): ReadonlyArray<JournalLine> { return this._lines }

  get totalDebit(): Money { return this._totalDebit }
  get totalCredit(): Money { return this._totalCredit }

  /**
   * Add a debit line.
   * Each line must have ONE side (debit or credit), not both.
   */
  addDebitLine(
    accountCode: string,
    amount: Money,
    accountName?: string,
    description?: string,
  ): void {
    if (amount.isZero()) {
      throw new DomainError('Journal line amount cannot be zero')
    }
    this._lines.push({
      accountCode,
      accountName,
      debit: amount,
      credit: Money.zero(),
      description,
    })
    this._totalDebit = this._totalDebit.add(amount)
  }

  /** Add a credit line */
  addCreditLine(
    accountCode: string,
    amount: Money,
    accountName?: string,
    description?: string,
  ): void {
    if (amount.isZero()) {
      throw new DomainError('Journal line amount cannot be zero')
    }
    this._lines.push({
      accountCode,
      accountName,
      debit: Money.zero(),
      credit: amount,
      description,
    })
    this._totalCredit = this._totalCredit.add(amount)
  }

  /**
   * Add a line linked to a source business entity
   * (e.g., a loan disbursement or payment)
   */
  addSourceLine(
    line: Omit<JournalLine, 'debit' | 'credit'> & { debit?: Money; credit?: Money },
    sourceTable: string,
    sourceId: string,
  ): void {
    const debit = line.debit ?? Money.zero()
    const credit = line.credit ?? Money.zero()
    this._lines.push({
      ...line,
      debit,
      credit,
      sourceTable,
      sourceId,
    })
    this._totalDebit = this._totalDebit.add(debit)
    this._totalCredit = this._totalCredit.add(credit)
  }

  // ─── Validation ────────────────────────────────────────

  /** Check if the entry is balanced (debits = credits) */
  get isBalanced(): boolean {
    return this._totalDebit.equals(this._totalCredit)
  }

  /** Get the imbalance amount (for error reporting) */
  get imbalance(): Money {
    if (this._totalDebit.isGreaterThan(this._totalCredit)) {
      return this._totalDebit.subtract(this._totalCredit)
    }
    return this._totalCredit.subtract(this._totalDebit)
  }

  /**
   * Validate and finalize the entry.
   * Throws DomainError if debits ≠ credits.
   */
  validate(): void {
    if (this._lines.length < 2) {
      throw new DomainError(
        `Journal entry ${this.entryId} must have at least 2 lines (debit + credit)`
      )
    }

    if (!this.isBalanced) {
      throw new DomainError(
        `Journal entry ${this.entryId} is not balanced! ` +
        `Debits: ${this._totalDebit.toPHP()}, Credits: ${this._totalCredit.toPHP()}, ` +
        `Difference: ${this.imbalance.toPHP()}`
      )
    }

    // Additional: ensure no line has both debit and credit
    for (let i = 0; i < this._lines.length; i++) {
      const line = this._lines[i]!
      if (!line.debit.isZero() && !line.credit.isZero()) {
        throw new DomainError(
          `Line ${i + 1} has both debit (${line.debit.toPHP()}) and credit (${line.credit.toPHP()}). ` +
          'Each line must be either debit OR credit, not both.'
        )
      }
    }
  }

  // ─── Snapshot ──────────────────────────────────────────

  toSnapshot() {
    return {
      id: this.entryId,
      tenantId: this.tenantId,
      description: this.description,
      entryDate: this.entryDate.toISOString(),
      lines: this._lines.map((l) => ({
        accountCode: l.accountCode,
        accountName: l.accountName,
        debitAmount: l.debit.toDecimal(),
        creditAmount: l.credit.toDecimal(),
        description: l.description,
        sourceTable: l.sourceTable,
        sourceId: l.sourceId,
      })),
      totalDebit: this._totalDebit.toDecimal(),
      totalCredit: this._totalCredit.toDecimal(),
    }
  }
}
