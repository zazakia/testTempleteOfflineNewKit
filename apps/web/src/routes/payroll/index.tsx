/**
 * ─── Payroll Page ────────────────────────────────────────────
 * Employee payroll management with period-based processing.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { employeeRepo, payrollRepo } from '../../lib/db'
import { Plus, Search, ChevronLeft, ChevronRight, Save, Calendar, Users } from 'lucide-react'

export function PayrollPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [periodStart, setPeriodStart] = useState(Date.now())
  const [periodEnd, setPeriodEnd] = useState(Date.now())

  useEffect(() => {
    async function load() {
      try {
        const [empRes, payRes] = await Promise.all([
          employeeRepo.findMany({ page: 1, pageSize: 100 }),
          payrollRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'periodStart', direction: 'desc' }] }),
        ])
        if ('items' in empRes) setEmployees(empRes.items)
        if ('items' in payRes) setPayrolls(payRes.items)
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  async function handleRunPayroll(e: React.FormEvent) {
    e.preventDefault()
    const emp = employees.find((e: any) => e.id === selectedEmployee)
    if (!emp) return
    setSaving(true)
    try {
      const baseSalary = emp.baseSalary ?? 0
      const daysInPeriod = Math.ceil((periodEnd - periodStart) / (86400000))
      const monthlySalary = baseSalary / 2 // semi-monthly
      const deductions = monthlySalary * 0.1 // 10% standard deductions
      const netPay = monthlySalary - deductions
      await payrollRepo.create({
        employeeId: selectedEmployee, periodStart, periodEnd,
        baseSalary: monthlySalary, deductions, allowances: 0, netPay,
        status: 'processed', tenantId: 'default', createdBy: 'admin', updatedBy: 'admin',
      })
      setShowModal(false)
      const r = await payrollRepo.findMany({ page: 1, pageSize: 100, sort: [{ field: 'periodStart', direction: 'desc' }] })
      if ('items' in r) setPayrolls(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const totalPayroll = payrolls.reduce((s: number, p: any) => s + (p.netPay ?? 0), 0)

  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-600">Total Payroll Processed</p>
          <p className="mt-1 text-2xl font-bold text-green-700">₱{totalPayroll.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-600">Payroll Runs</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{payrolls.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Employees</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{employees.length}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Payroll" description="Employee salary management"
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Run Payroll</Button>} />

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Base</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Deductions</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Net Pay</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td></tr> :
             payrolls.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">No payroll runs yet</td></tr> :
             payrolls.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{p.employeeId}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right text-sm">₱{(p.baseSalary ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm text-red-600">₱{(p.deductions ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm font-medium">₱{(p.netPay ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge color={p.status === 'processed' ? 'green' : 'yellow'}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Run Payroll" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleRunPayroll} loading={saving} icon={<Save className="h-4 w-4" />}>Process Payroll</Button></>}>
        <form className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select...</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.role}) — ₱{(e.baseSalary ?? 0).toLocaleString()}/mo</option>)}
            </select></div>
          <Input label="Period Start" type="date" value={String(periodStart)} onChange={(e) => setPeriodStart(new Date(e.target.value).getTime())} />
          <Input label="Period End" type="date" value={String(periodEnd)} onChange={(e) => setPeriodEnd(new Date(e.target.value).getTime())} />
        </form>
      </Modal>
    </div>
  )
}
