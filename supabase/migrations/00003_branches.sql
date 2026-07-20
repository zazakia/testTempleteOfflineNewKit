-- ============================================================
-- CoopERP: Migration 00003 — Multi-Branch Support
-- Adds branches table and branch_id to core entities
-- ============================================================

-- ─── Branches Table ─────────────────────────────────────────
create table if not exists branches (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_code text not null,
  name text not null,
  address text,
  barangay text,
  city_municipality text,
  province text,
  phone text,
  email text,
  manager_name text,
  is_main_branch boolean default false,
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  opened_date timestamptz,
  notes text,
  coordinates text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_branches_tenant on branches(tenant_id) where deleted_at is null;
create index if not exists idx_branches_code on branches(tenant_id, branch_code) where deleted_at is null;
create unique index if not exists idx_branches_code_unique on branches(tenant_id, branch_code) where deleted_at is null;

-- Enable RLS
alter table branches enable row level security;

-- ─── Add branch_id to core entities (optional, non-breaking) ─
-- Members
alter table members add column if not exists branch_id text references branches(id);
create index if not exists idx_members_branch on members(tenant_id, branch_id) where deleted_at is null;

-- Loans
alter table loans add column if not exists branch_id text references branches(id);
create index if not exists idx_loans_branch on loans(tenant_id, branch_id) where deleted_at is null;

-- Savings Accounts
alter table savings_accounts add column if not exists branch_id text references branches(id);
create index if not exists idx_savings_branch on savings_accounts(tenant_id, branch_id) where deleted_at is null;

-- Payments (inherit branch from loan or collector)
alter table payments add column if not exists branch_id text references branches(id);
create index if not exists idx_payments_branch on payments(tenant_id, branch_id) where deleted_at is null;

-- Collectors
alter table collectors add column if not exists branch_id text references branches(id);

-- Areas
alter table areas add column if not exists branch_id text references branches(id);

-- Journal Entries (for branch-level financial reporting)
alter table journal_entries add column if not exists branch_id text references branches(id);

-- ─── Default Main Branch for existing tenants ───────────────
-- Creates a "Main Office" branch for tenants that don't have one yet
insert into branches (tenant_id, branch_code, name, is_main_branch, status)
select
  t.id as tenant_id,
  upper(left(t.slug, 4)) || '-MAIN' as branch_code,
  t.name || ' — Main Office' as name,
  true as is_main_branch,
  'active' as status
from tenants t
where not exists (
  select 1 from branches b where b.tenant_id = t.id
);
