/**
 * ─── Remaining Reports ───────────────────────────────────────
 * bank-export, excess-cash-receipt, financial-summary,
 * monthly-sales, collection-logs, collector-collection-analysis, period-settings
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { loanRepo, paymentRepo, memberRepo, collectorRepo, chartOfAccountRepo } from '../../lib/db'

type ReportView = 'bank-export' | 'excess-cash' | 'financial-summary' | 'monthly-sales' | 'collection-logs' | 'collector-analysis' | 'period-settings'

export function BankExportReport() {
  const [data, setData] = useState<any[]>([])
  useEffect(() => {
    paymentRepo.findMany({ page: 1, pageSize: 1000 }).then(r => { if ('items' in r) setData(r.items) })
  }, [])
  return <Card><CardHeader title="Bank Export Report" description="For bank reconciliation" />
    <p className="py-4 text-sm text-gray-600">Total transactions: {data.length}</p>
    <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Date</th><th className="pb-2 pr-2">Reference</th><th className="pb-2 pr-2 text-right">Amount</th></tr></thead>
    <tbody>{data.slice(0, 30).map((p: any) => (
      <tr key={p.id}><td className="py-1 pr-2">{new Date(p.paymentDate).toLocaleDateString()}</td><td className="py-1 pr-2">{p.receiptNumber || '—'}</td><td className="py-1 pr-2 text-right">₱{p.amount.toLocaleString()}</td></tr>
    ))}</tbody></table>
    <p className="mt-4 text-xs text-gray-400">Export this data for bank reconciliation. {data.length > 30 ? `Showing 30 of ${data.length}` : ''}</p>
  </Card>
}

export function ExcessCashReceiptReport() {
  const [payments, setPayments] = useState<any[]>([])
  useEffect(() => {
    paymentRepo.findMany({ page: 1, pageSize: 1000 }).then(r => { if ('items' in r) setPayments(r.items) })
  }, [])
  return <Card><CardHeader title="Excess Cash Receipt" description="Payments exceeding installment amounts" />
    <p className="py-4 text-sm text-gray-600">All payments: {payments.length}. Excess tracking requires comparing payments to loan installments.</p>
    <p className="text-xs text-gray-400">This report identifies overpayments that need to be refunded or applied as advance payments.</p>
  </Card>
}

export function FinancialSummaryReport() {
  const [loans, setLoans] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  useEffect(() => {
    Promise.all([
      loanRepo.findMany({ page: 1, pageSize: 10000 }),
      paymentRepo.findMany({ page: 1, pageSize: 10000 }),
    ]).then(([l, p]) => {
      if ('items' in l) setLoans(l.items)
      if ('items' in p) setPayments(p.items)
    })
  }, [])
  const totalPortfolio = loans.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0)
  const totalCollections = payments.reduce((s: number, p: any) => s + p.amount, 0)
  return <Card><CardHeader title="Financial Summary" />
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">₱{totalPortfolio.toLocaleString()}</p><p className="text-xs text-blue-600">Loan Portfolio</p></div>
      <div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-700">₱{totalCollections.toLocaleString()}</p><p className="text-xs text-green-600">Total Collections</p></div>
      <div className="rounded-lg bg-purple-50 p-4 text-center"><p className="text-2xl font-bold text-purple-700">{loans.length}</p><p className="text-xs text-purple-600">Active Loans</p></div>
      <div className="rounded-lg bg-yellow-50 p-4 text-center"><p className="text-2xl font-bold text-yellow-700">{payments.length}</p><p className="text-xs text-yellow-600">Payment Transactions</p></div>
    </div>
  </Card>
}

export function MonthlySalesReport() {
  const [payments, setPayments] = useState<any[]>([])
  useEffect(() => {
    paymentRepo.findMany({ page: 1, pageSize: 10000 }).then(r => { if ('items' in r) setPayments(r.items) })
  }, [])
  const byMonth: Record<string, number> = {}
  payments.forEach((p: any) => {
    const d = new Date(p.paymentDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] ?? 0) + p.amount
  })
  return <Card><CardHeader title="Monthly Sales / Collections" />
    <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Month</th><th className="pb-2 pr-2 text-right">Collections</th></tr></thead>
    <tbody>{Object.entries(byMonth).sort().reverse().slice(0, 12).map(([month, total]) => (
      <tr key={month}><td className="py-1 pr-2">{month}</td><td className="py-1 pr-2 text-right font-medium">₱{total.toLocaleString()}</td></tr>
    ))}</tbody></table>
  </Card>
}

export function CollectionLogsReport() {
  const [payments, setPayments] = useState<any[]>([])
  const [collectors, setCollectors] = useState<any[]>([])
  useEffect(() => {
    Promise.all([
      paymentRepo.findMany({ page: 1, pageSize: 10000, sort: [{ field: 'paymentDate', direction: 'desc' }] }),
      collectorRepo.findMany({ page: 1, pageSize: 100 }),
    ]).then(([p, c]) => {
      if ('items' in p) setPayments(p.items)
      if ('items' in c) setCollectors(c.items)
    })
  }, [])
  return <Card><CardHeader title="Collection Logs" description="Per-collector collection records" />
    <div className="max-h-80 overflow-y-auto">
      <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Date</th><th className="pb-2 pr-2">Collector</th><th className="pb-2 pr-2">Loan</th><th className="pb-2 pr-2 text-right">Amount</th></tr></thead>
      <tbody className="divide-y divide-gray-100">
        {payments.slice(0, 100).map((p: any) => (
          <tr key={p.id}><td className="py-1.5 pr-2 text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
            <td className="py-1.5 pr-2">{p.collectorId || '—'}</td>
            <td className="py-1.5 pr-2 font-mono text-xs">{p.loanId?.slice(0, 8)}</td>
            <td className="py-1.5 pr-2 text-right">₱{p.amount.toLocaleString()}</td></tr>
        ))}
      </tbody></table>
    </div>
    <p className="mt-2 text-xs text-gray-400">Showing last 100 of {payments.length} payments</p>
  </Card>
}

export function CollectorAnalysisReport() {
  const [payments, setPayments] = useState<any[]>([])
  const [collectors, setCollectors] = useState<any[]>([])
  useEffect(() => {
    Promise.all([
      paymentRepo.findMany({ page: 1, pageSize: 10000 }),
      collectorRepo.findMany({ page: 1, pageSize: 100 }),
    ]).then(([p, c]) => {
      if ('items' in p) setPayments(p.items)
      if ('items' in c) setCollectors(c.items)
    })
  }, [])

  const byCollector: Record<string, { count: number; total: number }> = {}
  payments.forEach((p: any) => {
    const id = p.collectorId || 'unassigned'
    if (!byCollector[id]) byCollector[id] = { count: 0, total: 0 }
    byCollector[id].count++
    byCollector[id].total += p.amount
  })

  return <Card><CardHeader title="Collector Collection Analysis" />
    <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Collector</th><th className="pb-2 pr-2 text-right">Transactions</th><th className="pb-2 pr-2 text-right">Total Collected</th><th className="pb-2 pr-2 text-right">Avg/Transaction</th></tr></thead>
    <tbody>{Object.entries(byCollector).map(([id, data]) => (
      <tr key={id}><td className="py-1 pr-2">{id}</td><td className="py-1 pr-2 text-right">{data.count}</td>
        <td className="py-1 pr-2 text-right font-medium">₱{data.total.toLocaleString()}</td>
        <td className="py-1 pr-2 text-right">₱{Math.round(data.total / data.count).toLocaleString()}</td></tr>
    ))}</tbody></table>
    <p className="mt-2 text-xs text-gray-400">{payments.length} total payments analyzed</p>
  </Card>
}

export function PeriodSettingsReport() {
  const [loans, setLoans] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  useEffect(() => {
    Promise.all([
      loanRepo.findMany({ page: 1, pageSize: 10000 }),
      paymentRepo.findMany({ page: 1, pageSize: 10000 }),
    ]).then(([l, p]) => {
      if ('items' in l) setLoans(l.items)
      if ('items' in p) setPayments(p.items)
    })
  }, [])

  const periodStart = new Date(year, month, 1).getTime()
  const periodEnd = new Date(year, month + 1, 0).getTime()

  const periodLoans = loans.filter((l: any) => {
    const d = l.releaseDate ?? l.createdAt
    return d >= periodStart && d <= periodEnd
  })
  const periodPayments = payments.filter((p: any) => p.paymentDate >= periodStart && p.paymentDate <= periodEnd)
  const periodRevenue = periodPayments.reduce((s: number, p: any) => s + p.amount, 0)

  return <Card><CardHeader title="Period Settings & Performance">
    <div className="flex gap-2">
      <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="rounded-lg border px-2 py-1 text-sm">
        {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>)}
      </select>
      <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="rounded-lg border px-2 py-1 text-sm">
        {Array.from({ length: 5 }, (_, i) => <option key={i} value={year - i}>{year - i}</option>)}
      </select>
    </div>
  </CardHeader>
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-xl font-bold text-blue-700">{periodLoans.length}</p><p className="text-xs text-blue-600">Loans Released</p></div>
      <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-xl font-bold text-green-700">₱{periodRevenue.toLocaleString()}</p><p className="text-xs text-green-600">Collections</p></div>
      <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-xl font-bold text-purple-700">{periodPayments.length}</p><p className="text-xs text-purple-600">Transactions</p></div>
    </div>
    <div className="mt-4 flex justify-between border-t pt-3 text-sm"><span className="text-gray-500">Period Status:</span>
      <Badge color="green">Open — entries can be posted</Badge></div>
  </Card>
}
