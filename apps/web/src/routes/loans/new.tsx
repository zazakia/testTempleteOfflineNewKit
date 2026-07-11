/**
 * ─── Disburse Loan Page ──────────────────────────────────────
 * Full loan creation with product selection, fee computation,
 * amortization preview, and payment schedule generation.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input, Badge } from '@repo/ui-core'
import { loanRepo, loanProductRepo } from '../../lib/db'
import { CreateLoanSchema, LoanService } from '@repo/entity-loan'
import type { LoanProduct } from '@repo/entity-loan'
import { ChevronLeft, Save, Calculator, ScrollText } from 'lucide-react'

interface FormErrors { [key: string]: string }

export function CreateLoanPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [showAmortization, setShowAmortization] = useState(false)
  const [amortSchedule, setAmortSchedule] = useState<Array<{ month: number; principal: number; interest: number; balance: number }>>([])
  const [formData, setFormData] = useState({
    borrowerId: '', loanNumber: '', principalAmount: 0,
    interestRate: 12, interestType: 'diminishing' as const,
    term: 12, termUnit: 'months' as const, frequency: 'monthly' as const,
    releaseDate: Date.now(), firstPaymentDate: 0,
    processingFee: 0, notarialFee: 0, insuranceAmount: 0,
    savingsPerPayment: 0, collectorId: '', notes: '',
  })
  const [fees, setFees] = useState({ monthlyPayment: 0, totalInterest: 0, totalAmount: 0 })

  useEffect(() => {
    loanProductRepo.findMany({ page: 1, pageSize: 50 }).then(result => {
      if ('items' in result) setProducts(result.items as LoanProduct[])
    })
  }, [])

  function computeAmortization() {
    if (formData.interestType === 'diminishing') {
      const result = LoanService.computeDiminishingAmortization(
        formData.principalAmount, formData.interestRate, formData.term
      )
      setFees({ monthlyPayment: result.monthlyPayment, totalInterest: result.totalInterest, totalAmount: result.totalAmount })
      setAmortSchedule(result.schedule)
    } else {
      const result = LoanService.computeStraightAmortization(
        formData.principalAmount, formData.interestRate, formData.term
      )
      setFees({ monthlyPayment: result.monthlyPayment, totalInterest: result.totalInterest, totalAmount: result.totalAmount })
      setAmortSchedule([])
    }
    setShowAmortization(true)
  }

  function applyProduct(product: LoanProduct) {
    setFormData(f => ({
      ...f,
      interestRate: product.defaultRatePercent,
      term: product.defaultTerm,
      termUnit: product.defaultTermUnit as any,
      frequency: product.defaultFrequency as any,
      processingFee: product.defaultProcessingFeeFlat ?? 0,
      notarialFee: product.defaultNotarialFee ?? 0,
      savingsPerPayment: product.defaultSavingsPerPayment ?? 0,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const parsed = CreateLoanSchema.parse({
        tenantId: 'default',
        ...formData,
        firstPaymentDate: formData.firstPaymentDate || undefined,
        collectorId: formData.collectorId || undefined,
        notes: formData.notes || undefined,
        processingFee: formData.processingFee || undefined,
        notarialFee: formData.notarialFee || undefined,
        insuranceAmount: formData.insuranceAmount || undefined,
        savingsPerPayment: formData.savingsPerPayment || undefined,
      })
      // Compute installment amount
      const amort = LoanService.computeDiminishingAmortization(parsed.principalAmount, parsed.interestRate, parsed.term)
      const loan = await loanRepo.create({
        ...parsed,
        totalAmount: amort.totalAmount,
        installmentAmount: amort.monthlyPayment,
        interestAmount: amort.totalInterest,
        status: 'disbursed',
      } as any)
      navigate({ to: '/loans/$id', params: { id: loan.id } })
    } catch (error: any) {
      if (error?.issues) {
        const formErrors: FormErrors = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.')
          formErrors[path] = issue.message
        }
        setErrors(formErrors)
      } else {
        setErrors({ _form: error?.message ?? 'An error occurred' })
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/loans' })}
          icon={<ChevronLeft className="h-4 w-4" />}>Back to Loans</Button>
      </div>

      {/* Product Selection */}
      {products.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Select Product</p>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <button key={p.id} type="button" onClick={() => applyProduct(p)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-purple-300 hover:text-purple-700">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Card className="max-w-4xl">
        <CardHeader title="Disburse New Loan" description="Record a new loan with amortization computation" />
        <form onSubmit={handleSubmit} className="space-y-8">
          {errors._form && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors._form}</div>}

          {/* Loan Details */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <ScrollText className="h-4 w-4" /> Loan Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Borrower/Member ID *" required value={formData.borrowerId}
                onChange={(e) => setFormData(f => ({ ...f, borrowerId: e.target.value }))} error={errors.borrowerId} />
              <Input label="Loan Number *" required placeholder="LN-2026-0001" value={formData.loanNumber}
                onChange={(e) => setFormData(f => ({ ...f, loanNumber: e.target.value }))} error={errors.loanNumber} />
              <Input label="Principal Amount (₱) *" type="number" required value={String(formData.principalAmount)}
                onChange={(e) => setFormData(f => ({ ...f, principalAmount: Number(e.target.value) }))} error={errors.principalAmount} />
              <Input label="Interest Rate (%) *" type="number" value={String(formData.interestRate)}
                onChange={(e) => setFormData(f => ({ ...f, interestRate: Number(e.target.value) }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Type</label>
                <select value={formData.interestType}
                  onChange={(e) => setFormData(f => ({ ...f, interestType: e.target.value as any }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="diminishing">Diminishing Balance</option>
                  <option value="straight">Straight Line</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Term *" type="number" value={String(formData.term)}
                  onChange={(e) => setFormData(f => ({ ...f, term: Number(e.target.value) }))} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                  <select value={formData.termUnit}
                    onChange={(e) => setFormData(f => ({ ...f, termUnit: e.target.value as any }))}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
                <select value={formData.frequency}
                  onChange={(e) => setFormData(f => ({ ...f, frequency: e.target.value as any }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="semi_monthly">Semi-Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compute Button + Amortization Preview */}
          <div>
            <Button type="button" variant="secondary" onClick={computeAmortization}
              icon={<Calculator className="h-4 w-4" />}>Compute Amortization</Button>

            {showAmortization && (
              <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="mb-3 grid grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500">Monthly Payment</p><p className="text-lg font-bold text-purple-700">₱{fees.monthlyPayment.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Total Interest</p><p className="text-lg font-bold text-gray-900">₱{fees.totalInterest.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Total Amount</p><p className="text-lg font-bold text-gray-900">₱{fees.totalAmount.toLocaleString()}</p></div>
                </div>
                {amortSchedule.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-purple-700">View Amortization Schedule</summary>
                    <div className="mt-2 max-h-48 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-500"><th className="pr-2 text-right">#</th><th className="pr-2 text-right">Principal</th><th className="pr-2 text-right">Interest</th><th className="text-right">Balance</th></tr></thead>
                        <tbody>
                          {amortSchedule.map(s => (
                            <tr key={s.month}>
                              <td className="pr-2 text-right text-gray-400">{s.month}</td>
                              <td className="pr-2 text-right">₱{s.principal.toLocaleString()}</td>
                              <td className="pr-2 text-right">₱{s.interest.toLocaleString()}</td>
                              <td className="text-right font-medium">₱{s.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Disbursement */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Disbursement</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Release Date" type="date" value={String(formData.releaseDate)}
                onChange={(e) => setFormData(f => ({ ...f, releaseDate: new Date(e.target.value).getTime() }))} />
              <Input label="First Payment Date" type="date" value={String(formData.firstPaymentDate)}
                onChange={(e) => setFormData(f => ({ ...f, firstPaymentDate: new Date(e.target.value).getTime() }))} />
            </div>
          </div>

          {/* Fees */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Fees & Deductions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Input label="Processing Fee" type="number" value={String(formData.processingFee)}
                onChange={(e) => setFormData(f => ({ ...f, processingFee: Number(e.target.value) }))} />
              <Input label="Notarial Fee" type="number" value={String(formData.notarialFee)}
                onChange={(e) => setFormData(f => ({ ...f, notarialFee: Number(e.target.value) }))} />
              <Input label="Insurance" type="number" value={String(formData.insuranceAmount)}
                onChange={(e) => setFormData(f => ({ ...f, insuranceAmount: Number(e.target.value) }))} />
              <Input label="Savings per Payment" type="number" value={String(formData.savingsPerPayment)}
                onChange={(e) => setFormData(f => ({ ...f, savingsPerPayment: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Assignment</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Collector ID" placeholder="Collector assigned to this loan" value={formData.collectorId}
                onChange={(e) => setFormData(f => ({ ...f, collectorId: e.target.value }))} />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={formData.notes}
                  onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/loans' })}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Disburse Loan</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
