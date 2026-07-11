/**
 * ─── Loan Calculator ─────────────────────────────────────────
 * What-if amortization calculator for cooperative loans.
 */

import { useState } from 'react'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { LoanService } from '@repo/entity-loan'
import { Calculator, Download } from 'lucide-react'

export function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState(10000)
  const [rate, setRate] = useState(12)
  const [term, setTerm] = useState(12)
  const [type, setType] = useState<'diminishing' | 'straight'>('diminishing')
  const [result, setResult] = useState<any>(null)

  function compute() {
    if (type === 'diminishing') {
      setResult(LoanService.computeDiminishingAmortization(principal, rate, term))
    } else {
      setResult(LoanService.computeStraightAmortization(principal, rate, term))
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Loan Calculator</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <Card>
            <CardHeader title="Loan Parameters" />
            <div className="space-y-4">
              <Input label="Principal Amount (₱)" type="number" value={String(principal)}
                onChange={(e) => setPrincipal(Number(e.target.value))} />
              <Input label="Interest Rate (%)" type="number" value={String(rate)}
                onChange={(e) => setRate(Number(e.target.value))} />
              <Input label="Term (months)" type="number" value={String(term)}
                onChange={(e) => setTerm(Number(e.target.value))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="diminishing">Diminishing Balance</option>
                  <option value="straight">Straight Line</option>
                </select>
              </div>
              <Button onClick={compute} className="w-full" icon={<Calculator className="h-4 w-4" />}>Compute</Button>
            </div>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader title="Amortization Summary" />
            {!result ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <p>Enter parameters and click Compute</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-purple-50 p-3 text-center">
                    <p className="text-xs text-purple-600">Monthly Payment</p>
                    <p className="text-xl font-bold text-purple-700">₱{result.monthlyPayment.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-3 text-center">
                    <p className="text-xs text-orange-600">Total Interest</p>
                    <p className="text-xl font-bold text-orange-700">₱{result.totalInterest.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center col-span-2">
                    <p className="text-xs text-green-600">Total Amount Payable</p>
                    <p className="text-xl font-bold text-green-700">₱{result.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {result.schedule && (
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-purple-700">View Full Schedule ({result.schedule.length} payments)</summary>
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-500"><th className="pr-2 text-right">#</th><th className="pr-2 text-right">Principal</th><th className="pr-2 text-right">Interest</th><th className="text-right">Balance</th></tr></thead>
                        <tbody>
                          {result.schedule.map((s: any) => (
                            <tr key={s.month}><td className="pr-2 text-right text-gray-400">{s.month}</td>
                              <td className="pr-2 text-right">₱{s.principal.toLocaleString()}</td>
                              <td className="pr-2 text-right">₱{s.interest.toLocaleString()}</td>
                              <td className="pr-2 text-right font-medium">₱{s.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
