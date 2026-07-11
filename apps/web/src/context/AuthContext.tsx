/**
 * ─── Auth Context — Role-Based Access Control ────────────────
 * Manages authentication state and role-based routing
 * for borrower, collector, encoder, and admin portals.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type UserRole = 'admin' | 'manager' | 'collector' | 'borrower' | 'loan_encoder' | 'payment_encoder' | 'expenses_encoder' | 'officer'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  tenantId: string
  memberId?: string
  collectorId?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isCollector: boolean
  isBorrower: boolean
  isEncoder: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USERS: Array<User & { password: string }> = [
  { id: 'u1', email: 'admin@coop.com', password: 'admin123', fullName: 'Admin User', role: 'admin', tenantId: 'default' },
  { id: 'u2', email: 'manager@coop.com', password: 'manager123', fullName: 'Maria Santos', role: 'manager', tenantId: 'default' },
  { id: 'u3', email: 'collector@coop.com', password: 'collector123', fullName: 'Juan Collector', role: 'collector', tenantId: 'default', collectorId: 'c1' },
  { id: 'u4', email: 'borrower@coop.com', password: 'borrower123', fullName: 'Pedro Borrower', role: 'borrower', tenantId: 'default', memberId: 'm1' },
  { id: 'u5', email: 'encoder@coop.com', password: 'encoder123', fullName: 'Ana Encoder', role: 'loan_encoder', tenantId: 'default' },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('cooperp_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('cooperp_user') }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 500))
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Invalid email or password')
    const { password: _, ...userData } = found
    setUser(userData)
    localStorage.setItem('cooperp_user', JSON.stringify(userData))
    setLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('cooperp_user')
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    if (!user) return
    const updated = { ...user, role }
    setUser(updated)
    localStorage.setItem('cooperp_user', JSON.stringify(updated))
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'manager',
      isCollector: user?.role === 'collector',
      isBorrower: user?.role === 'borrower',
      isEncoder: user?.role === 'loan_encoder' || user?.role === 'payment_encoder' || user?.role === 'expenses_encoder',
      login, logout, switchRole, loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
