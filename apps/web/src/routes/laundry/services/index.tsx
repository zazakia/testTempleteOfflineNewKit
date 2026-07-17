/**
 * ─── Laundry Services Catalog Page ────────────────────────────
 * Service catalog for the Laundry Shop Management System.
 */

import { useEffect, useState, useCallback } from 'react'
import { Card, Badge, Button, Input } from '@repo/ui-core'
import { laundryServiceRepo } from '../../../lib/db'
import type { LaundryService } from '@repo/entity-laundry'
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_COLORS, PRICING_UNIT_LABELS } from '@repo/entity-laundry'
import { Plus, Search, Shirt } from 'lucide-react'

export function LaundryServicesPage() {
  const [services, setServices] = useState<LaundryService[]>([])
  const [loading, setLoading] = useState(true)

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const result = await laundryServiceRepo.findMany({
        page: 1,
        pageSize: 100,
        sort: [{ field: 'sortOrder', direction: 'asc' }],
      })
      if ('items' in result) {
        setServices(result.items as LaundryService[])
      }
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadServices() }, [loadServices])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">Manage laundry services, pricing, and turnaround times</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>Add Service</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Shirt className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No services defined</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first laundry service to start taking orders</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <Badge color={SERVICE_CATEGORY_COLORS[s.category]}>
                  {SERVICE_CATEGORY_LABELS[s.category]}
                </Badge>
                <span className="text-xs text-gray-400">{PRICING_UNIT_LABELS[s.pricingUnit]}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{s.name}</h3>
              {s.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>}
              <div className="flex items-end justify-between mt-4">
                <div>
                  <span className="text-2xl font-bold text-green-700">₱{s.basePrice.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-1">/{s.pricingUnit === 'per_kg' ? 'kg' : s.pricingUnit === 'per_piece' ? 'pc' : 'unit'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Turnaround</span>
                  <span className="text-sm font-medium text-gray-700">{s.turnaroundHours}h</span>
                </div>
              </div>
              {s.minCharge > 0 && (
                <p className="text-xs text-gray-400 mt-2">Min charge: ₱{s.minCharge.toFixed(2)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
