/**
 * ─── Borrower Loan Request ──────────────────────────────────
 * Dedicated page for members to request a new loan.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { loanApplicationRepo, loanProductRepo } from '../../../../lib/db'
import { useAuth } from '../../../../context/AuthContext'
import { ChevronLeft, Save, Calculator } from 'lucide-react'
import { LoanService } from '@repo/entity-loan'

export function BorrowerLoanRequestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ amountApplied: 10000, purpose: '', productType: 'regular' })
  const [saving, setSaving] = useState(false)
  const [showAmort, setShowAmort] = useState(false)
  const amort = LoanService.computeDiminishingAmortization(form.amountApplied, 12, 12)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await loanApplicationRepo.create({
        borrowerId: user?.memberId ?? user?.id ?? 'm1',
        amountApplied: form.amountApplied, purpose: form.purpose,
        applicationDate: Date.now(), status: 'submitted',
        tenantId: 'default', createdBy: user?.id ?? 'system', updatedBy: user?.id ?? 'system',
      })
      navigate({ to: '/portal/borrower' })
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/portal/borrower' })} icon={<ChevronLeft className="h-4 w-4" />}>Back to Dashboard</Button>
      <Card className="mt-4">
        <CardHeader title="Request a Loan" description="Submit a new loan application" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Amount (₱)" type="number" required value={String(form.amountApplied)}
            onChange={(e) => setForm(f => ({ ...f, amountApplied: Number(e.target.value) }))} />
          <Input label="Purpose" value={form.purpose} onChange={(e) => setForm(f => ({ ...f, purpose: e.target.value }))} />

          <Button type="button" variant="secondary" onClick={() => setShowAmort(!showAmort)} icon={<Calculator className="h-4 w-4" />}>
            {showAmort ? 'Hide' : 'Show'} Estimated Amortization
          </Button>
          {showAmort && (
            <div className="rounded-lg bg-purple-50 p-3 text-sm">
              <p>Monthly Payment: <strong>₱{amort.monthlyPayment.toLocaleString()}</strong></p>
              <p>Total Interest: <strong>₱{amort.totalInterest.toLocaleString()}</strong></p>
              <p>Total Amount: <strong>₱{amort.totalAmount.toLocaleString()}</strong></p>
              <p className="text-xs text-gray-400 mt-1">Based on 12% p.a. over 12 months</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/portal/borrower' })}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Submit Application</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
