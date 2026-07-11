/**
 * ─── Loan UI Configuration ───────────────────────────────────
 */

import type { Loan, LoanProduct, LoanApplication } from './loan.schema'
import { LOAN_STATUS_LABELS, LOAN_STATUS_COLORS, LOAN_APPLICATION_STATUS_LABELS, FREQUENCY_LABELS } from './loan.schema'

export interface ColumnDef<T> { key: keyof T | string; label: string; sortable?: boolean; filterable?: boolean; searchable?: boolean; width?: string }
export interface FormFieldDef { name: string; label: string; type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'textarea' | 'tags' | 'number' | 'date' | 'checkbox'; placeholder?: string; required?: boolean; defaultValue?: string; options?: Array<{ label: string; value: string }>; helperText?: string; section?: string }

export const LoanUIConfig = {
  defaultColumns: [
    { key: 'loanNumber', label: 'Loan #', sortable: true, searchable: true, width: '130px' },
    { key: 'borrowerId', label: 'Borrower', sortable: true, searchable: true, width: '200px' },
    { key: 'principalAmount', label: 'Principal', sortable: true, width: '130px' },
    { key: 'installmentAmount', label: 'Installment', sortable: true, width: '130px' },
    { key: 'status', label: 'Status', sortable: true, filterable: true, width: '120px' },
    { key: 'dpd', label: 'DPD', sortable: true, width: '70px' },
    { key: 'releaseDate', label: 'Release Date', sortable: true, width: '120px' },
    { key: 'maturityDate', label: 'Maturity', sortable: true, width: '120px' },
  ] satisfies ColumnDef<Loan>[],

  formFields: {
    create: [
      { name: 'borrowerId', label: 'Borrower / Member ID', type: 'text', required: true, section: 'Loan Details' },
      { name: 'loanNumber', label: 'Loan Number', type: 'text', required: true, placeholder: 'LN-2026-0001', section: 'Loan Details' },
      { name: 'principalAmount', label: 'Principal Amount (₱)', type: 'number', required: true, section: 'Loan Details' },
      { name: 'interestRate', label: 'Interest Rate (%)', type: 'number', required: true, placeholder: '12', section: 'Loan Details' },
      { name: 'interestType', label: 'Interest Type', type: 'select', defaultValue: 'diminishing', options: [{ label: 'Diminishing Balance', value: 'diminishing' }, { label: 'Straight Line', value: 'straight' }], section: 'Loan Details' },
      { name: 'term', label: 'Term', type: 'number', required: true, section: 'Loan Details' },
      { name: 'termUnit', label: 'Term Unit', type: 'select', defaultValue: 'months', options: [{ label: 'Months', value: 'months' }, { label: 'Years', value: 'years' }], section: 'Loan Details' },
      { name: 'frequency', label: 'Payment Frequency', type: 'select', defaultValue: 'monthly', options: [{ label: 'Monthly', value: 'monthly' }, { label: 'Weekly', value: 'weekly' }, { label: 'Semi-Monthly', value: 'semi_monthly' }, { label: 'Quarterly', value: 'quarterly' }], section: 'Loan Details' },
      { name: 'releaseDate', label: 'Release Date', type: 'date', section: 'Disbursement' },
      { name: 'firstPaymentDate', label: 'First Payment Date', type: 'date', section: 'Disbursement' },
      { name: 'processingFee', label: 'Processing Fee (₱)', type: 'number', section: 'Fees' },
      { name: 'notarialFee', label: 'Notarial Fee (₱)', type: 'number', section: 'Fees' },
      { name: 'insuranceAmount', label: 'Insurance (₱)', type: 'number', section: 'Fees' },
      { name: 'savingsPerPayment', label: 'Savings per Payment (₱)', type: 'number', section: 'Fees' },
      { name: 'collectorId', label: 'Assigned Collector', type: 'text', section: 'Assignment' },
      { name: 'notes', label: 'Notes', type: 'textarea', section: 'Assignment' },
    ] satisfies FormFieldDef[],
  },
}

export const LoanApplicationUIConfig = {
  defaultColumns: [
    { key: 'applicationDate', label: 'Date', sortable: true, width: '110px' },
    { key: 'borrowerId', label: 'Borrower', sortable: true, searchable: true, width: '200px' },
    { key: 'amountApplied', label: 'Amount Applied', sortable: true, width: '130px' },
    { key: 'status', label: 'Status', sortable: true, filterable: true, width: '130px' },
    { key: 'approvedBy', label: 'Approved By', width: '150px' },
  ] satisfies ColumnDef<LoanApplication>[],
}
