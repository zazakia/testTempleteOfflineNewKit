/**
 * ─── Audit Settings Page ────────────────────────────────────
 * Configure audit trail settings and retention policies.
 */

import { useState } from 'react'
import { Card, CardHeader, Badge, Button, Input } from '@repo/ui-core'
import { Save, Eye, Shield } from 'lucide-react'

export function AuditSettingsPage() {
  const [config, setConfig] = useState({
    enabled: true, retentionDays: 365, logLevel: 'all',
    trackReads: false, trackQueries: false, excludePaths: '/health,/sync',
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Audit Settings</h1>
      <Card>
        <CardHeader title="Audit Trail Configuration" />
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
            <div className="flex items-center gap-3"><Eye className="h-5 w-5 text-blue-500" /><div><p className="font-medium text-gray-900">Enable Audit Trail</p><p className="text-xs text-gray-500">Log all entity mutations</p></div></div>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig(c => ({ ...c, enabled: e.target.checked }))} className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
            </label>
          </div>
          <Input label="Retention Period (days)" type="number" value={String(config.retentionDays)}
            onChange={(e) => setConfig(c => ({ ...c, retentionDays: Number(e.target.value) }))} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
            <select value={config.logLevel} onChange={(e) => setConfig(c => ({ ...c, logLevel: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="all">All Operations</option>
              <option value="mutations">Create/Update/Delete Only</option>
              <option value="errors">Errors Only</option>
            </select></div>
          <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
            <div><p className="font-medium text-gray-900">Track Read Operations</p><p className="text-xs text-gray-500">Log when records are viewed</p></div>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input type="checkbox" checked={config.trackReads} onChange={(e) => setConfig(c => ({ ...c, trackReads: e.target.checked }))} className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="flex justify-end pt-4"><Button icon={<Save className="h-4 w-4" />}>Save Settings</Button></div>
        </div>
      </Card>
    </div>
  )
}
