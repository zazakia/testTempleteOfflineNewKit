# 👨‍💻 Developer Guide — Offline-First Business App Starter

> **Comprehensive guide for using, developing, and extending this starter kit.**
> For product context, see [PRD.md](./PRD.md). For architecture decisions, see [ADR-001](./adr/001-use-turborepo.md) and [ADR-002](./adr/002-repository-pattern.md).

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Project Map](#2-project-map)
3. [Core Architecture Patterns](#3-core-architecture-patterns)
4. [How Data Flows](#4-how-data-flows)
5. [How to Add a New Entity](#5-how-to-add-a-new-entity)
6. [How to Add a New DB Adapter](#6-how-to-add-a-new-db-adapter)
7. [How to Add Middleware](#7-how-to-add-middleware)
8. [How to Use Feature Flags](#8-how-to-use-feature-flags)
9. [How to Use Domain Events](#9-how-to-use-domain-events)
10. [Testing Patterns](#10-testing-patterns)
11. [UI Component System](#11-ui-component-system)
12. [State Management](#12-state-management)
13. [Working with the Sync Engine](#13-working-with-the-sync-engine)
14. [Common Development Tasks](#14-common-development-tasks)
15. [Package Dependency Map](#15-package-dependency-map)

---

## 1. Quick Start

```bash
# Install dependencies
pnpm install

# Start the web app (http://localhost:5173)
cd apps/web && npx vite

# Start the API server (http://localhost:3001) — in another terminal
cd apps/api && npx tsx src/index.ts

# Type check all packages
pnpm -r typecheck

# Run all tests
pnpm -r test
```

**What you'll see:**
- Web: A PWA with Dashboard and Customer CRUD (list, create, edit, delete)
- API: A Hono server with `/sync/push`, `/sync/pull`, `/sync/health` endpoints
- All data is written to local IndexedDB first (offline-first), then synced in the background

---

## 2. Project Map

```
offline-first-starter/
│
├── packages/                          # Shared libraries (14 packages)
│   ├── core/                          # ⭐ HEART — Types, errors, registry, middleware, events
│   ├── db-adapter-dexie/              # IndexedDB adapter for web (Dexie.js)
│   ├── db-adapter-expo-sqlite/        # SQLite adapter for mobile (Expo)
│   ├── db-adapter-tauri-sql/          # SQLite adapter for desktop (Tauri)
│   ├── entity-customer/               # Example: Customer business module
│   ├── ui-core/                       # Design system components
│   ├── sync-engine/                   # Push/pull sync, conflict resolution, retry
│   ├── audit-trail/                   # Immutable audit log with SHA-256 chaining
│   ├── multi-tenant/                  # Tenant isolation middleware
│   ├── feature-flags/                 # Runtime feature toggles
│   ├── observability/                 # Structured logging, metrics, health
│   ├── codegen/                       # Entity scaffolding CLI
│   └── testing/                       # Shared test utilities (mocks, factories)
│
├── apps/                              # Deployable applications (4 targets)
│   ├── web/                           # React 19 + Vite 6 + Tailwind + PWA
│   ├── mobile/                        # Expo (iOS/Android)
│   ├── desktop/                       # Tauri v2 (Windows/Mac/Linux)
│   └── api/                           # Hono sync backend
│
├── e2e/                               # Playwright E2E tests
├── docs/                              # Documentation
└── .github/workflows/                 # CI/CD pipeline
```

### Key Package Relationships

```
@repo/core  (zero external deps — just zod)
  │
  ├──► @repo/entity-customer     (core + zod)
  ├──► @repo/db-adapter-dexie    (core + dexie + uuid)
  ├──► @repo/db-adapter-expo-sqlite (core + expo-sqlite)
  ├──► @repo/db-adapter-tauri-sql   (core + tauri-sql)
  ├──► @repo/sync-engine         (core + uuid)
  ├──► @repo/audit-trail         (core + uuid)
  ├──► @repo/multi-tenant        (core)
  ├──► @repo/observability       (core)
  └──► @repo/testing             (core + uuid)
```

All packages export from **source directly** (`"main": "./src/index.ts"`) — no build step needed during development. The `tsconfig.base.json` paths resolve `@repo/*` to source.

---

## 3. Core Architecture Patterns

### 3.1 Entity Registry Pattern

Every business module **self-registers** on import. The registry knows about all entities and auto-wires sync, RBAC, audit, and UI navigation.

```typescript
// packages/entity-customer/src/customer.entity.ts
import { EntityRegistry } from '@repo/core'

export const CustomerEntity = {
  name: 'customer',
  ui: { label: 'Customer', labelPlural: 'Customers', routePath: 'customers', /* ... */ },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true },
  rbac: { enabled: true, permissionPrefix: 'customer' },
  hooks: CustomerHooks,
  pagination: 'cursor',
  tenant: { enabled: true },
  softDelete: { enabled: true },
}

// Self-registers at module import time
EntityRegistry.register(CustomerEntity)
```

**Usage:** Simply importing the package registers the entity:
```typescript
import '@repo/entity-customer'  // Entity is now known to the framework
```

**Registry API:**
```typescript
EntityRegistry.get('customer')          // Get entity definition
EntityRegistry.has('customer')           // Check if registered
EntityRegistry.getAll()                  // All registered entities
EntityRegistry.getNavEntities()          // Entities for navigation (sorted)
EntityRegistry.getSyncEntities()         // Entities with sync enabled
```

### 3.2 Repository Pattern

All data access goes through a **6-method interface**. Business logic never touches the database directly.

```typescript
interface Repository<T extends BaseEntity> {
  findById(id: EntityId, options?: WriteOptions): Promise<T | null>
  findMany(query: QueryParams<T>, options?: WriteOptions): Promise<QueryResultType<T>>
  create(input: CreateInput<T>, options?: WriteOptions): Promise<T>
  update(id: EntityId, input: UpdateInput<T>, options?: WriteOptions): Promise<T>
  delete(id: EntityId, options?: WriteOptions): Promise<void>
  count(query: Pick<CursorQuery, 'filter' | 'search' | 'includeDeleted'>): Promise<number>
}
```

**Two pagination types:**
```typescript
// Cursor-based (recommended for large datasets — avoids offset drift)
type CursorQuery = { cursor?: string; limit: number; filter?: FilterRule[]; sort?: SortRule[]; search?: string }

// Offset-based (simpler, use for small datasets)
type OffsetQuery = { page: number; pageSize: number; filter?: FilterRule[]; sort?: SortRule[]; search?: string }
```

**Filter operators:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `contains`, `startsWith`, `endsWith`, `between`

### 3.3 Base Entity Shape

Every entity automatically gets these fields:

```typescript
interface BaseEntity {
  id: EntityId           // UUID v4
  tenantId: string       // Tenant isolation
  createdAt: number      // Auto-set on create
  updatedAt: number      // Auto-bumped on update
  deletedAt: number|null // Soft delete timestamp
  version: number        // Optimistic concurrency (bumped on every write)
  createdBy: string
  updatedBy: string
}
```

### 3.4 Middleware Pipeline

Every CRUD operation flows through a middleware chain. Middleware can inspect, modify, or abort operations.

```typescript
interface Middleware<T> {
  name: string
  beforeCreate?: (input, ctx) => Promise<Record<string, unknown>>
  afterCreate?: (result, ctx) => Promise<void>
  beforeUpdate?: (id, input, ctx) => Promise<Record<string, unknown>>
  afterUpdate?: (result, ctx) => Promise<void>
  beforeDelete?: (id, ctx) => Promise<void>
  afterDelete?: (result, ctx) => Promise<void>
  beforeRead?: (id, ctx) => Promise<void>
  afterRead?: (result, ctx) => Promise<T | null>
  beforeQuery?: (query, ctx) => Promise<Record<string, unknown>>
  afterQuery?: (results, ctx) => Promise<T[]>
  onError?: (error, ctx) => Promise<void>
}
```

### 3.5 Error Hierarchy (11 typed error classes)

```typescript
AppError (base)
├── ValidationError      // 400 — Zod validation failed
├── NotFoundError        // 404 — Entity not found
├── AuthError            // 401 — Not authenticated
├── ForbiddenError       // 403 — Not authorized
├── ConflictError        // 409 — Version conflict (optimistic concurrency)
├── SyncError            // 500 — Sync failure
├── DataIntegrityError   // 500 — Corrupt data
├── NetworkError         // 0 — Network request failed
├── TenantMismatchError  // 403 — Wrong tenant
├── DatabaseError        // 500 — DB operation failed
└── RateLimitError       // 429 — Rate limited
```

Every error has `.toJSON()` for structured API responses and optional `metadata` for debugging.

---

## 4. How Data Flows

### Offline-First Write Path

```
User fills form → Zod validation → Repository.create(input)
                                        │
                                        ▼
                              Write to IndexedDB (Dexie)
                                        │
                                        ▼
                              Write to Change Log (status: "pending")
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                        Online?              Offline?
                              │                   │
                              ▼                   ▼
                    Push to API via         Stay in change log
                    Sync Engine              (sync when online)
                              │
                              ▼
                    Mark change log as "synced"
```

### Sync Engine Path

```
Sync Engine (background polling every 30s when online)
  │
  ├── push() → POST /sync/push → Server applies changes → Returns results
  │     ├── Success → Mark change as "synced"
  │     ├── Conflict → Mark as "conflict", run conflict resolver
  │     └── Failure → Retry with exponential backoff, then dead letter queue
  │
  └── pull() → GET /sync/pull?since=<timestamp> → Get remote changes
        └── Apply changes locally (create/update/delete with conflict detection)
```

### Conflict Resolution Strategies

| Strategy | Behavior |
|---|---|
| `lww` (Last Writer Wins) | Latest timestamp wins — full entity overwrite |
| `per-field` | Merge field by field based on timestamps |
| `manual` | Flag for human review |
| `crdt` | Conflict-free replicated data type (future) |

---

## 5. How to Add a New Entity

Let's add an **Order** entity as an example.

### 5.1 Generate the Scaffold

```bash
pnpm codegen entity Order
```

If codegen isn't available yet, create the structure manually:

### 5.2 Create the Package

```
packages/entity-order/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Barrel exports + self-registration
│   ├── order.entity.ts             # Entity definition + EntityRegistry.register()
│   ├── order.schema.ts             # Zod schemas + TypeScript types
│   ├── order.service.ts            # Pure business logic (no I/O)
│   ├── order.policies.ts           # RBAC policies
│   ├── order.hooks.ts              # Lifecycle hooks
│   ├── order.ui.tsx                # UI configuration (columns, form fields, detail sections)
│   └── __tests__/
│       ├── order-schema.test.ts
│       ├── order-service.test.ts
│       └── order-policies.test.ts
```

### 5.3 package.json

```json
{
  "name": "@repo/entity-order",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@repo/core": "workspace:*",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

### 5.4 Schema (`order.schema.ts`)

```typescript
import { z } from 'zod'
import { createUpdateSchema, createQuerySchema } from '@repo/core'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  tenantId: string
  customerId: string
  customerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  notes?: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  version: number
  createdBy: string
  updatedBy: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
})

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])

export const CreateOrderSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  total: z.number().min(0),
  status: OrderStatusSchema.default('pending'),
  notes: z.string().max(2000).optional(),
})

export const UpdateOrderSchema = createUpdateSchema({
  customerId: z.string().min(1).optional(),
  customerName: z.string().min(1).optional(),
  items: z.array(OrderItemSchema).min(1).optional(),
  total: z.number().min(0).optional(),
  status: OrderStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
})

export const OrderQuerySchema = createQuerySchema({
  status: OrderStatusSchema.optional(),
  customerId: z.string().optional(),
})
```

### 5.5 Entity Definition (`order.entity.ts`)

```typescript
import { EntityRegistry } from '@repo/core'
import type { EntityDefinition } from '@repo/core'
import type { Order } from './order.schema'
import { OrderHooks } from './order.hooks'
import { OrderPolicies } from './order.policies'

export const OrderEntity: EntityDefinition<Order> = {
  name: 'order',
  ui: {
    label: 'Order',
    labelPlural: 'Orders',
    icon: 'ShoppingCart',
    routePath: 'orders',
    color: 'purple',
    showInNav: true,
    navOrder: 20,
  },
  sync: { enabled: true, conflictStrategy: 'lww', priority: 'normal' },
  audit: { enabled: true, excludeFields: ['version'] },
  rbac: { enabled: true, permissionPrefix: 'order' },
  hooks: OrderHooks,
  pagination: 'cursor',
  tenant: { enabled: true, field: 'tenantId' },
  softDelete: { enabled: true, field: 'deletedAt' },
}

// Self-register on import
EntityRegistry.register(OrderEntity)
```

### 5.6 Service (`order.service.ts`)

```typescript
import type { Order } from './order.schema'

export class OrderService {
  static calculateTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  static canShip(order: Order): { allowed: boolean; reason?: string } {
    if (order.status !== 'confirmed') {
      return { allowed: false, reason: 'Only confirmed orders can be shipped' }
    }
    if (order.items.length === 0) {
      return { allowed: false, reason: 'Order has no items' }
    }
    return { allowed: true }
  }

  static canCancel(order: Order): { allowed: boolean; reason?: string } {
    if (order.status === 'delivered') {
      return { allowed: false, reason: 'Delivered orders cannot be cancelled' }
    }
    if (order.status === 'cancelled') {
      return { allowed: false, reason: 'Order is already cancelled' }
    }
    return { allowed: true }
  }
}
```

### 5.7 Policies (`order.policies.ts`)

```typescript
import type { Policy, PolicyContext } from '@repo/entity-customer' // or define locally

export const OrderPolicies: Policy[] = [
  { effect: 'allow', action: '*', conditions: (ctx) => ctx.roles.includes('admin'), priority: 100 },
  { effect: 'allow', action: 'read', conditions: (ctx) => ctx.roles.includes('manager'), priority: 90 },
  { effect: 'allow', action: 'create', conditions: (ctx) => ctx.roles.includes('manager'), priority: 90 },
  { effect: 'allow', action: 'update', conditions: (ctx) => ctx.roles.includes('manager'), priority: 90 },
  { effect: 'deny', action: 'delete', priority: 50 },
  { effect: 'deny', action: 'bulk_import', priority: 50 },
]
```

### 5.8 Hooks (`order.hooks.ts`)

```typescript
import type { EntityHooks, HookContext, EntityId } from '@repo/core'
import type { Order } from './order.schema'
import { OrderService } from './order.service'

export const OrderHooks: EntityHooks<Order> = {
  beforeCreate: async (input, ctx) => {
    input.tenantId = ctx.tenantId
    input.createdBy = ctx.userId
    // Recalculate total to prevent tampering
    if (input.items) {
      input.total = OrderService.calculateTotal(input.items as any[])
    }
    return input
  },

  afterCreate: async (entity, ctx) => {
    console.log(`[OrderHook] Order ${entity.id} created by ${ctx.userId}`)
  },

  beforeUpdate: async (id, input, ctx) => {
    if (input.items) {
      input.total = OrderService.calculateTotal(input.items as any[])
    }
    return input
  },
}
```

### 5.9 Register with Dexie Schema

In `packages/db-adapter-dexie/src/index.ts`, add to the `OfflineDatabase` constructor:

```typescript
this.version(1).stores({
  // ...existing tables...
  order: 'id, tenantId, customerId, status, createdAt, updatedAt, deletedAt, [tenantId+deletedAt], [tenantId+status]',
})
```

> **Warning:** Dexie schema is defined upfront. For new entities in development, you may need to increment the version number or clear IndexedDB via DevTools > Application > Storage > IndexedDB > Clear.

### 5.10 Create Repository in the App

```typescript
// apps/web/src/lib/db.ts
import { createDexieRepository } from '@repo/db-dexie'
import type { Repository } from '@repo/core'
import type { Order } from '@repo/entity-order'
import '@repo/entity-order' // Registers Order entity

export const orderRepo: Repository<Order> = createDexieRepository<Order>('order')
```

### 5.11 Add Routes

```typescript
// apps/web/src/router.tsx
import { OrderListPage } from './routes/orders/index'
import { CreateOrderPage } from './routes/orders/new'
import { OrderDetailPage } from './routes/orders/$id'

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'orders',
  component: () => <Outlet />,
})

const ordersIndexRoute = createRoute({
  getParentRoute: () => ordersRoute,
  path: '/',
  component: OrderListPage,
})

const ordersNewRoute = createRoute({
  getParentRoute: () => ordersRoute,
  path: 'new',
  component: CreateOrderPage,
})

const orderDetailRoute = createRoute({
  getParentRoute: () => ordersRoute,
  path: '$id',
  component: OrderDetailPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  customersRoute.addChildren([/* ... */]),
  ordersRoute.addChildren([ordersIndexRoute, ordersNewRoute, orderDetailRoute]),
])
```

### 5.12 Build UI Pages

Follow the patterns in `apps/web/src/routes/customers/`:

- **List page** (`index.tsx`): Use `orderRepo.findMany()` with search, filter, pagination
- **Create page** (`new.tsx`): Form with Zod validation, calls `orderRepo.create(parsed)`
- **Detail page** (`$id.tsx`): View + edit mode, calls `orderRepo.findById()`, `orderRepo.update()`, `orderRepo.delete()`

---

## 6. How to Add a New DB Adapter

Create a new package `packages/db-adapter-xyz/` and implement the `Repository<T>` interface.

```typescript
// packages/db-adapter-xyz/src/index.ts
import type { Repository, BaseEntity, /* ... */ } from '@repo/core'

export function createXyzRepository<T extends BaseEntity>(
  entityName: string,
  options?: { /* adapter-specific options */ },
): Repository<T> {
  return {
    async findById(id) { /* ... */ },
    async findMany(query) { /* ... */ },
    async create(input) { /* ... */ },
    async update(id, input) { /* ... */ },
    async delete(id) { /* ... */ },
    async count(query) { /* ... */ },
  }
}
```

**Key considerations:**
- Implement optimistic concurrency (check `version` on update)
- Implement soft-delete (set `deletedAt` instead of hard delete)
- Write to a change log for sync (table named `changeLog` or equivalent)
- Support cursor and offset pagination
- Support all filter operators (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, `startsWith`, `between`)

### 6.1 Register the adapter package

Add `packages/db-adapter-xyz/` to the workspace (it's already included via `packages/*` glob), then:
```bash
pnpm install
```

---

## 7. How to Add Middleware

Create middleware functions that implement the `Middleware<T>` interface.

### Built-in Middleware

| Middleware | Package | Purpose |
|---|---|---|
| Tenant isolation | `@repo/multi-tenant` | Ensures all queries are scoped to user's tenant |
| Audit trail | `@repo/audit-trail` | Logs every mutation to immutable audit log |

### Custom Middleware Example: Rate Limiting

```typescript
// packages/core/src/middleware/rate-limiter.ts
import type { Middleware, MiddlewareContext } from './pipeline'

export function createRateLimitMiddleware(options: { maxRequests: number; windowMs: number }): Middleware {
  const requestCounts = new Map<string, { count: number; resetAt: number }>()

  return {
    name: 'rate-limiter',
    beforeCreate: async (input, ctx) => {
      const key = `${ctx.userId}:${ctx.operation}`
      const now = Date.now()
      const record = requestCounts.get(key)

      if (record && now < record.resetAt) {
        record.count++
        if (record.count > options.maxRequests) {
          throw new AppError('Rate limit exceeded', 'RATE_LIMIT_ERROR', 429)
        }
      } else {
        requestCounts.set(key, { count: 1, resetAt: now + options.windowMs })
      }

      return input
    },
    // ...same pattern for other operations
  }
}
```

### Using Middleware in an App

```typescript
import { MiddlewarePipeline } from '@repo/core'
import { createTenantMiddleware } from '@repo/multi-tenant'
import { createAuditMiddleware } from '@repo/audit-trail'

const pipeline = new MiddlewarePipeline()
pipeline.use(createTenantMiddleware('customer'))
pipeline.use(createAuditMiddleware('customer'))

// Use pipeline before/after operations
const modifiedInput = await pipeline.runBeforeCreate(input, ctx)
const result = await repo.create(modifiedInput)
await pipeline.runAfterCreate(result, ctx)
```

---

## 8. How to Use Feature Flags

```typescript
import { featureFlags } from '@repo/feature-flags'

// Define a flag (usually at app startup)
featureFlags.define({
  key: 'orders.bulk-export',
  description: 'Enable bulk export for orders',
  enabled: false,
  rules: [
    { target: 'environment', environments: ['development', 'staging'] },
    { target: 'tenant', values: ['enterprise-tenant'] },
  ],
  default: true, // Fallback if no rules apply
})

// Check at runtime
const context = { environment: 'development', tenantId: 'abc-123', userId: 'user-1' }
if (featureFlags.isEnabled('orders.bulk-export', context)) {
  renderExportButton()
}

// Toggle at runtime (e.g., from an admin panel)
featureFlags.setEnabled('orders.bulk-export', false)
```

**Flag targets:** `environment` | `tenant` | `user` | `percentage` | `always`

### Default flags already defined:

| Key | Purpose | Default |
|---|---|---|
| `sync.enabled` | Background sync | `true` |
| `sync.realtime` | WebSocket sync (dev/staging only) | `false` |
| `audit.enabled` | Audit trail | `true` |
| `export.csv` | CSV export | `true` |
| `export.pdf` | PDF export (enterprise tenants) | `false` |
| `multi-tenant` | Multi-tenancy features | `true` |
| `customer.bulk-import` | Bulk import (50% rollout) | `false` |
| `debug.error-details` | Detailed errors (dev only) | `false` |

---

## 9. How to Use Domain Events

```typescript
import { eventBus } from '@repo/core'

// Subscribe to a specific event type
const sub = eventBus.on('entity.created', async (event) => {
  if (event.entityType === 'order') {
    await sendOrderConfirmation(event.data.email as string, event.data.id as string)
  }
})

// Subscribe to ALL events (logging, analytics)
eventBus.onAny((event) => {
  console.log(`[Event] ${event.type}`, event.data)
})

// Subscribe by pattern
eventBus.onPattern(/^sync\./, async (event) => {
  metrics.increment(event.type, 1)
})

// Emit an event
await eventBus.emit('entity.created', {
  entityType: 'order',
  id: order.id,
  email: order.customerEmail,
  total: order.total,
}, { userId: 'user-1', tenantId: 'tenant-1' })

// Unsubscribe
sub.unsubscribe()
```

**Built-in event types:** `entity.created`, `entity.updated`, `entity.deleted`, `entity.restored`, `sync.started`, `sync.completed`, `sync.failed`, `sync.conflict`, `sync.conflict.resolved`, `auth.login`, `auth.logout`, `auth.session.expired`, `auth.session.refreshed`, `tenant.changed`, `system.error`, `system.warning`

---

## 10. Testing Patterns

### 10.1 Writing Unit Tests (Vitest)

```typescript
// packages/entity-order/src/__tests__/order-service.test.ts
import { describe, it, expect } from 'vitest'
import { OrderService } from '../order.service'
import type { Order } from '../order.schema'

describe('OrderService', () => {
  describe('calculateTotal', () => {
    it('should sum item totals', () => {
      const items = [
        { productId: 'p1', productName: 'Widget', quantity: 2, unitPrice: 10 },
        { productId: 'p2', productName: 'Gadget', quantity: 1, unitPrice: 25 },
      ]
      expect(OrderService.calculateTotal(items)).toBe(45)
    })

    it('should return 0 for empty items', () => {
      expect(OrderService.calculateTotal([])).toBe(0)
    })
  })

  describe('canShip', () => {
    it('should allow shipping confirmed orders', () => {
      const order = { status: 'confirmed', items: [{ quantity: 1 }] } as Order
      expect(OrderService.canShip(order).allowed).toBe(true)
    })

    it('should reject pending orders', () => {
      const order = { status: 'pending', items: [{ quantity: 1 }] } as Order
      expect(OrderService.canShip(order).allowed).toBe(false)
    })
  })
})
```

### 10.2 Using Mock Repositories

```typescript
import { createMockRepository, createMockBase } from '@repo/testing'

// Create a mock repository backed by an in-memory Map
const mockRepo = createMockRepository<Order>()

// Create test entities
const order = await mockRepo.create({
  customerId: 'c1',
  customerName: 'Test Corp',
  items: [{ productId: 'p1', productName: 'Widget', quantity: 1, unitPrice: 100 }],
  total: 100,
  status: 'pending',
  tenantId: 'test-tenant',
} as any)

// Query
const result = await mockRepo.findMany({ page: 1, pageSize: 10 })
expect(result.items).toHaveLength(1)

// Update with version check
const updated = await mockRepo.update(order.id, { status: 'confirmed', version: order.version } as any)
expect(updated.status).toBe('confirmed')
expect(updated.version).toBe(order.version + 1)
```

### 10.3 Testing Entity Registry

```typescript
describe('EntityRegistry', () => {
  it('should register and retrieve an entity', () => {
    const def = createMockEntityDef('Order')
    EntityRegistry.register(def)
    expect(EntityRegistry.get('Order')).toBeDefined()
    expect(EntityRegistry.has('Order')).toBe(true)
  })

  it('should return nav entities sorted by navOrder', () => {
    const all = EntityRegistry.getNavEntities()
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1]!.ui.navOrder! <= all[i]!.ui.navOrder!).toBe(true)
    }
  })
})
```

### 10.4 Testing with Events

```typescript
import { eventBus } from '@repo/core'

it('should emit event after create', async () => {
  const events: DomainEvent[] = []
  eventBus.on('entity.created', (event) => { events.push(event) })

  await repo.create(input)
  expect(events).toHaveLength(1)
  expect(events[0]!.entityType).toBe('customer')
})
```

---

## 11. UI Component System

All components are in `@repo/ui-core` and follow a consistent design with Tailwind CSS.

### 11.1 Available Primitives

| Component | Props | Usage |
|---|---|---|
| `Button` | `variant: 'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'outline'`, `size: 'sm' \| 'md' \| 'lg'`, `loading`, `icon` | Primary actions |
| `Input` | `label`, `error`, `helperText`, `placeholder`, `type` | Form inputs |
| `Badge` | `color: 'green' \| 'gray' \| 'yellow' \| 'red' \| 'blue' \| 'purple'`, `size: 'sm' \| 'md'` | Status indicators |
| `Card` | Wrapper with optional `CardHeader` (title, description, action) | Content containers |
| `Modal` | `open`, `onClose`, `title`, `description`, `size: 'sm' \| 'md' \| 'lg'`, `footer` | Confirmation dialogs |
| `ErrorBoundary` | `children`, `fallback` | Error catching |

### 11.2 Hooks

| Hook | Purpose |
|---|---|
| `useOnlineStatus()` | Returns `{ online: boolean }` — tracks navigator.onLine |

### 11.3 Utility Functions

```typescript
import { cn, formatTimestamp, formatCurrency, truncate, parseTags } from '@repo/ui-core'

cn('px-4 py-2', isActive && 'bg-blue-50') // Class merging (clsx + twMerge)
formatTimestamp(Date.now())                 // "Jan 15, 2026"
formatCurrency(1234.5)                      // "$1,234.50"
truncate('Long text...', 20)               // "Long text..."
parseTags('vip, enterprise')               // ['vip', 'enterprise']
```

### 11.4 Building a List Page Pattern

```typescript
export function EntityListPage() {
  const [items, setItems] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    repo.findMany({ page, pageSize: 20, search: search || undefined })
      .then((result) => {
        if ('items' in result) setItems(result.items as Entity[])
      })
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Entities" description={`${total} total`} action={<Link to="/new"><Button>Add</Button></Link>} />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <table>{/* ... */}</table>
        {/* Pagination controls */}
      </Card>
    </div>
  )
}
```

---

## 12. State Management

The app uses **Zustand** for client state and **TanStack Query** for server/cache state.

### 12.1 Zustand Stores (`apps/web/src/store/app.ts`)

```typescript
// Theme store (persisted to localStorage)
export const useThemeStore = create<ThemeState>()(
  persist((set) => ({
    theme: 'system',
    setTheme: (theme) => set({ theme }),
  }), { name: 'app-theme' })
)

// Sync status store (persisted)
export const useSyncStore = create<SyncState>()(
  persist((set) => ({
    pendingCount: 0,
    lastSyncAt: null,
    syncing: false,
    hasConflicts: false,
    setPendingCount: (count) => set({ pendingCount: count }),
  }), { name: 'app-sync' })
)

// App UI state
export const useAppStore = create<AppState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  currentTenant: 'default',
}))
```

### 12.2 TanStack Query Configuration

```typescript
// In apps/web/src/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 30,         // 30 minutes
      retry: 3,
      retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
      refetchOnWindowFocus: false,    // Offline-first: avoid unnecessary refetches
      refetchOnReconnect: true,
    },
  },
})
```

**Rule of thumb:** Use Zustand for UI-only state (theme, sidebar, sync indicator). Use direct Repository calls for entity data (TanStack Query can be added later for caching).

---

## 13. Working with the Sync Engine

### 13.1 How it Works

The `OfflineSyncEngine` in `packages/sync-engine/src/sync-engine.ts`:

1. **Pushes** local changes to the API
2. **Pulls** remote changes from the API
3. **Detects conflicts** using entity version numbers
4. **Resolves conflicts** using the configured strategy (LWW, per-field, manual, CRDT)
5. **Retries** with exponential backoff + jitter
6. **Dead letter queue** for permanently failed changes

### 13.2 Configuration

```typescript
const syncEngine = new OfflineSyncEngine({
  apiBaseUrl: 'http://localhost:3001',
  pollIntervalMs: 30000,                    // Check every 30s
  batchSize: 50,                            // Push/pull in batches of 50
  getAuthToken: async () => localStorage.getItem('token'),
  getEntityDefinitions: () => EntityRegistry.getSyncEntities(),
  changeLogRepo: /* Dexie repository for changeLog table */,
  getRepository: (entityName) => /* map of entityName → Repository */,
})
```

### 13.3 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sync/push` | Send local changes to server |
| `GET` | `/sync/pull?since=<timestamp>` | Get changes since timestamp |
| `GET` | `/sync/health` | Server health check |

### 13.4 Manual Conflict Resolution

```typescript
const conflicts = await syncEngine.getConflicts()
// Display in UI for user to choose
await syncEngine.resolveConflict(conflictId, 'local')   // Keep local version
await syncEngine.resolveConflict(conflictId, 'remote')  // Accept server version
await syncEngine.resolveConflict(conflictId, 'custom', { name: 'Merged Name' }) // Custom merge
```

### 13.5 Sync Status in UI

```typescript
import { useSyncStore } from '../store/app'
const { pendingCount, syncing, hasConflicts } = useSyncStore()

// Display in sidebar:
{!online && <OfflineIndicator />}
{pendingCount > 0 && <PendingChanges count={pendingCount} />}
{hasConflicts && <ConflictWarning />}
```

---

## 14. Common Development Tasks

| Task | Command |
|---|---|
| Start web app | `cd apps/web && npx vite` |
| Start API server | `cd apps/api && npx tsx src/index.ts` |
| Type check all packages | `pnpm -r typecheck` |
| Type check single package | `cd packages/core && pnpm typecheck` |
| Run all tests | `pnpm -r test` |
| Run single test suite | `cd packages/core && pnpm test` |
| Run tests in watch mode | `cd packages/core && npx vitest --watch` |
| Build all packages | `pnpm build` |
| Build single package | `cd packages/core && pnpm build` |
| Generate new entity | `pnpm codegen entity Order` |
| Lint all | `pnpm -r lint` |
| Format code | `pnpm format` |
| Clean all artifacts | `pnpm clean` |

### TypeScript Build Note

Some packages use TypeScript project references (`composite: true`). When you see errors like:
```
error TS6305: Output file '.../core/dist/index.d.ts' has not been built
```
Run the build for the dependency first:
```bash
cd packages/core && pnpm build
```

### Adding a New Package

1. Create directory `packages/your-package/`
2. Add `package.json` with `"@repo/your-package"` name
3. Add `tsconfig.json` extending `../../tsconfig.base.json`
4. Import it in the target app via workspace protocol:
   ```json
   "dependencies": { "@repo/your-package": "workspace:*" }
   ```
5. Add a Vite alias in `apps/web/vite.config.ts` if the app needs to resolve it
6. Run `pnpm install` at root

---

## 15. Package Dependency Map

```
@repo/core                    → zod (only dep)
  │
  ├── @repo/entity-customer   → @repo/core, zod
  ├── @repo/db-adapter-dexie  → @repo/core, dexie, uuid
  ├── @repo/db-adapter-expo-sqlite → @repo/core, expo-sqlite
  ├── @repo/db-adapter-tauri-sql   → @repo/core, @tauri-apps/plugin-sql
  ├── @repo/sync-engine       → @repo/core, uuid
  ├── @repo/audit-trail       → @repo/core, uuid
  ├── @repo/multi-tenant      → @repo/core
  ├── @repo/observability     → @repo/core
  └── @repo/testing           → @repo/core, uuid
  └── @repo/ui-core           → (standalone — react, tailwind)
  └── @repo/codegen           → (standalone CLI)

apps/web                      → @repo/core, @repo/db-adapter-dexie, @repo/ui-core,
  │                              @repo/entity-customer, react, vite, tailwindcss,
  │                              zustand, @tanstack/react-query, @tanstack/react-router,
  │                              lucide-react
  │
apps/api                      → @repo/core, hono, @hono/node-server, uuid, zod
apps/mobile                   → @repo/core, @repo/db-adapter-expo-sqlite, @repo/ui-core,
  │                              @repo/entity-customer, expo, react-native
  │
apps/desktop                  → @repo/core, @repo/db-adapter-tauri-sql, @repo/ui-core,
                                 @repo/entity-customer, @tauri-apps/api, react
```

---

## Appendix: File-by-File Reference

### Core Package (`packages/core/src/`)

| File | What it defines |
|---|---|
| `types/index.ts` | `BaseEntity`, query types, pagination, sync types |
| `errors/index.ts` | `AppError` + 11 subclasses |
| `entity/registry.ts` | `EntityRegistry` singleton, `EntityDefinition` interface |
| `repository/interface.ts` | `Repository<T>` interface (6 methods) |
| `sync/interface.ts` | `SyncEngine` interface, `PushResult`, `PullResult` |
| `auth/interface.ts` | `AuthProvider` interface, `Session`, login/register types |
| `middleware/pipeline.ts` | `MiddlewarePipeline`, `Middleware` interface |
| `event/bus.ts` | `eventBus` singleton, typed domain events |
| `validation/schema.ts` | Zod schema helpers (`emailSchema`, `createUpdateSchema`, etc.) |

### Entity Package (`packages/entity-customer/src/`)

| File | Purpose |
|---|---|
| `customer.entity.ts` | Entity definition + self-registration |
| `customer.schema.ts` | Zod schemas + TypeScript types |
| `customer.service.ts` | Pure business logic (no I/O) |
| `customer.policies.ts` | RBAC policies |
| `customer.hooks.ts` | Lifecycle hooks |
| `customer.ui.tsx` | UI config (columns, form fields, detail sections) |
| `index.ts` | Barrel exports |

---

> **Note:** This guide is a living document. When you add new features or patterns, update this file to keep it current for the next developer.
