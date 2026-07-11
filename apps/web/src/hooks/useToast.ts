/**
 * ─── Toast Hook ──────────────────────────────────────────────
 * Simple toast notification system using state.
 * In production, replace with a library like react-hot-toast.
 */

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

let toastId = 0

// Global toast state (singleton) for simplicity
let globalToasts: Toast[] = []
let globalListeners: Array<(toasts: Toast[]) => void> = []

function notifyListeners() {
  globalListeners.forEach(l => l([...globalToasts]))
}

export function showToast(type: Toast['type'], title: string, message?: string) {
  const toast: Toast = { id: String(++toastId), type, title, message }
  globalToasts = [...globalToasts, toast]
  notifyListeners()
  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== toast.id)
    notifyListeners()
  }, 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts)

  useState(() => {
    globalListeners.push(setToasts)
    return () => {
      globalListeners = globalListeners.filter(l => l !== setToasts)
    }
  })

  const dismiss = useCallback((id: string) => {
    globalToasts = globalToasts.filter(t => t.id !== id)
    notifyListeners()
  }, [])

  return { toasts, dismiss }
}
