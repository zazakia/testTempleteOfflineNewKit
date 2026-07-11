import { Card, CardHeader, Button, Input, Badge } from '@repo/ui-core'
import { useEffect, useState } from 'react'
import { chartOfAccountRepo } from '../../lib/db'
import type { ChartOfAccount } from '@repo/entity-accounting'
import { ACCOUNT_TYPE_LABELS } from '@repo/entity-accounting'
import { Plus } from 'lucide-react'

export function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])

  useEffect(() => {
    chartOfAccountRepo.findMany({ page: 1, pageSize: 100 }).then(result => {
      if ('items' in result) setAccounts(result.items as ChartOfAccount[])
    })
  }, [])

  const accountTypeColors: Record<string, 'blue' | 'red' | 'green' | 'yellow' | 'purple'> = {
    asset: 'blue', liability: 'red', equity: 'green', income: 'yellow', expense: 'purple',
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Chart of Accounts" description="CDA-compliant chart of accounts"
          action={<Button icon={<Plus className="h-4 w-4" />}>Add Account</Button>} />
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Normal Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {accounts.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  No accounts yet. Add your first account to build the chart of accounts.
                </td></tr>
              ) : accounts.map((acc) => (
                <tr key={acc.id} className={acc.isHeader ? 'bg-gray-50 font-semibold' : ''}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-mono text-gray-900">{acc.code}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{acc.name}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <Badge color={accountTypeColors[acc.accountType] ?? 'gray'} size="sm">
                      {ACCOUNT_TYPE_LABELS[acc.accountType]}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500 capitalize">{acc.normalBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
