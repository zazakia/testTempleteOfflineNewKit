/**
 * ─── Zod Schema → Form Field Extractor ───────────────────────
 * Reads Zod object schemas and extracts field definitions
 * that GenericForm can render. Maps Zod types to FieldDef types.
 *
 * This makes forms TRULY metadata-driven — the Zod schema IS
 * the source of truth for field definitions, not a separate map.
 */

import { z } from 'zod'
import type { FieldDef } from '../components/GenericForm'

/**
 * Extract FieldDef[] from a Zod object schema.
 * Reads the schema shape and maps each field to a form field definition.
 */
export function extractFieldsFromSchema(
  schema: z.ZodObject<any>,
  overrides?: Partial<Record<string, Partial<FieldDef>>>,
): FieldDef[] {
  const shape = schema.shape as Record<string, z.ZodTypeAny>
  const fields: FieldDef[] = []

  for (const [name, zodType] of Object.entries(shape)) {
    // Skip internal fields
    if (['id', 'tenantId', 'createdAt', 'updatedAt', 'deletedAt', 'version', 'createdBy', 'updatedBy'].includes(name)) {
      continue
    }

    const field: FieldDef = {
      name,
      label: inferLabel(name),
      type: inferType(zodType),
      required: !zodType.isOptional(),
      ...overrides?.[name],
    }

    // Extract enum options
    if (zodType instanceof z.ZodEnum || (zodType as any).unwrap?.() instanceof z.ZodEnum) {
      field.type = 'select'
      const enumType = zodType instanceof z.ZodEnum ? zodType : (zodType as any).unwrap()
      field.options = enumType.options?.map((v: string) => ({ label: formatLabel(v), value: v })) ?? []
    }

    // Extract number type
    if (isZodNumber(zodType)) {
      field.type = 'number'
    }

    // Extract boolean
    if (isZodBoolean(zodType)) {
      field.type = 'boolean'
    }

    fields.push(field)
  }

  return fields
}

/** Convert camelCase/PascalCase to human-readable label */
function inferLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Capitalize and format enum/select values */
function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Infer FieldDef type from Zod type */
function inferType(zodType: z.ZodTypeAny): FieldDef['type'] {
  if (isZodString(zodType)) {
    // Check for email/phone patterns
    const checks = (zodType as any)._def?.checks ?? []
    if (checks.some((c: any) => c.kind === 'email')) return 'email'
    return 'text'
  }
  if (isZodNumber(zodType)) return 'number'
  if (isZodBoolean(zodType)) return 'boolean'
  if (zodType instanceof z.ZodEnum) return 'select'
  if (zodType instanceof z.ZodDate) return 'date'
  return 'text'
}

function isZodString(t: z.ZodTypeAny): boolean {
  let current = t
  while (current) {
    if (current instanceof z.ZodString) return true
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
      current = (current as any)._def?.innerType
    } else break
  }
  return false
}

function isZodNumber(t: z.ZodTypeAny): boolean {
  let current = t
  while (current) {
    if (current instanceof z.ZodNumber) return true
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
      current = (current as any)._def?.innerType
    } else break
  }
  return false
}

function isZodBoolean(t: z.ZodTypeAny): boolean {
  let current = t
  while (current) {
    if (current instanceof z.ZodBoolean) return true
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
      current = (current as any)._def?.innerType
    } else break
  }
  return false
}
