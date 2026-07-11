# 🏢 Offline-First Business App Starter Kit

Enterprise-grade starter kit for building offline-first business applications that run on **web (PWA)**, **mobile (iOS/Android)**, and **desktop (Windows/Mac/Linux)**.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Monorepo (Turborepo + pnpm)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────┐  │
│  │   Web    │  │  Mobile  │  │ Desktop  │  │ API │  │
│  │ (React)  │  │  (Expo)  │  │ (Tauri)  │  │(Hono)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──┬──┘  │
│       └──────────────┼──────────────┘          │      │
│                      ▼                         │      │
│          ┌──────────────────────┐              │      │
│          │    packages/core     │ ◄────────────┘      │
│          │ (interfaces, types,  │                     │
│          │  registry, errors)   │                     │
│          └──────────────────────┘                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ DbAdapter│  │  Entity  │  │    UI Core       │    │
│  │ (Dexie)  │  │(Customer)│  │(Components/Hooks)│    │
│  └──────────┘  └──────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Features

- **Offline-First**: All data written to local DB first, synced in background
- **Cross-Platform**: Same business logic on web, mobile, desktop
- **Entity Registry**: Self-registering business modules
- **Repository Pattern**: Swap databases without touching logic
- **Middleware Pipeline**: Validation, auth, audit, tenant isolation
- **Pluggable Sync**: LWW, CRDT, or custom conflict resolution
- **Enterprise Ready**: RBAC with policies, audit trail, multi-tenancy
- **Typed Errors**: Full error hierarchy with structured metadata

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173 in your browser.

## Documentation

| Document | Description |
|---|---|
| **[📘 Developer Guide](docs/DEVELOPER_GUIDE.md)** | Complete guide: architecture, adding entities, middleware, testing, sync engine, UI components |
| **[⚡ Cheatsheet](docs/CHEATSHEET.md)** | One-page quick reference for commands, interfaces, patterns |
| **[📋 PRD](docs/PRD.md)** | Product requirements, feature breakdown, tech stack, roadmap |
| **[📐 Architecture](docs/architecture.md)** | High-level architecture overview |
| **[🚀 Deployment](docs/DEPLOYMENT.md)** | Deploy to Netlify, Cloudflare, Vercel, or Docker |
| **[📝 PLAN](docs/PLAN.md)** | Implementation plan across all 5 phases |
| **[📌 ADR-001](docs/adr/001-use-turborepo.md)** | Decision: Turborepo + pnpm |
| **[📌 ADR-002](docs/adr/002-repository-pattern.md)** | Decision: Repository pattern for data access |

## Project Structure

```
packages/
├── core/                   # Interfaces, types, registry, middleware, events
├── db-adapter-dexie/       # IndexedDB adapter (web)
├── db-adapter-expo-sqlite/ # SQLite adapter (mobile)
├── db-adapter-tauri-sql/   # SQLite adapter (desktop)
├── entity-customer/        # Customer business module (example)
├── ui-core/                # Design system components
├── sync-engine/            # Push/pull sync, conflict resolution, retry
├── audit-trail/            # Immutable audit log
├── multi-tenant/           # Tenant isolation
├── feature-flags/          # Runtime feature toggles
├── observability/          # Logging, metrics, health
├── codegen/                # Entity scaffolding CLI
└── testing/                # Shared test utilities

apps/
├── web/                    # React 19 + Vite 6 + PWA
├── mobile/                 # Expo (iOS/Android)
├── desktop/                # Tauri v2 (Win/Mac/Linux)
└── api/                    # Hono sync backend
```

## Adding a New Entity

```bash
# 1. Generate the scaffold
pnpm codegen entity Order

# 2. Add repository in apps/web/src/lib/db.ts
# 3. Add routes in apps/web/src/router.tsx
# 4. Build your UI pages
```

For a detailed walkthrough, see the **[Developer Guide → Adding a New Entity](docs/DEVELOPER_GUIDE.md#5-how-to-add-a-new-entity)**.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm |
| Language | TypeScript 5.x (strict mode) |
| Web | React 19 + Vite 6 + Tailwind CSS 3.4 |
| Mobile | Expo 52 (iOS/Android) |
| Desktop | Tauri v2 (Win/Mac/Linux) |
| Local DB (Web) | Dexie.js 4.x (IndexedDB) |
| Local DB (Mobile) | expo-sqlite 14.x |
| Local DB (Desktop) | @tauri-apps/plugin-sql 2.x |
| API Server | Hono 4.x |
| Validation | Zod 3.23 |
| Client State | Zustand 5.x |
| Server State | TanStack Query 5.x |
| Routing | TanStack Router 1.x |
| PWA | vite-plugin-pwa + Workbox |
| UI | Custom design system (6+ primitives) |
