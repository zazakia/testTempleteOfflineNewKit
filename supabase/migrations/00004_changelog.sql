-- ============================================================
-- CoopERP: Migration 00004 — Changelog / Roadmap Module
-- Tracks every update, feature, and change in the app lifecycle
-- ============================================================

-- ─── Changelog Entries Table ─────────────────────────────────
create table if not exists changelog_entries (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,

  -- Core metadata
  release_version text not null,
  title text not null,
  category text not null check (
    category in ('feature','enhancement','bugfix','breaking','infrastructure','security','performance','documentation','deprecation')
  ),
  status text not null default 'planned' check (
    status in ('planned','in-progress','released','rolled-back','cancelled')
  ),

  -- Detailed content
  description text not null,
  purpose text not null,
  impact_notes text,

  -- Module / platform tracking
  affected_platforms text[] default '{all}',
  affected_modules jsonb default '[]',

  -- Metadata
  released_at timestamptz not null,
  author text not null,
  contributors text[],
  related_links text[],
  is_breaking boolean default false,
  migration_required boolean default false,
  migration_notes text,
  tags text[] default '{}',

  -- Base
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version_num int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

-- Indexes
create index if not exists idx_changelog_tenant on changelog_entries(tenant_id) where deleted_at is null;
create index if not exists idx_changelog_version on changelog_entries(tenant_id, release_version) where deleted_at is null;
create index if not exists idx_changelog_category on changelog_entries(tenant_id, category) where deleted_at is null;
create index if not exists idx_changelog_status on changelog_entries(tenant_id, status) where deleted_at is null;
create index if not exists idx_changelog_date on changelog_entries(tenant_id, released_at desc) where deleted_at is null;
create index if not exists idx_changelog_tags on changelog_entries using gin(tags) where deleted_at is null;
create index if not exists idx_changelog_breaking on changelog_entries(tenant_id, is_breaking) where deleted_at is null and is_breaking = true;

-- Unique constraint: one version entry per tenant (one changelog per version)
create unique index if not exists idx_changelog_version_unique
  on changelog_entries(tenant_id, release_version) where deleted_at is null;

-- RLS
alter table changelog_entries enable row level security;

-- ─── Seed Data: Initial Release ─────────────────────────────
insert into changelog_entries (
  tenant_id, release_version, title, category, status,
  description, purpose,
  affected_platforms, affected_modules,
  released_at, author, tags
) values (
  'default',
  '1.0.0',
  'Initial Release — Cooperative ERP Platform',
  'feature',
  'released',
  'Initial release of the Cooperative ERP platform with core modules:
- Member management with full CRUD and search
- Share capital tracking with transaction history
- Savings accounts with deposit/withdrawal support
- Loan management with products, applications, schedules, and payments
- Double-entry accounting with chart of accounts and journal entries
- Collection management with collectors, groups, and remittances
- Offline-first architecture with automatic sync to Supabase
- Multi-tenant data isolation with Row-Level Security
- Role-based access control (RBAC)
- Audit trail for all data mutations',
  'Provide a comprehensive, offline-first cooperative management system that works in areas with intermittent internet connectivity. Built for Philippine cooperatives with standard regulatory requirements.',
  '{all}',
  '[
    {"name":"@repo/core","changeType":"added","note":"Core types, errors, validation, middleware pipeline, event bus"},
    {"name":"@repo/sync-engine","changeType":"added","note":"Offline-first sync with push/pull, conflict resolution, dead letter queue"},
    {"name":"@repo/db-adapter-dexie","changeType":"added","note":"IndexedDB adapter for browser offline storage"},
    {"name":"@repo/multi-tenant","changeType":"added","note":"Tenant isolation, metadata store, metadata resolver"},
    {"name":"@repo/audit-trail","changeType":"added","note":"Immutable audit logging for all mutations"},
    {"name":"@repo/feature-flags","changeType":"added","note":"Runtime feature toggles per environment/tenant/user"},
    {"name":"@repo/entity-member","changeType":"added","note":"Member entity with demographics, status tracking"},
    {"name":"@repo/entity-share-capital","changeType":"added","note":"Share capital subscriptions, redemptions, transfers"},
    {"name":"@repo/entity-savings","changeType":"added","note":"Savings accounts with deposits and withdrawals"},
    {"name":"@repo/entity-loan","changeType":"added","note":"Loan products, applications, payment schedules, payments"},
    {"name":"@repo/entity-accounting","changeType":"added","note":"Chart of accounts, journal entries, double-entry ledger"},
    {"name":"@repo/entity-collection","changeType":"added","note":"Collector management, group collections, remittances"},
    {"name":"apps/web","changeType":"added","note":"Vite + React 19 PWA with offline support"},
    {"name":"apps/mobile","changeType":"added","note":"Expo React Native mobile app"},
    {"name":"apps/desktop","changeType":"added","note":"Tauri desktop application"}
  ]',
  '2025-07-01T00:00:00Z',
  'dev-team',
  '{cooperative,erp,offline-first,initial-release}'
)
on conflict (tenant_id, release_version) where deleted_at is null do nothing;
