import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { journalEntryRepo } from '../../lib/db'
import { CreateJournalEntrySchema } from '@repo/entity-accounting'
import { ChevronLeft, Save, Plus, X } from 'lucide-react'

export function CreateJournalEntryPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ description: '', entryDate: Date.now() })
  const [lines, setLines] = useState([{ accountCode: '', debitAmount: 0, creditAmount: 0, description: '' }])

  const totalDebit = lines.reduce((s, l) => s + (l.debitAmount ?? 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (l.creditAmount ?? 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  function addLine() { setLines([...lines, { accountCode: '', debitAmount: 0, creditAmount: 0, description: '' }]) }
  function removeLine(i: number) { if (lines.length > 1) setLines(lines.filter((_, idx) => idx !== i)) }
  function updateLine(i: number, field: string, value: any) {
    const updated = [...lines]
    ;(updated[i] as any)[field] = value
    setLines(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isBalanced) return
    setSaving(true)
    try {
      const parsed = CreateJournalEntrySchema.parse({ ...form, lines })
      await journalEntryRepo.create(parsed as any)
      navigate({ to: '/accounting/journal-entries' })
    } catch (error: any) {
      console.error(error)
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/accounting/journal-entries' })}
        icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
      <Card className="mt-4 max-w-3xl">
        <CardHeader title="New Journal Entry" description="Create a double-entry journal entry" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Description" required value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />

          {/* Journal Lines */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Journal Lines</span>
              <Button type="button" variant="ghost" size="sm" onClick={addLine} icon={<Plus className="h-3 w-3" />}>Add Line</Button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <Input placeholder="Account Code" value={line.accountCode} className="w-32 text-sm"
                    onChange={(e) => updateLine(i, 'accountCode', e.target.value)} />
                  <Input placeholder="Debit" type="number" value={String(line.debitAmount)} className="w-24 text-sm"
                    onChange={(e) => updateLine(i, 'debitAmount', Number(e.target.value))} />
                  <Input placeholder="Credit" type="number" value={String(line.creditAmount)} className="w-24 text-sm"
                    onChange={(e) => updateLine(i, 'creditAmount', Number(e.target.value))} />
                  <Input placeholder="Description (optional)" value={line.description} className="flex-1 text-sm"
                    onChange={(e) => updateLine(i, 'description', e.target.value)} />
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className={`rounded-lg border p-3 text-sm ${isBalanced ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <div className="flex justify-between">
              <span>Total Debit: <strong>₱{totalDebit.toLocaleString()}</strong></span>
              <span>Total Credit: <strong>₱{totalCredit.toLocaleString()}</strong></span>
              <span>{isBalanced ? '✅ Balanced' : '❌ Not Balanced'}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/accounting/journal-entries' })}>Cancel</Button>
            <Button type="submit" disabled={!isBalanced} loading={saving} icon={<Save className="h-4 w-4" />}>Post Entry</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
