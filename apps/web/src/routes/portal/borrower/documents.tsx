/**
 * ─── Borrower Documents ──────────────────────────────────────
 * Document management for member files.
 */

import { useState } from 'react'
import { Card, CardHeader, Button } from '@repo/ui-core'
import { FileText, Upload, Download, Eye } from 'lucide-react'

export function BorrowerDocumentsPage() {
  const [docs] = useState([
    { name: 'Membership Application Form', date: '2026-01-15', type: 'PDF' },
    { name: 'PMES Certificate', date: '2026-01-15', type: 'PDF' },
    { name: 'Loan Application - LN-2026-0001', date: '2026-03-01', type: 'PDF' },
    { name: 'Promissory Note - LN-2026-0001', date: '2026-03-01', type: 'PDF' },
  ])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Documents</h1>
      <Card>
        <CardHeader title="Document Management" action={<Button icon={<Upload className="h-4 w-4" />}>Upload Document</Button>} />
        <div className="space-y-2">
          {docs.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div><p className="font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.date} · {d.type}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />}>View</Button>
                <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>Download</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
