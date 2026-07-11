/**
 * ─── Borrower Portal — Self-Service Dashboard ───────────────
 * Members can view their loans, savings, share capital, and request new loans.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { loanRepo, paymentRepo, shareCapitalRepo, savingsRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { LOAN_STATUS_LABELS, LOAN_STATUS_COLORS } from '@repo/entity-loan'
import { ScrollText, PiggyBank, Banknote, Receipt, Plus, RefreshCw, User } from 'lucide-react'

export function BorrowerPortal() {
  const { user } = useAuth()
  const memberId = user?.memberId ?? 'm1'
  const [loans, setLoans] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [savings, setSavings] = useState<any[]>([])
  const [shareCapital, setShareCapital] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [loanRes, paymentRes, savingsRes, shareRes] = await Promise.all([
          loanRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'borrowerId', operator: 'eq', value: memberId }] }),
          paymentRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'borrowerId', operator: 'eq', value: memberId }] }),
          savingsRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'memberId', operator: 'eq', value: memberId }] }),
          shareCapitalRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'memberId', operator: 'eq', value: memberId }] }),
        ])
        if ('items' in loanRes) setLoans(loanRes.items)
        if ('items' in paymentRes) setPayments(paymentRes.items)
        if ('items' in savingsRes) setSavings(savingsRes.items)
        if ('items' in shareRes) setShareCapital(shareRes.items)
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [memberId])

  const totalPayments = payments.reduce((s: number, p: any) => s + p.amount, 0)
  const savingsBalance = savings.reduce((s: number, t: any) => {
    if (t.type === 'deposit' || t.type === 'interest') return s + t.amount
    if (t.type === 'withdrawal') return s - t.amount
    return s
  }, 0)
  const totalShareCapital = shareCapital.reduce((s: number, t: any) => {
    if (t.transactionType === 'subscription' || t.transactionType === 'payment') return s + t.amount
    return s
  }, 0)

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.fullName ?? 'Member'}</h1>
        <p className="mt-1 text-sm text-gray-500">Member ID: {memberId} · Your financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm text-blue-600">Active Loans</p><ScrollText className="h-5 w-5 text-blue-500" /></div>
          <p className="mt-1 text-2xl font-bold text-blue-700">{loans.filter((l: any) => l.status === 'active' || l.status === 'disbursed').length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm text-green-600">Total Payments</p><Receipt className="h-5 w-5 text-green-500" /></div>
          <p className="mt-1 text-2xl font-bold text-green-700">₱{totalPayments.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm text-purple-600">Savings Balance</p><PiggyBank className="h-5 w-5 text-purple-500" /></div>
          <p className="mt-1 text-2xl font-bold text-purple-700">₱{savingsBalance.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm text-yellow-600">Share Capital</p><Banknote className="h-5 w-5 text-yellow-500" /></div>
          <p className="mt-1 text-2xl font-bold text-yellow-700">₱{totalShareCapital.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-3">
        <Button icon={<Plus className="h-4 w-4" />}>Request Loan</Button>
        <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />}>Make Payment</Button>
        <Button variant="secondary" icon={<User className="h-4 w-4" />}>Update Profile</Button>
      </div>

      {/* My Loans */}
      <Card className="mb-6">
        <CardHeader title="My Loans" />
        {loading ? <p className="py-4 text-center text-gray-400">Loading...</p> : loans.length === 0 ? (
          <p className="py-8 text-center text-gray-400">You have no active loans. Apply now!</p>
        ) : (
          <div className="space-y-3">
            {loans.map((loan: any) => (
              <div key={loan.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                <div>
                  <p className="font-medium text-gray-900">{loan.loanNumber}</p>
                  <p className="text-sm text-gray-500">₱{loan.principalAmount?.toLocaleString()} · {loan.term} {loan.termUnit} · {loan.interestRate}%</p>
                </div>
                <div className="text-right">
                  <Badge color={LOAN_STATUS_COLORS[loan.status]}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
                  <p className="mt-1 text-xs text-gray-400">Installment: ₱{loan.installmentAmount?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader title="Recent Transactions" />
        {payments.length === 0 ? (
          <p className="py-4 text-center text-gray-400">No recent transactions</p>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {payments.slice(0, 10).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                <span className="text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</span>
                <span className="text-gray-900">Loan payment: ₱{p.amount.toLocaleString()}</span>
                <Badge color="green" size="sm">{p.paymentType}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
