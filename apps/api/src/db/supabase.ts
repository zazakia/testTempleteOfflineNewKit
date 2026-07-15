/**
 * ─── Supabase Client (Server-Side) ───────────────────────────
 * Uses service_role key for admin-level database access.
 * For JWKS validation, see middleware/auth.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. ' +
    'Running with in-memory fallback. Create apps/api/.env with your credentials.'
  )
}

/** Admin client — has full database access (server-side only, NEVER expose to clients) */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

/** Check if Supabase is configured */
export function isSupabaseConfigured(): boolean {
  return supabaseAdmin !== null
}

/**
 * Execute a query via Supabase admin client.
 * Falls back to null if not configured (caller should use in-memory store).
 */
export async function supabaseQuery<T = any>(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert',
  params?: Record<string, unknown>
): Promise<{ data: T[] | null; error: Error | null }> {
  if (!supabaseAdmin) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  try {
    let query: any

    switch (operation) {
      case 'select':
        query = supabaseAdmin.from(table).select(params?.columns as string ?? '*')
        if (params?.filter) {
          const filterObj = params.filter as Record<string, unknown>
          for (const [key, value] of Object.entries(filterObj)) {
            query = query.eq(key, value)
          }
        }
        if (params?.order) {
          query = query.order(params.order as string, { ascending: (params?.ascending as boolean) ?? false })
        }
        if (params?.limit) {
          query = query.limit(params.limit as number)
        }
        break

      case 'insert':
        query = supabaseAdmin.from(table).insert((params?.data as Record<string, unknown>) ?? (params as Record<string, unknown>))
        break

      case 'update':
        query = supabaseAdmin.from(table).update((params?.data as Record<string, unknown>) ?? {})
        if (params?.filter) {
          const filterObj = params.filter as Record<string, unknown>
          for (const [key, value] of Object.entries(filterObj)) {
            query = query.eq(key, value)
          }
        }
        break

      case 'upsert':
        query = supabaseAdmin.from(table).upsert(
          (params?.data as Record<string, unknown>) ?? (params as Record<string, unknown>),
          { onConflict: params?.onConflict as string },
        )
        break

      case 'delete':
        query = supabaseAdmin.from(table).delete()
        if (params?.filter) {
          for (const [key, value] of Object.entries(params.filter as Record<string, unknown>)) {
            query = query.eq(key, value)
          }
        }
        break

      default:
        return { data: null, error: new Error(`Unknown operation: ${operation}`) }
    }

    const { data, error } = await query
    return { data: data ?? null, error }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}
