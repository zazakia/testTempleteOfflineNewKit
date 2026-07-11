import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { loanApplicationRepo } from '../../lib/db'
import { CreateLoanApplicationSchema } from '@repo/entity-loan'
import { ChevronLeft, Save } from 'lucide-react'

export function CreateLoanApplicationPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ borrowerId: '', amountApplied: 0, purpose: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const parsed = CreateLoanApplicationSchema.parse({
        ...form, applicationDate: Date.now(), tenantId: 'default',
      })
      await loanApplicationRepo.create(parsed)
      navigate({ to: '/loan-applications' })
    } catch (error: any) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/loan-applications' })} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
      <Card className="mt-4 max-w-2xl">
        <CardHeader title="New Loan Application" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Borrower ID" required value={form.borrowerId} onChange={(e) => setForm(f => ({ ...f, borrowerId: e.target.value }))} />
          <Input label="Amount Applied" type="number" required value={String(form.amountApplied)} onChange={(e) => setForm(f => ({ ...f, amountApplied: Number(e.target.value) }))} />
          <Input label="Purpose" value={form.purpose} onChange={(e) => setForm(f => ({ ...f, purpose: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/loan-applications' })}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Submit Application</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
