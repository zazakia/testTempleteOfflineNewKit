/**
 * ─── Customer Form Fields (Metadata-Driven) ──────────────────
 * Extracts form field definitions from the Customer Zod schema.
 * This is the METADATA-DRIVEN way to generate forms — no hardcoded
 * field maps, the schema IS the source of truth.
 */

import { extractFieldsFromSchema } from '@repo/core'
import type { FieldDef } from '@repo/core'
import { CreateCustomerSchema } from './customer.schema'

/** Get form fields for Customer entity, extracted from Zod schema */
export function getCustomerFormFields(): FieldDef[] {
  return extractFieldsFromSchema(CreateCustomerSchema, {
    // Override labels for better UX
    name: { label: 'Full Name', placeholder: 'Enter customer name' },
    email: { label: 'Email Address', placeholder: 'customer@example.com' },
    phone: { label: 'Phone Number' },
    company: { label: 'Company (optional)' },
    website: { label: 'Website (optional)' },
    status: { label: 'Account Status' },
  })
}
