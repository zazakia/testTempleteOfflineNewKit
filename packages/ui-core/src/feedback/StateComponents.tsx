/**
 * ─── Loading & Empty State Components ────────────────────────
 * Reusable quality-of-life components for all pages.
 */

import React from 'react'
import { Loader2, PackageOpen, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

// ─── Loading Skeleton ───────────────────────────────────────

interface SkeletonProps {
  rows?: number
  cols?: number
  className?: string
}

/**
 * Animated loading skeleton for tables.
 * Matches the GenericList / page table structure.
 */
export function LoadingSkeleton({ rows = 5, cols = 4, className }: SkeletonProps) {
  return (
    <div className={cn('w-full animate-pulse', className)} role="status" aria-label="Loading data">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-gray-100 px-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 flex-1 rounded bg-gray-200" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Full-page centered spinner with message.
 */
export function PageSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-label={message}>
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="mt-3 text-sm text-gray-500">{message}</p>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

/**
 * Shown when a list/table has no data.
 */
export function EmptyState({
  icon,
  title = 'No data found',
  description = 'Get started by creating your first record.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
        {icon ?? <PackageOpen className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Error Fallback ─────────────────────────────────────────

interface ErrorFallbackProps {
  error?: Error | null
  onRetry?: () => void
  message?: string
}

/**
 * Shown when a component crashes or a data load fails.
 */
export function ErrorFallback({ error, onRetry, message }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-red-100 p-4 text-red-500">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{message ?? 'Something went wrong'}</h3>
      <p className="mt-1 max-w-md text-sm text-gray-500">
        {error?.message ?? 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          aria-label="Retry loading"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      )}
    </div>
  )
}

// ─── Page Error Boundary ────────────────────────────────────

interface PageErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface PageErrorBoundaryState {
  error: Error | null
}

/**
 * Per-page error boundary with retry support.
 * Catches render errors in individual page components.
 */
export class PageErrorBoundary extends React.Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  override state: PageErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  override render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      )
    }
    return this.props.children
  }
}
