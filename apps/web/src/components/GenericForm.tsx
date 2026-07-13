/**
 * ─── GenericForm Component ───────────────────────────────────
 * Metadata-driven form. Reads field definitions and renders
 * React Hook Form with Zod validation. Supports tenant custom fields.
 *
 * Usage:
 *   <GenericForm
 *     entityName="member"
 *     fields={memberFields}
 *     customFields={tenantCustomFields}
 *     repo={memberRepo}
 *     onSubmit={handleSubmit}
 *   />
 */

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, cn } from '@repo/ui-core'
import { Save, X } from 'lucide-react'
import type { CustomFieldDef } from '@repo/multi-tenant'

import type { FieldDef } from '@repo/core'
export type { FieldDef }

interface GenericFormProps {
  entityName: string
  fields: FieldDef[]
  customFields?: CustomFieldDef[]
  initialData?: Record<string, unknown>
  repo: { create: (input: any) => Promise<any>; update: (id: string, input: any) => Promise<any> }
  onSuccess?: (data: any) => void
  onCancel?: () => void
  editingId?: string  // if set, we're in edit mode
}

// ─── Build Zod Schema from FieldDef ────────────────────────

function buildSchema(fields: FieldDef[], customFields: CustomFieldDef[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const f of fields) {
    let schema: z.ZodTypeAny
    switch (f.type) {
      case 'number': schema = z.coerce.number().min(0, 'Must be positive'); break
      case 'email': schema = z.string().email('Invalid email'); break
      case 'boolean': schema = z.boolean(); break
      default: schema = z.string()
    }
    if (!f.required) schema = schema.optional().nullable()
    else schema = (schema as z.ZodString).min(1, `${f.label} is required`)
    shape[f.name] = schema
  }

  // Custom fields
  for (const cf of customFields) {
    let schema: z.ZodTypeAny
    switch (cf.type) {
      case 'number': schema = z.coerce.number(); break
      case 'date': schema = z.string(); break
      case 'boolean': schema = z.boolean(); break
      default: schema = z.string()
    }
    if (!cf.required) schema = schema.optional().nullable()
    shape[cf.name] = schema
  }

  return z.object(shape)
}

// ─── Component ──────────────────────────────────────────────

export function GenericForm({
  entityName,
  fields,
  customFields = [],
  initialData,
  repo,
  onSuccess,
  onCancel,
  editingId,
}: GenericFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = React.useMemo(() => buildSchema(fields, customFields), [fields, customFields])

  const defaultValues = React.useMemo(() => {
    const vals: Record<string, unknown> = {}
    for (const f of fields) {
      vals[f.name] = initialData?.[f.name] ?? f.defaultValue ?? (f.type === 'number' ? 0 : '')
    }
    for (const cf of customFields) {
      vals[cf.name] = initialData?.[cf.name] ?? cf.defaultValue ?? ''
    }
    return vals
  }, [fields, customFields, initialData])

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true)
    setError(null)
    try {
      let result
      if (editingId) {
        result = await repo.update(editingId, { ...data, version: (initialData as any)?.version ?? 1 })
      } else {
        result = await repo.create(data)
      }
      onSuccess?.(result)
    } catch (e: any) {
      setError(e.message ?? 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {editingId ? 'Edit' : 'New'} {EntityRegistry.has(entityName) ? EntityRegistry.get(entityName).ui.label : entityName}
        </h2>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Standard fields */}
        {fields.map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name={f.name}
              control={control}
              render={({ field }) => {
                if (f.type === 'select' && f.options) {
                  return (
                    <select
                      {...field}
                      value={field.value ?? ''}
                      disabled={f.readOnly}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select...</option>
                      {f.options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  )
                }
                if (f.type === 'textarea') {
                  return (
                    <textarea
                      {...field}
                      value={field.value ?? ''}
                      rows={3}
                      placeholder={f.placeholder}
                      disabled={f.readOnly}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  )
                }
                if (f.type === 'boolean') {
                  return (
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      disabled={f.readOnly}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  )
                }
                return (
                  <input
                    {...field}
                    type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : 'text'}
                    value={field.value ?? ''}
                    placeholder={f.placeholder}
                    disabled={f.readOnly}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                  />
                )
              }}
            />
            {errors[f.name] && (
              <p className="mt-1 text-xs text-red-600">{(errors[f.name] as any)?.message}</p>
            )}
          </div>
        ))}

        {/* Custom fields from tenant metadata */}
        {customFields.map(cf => (
          <div key={cf.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {cf.label ?? cf.name} {cf.required && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name={cf.name}
              control={control}
              render={({ field }) => {
                if (cf.type === 'select' && cf.options) {
                  return (
                    <select
                      {...field}
                      value={field.value ?? ''}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Select...</option>
                      {cf.options.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )
                }
                return (
                  <input
                    {...field}
                    type={cf.type === 'number' ? 'number' : cf.type === 'date' ? 'date' : 'text'}
                    value={field.value ?? ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                )
              }}
            />
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  )
}
