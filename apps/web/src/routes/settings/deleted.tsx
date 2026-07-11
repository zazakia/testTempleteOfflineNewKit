/**
 * ─── Deleted Records Viewer ──────────────────────────────────
 * View and restore soft-deleted records.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { getDatabase } from '@repo/db-dexie'
import { Search, RotateCcw, Trash2 } from 'lucide-react'

export function DeletedRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tableFilter, setTableFilter] = useState('')
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      try {
        const db = getDatabase()
        const tableNames = db.tables.filter(t => t.name !== 'changeLog').map(t => t.name)
        setTables(tableNames)
        const allDeleted: any[] = []
        for (const name of tableNames) {
          const items = await db.table(name).filter((item: any) => item.deletedAt !== null && item.deletedAt !== undefined).toArray()
          allDeleted.push(...items.map((i: any) => ({ ...i, _table: name })))
        }
        setRecords(allDeleted.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)))
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = tableFilter ? records.filter(r => r._table === tableFilter) : records

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Deleted Records</h1>
      <p className="mb-4 text-sm text-gray-500">{records.length} soft-deleted records across {tables.length} tables</p>
      <div className="mb-4">
        <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Tables</option>
          {tables.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <Card>
        {loading ? <p className="py-8 text-center text-gray-400">Scanning tables...</p> : filtered.length === 0 ? (
          <div className="py-16 text-center"><Trash2 className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-2 text-gray-500">No deleted records found</p></div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="pb-2 pr-2">Table</th><th className="pb-2 pr-2">ID</th><th className="pb-2 pr-2">Name</th><th className="pb-2 pr-2 text-right">Deleted At</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.slice(0, 100).map((r, i) => (
                <tr key={`${r._table}-${r.id}-${i}`} className="hover:bg-gray-50">
                  <td className="py-2 pr-2"><Badge color="red" size="sm">{r._table}</Badge></td>
                  <td className="py-2 pr-2 font-mono text-xs">{r.id?.slice(0, 8)}...</td>
                  <td className="py-2 pr-2">{r.fullName || r.name || r.loanNumber || r.membershipNumber || '—'}</td>
                  <td className="py-2 pr-2 text-right text-gray-400">{r.deletedAt ? new Date(r.deletedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        )}
      </Card>
    </div>
  )
}
