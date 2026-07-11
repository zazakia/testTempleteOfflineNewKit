/**
 * ─── Login Page ──────────────────────────────────────────────
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '@repo/ui-core'
import { Building2, Lock, Mail } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@coop.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CoopERP</h1>
          <p className="mt-1 text-sm text-gray-500">Cooperative Management System</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <Input label="Email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@coop.com"
              icon={<Mail className="h-4 w-4 text-gray-400" />} />

            <Input label="Password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-gray-400" />} />

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p><strong>Admin:</strong> admin@coop.com / admin123</p>
              <p><strong>Manager:</strong> manager@coop.com / manager123</p>
              <p><strong>Collector:</strong> collector@coop.com / collector123</p>
              <p><strong>Borrower:</strong> borrower@coop.com / borrower123</p>
              <p><strong>Encoder:</strong> encoder@coop.com / encoder123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
