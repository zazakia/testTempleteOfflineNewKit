import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'

export interface WsCustomer {
  id: string; tenantId: string; name: string; phone?: string; address?: string
  isMember: boolean; memberId?: string; is_active?: boolean
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface WsDelivery {
  id: string; tenantId: string; customerId: string; deliveryDate: number
  gallons: number; pricePerGallon: number; totalAmount: number
  status: 'pending' | 'delivered' | 'cancelled'
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface WsContainer {
  id: string; tenantId: string; customerId: string
  containerType: string; quantityOwned: number; quantityLoaned: number
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

export interface WsPayment {
  id: string; tenantId: string; customerId: string; deliveryId?: string
  paymentDate: number; amount: number; paymentMethod: string
  createdAt: number; updatedAt: number; deletedAt: number | null
  version: number; createdBy: string; updatedBy: string
}

const WsCustomerEntity: EntityDefinition<WsCustomer> = {
  name: 'ws_customer',
  ui: { label: 'WS Customer', labelPlural: 'WS Customers', icon: 'Droplets', routePath: 'water-station/customers', color: 'blue', showInNav: true, navOrder: 70 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'water_station' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(WsCustomerEntity)

const WsDeliveryEntity: EntityDefinition<WsDelivery> = {
  name: 'ws_delivery',
  ui: { label: 'WS Delivery', labelPlural: 'WS Deliveries', icon: 'Truck', routePath: 'water-station/deliveries', color: 'green', showInNav: true, navOrder: 71 },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true }, rbac: { enabled: true, permissionPrefix: 'water_station' },
  hooks: {}, pagination: 'cursor', tenant: { enabled: true }, softDelete: { enabled: true },
}
EntityRegistry.register(WsDeliveryEntity)

export { WsCustomerEntity, WsDeliveryEntity }
