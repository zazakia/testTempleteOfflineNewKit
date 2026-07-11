/**
 * ─── Trial Balance Page ──────────────────────────────────────
 * Shows trial balance with drill-down to journal entries.
 * CDA-compliant format for Philippine cooperatives.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { chartOfAccountRepo, journalEntryRepo } from '../../lib/db'
import type { ChartOfAccount, JournalEntryLine } from '@repo/entity-accounting'
import { ReportGenerator, ACCOUNT_TYPE_LABELS } from '@repo/entity-accounting'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TrialBalancePage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [lines, setLines] = useState<JournalEntryLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [accountsResult, entriesResult] = await Promise.all([
          chartOfAccountRepo.findMany({ page: 1, pageSize: 200 }),
          journalEntryRepo.findMany({ page: 1, pageSize: 10000 }),
        ])
        if ('items' in accountsResult) setAccounts(accountsResult.items as ChartOfAccount[])
        if ('items' in entriesResult) {
          const entries = entriesResult.items as any[]
          // Flatten journal entry lines
          const allLines: JournalEntryLine[] = []
          for (const entry of entries) {
            if ((entry as any).lines) {
              allLines.push(...(entry as any).lines)
            }
          }
          setLines(allLines)
        }
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const trialBalance = ReportGenerator.generateTrialBalance(accounts, lines)
  const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0)
  const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const accountTypeColors: Record<string, 'blue' | 'red' | 'green' | 'yellow' | 'purple'> = {
    asset: 'blue', liability: 'red', equity: 'green', income: 'yellow', expense: 'purple',
  }

  // Group by type
  const grouped = accounts.reduce((acc, a) => {
    if (!a.isHeader && !acc.find(r => r.code === a.code)) {
      const tb = trialBalance.find(r => r.code === a.code)
      if (tb && tb.debit + tb.credit > 0) {
        acc.push(tb)
      }
    }
    return acc
  }, [] as typeof trialBalance)

  return (
    <div className="p-6">
      {/* Balance Check */}
      <div className={`mb-6 rounded-xl border p-4 ${isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{isBalanced ? '✅ Trial Balance is Balanced' : '❌ Trial Balance is NOT Balanced'}</p>
            <p className="mt-1 text-xs text-gray-500">
              Total Debits: ₱{totalDebit.toLocaleString()} · Total Credits: ₱{totalCredit.toLocaleString()}
            </p>
          </div>
          {!isBalanced && <span className="text-sm font-medium text-red-600">Difference: ₱{Math.abs(totalDebit - totalCredit).toLocaleString()}</span>}
        </div>
      </div>

      <Card>
        <CardHeader title="Trial Balance" description="CDA-compliant trial balance report" />
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-2"><div className="h-4 w-full animate-pulse rounded bg-gray-200" /></td>
                  ))}</tr>
                ))
              ) : grouped.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No journal entries posted yet. Record transactions to see the trial balance.
                </td></tr>
              ) : grouped.map(row => (
                <tr key={row.code} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-mono text-gray-900">{row.code}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{row.name}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <Badge color={accountTypeColors[row.accountType] ?? 'gray'} size="sm">
                      {ACCOUNT_TYPE_LABELS[row.accountType as keyof typeof ACCOUNT_TYPE_LABELS] || row.accountType}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-900">
                    {row.debit > 0 ? `₱${row.debit.toLocaleString()}` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-900">
                    {row.credit > 0 ? `₱${row.credit.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-900">Total</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">₱{totalDebit.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">₱{totalCredit.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
