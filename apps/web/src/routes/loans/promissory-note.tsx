/**
 * ─── Promissory Note ─────────────────────────────────────────
 * Loan document generation for promissory notes.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Badge, Button } from '@repo/ui-core'
import { loanRepo } from '../../lib/db'
import { ChevronLeft, Printer, Download } from 'lucide-react'

export function PromissoryNotePage() {
  const params = useParams({ from: '/promissory-note/$id' })
  const id = (params as any).id ?? ''
  const navigate = useNavigate()
  const [loan, setLoan] = useState<any>(null)

  useEffect(() => { if (id) loanRepo.findById(id).then(setLoan) }, [id])

  if (!loan) return <div className="p-6"><Button variant="ghost" onClick={() => navigate({ to: '/loans' })} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button><p className="mt-4">Loading...</p></div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/loans/$id', params: { id } })} icon={<ChevronLeft className="h-4 w-4" />}>Back to Loan</Button>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {/* Promissory Note Document */}
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm print:shadow-none print:border-none">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">PROMISSORY NOTE</h1>
          <p className="text-sm text-gray-500">(Cooperative Code: to be filled)</p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>KNOW ALL MEN BY THESE PRESENTS:</strong>
          </p>
          <p>
            I/We, <u className="font-medium">{loan.borrowerId}</u>, of legal age, Filipino, and a member of the Cooperative,
            do hereby promise to pay the Cooperative the sum of 
            <strong> PESOS: {loan.principalAmount?.toLocaleString()} (₱{loan.principalAmount?.toLocaleString()})</strong>,
            Philippine Currency, together with interest at the rate of <strong>{loan.interestRate}% per annum</strong>,
            payable in <strong>{loan.term} {loan.termUnit}</strong> as follows:
          </p>
          <p>
            <strong>Installment Amount:</strong> ₱{loan.installmentAmount?.toLocaleString()} · 
            <strong> Frequency:</strong> {loan.frequency} · 
            <strong> Term:</strong> {loan.term} {loan.termUnit}
          </p>
          <p>
            In case of default in the payment of any installment when due, I/We agree to pay a penalty charge
            of <strong>0.5% per day</strong> on the overdue amount until fully paid.
          </p>
          <p>
            I/We hereby waive the presentment for payment, demand, protest, and notice of dishonor
            and consent to extrajudicial foreclosure in case of default.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="text-xs text-gray-500">BORROWER</p>
                <p className="font-medium">{loan.borrowerId}</p>
                <p className="text-xs text-gray-400">Date: _______________</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="text-xs text-gray-500">WITNESS</p>
                <p className="font-medium">___________________</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Prepared on: {new Date().toLocaleDateString()} · Loan #{loan.loanNumber}</p>
            <p>This document is computer-generated. No signature required for electronic version.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
