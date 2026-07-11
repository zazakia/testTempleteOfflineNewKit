/**
 * ─── Cooperative Computation Settings ───────────────────────
 * Configure formulas and parameters for cooperative financial computations.
 */

import { useState } from 'react'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { Save, Calculator } from 'lucide-react'

export function CoopComputationsPage() {
  const [params, setParams] = useState({
    parValue: 100, minShareSub: 1000, maxLoanMultiple: 5,
    patronageRate: 0.70, interestOnCapitalRate: 0.30,
    reserveFundRate: 10, educationFundRate: 10, communityDevRate: 3,
    latePenaltyRate: 0.5, maxLoanTerm: 60, maxInterestRate: 24,
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Cooperative Computations</h1>
      <Card>
        <CardHeader title="Financial Parameters" description="Configure cooperative computation formulas" />
        <div className="space-y-6">
          <div><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Share Capital</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Par Value per Share (₱)" type="number" value={String(params.parValue)}
                onChange={(e) => setParams(p => ({ ...p, parValue: Number(e.target.value) }))} />
              <Input label="Min Subscription (₱)" type="number" value={String(params.minShareSub)}
                onChange={(e) => setParams(p => ({ ...p, minShareSub: Number(e.target.value) }))} />
              <Input label="Max Loan Multiple" type="number" value={String(params.maxLoanMultiple)}
                onChange={(e) => setParams(p => ({ ...p, maxLoanMultiple: Number(e.target.value) }))} />
            </div>
          </div>
          <div><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Surplus Distribution</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Patronage Refund Pool (%)" type="number" value={String(params.patronageRate * 100)}
                onChange={(e) => setParams(p => ({ ...p, patronageRate: Number(e.target.value) / 100 }))} />
              <Input label="Interest on Capital Pool (%)" type="number" value={String(params.interestOnCapitalRate * 100)}
                onChange={(e) => setParams(p => ({ ...p, interestOnCapitalRate: Number(e.target.value) / 100 }))} />
            </div>
          </div>
          <div><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Statutory Fund Allocations</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Reserve Fund (%)" type="number" value={String(params.reserveFundRate)}
                onChange={(e) => setParams(p => ({ ...p, reserveFundRate: Number(e.target.value) }))} />
              <Input label="Education Fund (%)" type="number" value={String(params.educationFundRate)}
                onChange={(e) => setParams(p => ({ ...p, educationFundRate: Number(e.target.value) }))} />
              <Input label="Community Dev (%)" type="number" value={String(params.communityDevRate)}
                onChange={(e) => setParams(p => ({ ...p, communityDevRate: Number(e.target.value) }))} />
            </div>
          </div>
          <div><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Loan Parameters</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Late Penalty (%/day)" type="number" value={String(params.latePenaltyRate)}
                onChange={(e) => setParams(p => ({ ...p, latePenaltyRate: Number(e.target.value) }))} />
              <Input label="Max Loan Term (months)" type="number" value={String(params.maxLoanTerm)}
                onChange={(e) => setParams(p => ({ ...p, maxLoanTerm: Number(e.target.value) }))} />
              <Input label="Max Interest Rate (%)" type="number" value={String(params.maxInterestRate)}
                onChange={(e) => setParams(p => ({ ...p, maxInterestRate: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex justify-end pt-4"><Button icon={<Save className="h-4 w-4" />}>Save Parameters</Button></div>
        </div>
      </Card>
    </div>
  )
}
