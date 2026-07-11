/**
 * ─── Borrower Transaction History ────────────────────────────
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { paymentRepo, shareCapitalRepo, savingsRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { ChevronLeft, Receipt, Banknote, PiggyBank } from 'lucide-react'

export function BorrowerTransactionsPage() {
  const { user } = useAuth()
  const memberId = user?.memberId ?? 'm1'
  const [tab, setTab] = useState<'payments' | 'savings' | 'share'>('payments')
  const [payments, setPayments] = useState<any[]>([])
  const [savings, setSavings] = useState<any[]>([])
  const [shares, setShares] = useState<any[]>([])

  useEffect(() => {
    paymentRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'borrowerId', operator: 'eq', value: memberId }], sort: [{ field: 'paymentDate', direction: 'desc' }] }).then(r => { if ('items' in r) setPayments(r.items) })
    savingsRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'memberId', operator: 'eq', value: memberId }], sort: [{ field: 'date', direction: 'desc' }] }).then(r => { if ('items' in r) setSavings(r.items) })
    shareCapitalRepo.findMany({ page: 1, pageSize: 50, filter: [{ field: 'memberId', operator: 'eq', value: memberId }], sort: [{ field: 'date', direction: 'desc' }] }).then(r => { if ('items' in r) setShares(r.items) })
  }, [memberId])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Transaction History</h1>
      <div className="flex gap-2 mb-4">
        {(['payments', 'savings', 'share'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === t ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {t === 'payments' ? <Receipt className="h-4 w-4" /> : t === 'savings' ? <PiggyBank className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
            {t === 'payments' ? 'Loan Payments' : t === 'savings' ? 'Savings' : 'Share Capital'}
          </button>
        ))}
      </div>
      <Card>
        {tab === 'payments' && (payments.length === 0 ? <p className="py-8 text-center text-gray-400">No payments</p> :
          payments.map((p: any) => (
            <div key={p.id} className="flex justify-between border-b border-gray-100 py-2 px-3">
              <span className="text-sm text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</span>
              <span className="text-sm text-gray-900">Loan payment</span>
              <span className="text-sm font-medium text-gray-900">₱{p.amount.toLocaleString()}</span>
            </div>
          ))
        )}
        {tab === 'savings' && (savings.length === 0 ? <p className="py-8 text-center text-gray-400">No savings transactions</p> :
          savings.map((t: any) => (
            <div key={t.id} className="flex justify-between border-b border-gray-100 py-2 px-3">
              <span className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</span>
              <span className="text-sm text-gray-900 capitalize">{t.type}</span>
              <span className={`text-sm font-medium ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'deposit' ? '+' : '-'}₱{t.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
        {tab === 'share' && (shares.length === 0 ? <p className="py-8 text-center text-gray-400">No share capital transactions</p> :
          shares.map((t: any) => (
            <div key={t.id} className="flex justify-between border-b border-gray-100 py-2 px-3">
              <span className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</span>
              <span className="text-sm text-gray-900 capitalize">{t.transactionType}</span>
              <span className="text-sm font-medium text-gray-900">₱{t.amount.toLocaleString()}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
