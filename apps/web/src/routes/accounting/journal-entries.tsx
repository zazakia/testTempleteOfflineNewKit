import { Card, CardHeader, Button } from '@repo/ui-core'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export function JournalEntryListPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Journal Entries" description="General ledger journal entries"
          action={<Link to="/accounting/journal-entries/new"><Button icon={<Plus className="h-4 w-4" />}>New Entry</Button></Link>} />
        <div className="flex items-center justify-center py-16 text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium">Journal Entries</p>
            <p className="mt-1 text-sm">Record and post journal entries for the cooperative's general ledger.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
