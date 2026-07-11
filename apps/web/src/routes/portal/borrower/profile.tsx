/**
 * ─── Borrower Profile ────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, Button, Input } from '@repo/ui-core'
import { memberRepo } from '../../../lib/db'
import { useAuth } from '../../../context/AuthContext'
import { ChevronLeft, Save, User } from 'lucide-react'

export function BorrowerProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [member, setMember] = useState<any>(null)
  const [form, setForm] = useState({ phone: '', email: '', barangay: '', cityMunicipality: '', province: '' })

  useEffect(() => {
    memberRepo.findMany({ page: 1, pageSize: 1, filter: [{ field: 'id', operator: 'eq', value: user?.memberId ?? '' }] }).then(r => {
      if ('items' in r && r.items.length > 0) {
        const m = r.items[0]
        setMember(m)
        setForm({ phone: m.phone ?? '', email: m.email ?? '', barangay: m.barangay ?? '', cityMunicipality: m.cityMunicipality ?? '', province: m.province ?? '' })
      }
    })
  }, [user])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/portal/borrower' })} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
      <Card className="mt-4">
        <CardHeader title="My Profile" />
        {member && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="rounded-full bg-blue-100 p-3"><User className="h-6 w-6 text-blue-600" /></div>
              <div><p className="font-medium text-lg">{member.fullName}</p><p className="text-sm text-gray-500">{member.membershipNumber} · {member.membershipType}</p></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Barangay" value={form.barangay} onChange={(e) => setForm(f => ({ ...f, barangay: e.target.value }))} />
              <Input label="City/Municipality" value={form.cityMunicipality} onChange={(e) => setForm(f => ({ ...f, cityMunicipality: e.target.value }))} />
              <Input label="Province" value={form.province} onChange={(e) => setForm(f => ({ ...f, province: e.target.value }))} />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
