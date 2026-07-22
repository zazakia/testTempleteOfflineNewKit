/**
 * ─── Settings Page ───────────────────────────────────────────
 * Central settings hub for cooperative configuration.
 */

import { useEffect, useState } from 'react'
import { Card, CardHeader, Badge, Button, Input, Modal } from '@repo/ui-core'
import { collectionGroupRepo, expenseCategoryRepo, employeeRepo, loanProductRepo } from '../../lib/db'
import { useAllFlags, useToggleFlag } from '../../context/FeatureFlagContext'
import { Plus, Save, Layers, Tag, Users, Briefcase, Settings2, ChevronLeft, ChevronRight, Blocks } from 'lucide-react'

type SettingsTab = 'collection-groups' | 'expense-categories' | 'employees' | 'loan-products' | 'modules'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('collection-groups')

  const tabs = [
    { id: 'modules' as SettingsTab, label: 'Modules', icon: <Blocks className="h-4 w-4" /> },
    { id: 'collection-groups' as SettingsTab, label: 'Collection Groups', icon: <Layers className="h-4 w-4" /> },
    { id: 'expense-categories' as SettingsTab, label: 'Expense Categories', icon: <Tag className="h-4 w-4" /> },
    { id: 'employees' as SettingsTab, label: 'Employees', icon: <Users className="h-4 w-4" /> },
    { id: 'loan-products' as SettingsTab, label: 'Loan Products', icon: <Briefcase className="h-4 w-4" /> },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure cooperative business rules and reference data</p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeTab === tab.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'collection-groups' && <CollectionGroupsSettings />}
          {activeTab === 'expense-categories' && <ExpenseCategoriesSettings />}
          {activeTab === 'employees' && <EmployeesSettings />}
          {activeTab === 'loan-products' && <LoanProductsSettings />}
          {activeTab === 'modules' && <ModuleSettings />}
        </div>
      </div>
    </div>
  )
}

function CollectionGroupsSettings() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', collectionDay: 0, collectorId: '' })

  useEffect(() => {
    collectionGroupRepo.findMany({ page: 1, pageSize: 100 }).then(r => {
      if ('items' in r) setItems(r.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await collectionGroupRepo.create({ ...form, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ name: '', collectionDay: 0, collectorId: '' })
      const r = await collectionGroupRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setItems(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <Card>
      <CardHeader title="Collection Groups" description="Define collector routes and schedules"
        action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Group</Button>} />
      {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No collection groups defined</p>
      ) : (
        <div className="space-y-2">
          {items.map((g: any) => (
            <div key={g.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div><p className="font-medium text-gray-900">{g.name}</p><p className="text-sm text-gray-500">{dayNames[g.collectionDay] ?? 'Unknown'} · {g.collectorId || 'No collector assigned'}</p></div>
              <Badge color={g.is_active !== false ? 'green' : 'gray'}>{g.is_active !== false ? 'Active' : 'Inactive'}</Badge>
            </div>
          ))}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Collection Group" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Group Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Collection Day</label>
            <select value={form.collectionDay} onChange={(e) => setForm(f => ({ ...f, collectionDay: parseInt(e.target.value) }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm">
              {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select></div>
          <Input label="Collector ID" value={form.collectorId} onChange={(e) => setForm(f => ({ ...f, collectorId: e.target.value }))} />
        </form>
      </Modal>
    </Card>
  )
}

function ExpenseCategoriesSettings() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '' })

  useEffect(() => {
    expenseCategoryRepo.findMany({ page: 1, pageSize: 100 }).then(r => {
      if ('items' in r) setItems(r.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await expenseCategoryRepo.create({ name: form.name, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ name: '' })
      const r = await expenseCategoryRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setItems(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <Card>
      <CardHeader title="Expense Categories" action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Category</Button>} />
      {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No categories defined</p>
      ) : (
        <div className="flex flex-wrap gap-2">{items.map((c: any) => (
          <span key={c.id} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{c.name}</span>
        ))}</div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Expense Category" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <Input label="Category Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
      </Modal>
    </Card>
  )
}

function EmployeesSettings() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'staff', baseSalary: 0 })

  useEffect(() => {
    employeeRepo.findMany({ page: 1, pageSize: 100 }).then(r => {
      if ('items' in r) setItems(r.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await employeeRepo.create({ ...form, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ name: '', role: 'staff', baseSalary: 0 })
      const r = await employeeRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setItems(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <Card>
      <CardHeader title="Employees" description="Staff and payroll management"
        action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Employee</Button>} />
      {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No employees yet</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Base Salary</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((e: any) => (
              <tr key={e.id}><td className="px-4 py-3 text-sm text-gray-900">{e.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{e.role}</td>
                <td className="px-4 py-3 text-right text-sm">₱{(e.baseSalary ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge color={e.is_active !== false ? 'green' : 'gray'}>{e.is_active !== false ? 'Active' : 'Inactive'}</Badge></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Employee" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Full Name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm">
              <option value="staff">Staff</option> <option value="manager">Manager</option>
              <option value="officer">Officer</option> <option value="collector">Collector</option>
            </select></div>
          <Input label="Base Salary (₱)" type="number" value={String(form.baseSalary)} onChange={(e) => setForm(f => ({ ...f, baseSalary: Number(e.target.value) }))} />
        </form>
      </Modal>
    </Card>
  )
}

function LoanProductsSettings() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ productType: '', label: '', defaultRatePercent: 12, defaultTerm: 12, defaultFrequency: 'monthly' })

  useEffect(() => {
    loanProductRepo.findMany({ page: 1, pageSize: 100 }).then((r: any) => {
      if ('items' in r) setItems(r.items)
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await loanProductRepo.create({ ...form, defaultTermUnit: 'months', is_active: true, tenantId: 'default', createdBy: 'admin', updatedBy: 'admin' })
      setShowModal(false); setForm({ productType: '', label: '', defaultRatePercent: 12, defaultTerm: 12, defaultFrequency: 'monthly' })
      const r = await loanProductRepo.findMany({ page: 1, pageSize: 100 })
      if ('items' in r) setItems(r.items)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  return (
    <Card>
      <CardHeader title="Loan Products" action={<Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>Add Product</Button>} />
      {loading ? <p className="py-8 text-center text-gray-400">Loading...</p> : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No loan products defined</p>
      ) : (
        <div className="space-y-2">{items.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div><p className="font-medium text-gray-900">{p.label}</p><p className="text-sm text-gray-500">{p.productType} · {p.defaultRatePercent}% · {p.defaultTerm} months</p></div>
            <Badge color={p.is_active !== false ? 'green' : 'gray'}>{p.is_active !== false ? 'Active' : 'Inactive'}</Badge>
          </div>
        ))}</div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Loan Product" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button></>}>
        <form className="space-y-3">
          <Input label="Product Type" required value={form.productType} onChange={(e) => setForm(f => ({ ...f, productType: e.target.value }))} />
          <Input label="Label" required value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} />
          <Input label="Default Rate (%)" type="number" value={String(form.defaultRatePercent)} onChange={(e) => setForm(f => ({ ...f, defaultRatePercent: Number(e.target.value) }))} />
          <Input label="Default Term (months)" type="number" value={String(form.defaultTerm)} onChange={(e) => setForm(f => ({ ...f, defaultTerm: Number(e.target.value) }))} />
        </form>
      </Modal>
    </Card>
  )
}

// ─── Modules Toggle ───────────────────────────────────────────

interface ModuleDef {
  flagKey: string
  label: string
  description: string
  icon: string
  category: 'core' | 'vertical'
}

const MODULES: ModuleDef[] = [
  {
    flagKey: 'module.cooperative',
    label: 'Cooperative ERP',
    description: 'Members, lending, savings, share capital, accounting & collections',
    icon: 'Building2',
    category: 'core',
  },
  {
    flagKey: 'module.multi-branch',
    label: 'Multi-Branch',
    description: 'Branch entities, per-branch filtering and reports',
    icon: 'GitBranch',
    category: 'core',
  },
  {
    flagKey: 'module.changelog',
    label: 'Changelog / Roadmap',
    description: 'Release version tracking & feature roadmap',
    icon: 'Clock',
    category: 'core',
  },
  {
    flagKey: 'module.laundry',
    label: 'Laundry Shop',
    description: 'Multi-branch laundry: customers, orders, services, payments, inventory',
    icon: 'Shirt',
    category: 'vertical',
  },
  {
    flagKey: 'module.clinic',
    label: 'Clinic',
    description: 'Patients, doctors, appointments, consultation records, billing',
    icon: 'HeartPulse',
    category: 'vertical',
  },
  {
    flagKey: 'module.driving-school',
    label: 'Driving School',
    description: 'Students, instructors, courses, enrollments, schedules, payments, vehicles',
    icon: 'Car',
    category: 'vertical',
  },
  {
    flagKey: 'module.fastfood',
    label: 'Fast Food',
    description: 'Menu, POS orders, inventory tracking, daily sales summary',
    icon: 'UtensilsCrossed',
    category: 'vertical',
  },
  {
    flagKey: 'module.water-station',
    label: 'Water Station',
    description: 'Water delivery customers, deliveries, containers & payments',
    icon: 'Droplets',
    category: 'vertical',
  },
]

function ModuleSettings() {
  const allFlags = useAllFlags()
  const toggle = useToggleFlag()

  const flagsByKey = new Map(allFlags.map(f => [f.key, f]))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Module Toggles"
          description="Turn business domains on or off. Changes apply immediately to the sidebar and routes."
        />

        {/* Core Modules */}
        <div className="mb-6">
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Platform Features
          </p>
          <div className="space-y-1">
            {MODULES.filter(m => m.category === 'core').map(mod => {
              const flag = flagsByKey.get(mod.flagKey)
              const enabled = flag?.resolved ?? flag?.enabled ?? false
              return (
                <div
                  key={mod.flagKey}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{mod.label}</p>
                    <p className="text-xs text-gray-500">{mod.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Toggle ${mod.label}`}
                    onClick={() => toggle(mod.flagKey, !enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vertical Modules */}
        <div>
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Business Line Modules
          </p>
          <div className="space-y-1">
            {MODULES.filter(m => m.category === 'vertical').map(mod => {
              const flag = flagsByKey.get(mod.flagKey)
              const enabled = flag?.resolved ?? flag?.enabled ?? false
              return (
                <div
                  key={mod.flagKey}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{mod.label}</p>
                    <p className="text-xs text-gray-500">{mod.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Toggle ${mod.label}`}
                    onClick={() => toggle(mod.flagKey, !enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Persistence note */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Module toggles are stored in memory and reset on page reload.
          In production, they persist per tenant via <code className="rounded bg-amber-100 px-1 text-xs">tenant_metadata</code>.
        </p>
      </div>
    </div>
  )
}
