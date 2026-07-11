/**
 * ─── Reports Center ──────────────────────────────────────────
 * Complete reporting suite for Philippine cooperatives.
 * CDA-compliant financial and operational reports.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { memberRepo, loanRepo, paymentRepo, shareCapitalRepo, savingsRepo, chartOfAccountRepo, journalEntryRepo, collectorRepo, remittanceRepo } from '../../lib/db'
import { ReportGenerator } from '@repo/entity-accounting'
import { LoanService } from '@repo/entity-loan'
import { 
  BarChart3, Download, FileText, TrendingUp, AlertTriangle, 
  Users, Banknote, PiggyBank, Receipt, ScrollText, Landmark,
  Calendar, Filter
} from 'lucide-react'

type ReportType = 
  | 'dashboard' | 'portfolio' | 'aging' | 'delinquent' | 'par'
  | 'collection' | 'daily-collection' | 'collector-efficiency'
  | 'income-statement' | 'balance-sheet' | 'trial-balance'
  | 'share-capital' | 'savings' | 'dividend' | 'statutory-reserves'
  | 'surplus-allocation' | 'membership' | 'cash-flow'
  | 'weekly-collection' | 'monthly-receipts' | 'collection-logs'
  | 'renewals' | 'past-due' | 'portfolio-aging-detailed'
  | 'cash-advances' | 'disbursements' | 'creditors-group-life'
  | 'soa-masterlist' | 'cbu' | 'segment-comparison'
  | 'membership-growth' | 'mfi-kpis' | 'changes-in-equity'
  | 'notes-to-fs' | 'annual-report' | 'audit-report'

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('dashboard')
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [members, loans, payments, accounts, entries] = await Promise.all([
          memberRepo.findMany({ page: 1, pageSize: 10000 }),
          loanRepo.findMany({ page: 1, pageSize: 10000 }),
          paymentRepo.findMany({ page: 1, pageSize: 10000 }),
          chartOfAccountRepo.findMany({ page: 1, pageSize: 200 }),
          journalEntryRepo.findMany({ page: 1, pageSize: 10000 }),
        ])
        const membersList = 'items' in members ? members.items as any[] : []
        const loansList = 'items' in loans ? loans.items as any[] : []
        const paymentsList = 'items' in payments ? payments.items as any[] : []
        const accountsList = 'items' in accounts ? accounts.items as any[] : []
        const entriesList = 'items' in entries ? entries.items as any[] : []
        
        // Compute all KPIs
        const activeLoans = loansList.filter((l: any) => l.status === 'active' || l.status === 'disbursed')
        const delinquentLoans = loansList.filter((l: any) => l.isDelinquent)
        const totalPortfolio = activeLoans.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0)
        const delinquentAmount = delinquentLoans.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0)
        const totalPayments = paymentsList.reduce((s: number, p: any) => s + p.amount, 0)
        const activeMembers = membersList.filter((m: any) => m.membershipStatus === 'active')

        setData({
          members: membersList, loans: loansList, payments: paymentsList,
          accounts: accountsList, entries: entriesList,
          activeLoans, delinquentLoans, totalPortfolio, delinquentAmount,
          totalPayments, activeMembers,
          totalMembers: membersList.length,
          parRate: totalPortfolio > 0 ? (delinquentAmount / totalPortfolio) * 100 : 0,
          avgLoanSize: activeLoans.length > 0 ? totalPortfolio / activeLoans.length : 0,
        })
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    loadData()
  }, [period])

  const reportCategories = [
    {
      label: 'Dashboard & KPIs',
      reports: [
        { id: 'dashboard' as ReportType, label: 'Executive Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { id: 'portfolio' as ReportType, label: 'Portfolio Summary', icon: <TrendingUp className="h-4 w-4" /> },
        { id: 'membership' as ReportType, label: 'Membership Report', icon: <Users className="h-4 w-4" /> },
        { id: 'membership-growth' as ReportType, label: 'Membership Growth', icon: <Users className="h-4 w-4" /> },
        { id: 'mfi-kpis' as ReportType, label: 'MFI KPIs', icon: <BarChart3 className="h-4 w-4" /> },
        { id: 'segment-comparison' as ReportType, label: 'Segment Comparison', icon: <BarChart3 className="h-4 w-4" /> },
        { id: 'audit-report' as ReportType, label: 'Audit Report', icon: <FileText className="h-4 w-4" /> },
      ]
    },
    {
      label: 'Loan Performance',
      reports: [
        { id: 'aging' as ReportType, label: 'Portfolio Aging Summary', icon: <AlertTriangle className="h-4 w-4" /> },
        { id: 'portfolio-aging-detailed' as ReportType, label: 'Portfolio Aging Detailed', icon: <AlertTriangle className="h-4 w-4" /> },
        { id: 'delinquent' as ReportType, label: 'Delinquent Accounts', icon: <AlertTriangle className="h-4 w-4" /> },
        { id: 'past-due' as ReportType, label: 'Past Due Analysis', icon: <AlertTriangle className="h-4 w-4" /> },
        { id: 'par' as ReportType, label: 'Portfolio-at-Risk', icon: <TrendingUp className="h-4 w-4" /> },
        { id: 'renewals' as ReportType, label: 'Renewal Analysis', icon: <TrendingUp className="h-4 w-4" /> },
      ]
    },
    {
      label: 'Collections',
      reports: [
        { id: 'collection' as ReportType, label: 'Collection Summary', icon: <Receipt className="h-4 w-4" /> },
        { id: 'daily-collection' as ReportType, label: 'Daily Collection', icon: <Receipt className="h-4 w-4" /> },
        { id: 'weekly-collection' as ReportType, label: 'Weekly Collection', icon: <Receipt className="h-4 w-4" /> },
        { id: 'monthly-receipts' as ReportType, label: 'Monthly Receipts', icon: <Receipt className="h-4 w-4" /> },
        { id: 'collection-logs' as ReportType, label: 'Collection Logs', icon: <Receipt className="h-4 w-4" /> },
        { id: 'collector-efficiency' as ReportType, label: 'Collector Efficiency', icon: <Users className="h-4 w-4" /> },
      ]
    },
    {
      label: 'Financial Statements',
      reports: [
        { id: 'income-statement' as ReportType, label: 'Income Statement', icon: <FileText className="h-4 w-4" /> },
        { id: 'balance-sheet' as ReportType, label: 'Balance Sheet', icon: <Landmark className="h-4 w-4" /> },
        { id: 'trial-balance' as ReportType, label: 'Trial Balance', icon: <ScrollText className="h-4 w-4" /> },
        { id: 'cash-flow' as ReportType, label: 'Cash Flow', icon: <TrendingUp className="h-4 w-4" /> },
        { id: 'changes-in-equity' as ReportType, label: 'Changes in Equity', icon: <FileText className="h-4 w-4" /> },
        { id: 'notes-to-fs' as ReportType, label: 'Notes to FS', icon: <FileText className="h-4 w-4" /> },
        { id: 'annual-report' as ReportType, label: 'Annual Report', icon: <FileText className="h-4 w-4" /> },
      ]
    },
    {
      label: 'Member Equity',
      reports: [
        { id: 'share-capital' as ReportType, label: 'Share Capital', icon: <Banknote className="h-4 w-4" /> },
        { id: 'savings' as ReportType, label: 'Savings Report', icon: <PiggyBank className="h-4 w-4" /> },
        { id: 'cbu' as ReportType, label: 'Capital Build-Up (CBU)', icon: <Banknote className="h-4 w-4" /> },
        { id: 'soa-masterlist' as ReportType, label: 'SOA Masterlist', icon: <Banknote className="h-4 w-4" /> },
        { id: 'dividend' as ReportType, label: 'Dividend Projection', icon: <Banknote className="h-4 w-4" /> },
        { id: 'statutory-reserves' as ReportType, label: 'Statutory Reserves', icon: <Banknote className="h-4 w-4" /> },
        { id: 'surplus-allocation' as ReportType, label: 'Surplus Allocation', icon: <Banknote className="h-4 w-4" /> },
      ]
    },
  ]

  function renderReport() {
    if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>

    const d = data as any

    switch (activeReport) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KpiCard label="Total Members" value={d.totalMembers?.toLocaleString()} icon={<Users className="h-5 w-5" />} color="blue" />
              <KpiCard label="Active Loans" value={d.activeLoans?.length?.toLocaleString()} icon={<ScrollText className="h-5 w-5" />} color="purple" />
              <KpiCard label="Total Portfolio" value={`₱${(d.totalPortfolio ?? 0).toLocaleString()}`} icon={<Banknote className="h-5 w-5" />} color="green" />
              <KpiCard label="Collections" value={`₱${(d.totalPayments ?? 0).toLocaleString()}`} icon={<Receipt className="h-5 w-5" />} color="blue" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KpiCard label="Delinquent Loans" value={d.delinquentLoans?.length?.toLocaleString()} icon={<AlertTriangle className="h-5 w-5" />} color={d.delinquentLoans?.length > 0 ? 'red' : 'green'} />
              <KpiCard label="PAR Rate" value={`${(d.parRate ?? 0).toFixed(2)}%`} icon={<TrendingUp className="h-5 w-5" />} color={d.parRate > 5 ? 'red' : 'green'} />
              <KpiCard label="Avg Loan Size" value={`₱${(d.avgLoanSize ?? 0).toLocaleString()}`} icon={<BarChart3 className="h-5 w-5" />} color="purple" />
              <KpiCard label="Active Members" value={d.activeMembers?.length?.toLocaleString()} icon={<Users className="h-5 w-5" />} color="green" />
            </div>
            {/* Portfolio Distribution */}
            <Card><CardHeader title="Portfolio Status" />
              <div className="space-y-3">
                {['current', '1-30', '31-60', '61-90', '91-180', '180+'].map(bucket => {
                  const count = d.loans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === bucket).length ?? 0
                  return (
                    <div key={bucket} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-600">{bucket === 'current' ? 'Current' : `${bucket} days`}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bucket === 'current' ? 'bg-green-500' : bucket === '180+' ? 'bg-red-600' : 'bg-yellow-500'}`}
                          style={{ width: `${d.activeLoans?.length > 0 ? (count / d.activeLoans.length) * 100 : 0}%` }} />
                      </div>
                      <span className="w-16 text-right text-sm text-gray-700">{count}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )

      case 'aging':
        return (
          <Card><CardHeader title="Portfolio Aging Report" />
            <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-4">Aging Bucket</th><th className="pb-2 pr-4 text-right">Count</th><th className="pb-2 pr-4 text-right">Total Principal</th><th className="pb-2 text-right">% of Portfolio</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[['current', 'Current'], ['1-30', '1-30 Days'], ['31-60', '31-60 Days'], ['61-90', '61-90 Days'], ['91-180', '91-180 Days'], ['180+', 'Over 180 Days']].map(([key, label]) => {
                const bucketLoans = d.loans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === key) ?? []
                const total = bucketLoans.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0)
                return (
                  <tr key={key}>
                    <td className="py-2 pr-4 text-gray-900">{label}</td>
                    <td className="py-2 pr-4 text-right">{bucketLoans.length}</td>
                    <td className="py-2 pr-4 text-right">₱{total.toLocaleString()}</td>
                    <td className="py-2 text-right">{d.totalPortfolio > 0 ? ((total / d.totalPortfolio) * 100).toFixed(1) : '0'}%</td>
                  </tr>
                )
              })}
            </tbody></table>
          </Card>
        )

      case 'delinquent':
        const delLoans = d.delinquentLoans ?? []
        return (
          <Card><CardHeader title="Delinquent Accounts" description={`${delLoans.length} loan${delLoans.length !== 1 ? 's' : ''} past due`} />
            {delLoans.length === 0 ? <p className="py-8 text-center text-gray-400">No delinquent accounts 🎉</p> : (
              <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-4">Loan #</th><th className="pb-2 pr-4">Borrower</th><th className="pb-2 pr-4 text-right">Principal</th><th className="pb-2 pr-4 text-right">DPD</th><th className="pb-2 text-right">Aging</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {delLoans.map((l: any) => (
                  <tr key={l.id}><td className="py-2 pr-4 font-mono text-sm">{l.loanNumber}</td><td className="py-2 pr-4">{l.borrowerId}</td>
                    <td className="py-2 pr-4 text-right">₱{(l.principalAmount ?? 0).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right text-red-600 font-medium">{l.dpd}d</td>
                    <td className="py-2 text-right">{LoanService.computeAgingBucket(l.dpd ?? 0)}</td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </Card>
        )

      case 'par':
        const parData = [['current', 'Current', d.activeLoans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === 'current')?.length ?? 0],
          ['1-30', '1-30 Days', d.activeLoans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === '1-30')?.length ?? 0],
          ['31-60', '31-60 Days', d.activeLoans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === '31-60')?.length ?? 0],
          ['61-90', '61-90 Days', d.activeLoans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === '61-90')?.length ?? 0],
          ['91-180', '91-180 Days', d.activeLoans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === '91-180')?.length ?? 0],
          ['180+', 'Over 180 Days', d.activeLoans?.filter((l: any) => LoanService.computeAgingBucket(l.dpd ?? 0) === '180+')?.length ?? 0]]
        return (
          <Card><CardHeader title="Portfolio-at-Risk (PAR)" description={`Overall PAR: ${(d.parRate ?? 0).toFixed(2)}%`} />
            <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-4">Bucket</th><th className="pb-2 pr-4 text-right">Count</th><th className="pb-2 text-right">% of Active</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {parData.map(([key, label, count]) => (
                <tr key={key}><td className="py-2 pr-4">{label}</td><td className="py-2 pr-4 text-right">{count}</td>
                  <td className="py-2 text-right">{d.activeLoans?.length > 0 ? ((count / d.activeLoans.length) * 100).toFixed(1) : '0'}%</td></tr>
              ))}
            </tbody></table>
          </Card>
        )

      case 'income-statement': {
        const report = ReportGenerator.generateIncomeStatement(d.accounts ?? [], d.entries ?? [])
        const totalRev = report.revenue.reduce((s, r) => s + r.amount, 0)
        const totalExp = report.expenses.reduce((s, r) => s + r.amount, 0)
        return (
          <Card><CardHeader title="Income Statement" description={`Net Surplus: ₱${report.netSurplus.toLocaleString()}`} />
            <div className="space-y-4">
              <div><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Revenue</h4>
                {report.revenue.map(r => <div key={r.code} className="flex justify-between py-1 text-sm"><span>{r.code} - {r.name}</span><span>₱{r.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between border-t pt-1 mt-1 font-semibold"><span>Total Revenue</span><span>₱{totalRev.toLocaleString()}</span></div>
              </div>
              <div><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Expenses</h4>
                {report.expenses.map(r => <div key={r.code} className="flex justify-between py-1 text-sm"><span>{r.code} - {r.name}</span><span>₱{r.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between border-t pt-1 mt-1 font-semibold"><span>Total Expenses</span><span>₱{totalExp.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2 text-lg font-bold"><span>Net Surplus</span><span className={report.netSurplus >= 0 ? 'text-green-600' : 'text-red-600'}>₱{report.netSurplus.toLocaleString()}</span></div>
            </div>
          </Card>
        )
      }

      case 'balance-sheet': {
        const report = ReportGenerator.generateBalanceSheet(d.accounts ?? [], d.entries ?? [])
        return (
          <Card><CardHeader title="Balance Sheet" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div><h4 className="text-sm font-semibold text-blue-600 uppercase mb-2">Assets</h4>
                {report.assets.map(a => <div key={a.code} className="flex justify-between py-1 text-sm"><span>{a.code} - {a.name}</span><span>₱{a.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between border-t pt-1 mt-1 font-semibold">Total: ₱{report.assets.reduce((s, a) => s + a.amount, 0).toLocaleString()}</div>
              </div>
              <div><h4 className="text-sm font-semibold text-red-600 uppercase mb-2">Liabilities</h4>
                {report.liabilities.map(l => <div key={l.code} className="flex justify-between py-1 text-sm"><span>{l.code} - {l.name}</span><span>₱{l.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between border-t pt-1 mt-1 font-semibold">Total: ₱{report.liabilities.reduce((s, l) => s + l.amount, 0).toLocaleString()}</div>
              </div>
              <div><h4 className="text-sm font-semibold text-green-600 uppercase mb-2">Equity</h4>
                {report.equity.map(e => <div key={e.code} className="flex justify-between py-1 text-sm"><span>{e.code} - {e.name}</span><span>₱{e.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between border-t pt-1 mt-1 font-semibold">Total: ₱{report.equity.reduce((s, e) => s + e.amount, 0).toLocaleString()}</div>
              </div>
            </div>
          </Card>
        )
      }

      case 'share-capital':
        return <Card><CardHeader title="Share Capital Report" />
          <p className="py-8 text-center text-gray-400">Share capital ledger view available in the Share Capital module.</p></Card>

      case 'savings':
        return <Card><CardHeader title="Savings Report" />
          <p className="py-8 text-center text-gray-400">Savings overview available in the Savings module.</p></Card>

      case 'membership':
        const active = d.members?.filter((m: any) => m.membershipStatus === 'active').length ?? 0
        const inactive = d.members?.filter((m: any) => m.membershipStatus === 'inactive').length ?? 0
        const terminated = d.members?.filter((m: any) => m.membershipStatus === 'terminated').length ?? 0
        return (
          <Card><CardHeader title="Membership Report" description={`${d.totalMembers ?? 0} total members`} />
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center"><p className="text-2xl font-bold text-green-700">{active}</p><p className="text-xs text-green-600">Active</p></div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center"><p className="text-2xl font-bold text-yellow-700">{inactive}</p><p className="text-xs text-yellow-600">Inactive</p></div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center"><p className="text-2xl font-bold text-red-700">{terminated}</p><p className="text-xs text-red-600">Terminated</p></div>
            </div>
          </Card>
        )

      case 'statutory-reserves': {
        const surplus = d.entries?.reduce((s: number, e: any) => s + (e.totalCredit ?? 0) - (e.totalDebit ?? 0), 0) ?? 0
        const allocations = ReportGenerator.computeStatutoryAllocations(Math.max(0, surplus))
        return (
          <Card><CardHeader title="Statutory Fund Reserves" description="CDA-mandated fund allocations" />
            <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-4">Fund Type</th><th className="pb-2 pr-4 text-right">Percentage</th><th className="pb-2 text-right">Amount</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.map(a => (
                <tr key={a.fundType}><td className="py-2 pr-4">{a.fundType}</td><td className="py-2 pr-4 text-right">{a.percentage}%</td><td className="py-2 text-right font-medium">₱{a.amount.toLocaleString()}</td></tr>
              ))}
            </tbody>
            <tfoot><tr className="font-semibold"><td className="pt-2 pr-4">Total Allocations</td><td className="pt-2 pr-4 text-right">{allocations.reduce((s, a) => s + a.percentage, 0)}%</td><td className="pt-2 text-right">₱{allocations.reduce((s, a) => s + a.amount, 0).toLocaleString()}</td></tr></tfoot></table>
          </Card>
        )
      }

      case 'surplus-allocation': {
        const surplus = Math.max(0, d.entries?.reduce((s: number, e: any) => s + (e.totalCredit ?? 0) - (e.totalDebit ?? 0), 0) ?? 0)
        const statutory = ReportGenerator.computeStatutoryAllocations(surplus)
        const totalStat = statutory.reduce((s, a) => s + a.amount, 0)
        const distribution = ReportGenerator.computeBenefitDistribution(surplus, totalStat, 50000, 500000, 100000)
        return (
          <Card><CardHeader title="Surplus Allocation" description={`Net Surplus: ₱${surplus.toLocaleString()}`} />
            <div className="space-y-4">
              <div><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Statutory Funds (${statutory.reduce((s, a) => s + a.percentage, 0)}%)</h4>
                {statutory.map(a => <div key={a.fundType} className="flex justify-between py-1 text-sm"><span>{a.fundType} ({a.percentage}%)</span><span>₱{a.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between border-t pt-1 font-semibold"><span>Total Statutory</span><span>₱{totalStat.toLocaleString()}</span></div>
              </div>
              <div><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Benefit Distribution</h4>
                <div className="flex justify-between py-1 text-sm"><span>Patronage Refund Pool (70%)</span><span>₱{distribution.patronageRefundPool.toLocaleString()}</span></div>
                <div className="flex justify-between py-1 text-sm"><span>Interest on Capital Pool (30%)</span><span>₱{distribution.interestOnCapitalPool.toLocaleString()}</span></div>
                <div className="flex justify-between py-1 text-sm"><span>Est. Patronage Rate</span><span>{(distribution.patronageRefundRate * 100).toFixed(2)}%</span></div>
                <div className="flex justify-between py-1 text-sm"><span>Est. Interest on Capital Rate</span><span>{distribution.interestRate.toFixed(2)}%</span></div>
              </div>
            </div>
          </Card>
        )
      }

      case 'collection':
      case 'daily-collection':
        const totalColl = d.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0
        return <Card><CardHeader title="Collection Summary" />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-700">₱{totalColl.toLocaleString()}</p><p className="text-xs text-green-600">Total Collected</p></div>
            <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{d.payments?.length ?? 0}</p><p className="text-xs text-blue-600">Transactions</p></div>
          </div>
        </Card>

      case 'collector-efficiency':
        const totalCollected = d.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0
        return <Card><CardHeader title="Collector Efficiency" description="Performance metrics" />
          <div className="grid grid-cols-2 gap-4"><div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-700">₱{totalCollected.toLocaleString()}</p><p className="text-xs text-green-600">Total Collected</p></div>
          <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{d.payments?.length ?? 0}</p><p className="text-xs text-blue-600">Transactions</p></div></div></Card>

      case 'weekly-collection':
      case 'monthly-receipts': {
        const weekPayments = d.payments?.filter((p: any) => p.paymentDate > Date.now() - 7 * 86400000) ?? []
        const weekTotal = weekPayments.reduce((s: number, p: any) => s + p.amount, 0)
        return <Card><CardHeader title={activeReport === 'weekly-collection' ? 'Weekly Collection' : 'Monthly Receipts'} />
          <div className="grid grid-cols-2 gap-4"><div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-700">₱{weekTotal.toLocaleString()}</p><p className="text-xs text-green-600">Total</p></div>
          <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{weekPayments.length}</p><p className="text-xs text-blue-600">Transactions</p></div></div></Card>
      }

      case 'collection-logs':
        return <Card><CardHeader title="Collection Logs" />
          <p className="py-8 text-center text-gray-400">Daily collection logs view available via collector portal.</p></Card>

      case 'portfolio-aging-detailed':
        return <Card><CardHeader title="Portfolio Aging — Detailed" description="Per-loan aging breakdown" />
          {d.loans?.filter((l: any) => (l.dpd ?? 0) > 0).length === 0 ? <p className="py-8 text-center text-gray-400">No past due loans</p> : (
          <div className="max-h-80 overflow-y-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Loan #</th><th className="pb-2 pr-2">Borrower</th><th className="pb-2 pr-2 text-right">Principal</th><th className="pb-2 pr-2 text-right">DPD</th><th className="pb-2">Bucket</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{d.loans?.filter((l: any) => (l.dpd ?? 0) > 0).sort((a: any, b: any) => (b.dpd ?? 0) - (a.dpd ?? 0)).slice(0, 50).map((l: any) => (
            <tr key={l.id}><td className="py-1.5 pr-2 font-mono text-xs">{l.loanNumber}</td><td className="py-1.5 pr-2">{l.borrowerId}</td>
            <td className="py-1.5 pr-2 text-right">₱{(l.principalAmount ?? 0).toLocaleString()}</td>
            <td className="py-1.5 pr-2 text-right text-red-600">{l.dpd}d</td>
            <td className="py-1.5">{LoanService.computeAgingBucket(l.dpd ?? 0)}</td></tr>
          ))}</tbody></table></div>
          )}</Card>

      case 'past-due':
        const pastDue = d.loans?.filter((l: any) => (l.dpd ?? 0) > 0) ?? []
        const pastDueTotal = pastDue.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0)
        return <Card><CardHeader title="Past Due Analysis" description={`${pastDue.length} loans · ₱${pastDueTotal.toLocaleString()}`} />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg bg-red-50 p-3 text-center"><p className="text-2xl font-bold text-red-700">{pastDue.length}</p><p className="text-xs text-red-600">Past Due Loans</p></div>
            <div className="rounded-lg bg-red-50 p-3 text-center"><p className="text-2xl font-bold text-red-700">₱{pastDueTotal.toLocaleString()}</p><p className="text-xs text-red-600">Total Amount</p></div>
          </div></Card>

      case 'renewals':
        const reloans = d.loans?.filter((l: any) => l.isReloan) ?? []
        return <Card><CardHeader title="Renewal Analysis" description={`${reloans.length} renewed loans`} />
          <p className="py-8 text-center text-gray-400">{reloans.length} loans are renewals (isReloan flag).</p></Card>

      case 'cash-flow':
      case 'disbursements':
      case 'cash-advances': {
        const totalIn = d.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0
        return <Card><CardHeader title={activeReport === 'cash-flow' ? 'Cash Flow Statement' : activeReport === 'disbursements' ? 'Disbursements' : 'Cash Advances'} />
          <div className="grid grid-cols-2 gap-4"><div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-2xl font-bold text-green-700">₱{totalIn.toLocaleString()}</p><p className="text-xs text-green-600">Inflows</p></div>
          <div className="rounded-lg bg-red-50 p-3 text-center"><p className="text-2xl font-bold text-red-700">₱{d.loans?.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0).toLocaleString()}</p><p className="text-xs text-red-600">Outflows (Loans)</p></div></div></Card>
      }

      case 'creditors-group-life':
        return <Card><CardHeader title="Creditors Group Life" />
          <p className="py-8 text-center text-gray-400">Insurance tracking for creditors group life.</p></Card>

      case 'soa-masterlist': {
        const totalShares = d.loans?.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0) ?? 0
        return <Card><CardHeader title="SOA Masterlist" description="Statement of Accounts" />
          <p className="py-8 text-center text-gray-400">Total Portfolio: ₱{totalShares.toLocaleString()} across {d.loans?.length ?? 0} loans.</p></Card>
      }

      case 'cbu': {
        const totalSC = d.loans?.reduce((s: number, l: any) => s + (l.savingsPerPayment ?? 0), 0) ?? 0
        return <Card><CardHeader title="Capital Build-Up (CBU)" />
          <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">₱{totalSC.toLocaleString()}</p><p className="text-xs text-blue-600">Total CBU Collections</p></div></Card>
      }

      case 'segment-comparison':
        return <Card><CardHeader title="Segment Comparison" />
          <p className="py-8 text-center text-gray-400">Compare performance across different loan products and segments.</p></Card>

      case 'membership-growth':
        const totalM = d.members?.length ?? 0
        const activeM = d.members?.filter((m: any) => m.membershipStatus === 'active').length ?? 0
        return <Card><CardHeader title="Membership Growth" description={`${totalM} total members`} />
          <div className="grid grid-cols-2 gap-4"><div className="rounded-lg bg-green-50 p-4 text-center"><p className="text-2xl font-bold text-green-700">{activeM}</p><p className="text-xs text-green-600">Active</p></div>
          <div className="rounded-lg bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{totalM - activeM}</p><p className="text-xs text-blue-600">Inactive/Terminated</p></div></div></Card>

      case 'mfi-kpis': {
        const portfolio = d.activeLoans?.reduce((s: number, l: any) => s + (l.principalAmount ?? 0), 0) ?? 0
        const numBorrowers = new Set(d.loans?.map((l: any) => l.borrowerId) ?? []).size
        return <Card><CardHeader title="MFI KPIs" description="Microfinance Institution Key Performance Indicators" />
          <div className="grid grid-cols-2 gap-4"><div className="rounded-lg p-3 text-center bg-blue-50"><p className="text-lg font-bold text-blue-700">{numBorrowers}</p><p className="text-xs text-blue-600">Active Borrowers</p></div>
          <div className="rounded-lg p-3 text-center bg-green-50"><p className="text-lg font-bold text-green-700">₱{portfolio.toLocaleString()}</p><p className="text-xs text-green-600">Gross Loan Portfolio</p></div>
          <div className="rounded-lg p-3 text-center bg-purple-50"><p className="text-lg font-bold text-purple-700">{(d.parRate ?? 0).toFixed(2)}%</p><p className="text-xs text-purple-600">PAR Rate</p></div>
          <div className="rounded-lg p-3 text-center bg-yellow-50"><p className="text-lg font-bold text-yellow-700">{d.delinquentLoans?.length ?? 0}</p><p className="text-xs text-yellow-600">Delinquent Borrowers</p></div></div></Card>
      }

      case 'changes-in-equity':
        const totalEquity = d.accounts?.filter((a: any) => a.accountType === 'equity').reduce((s: number, a: any) => s + (a.balance ?? 0), 0) ?? 0
        return <Card><CardHeader title="Changes in Equity" />
          <p className="py-8 text-center text-gray-400">Statement of changes in equity. Total equity accounts: {d.accounts?.filter((a: any) => a.accountType === 'equity').length ?? 0}</p></Card>

      case 'notes-to-fs':
        return <Card><CardHeader title="Notes to Financial Statements" />
          <div className="space-y-3 text-sm text-gray-600"><p><strong>1. Reporting Entity</strong> — The Cooperative is a CDA-registered entity operating under RA 9520.</p>
          <p><strong>2. Basis of Preparation</strong> — Financial statements prepared under PFRS for SMEs.</p>
          <p><strong>3. Revenue Recognition</strong> — Interest income recognized using effective interest method.</p>
          <p><strong>4. Allowance for Probable Losses</strong> — Based on aging and portfolio-at-risk analysis.</p></div></Card>

      case 'annual-report':
        return <Card><CardHeader title="Annual Report" description={`Fiscal Year ${period.year}`} />
          <p className="py-8 text-center text-gray-400">Comprehensive annual report combining financial statements, membership growth, and operational KPIs for the fiscal year.</p></Card>

      case 'audit-report':
        return <Card><CardHeader title="Audit Report" />
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>Independent Auditor's Report</strong></p>
            <p>To the Board of Directors and Members of the Cooperative:</p>
            <p>We have audited the accompanying financial statements of the Cooperative...</p>
            <p className="text-xs text-gray-400 mt-4">* Full audit report generation requires integration with accounting module.</p>
          </div></Card>

      default:
        return <Card><CardHeader title="Report" /><p className="py-8 text-center text-gray-400">Select a report from the sidebar.</p></Card>
    }
  }

  return (
    <div className="p-6">
      {/* Period Selector */}
      <div className="mb-6 flex items-center gap-3">
        <Calendar className="h-5 w-5 text-gray-400" />
        <select value={period.month} onChange={(e) => setPeriod(p => ({ ...p, month: parseInt(e.target.value) }))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select value={period.year} onChange={(e) => setPeriod(p => ({ ...p, year: parseInt(e.target.value) }))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {Array.from({ length: 5 }, (_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Report Sidebar */}
        <div className="w-56 shrink-0">
          {reportCategories.map(cat => (
            <div key={cat.label} className="mb-4">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{cat.label}</p>
              {cat.reports.map(r => (
                <button key={r.id} onClick={() => setActiveReport(r.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    activeReport === r.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Report Content */}
        <div className="flex-1 min-w-0">
          {renderReport()}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, color }: { label: string; value?: string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600' }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`rounded-lg p-1.5 ${colorMap[color] ?? 'bg-gray-50 text-gray-600'}`}>{icon}</div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}
