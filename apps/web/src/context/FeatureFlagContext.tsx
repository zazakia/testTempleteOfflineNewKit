/**
 * ─── Feature Flag Context ─────────────────────────────────────
 * React wrapper around the @repo/feature-flags singleton.
 * Auto-derives FlagContext from AuthContext and Vite env.
 *
 * Usage:
 *   const showExportCsv = useFeatureFlag('export.csv')
 *   const toggle = useToggleFlag()
 *
 * Runtime access (browser console / tests):
 *   window.__FEATURE_FLAGS__.setEnabled('export.pdf', true)
 *   // React automatically re-renders when toggled via window too
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { featureFlags, type FeatureFlag as FeatureFlagDef, type FlagContext } from '@repo/feature-flags'
import { useAuth } from './AuthContext'

// ─── Types ──────────────────────────────────────────────────

interface FeatureFlagContextType {
  isEnabled: (key: string) => boolean
  getAllFlags: () => Array<FeatureFlagDef & { resolved: boolean }>
  toggle: (key: string, enabled: boolean) => void
  flagContext: FlagContext
}

// ─── Helpers ─────────────────────────────────────────────────

function detectEnvironment(): string {
  return (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE) ?? 'development'
}

function buildFlagContext(environment: string, tenantId?: string, userId?: string, role?: string): FlagContext {
  return {
    environment,
    tenantId: tenantId ?? 'default',
    userId: userId ?? 'anonymous',
    roles: role ? [role] : [],
  }
}

// ─── React refresh trigger (bridge external calls -> React) ───
let triggerReactRefresh: (() => void) | null = null

/**
 * Global wrapper that mirrors the singleton but also triggers React re-renders.
 * Tests and admin UIs use this to toggle flags and see instant UI updates.
 */
function createGlobalProxy() {
  const originalSetEnabled = featureFlags.setEnabled.bind(featureFlags)
  return {
    isEnabled: featureFlags.isEnabled.bind(featureFlags),
    getAll: featureFlags.getAll.bind(featureFlags),
    define: featureFlags.define.bind(featureFlags),
    defineMany: featureFlags.defineMany.bind(featureFlags),
    setEnabled(key: string, enabled: boolean) {
      originalSetEnabled(key, enabled)
      triggerReactRefresh?.()
    },
  }
}

if (typeof window !== 'undefined') {
  ;(window as any).__FEATURE_FLAGS__ = createGlobalProxy()
}

// ─── Context ─────────────────────────────────────────────────

const FeatureFlagCtx = createContext<FeatureFlagContextType | null>(null)

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const [version, setVersion] = useState(0)
  const environment = useMemo(() => detectEnvironment(), [])

  const flagContext = useMemo<FlagContext>(
    () => buildFlagContext(environment, auth.user?.tenantId, auth.user?.id, auth.user?.role),
    [environment, auth.user?.tenantId, auth.user?.id, auth.user?.role],
  )

  const isEnabled = useCallback(
    (key: string): boolean => {
      void version
      return featureFlags.isEnabled(key, flagContext)
    },
    [flagContext, version],
  )

  const getAllFlags = useCallback(() => {
    void version
    return featureFlags.getAll().map((f) => ({
      ...f,
      resolved: featureFlags.isEnabled(f.key, flagContext),
    }))
  }, [flagContext, version])

  const toggle = useCallback((key: string, enabled: boolean) => {
    featureFlags.setEnabled(key, enabled)
    setVersion((v) => v + 1)
  }, [])

  // Register / unregister the React refresh trigger for external toggles
  useEffect(() => {
    triggerReactRefresh = () => setVersion((v) => v + 1)
    return () => { triggerReactRefresh = null }
  }, [])

  return (
    <FeatureFlagCtx.Provider value={{ isEnabled, getAllFlags, toggle, flagContext }}>
      {children}
    </FeatureFlagCtx.Provider>
  )
}

// ─── Hooks ───────────────────────────────────────────────────

export function useFeatureFlag(key: string): boolean {
  const ctx = useContext(FeatureFlagCtx)
  if (!ctx) throw new Error('useFeatureFlag must be used within FeatureFlagProvider')
  return ctx.isEnabled(key)
}

export function useAllFlags() {
  const ctx = useContext(FeatureFlagCtx)
  if (!ctx) throw new Error('useAllFlags must be used within FeatureFlagProvider')
  return ctx.getAllFlags()
}

export function useToggleFlag() {
  const ctx = useContext(FeatureFlagCtx)
  if (!ctx) throw new Error('useToggleFlag must be used within FeatureFlagProvider')
  return ctx.toggle
}

export function useFlagContext(): FlagContext {
  const ctx = useContext(FeatureFlagCtx)
  if (!ctx) throw new Error('useFlagContext must be used within FeatureFlagProvider')
  return ctx.flagContext
}
