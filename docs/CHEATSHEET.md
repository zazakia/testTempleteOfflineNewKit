# ⚡ Quick Reference Cheatsheet

> **One-page command & pattern reference for daily development.**
> Full guide: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

---

## Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Run all apps (Turborepo)
pnpm build                # Build all packages
pnpm -r typecheck         # TypeScript check all 17 packages
pnpm -r test              # Run all 161 tests
pnpm -r lint              # Lint everything
pnpm format               # Prettier format
pnpm clean                # Delete dist + node_modules
pnpm codegen entity <N>   # Scaffold a new entity
pnpm changeset            # Create a changeset for release
```

### Individual Apps

```bash
cd apps/web && npx vite              # Web: http://localhost:5173
cd apps/api && npx tsx src/index.ts  # API: http://localhost:3001
cd apps/mobile && npx expo start     # Mobile (Expo)
cd apps/desktop && pnpm tauri dev    # Desktop (Tauri)
```

### Single Package

```bash
cd packages/core && pnpm build       # Build just core
cd packages/core && pnpm test        # Test just core
cd packages/core && pnpm typecheck   # Type check just core
```

---

## Entity Quickstart (Add "Order")

| Step | File | Key Action |
|---|---|---|
| 1 | `packages/entity-order/package.json` | Create with `@repo/entity-order` name |
| 2 | `packages/entity-order/src/order.schema.ts` | Define Zod schemas + TS types |
| 3 | `packages/entity-order/src/order.entity.ts` | Define + register entity (`EntityRegistry.register()`) |
| 4 | `packages/entity-order/src/order.service.ts` | Pure business logic |
| 5 | `packages/entity-order/src/order.hooks.ts` | Lifecycle hooks |
| 6 | `packages/entity-order/src/order.policies.ts` | RBAC policies |
| 7 | `packages/entity-order/src/index.ts` | Barrel exports |
| 8 | `packages/db-adapter-dexie/src/index.ts` | Add Dexie table schema |
| 9 | `apps/web/src/lib/db.ts` | Create repository |
| 10 | `apps/web/src/router.tsx` | Add routes |
| 11 | `apps/web/src/routes/orders/*.tsx` | Build UI pages |

---

## Core Interface Signatures

```typescript
// Repository (6 methods)
Repository<T>.findById(id)                    → T | null
Repository<T>.findMany(query)                 → { items, nextCursor/total }
Repository<T>.create(input)                   → T (with auto id, createdAt, version)
Repository<T>.update(id, { ...fields, version }) → T
Repository<T>.delete(id)                      → void (soft delete)
Repository<T>.count({ filter, search })       → number

// Entity Definition
EntityDefinition = {
  name: string
  ui: EntityUIConfig             // label, icon, routePath, color, navOrder
  sync: EntitySyncConfig         // enabled, conflictStrategy, priority
  audit: EntityAuditConfig
  rbac: EntityRbacConfig
  hooks: EntityHooks<T>          // before/after CRUD
  pagination: 'cursor' | 'offset'
  tenant: { enabled, field? }
  softDelete: { enabled, field? }
}

// Create input (auto-fields omitted)
CreateInput<T> = Omit<T, 'id'|'createdAt'|'updatedAt'|'version'|'createdBy'|'updatedBy'|'deletedAt'>

// Update input (version required for concurrency)
UpdateInput<T> = Partial<Omit<T, 'id'|'createdAt'|'createdBy'>> & { version: number }
```

---

## Middleware

```typescript
// Available hooks
Middleware.beforeCreate(input, ctx)  → Promise<Record<string, unknown>>
Middleware.afterCreate(result, ctx)  → Promise<void>
Middleware.beforeUpdate(id, input, ctx) → Promise<Record<string, unknown>>
Middleware.afterUpdate(result, ctx)  → Promise<void>
Middleware.beforeDelete(id, ctx)     → Promise<void>
Middleware.afterDelete(result, ctx)  → Promise<void>
Middleware.beforeRead(id, ctx)       → Promise<void>
Middleware.afterRead(result, ctx)    → Promise<T | null>
Middleware.beforeQuery(query, ctx)   → Promise<Record<string, unknown>>
Middleware.afterQuery(results, ctx)  → Promise<T[]>
Middleware.onError(error, ctx)       → Promise<void>
```

---

## Error Classes

```
AppError → .code, .statusCode, .metadata, .toJSON()

ValidationError  (400) — Zod issues array
NotFoundError    (404) — entityType + id
AuthError        (401) — not authenticated
ForbiddenError   (403) — not authorized
ConflictError    (409) — version mismatch
SyncError        (500) — sync failure
DataIntegrityError(500) — corrupt data
NetworkError     (0)   — request failed
TenantMismatchError(403) — wrong tenant
DatabaseError    (500) — DB operation failed
RateLimitError   (429) — retryAfterMs
```

---

## Query Filters

```typescript
{ field: 'status', operator: 'eq', value: 'active' }
{ field: 'age', operator: 'gt', value: 18 }
{ field: 'name', operator: 'contains', value: 'john' }
{ field: 'id', operator: 'in', value: ['id1', 'id2'] }
{ field: 'price', operator: 'between', value: [10, 100] }
{ field: 'email', operator: 'startsWith', value: 'john' }
```

**Operators:** `eq` `neq` `gt` `gte` `lt` `lte` `in` `nin` `contains` `startsWith` `endsWith` `between`

---

## Zustand Stores

```typescript
useThemeStore    → { theme, setTheme, resolvedTheme }
useSyncStore     → { pendingCount, lastSyncAt, syncing, hasConflicts }
useAppStore      → { sidebarOpen, toggleSidebar, currentTenant }
```

---

## Feature Flags

```typescript
featureFlags.isEnabled(key, { environment, tenantId, userId })
featureFlags.setEnabled(key, true/false)
featureFlags.define({ key, description, enabled, rules?, default? })
```

---

## Domain Events

```typescript
eventBus.on('entity.created', handler)         // Subscribe
eventBus.onAny(handler)                         // Subscribe to all
eventBus.onPattern(/^sync\./, handler)          // Pattern match
eventBus.emit('entity.created', data, metadata) // Publish
subscription.unsubscribe()                      // Remove listener
```

---

## UI Components (`@repo/ui-core`)

```tsx
<Button variant="primary|secondary|danger|ghost|outline" size="sm|md|lg" loading icon>
<Input label error helperText placeholder type>
<Badge color="green|gray|yellow|red|blue|purple" size="sm|md">
<Card><CardHeader title description action />{children}</Card>
<Modal open onClose title description size footer>
<ErrorBoundary>{children}</ErrorBoundary>
```

**Hooks:** `useOnlineStatus()` → `{ online: boolean }`  
**Utils:** `cn()` `formatTimestamp()` `formatCurrency()` `truncate()` `parseTags()`

---

## Offline/Sync Lifecycle

```
Online  → Poll every 30s → Push local changes → Pull remote changes → Merge
Offline → Queue changes in change log → Resume on reconnect
Conflict → LWW | per-field | manual | CRDT
Failure  → Retry (exponential backoff) → Dead letter queue (admin review)
```

---

## TypeScript Build Fixes

When you see `TS6305: Output file .../dist/index.d.ts has not been built`:

```bash
cd packages/<dependency> && pnpm build
# Then retry your typecheck/build
```

This happens because TypeScript project references (`composite: true`) need declaration files from dependencies.
