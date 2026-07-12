/**
 * ─── Entity Field Registry ───────────────────────────────────
 * Maps entity names to their standard form field definitions.
 * Used by GenericForm and GenericList to render entity UIs
 * without hardcoded per-entity components.
 *
 * This is a transitional registry. When entity schemas expose
 * Zod schemas with field metadata, this can be auto-generated.
 */

import type { FieldDef } from '../components/GenericForm'
import { extractFieldsFromSchema } from '@repo/core'

/** Get form fields for an entity, combining schema extraction + metadata overrides */
export function getEntityFormFields(entityName: string): FieldDef[] {
  // Try to extract from Zod schema first (metadata-driven)
  try {
    const schema = getEntitySchema(entityName)
    if (schema) return extractFieldsFromSchema(schema)
  } catch {
    // Schema not available — fall back to hardcoded fields
  }
  // Fallback: use hardcoded field definitions
  return ENTITY_FIELDS[entityName] ?? [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]
}

/** Dynamically import entity Zod schema */
function getEntitySchema(entityName: string): any {
  // This is a bridge — in production, each entity package would export
  // a getFormFields() that calls extractFieldsFromSchema with its schema.
  // For now, we use the hardcoded ENTITY_FIELDS which are already comprehensive.
  return null
}

/** Standard fields per entity (drives form generation) */
export const ENTITY_FIELDS: Record<string, FieldDef[]> = {
  member: [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'middleName', label: 'Middle Name', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'phone', required: true },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'gender', label: 'Gender', type: 'select', options: [
      { label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }
    ]},
    { name: 'civilStatus', label: 'Civil Status', type: 'select', options: [
      { label: 'Single', value: 'single' }, { label: 'Married', value: 'married' },
      { label: 'Widowed', value: 'widowed' }, { label: 'Separated', value: 'separated' },
    ]},
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'barangay', label: 'Barangay', type: 'text' },
    { name: 'cityMunicipality', label: 'City/Municipality', type: 'text' },
    { name: 'province', label: 'Province', type: 'text' },
    { name: 'membershipType', label: 'Membership Type', type: 'select', options: [
      { label: 'Regular', value: 'regular' }, { label: 'Associate', value: 'associate' },
      { label: 'Institutional', value: 'institutional' },
    ]},
  ],

  customer: [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'phone' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'website', label: 'Website', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' },
      { label: 'Lead', value: 'lead' }, { label: 'Churned', value: 'churned' },
    ]},
  ],

  loan: [
    { name: 'borrowerId', label: 'Borrower ID', type: 'text', required: true },
    { name: 'principalAmount', label: 'Principal Amount', type: 'number', required: true },
    { name: 'interestRate', label: 'Interest Rate (%)', type: 'number', required: true },
    { name: 'term', label: 'Term', type: 'number', required: true },
    { name: 'termUnit', label: 'Term Unit', type: 'select', options: [
      { label: 'Months', value: 'months' }, { label: 'Years', value: 'years' },
      { label: 'Weeks', value: 'weeks' },
    ]},
    { name: 'frequency', label: 'Payment Frequency', type: 'select', options: [
      { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' },
      { label: 'Semi-Monthly', value: 'semi_monthly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
    ]},
    { name: 'interestType', label: 'Interest Type', type: 'select', options: [
      { label: 'Diminishing Balance', value: 'diminishing' },
      { label: 'Straight Line', value: 'straight' },
      { label: 'Add-On', value: 'add_on' },
    ]},
    { name: 'loanType', label: 'Loan Type', type: 'select', options: [
      { label: 'Agricultural', value: 'agricultural' },
      { label: 'Business', value: 'business' },
      { label: 'Personal', value: 'personal' },
      { label: 'Emergency', value: 'emergency' },
      { label: 'Housing', value: 'housing' },
    ]},
    { name: 'purpose', label: 'Purpose', type: 'textarea' },
  ],

  loan_application: [
    { name: 'borrowerId', label: 'Borrower', type: 'text', required: true },
    { name: 'productId', label: 'Loan Product', type: 'text' },
    { name: 'amountApplied', label: 'Amount Applied', type: 'number', required: true },
    { name: 'purpose', label: 'Purpose', type: 'textarea', required: true },
  ],

  payment: [
    { name: 'loanId', label: 'Loan ID', type: 'text', required: true },
    { name: 'borrowerId', label: 'Borrower ID', type: 'text', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
    { name: 'paymentType', label: 'Payment Type', type: 'select', options: [
      { label: 'Regular', value: 'regular' }, { label: 'Advance', value: 'advance' },
      { label: 'Partial', value: 'partial' }, { label: 'Full Prepayment', value: 'full_prepayment' },
    ]},
    { name: 'receiptNumber', label: 'Receipt Number', type: 'text' },
  ],

  collector: [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'phone' },
  ],

  chart_of_accounts: [
    { name: 'code', label: 'Account Code', type: 'text', required: true },
    { name: 'name', label: 'Account Name', type: 'text', required: true },
    { name: 'accountType', label: 'Account Type', type: 'select', options: [
      { label: 'Asset', value: 'asset' }, { label: 'Liability', value: 'liability' },
      { label: 'Equity', value: 'equity' }, { label: 'Revenue', value: 'revenue' },
      { label: 'Expense', value: 'expense' },
    ]},
    { name: 'normalBalance', label: 'Normal Balance', type: 'select', options: [
      { label: 'Debit', value: 'debit' }, { label: 'Credit', value: 'credit' },
    ]},
    { name: 'parentCode', label: 'Parent Code', type: 'text' },
  ],

  journal_entries: [
    { name: 'entryDate', label: 'Entry Date', type: 'date', required: true },
    { name: 'referenceNumber', label: 'Reference Number', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
  ],

  share_capital_transactions: [
    { name: 'memberId', label: 'Member', type: 'text', required: true },
    { name: 'transactionType', label: 'Transaction Type', type: 'select', options: [
      { label: 'Subscription', value: 'subscription' },
      { label: 'Redemption', value: 'redemption' },
      { label: 'Transfer', value: 'transfer' },
    ]},
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'referenceNumber', label: 'Reference #', type: 'text' },
  ],

  savings_transactions: [
    { name: 'memberId', label: 'Member', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', options: [
      { label: 'Deposit', value: 'deposit' }, { label: 'Withdrawal', value: 'withdrawal' },
      { label: 'Interest', value: 'interest' },
    ]},
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
  ],
}

/** Get standard fields for an entity */
export function getEntityFields(entityName: string): FieldDef[] {
  return ENTITY_FIELDS[entityName] ?? [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]
}
