-- ============================================================
-- CoopERP: Supabase Schema Migration
-- Multi-tenant cooperative ERP with offline-first sync
-- Run: supabase db push OR supabase migration up
-- ============================================================

-- ─── Enable Extensions ──────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Tenant Table ───────────────────────────────────────────
create table if not exists tenants (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free','pro','enterprise')),
  features text[] default '{basic}',
  settings jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Tenant Metadata (JSONB customization per tenant) ───────
create table if not exists tenant_metadata (
  tenant_id text primary key references tenants(id) on delete cascade,
  metadata jsonb not null default '{}',
  version int not null default 1,
  updated_at timestamptz not null default now()
);

-- ─── Members ────────────────────────────────────────────────
create table if not exists members (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  membership_number text,
  membership_status text not null default 'active',
  membership_type text default 'regular',
  first_name text,
  middle_name text,
  last_name text,
  full_name text generated always as (trim(coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''))) stored,
  gender text,
  civil_status text,
  date_of_birth date,
  phone text,
  email text,
  address text,
  barangay text,
  city_municipality text,
  province text,
  share_capital_balance numeric(12,2) default 0,
  savings_balance numeric(12,2) default 0,
  collector_id text,
  area_id text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);
create index if not exists idx_members_tenant on members(tenant_id) where deleted_at is null;
create index if not exists idx_members_number on members(membership_number) where deleted_at is null;
create unique index if not exists idx_members_number_unique on members(tenant_id, membership_number) where deleted_at is null and membership_number is not null;

-- ─── Share Capital Transactions ─────────────────────────────
create table if not exists share_capital_transactions (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  member_id text not null references members(id),
  transaction_type text not null check (transaction_type in ('subscription','redemption','transfer')),
  share_type text,
  date timestamptz not null default now(),
  account_code text,
  amount numeric(12,2) not null,
  running_balance_shares numeric(12,2),
  running_balance_amount numeric(12,2),
  reference_number text,
  recorded_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_sc_member on share_capital_transactions(tenant_id, member_id) where deleted_at is null;

-- ─── Savings Accounts ───────────────────────────────────────
create table if not exists savings_accounts (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  member_id text not null references members(id),
  account_type text not null default 'regular',
  account_number text,
  balance numeric(12,2) not null default 0,
  interest_rate numeric(5,4) default 0.04,
  status text default 'active',
  opened_date timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int default 1, created_by text default 'system', updated_by text default 'system'
);

create table if not exists savings_transactions (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  savings_account_id text references savings_accounts(id),
  member_id text not null references members(id),
  type text not null check (type in ('deposit','withdrawal','interest')),
  amount numeric(12,2) not null,
  date timestamptz not null default now(),
  reference_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_st_member on savings_transactions(tenant_id, member_id) where deleted_at is null;

-- ─── Loan Products ──────────────────────────────────────────
create table if not exists loan_products (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  product_type text,
  label text not null,
  is_active boolean default true,
  default_rate_percent numeric(5,2),
  default_term int,
  default_frequency text default 'monthly',
  sort_order int default 0,
  default_processing_fee_rate numeric(5,2),
  default_processing_fee_flat numeric(12,2),
  default_notarial_fee numeric(12,2),
  notarial_fee_threshold numeric(12,2),
  notarial_fee_above_threshold numeric(12,2),
  default_savings_per_payment numeric(12,2),
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);

-- ─── Loans ──────────────────────────────────────────────────
create table if not exists loans (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  borrower_id text not null references members(id),
  loan_number text,
  loan_type text,
  principal_amount numeric(12,2) not null,
  interest_rate numeric(5,2),
  interest_type text default 'diminishing',
  term int not null,
  term_unit text default 'months',
  frequency text default 'monthly',
  total_amount numeric(12,2),
  installment_amount numeric(12,2),
  release_date timestamptz,
  first_payment_date timestamptz,
  maturity_date timestamptz,
  status text not null default 'pending',
  collector_id text,
  is_delinquent boolean default false,
  delinquent_since timestamptz,
  dpd int default 0,
  aging_bucket text,
  encoded_by text,
  approved_by text,
  approved_at timestamptz,
  notes text,
  is_reloan boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_loans_borrower on loans(tenant_id, borrower_id) where deleted_at is null;
create index idx_loans_status on loans(tenant_id, status) where deleted_at is null;
create index idx_loans_collector on loans(tenant_id, collector_id) where deleted_at is null and collector_id is not null;

-- ─── Loan Applications ──────────────────────────────────────
create table if not exists loan_applications (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  borrower_id text not null references members(id),
  product_id text references loan_products(id),
  amount_applied numeric(12,2) not null,
  amount_approved numeric(12,2),
  purpose text,
  application_date timestamptz default now(),
  status text default 'draft',
  approved_by text,
  approved_at timestamptz,
  notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);

-- ─── Payment Schedules ──────────────────────────────────────
create table if not exists payment_schedules (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  loan_id text not null references loans(id) on delete cascade,
  due_date timestamptz not null,
  scheduled_amount numeric(12,2) not null,
  principal_amount numeric(12,2),
  interest_amount numeric(12,2),
  fees_amount numeric(12,2) default 0,
  status text default 'pending',
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_ps_loan on payment_schedules(tenant_id, loan_id) where deleted_at is null;

-- ─── Payments ───────────────────────────────────────────────
create table if not exists payments (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  loan_id text not null references loans(id),
  borrower_id text not null references members(id),
  schedule_id text references payment_schedules(id),
  collector_id text,
  amount numeric(12,2) not null,
  payment_date timestamptz not null default now(),
  payment_type text default 'regular',
  receipt_number text,
  notes text,
  encoded_at timestamptz default now(),
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_pm_loan on payments(tenant_id, loan_id) where deleted_at is null;
create index idx_pm_borrower on payments(tenant_id, borrower_id) where deleted_at is null;

-- ─── Chart of Accounts ──────────────────────────────────────
create table if not exists chart_of_accounts (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  code text not null,
  name text not null,
  account_type text not null check (account_type in ('asset','liability','equity','revenue','expense')),
  normal_balance text not null check (normal_balance in ('debit','credit')),
  parent_code text,
  is_header boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1
);
create index idx_coa_type on chart_of_accounts(tenant_id, account_type) where deleted_at is null;
create unique index idx_coa_code on chart_of_accounts(tenant_id, code) where deleted_at is null;

-- ─── Journal Entries ────────────────────────────────────────
create table if not exists journal_entries (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  entry_date timestamptz not null default now(),
  reference_number text,
  description text,
  entry_type text default 'manual',
  source_table text,
  source_id text,
  posted_by text,
  is_posted boolean default false,
  total_debit numeric(12,2) default 0,
  total_credit numeric(12,2) default 0,
  fiscal_year int,
  fiscal_month int,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_je_date on journal_entries(tenant_id, entry_date) where deleted_at is null;

create table if not exists journal_entry_lines (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  journal_entry_id text not null references journal_entries(id) on delete cascade,
  account_code text not null,
  account_name text,
  debit_amount numeric(12,2) default 0,
  credit_amount numeric(12,2) default 0,
  description text,
  business_unit_id text,
  module_source_table text,
  module_source_id text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index idx_jel_entry on journal_entry_lines(journal_entry_id);

-- ─── Collectors & Collections ───────────────────────────────
create table if not exists collectors (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  full_name text not null,
  auth_id text,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1
);

create table if not exists areas (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  name text not null,
  code text,
  parent_area_id text references areas(id),
  is_active boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1
);

create table if not exists remittances (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  collector_id text not null references collectors(id),
  amount numeric(12,2) not null,
  remittance_date timestamptz not null default now(),
  status text default 'pending',
  approved_by text,
  notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);

-- ─── Change Log (for sync) ──────────────────────────────────
create table if not exists change_log (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  entity_type text not null,
  entity_id text not null,
  operation text not null check (operation in ('create','update','delete')),
  data jsonb not null,
  previous_data jsonb,
  timestamp timestamptz not null default now(),
  client_id text not null,
  performed_by text not null default 'system',
  status text not null default 'pending',
  error_message text,
  retry_count int default 0,
  server_version int
);
create index idx_cl_tenant_time on change_log(tenant_id, timestamp desc);
create index idx_cl_entity on change_log(entity_type, entity_id);

-- ─── Audit Trail (immutable) ────────────────────────────────
create table if not exists audit_entries (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  entity_type text not null,
  entity_id text not null,
  action text not null check (action in ('create','update','delete','sync','export','restore')),
  performed_by text not null,
  performed_at timestamptz not null default now(),
  previous_values jsonb,
  new_values jsonb,
  metadata jsonb default '{}',
  previous_hash text,
  hash text
);
create index idx_audit_entity on audit_entries(tenant_id, entity_type, entity_id);
create index idx_audit_time on audit_entries(tenant_id, performed_at desc);

-- ─── Sync Queue ─────────────────────────────────────────────
create table if not exists sync_queue (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  entity_type text not null,
  entity_id text not null,
  operation text not null,
  payload jsonb not null,
  status text default 'pending',
  created_at timestamptz default now(),
  processed_at timestamptz,
  error text
);

-- ============================================================
-- Row Level Security (Tenant Isolation)
-- ============================================================
alter table tenants enable row level security;
alter table tenant_metadata enable row level security;
alter table members enable row level security;
alter table share_capital_transactions enable row level security;
alter table savings_accounts enable row level security;
alter table savings_transactions enable row level security;
alter table loan_products enable row level security;
alter table loans enable row level security;
alter table loan_applications enable row level security;
alter table payment_schedules enable row level security;
alter table payments enable row level security;
alter table chart_of_accounts enable row level security;
alter table journal_entries enable row level security;
alter table journal_entry_lines enable row level security;
alter table collectors enable row level security;
alter table areas enable row level security;
alter table remittances enable row level security;
alter table change_log enable row level security;
alter table audit_entries enable row level security;
alter table sync_queue enable row level security;

-- Generic RLS policy: user can only see their tenant's data
-- In production, use auth.uid() and a user_tenants mapping table
create or replace function current_tenant_id() returns text as $$
begin
  return coalesce(
    current_setting('request.jwt.claims', true)::jsonb->>'tenant_id',
    'default'
  );
end;
$$ language plpgsql stable;

-- Apply to all tenant-scoped tables
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename not in ('tenants')
      and exists (
        select 1 from information_schema.columns
        where table_name = tablename and column_name = 'tenant_id'
      )
  loop
    execute format(
      'create policy "tenant_isolation" on %I for all using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())',
      t
    );
  end loop;
end;
$$;

-- ============================================================
-- Seed Data: Default Tenant + Chart of Accounts
-- ============================================================
insert into tenants (id, name, slug, plan) values ('default', 'Default Cooperative', 'default', 'enterprise')
on conflict (id) do nothing;

insert into tenant_metadata (tenant_id, metadata) values ('default', '{
  "loan": {
    "interestFormulas": {
      "declining_balance": {"rateMultiplier": 1.0, "roundingMode": "nearest_cent"},
      "flat_rate": {"rateMultiplier": 1.2, "roundingMode": "nearest_cent"}
    },
    "maxTermMonths": 60, "minAmount": 1000, "maxAmount": 500000, "maxActiveLoans": 3
  },
  "savings": {"interestRate": 0.04, "compoundingFrequency": "monthly", "minBalance": 500, "withdrawalFee": 0},
  "approvalWorkflows": {
    "loan": {"steps": [
      {"role": "loan_encoder", "action": "encode"},
      {"role": "manager", "action": "approve", "minAmount": 50000}
    ]}
  }
}')
on conflict (tenant_id) do nothing;

-- Standard Philippine cooperative chart of accounts
insert into chart_of_accounts (tenant_id, code, name, account_type, normal_balance, sort_order) values
('default','1000','Cash on Hand','asset','debit',1),
('default','1010','Cash in Bank','asset','debit',2),
('default','1100','Loans Receivable - Current','asset','debit',3),
('default','1110','Loans Receivable - Past Due','asset','debit',4),
('default','1120','Allowance for Probable Losses','asset','credit',5),
('default','1200','Furniture and Equipment','asset','debit',6),
('default','1210','Accumulated Depreciation','asset','credit',7),
('default','2000','Share Capital','equity','credit',10),
('default','2010','Statutory Reserve Fund','equity','credit',11),
('default','2020','Education & Training Fund','equity','credit',12),
('default','2030','Community Development Fund','equity','credit',13),
('default','2040','Optional Fund','equity','credit',14),
('default','3000','Savings Deposits','liability','credit',20),
('default','3010','Time Deposits','liability','credit',21),
('default','3100','Accounts Payable','liability','credit',22),
('default','4000','Interest Income - Loans','revenue','credit',30),
('default','4010','Service Fees','revenue','credit',31),
('default','4020','Membership Fees','revenue','credit',32),
('default','5000','Salaries and Wages','expense','debit',40),
('default','5010','Office Supplies','expense','debit',41),
('default','5020','Utilities','expense','debit',42),
('default','5030','Transportation','expense','debit',43),
('default','5040','Provision for Probable Losses','expense','debit',44)
on conflict (tenant_id, code) do nothing;
-- ============================================================
-- Sync Entities Table — Generic entity storage for sync API
-- Stores entities by ID with versioning, supports soft-delete
-- ============================================================

create table if not exists sync_entities (
  id text primary key,
  tenant_id text not null references tenants(id) on delete cascade,
  entity_type text not null,
  data jsonb not null default '{}',
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_sync_entities_tenant_type
  on sync_entities(tenant_id, entity_type) where deleted_at is null;
create index if not exists idx_sync_entities_updated
  on sync_entities(tenant_id, updated_at desc);

-- Enable RLS
alter table sync_entities enable row level security;

-- RLS: isolate by tenant
create policy "tenant_isolation" on sync_entities
  for all
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());
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
-- ============================================================
-- CoopERP: Migration 00005 — Sync Production Hardening
-- Fixes all 7 gaps for production-ready offline sync:
--  1. Proper change_log columns (client_id, changed_fields)
--  2. ExcludeFields support (enforced client-side)
--  3. Server-side financial validation (enforced in API)
--  4. Client-aware pull (excludeClient param)
--  5. Delta sync (changed_fields column)
--  6. Wired sync_queue for async processing
--  7. Real-time sync (Postgres LISTEN/NOTIFY via Supabase Realtime)
-- ============================================================

-- ─── Gap 1 & 5: Add client_id + changed_fields to change_log ─
do $$
begin
  if not exists (select 1 from information_schema.columns
    where table_name = 'change_log' and column_name = 'client_id') then
    alter table change_log add column client_id text not null default 'legacy';
  end if;

  if not exists (select 1 from information_schema.columns
    where table_name = 'change_log' and column_name = 'changed_fields') then
    alter table change_log add column changed_fields text[];
  end if;
end;
$$;

-- Add index on client_id for Gap 4 (excludeClient pull queries)
create index if not exists idx_cl_client on change_log(tenant_id, client_id, timestamp desc);

-- ─── Gap 6: Wire sync_queue properly ───────────────────────

-- Ensure sync_queue has client_id
do $$
begin
  if not exists (select 1 from information_schema.columns
    where table_name = 'sync_queue' and column_name = 'client_id') then
    alter table sync_queue add column client_id text not null default 'legacy';
  end if;
end;
$$;

-- Add indexes for efficient queue processing
create index if not exists idx_sq_status on sync_queue(tenant_id, status, created_at);
create index if not exists idx_sq_client on sync_queue(tenant_id, client_id);

-- Create a function to process the sync queue (called by cron or trigger)
create or replace function process_sync_queue_batch(batch_size int default 100)
returns table(processed int, failed int) as $$
declare
  job record;
  processed_count int := 0;
  failed_count int := 0;
begin
  for job in
    select * from sync_queue
    where status = 'pending'
    order by created_at asc
    limit batch_size
    for update skip locked
  loop
    begin
      update sync_queue
      set status = 'processing', processed_at = now()
      where id = job.id;

      -- Append to change_log for pull replication
      insert into change_log (
        id, tenant_id, entity_type, entity_id, operation,
        data, previous_data, changed_fields,
        timestamp, client_id, performed_by, status
      ) values (
        job.id, job.tenant_id, job.entity_type, job.entity_id, job.operation,
        coalesce(job.payload->>'data', '{}')::jsonb,
        job.payload->'previousData',
        case when job.payload ? 'changedFields'
          then (select array(select jsonb_array_elements_text(job.payload->'changedFields')))
          else null
        end,
        now(), job.client_id, 'system', 'synced'
      )
      on conflict (id) do nothing;

      -- Mark as completed
      update sync_queue
      set status = 'completed', processed_at = now(), error = null
      where id = job.id;

      processed_count := processed_count + 1;
    exception when others then
      update sync_queue
      set status = 'failed', error = SQLERRM, processed_at = now()
      where id = job.id;
      failed_count := failed_count + 1;
    end;
  end loop;

  return query select processed_count, failed_count;
end;
$$ language plpgsql security definer;

-- ─── Gap 7: Enable Supabase Realtime for change_log ────────
-- This allows the web client to subscribe to changes instantly.
-- Run this as a superuser or in the Supabase dashboard:
--   alter publication supabase_realtime add table change_log;
-- This is the only table-level change needed — the client-side
-- code in sync.ts already subscribes to this channel.

-- ─── Seed: Ensure Realtime is enabled on change_log ─────────
-- Uncomment and run manually or via Supabase Dashboard SQL Editor:
-- alter publication supabase_realtime add table change_log;

-- ─── Clean up old sync_queue entries periodically ───────────
-- Retain completed jobs for 7 days, failed for 30 days
create or replace function cleanup_sync_queue()
returns int as $$
declare
  deleted int;
begin
  delete from sync_queue
  where status = 'completed'
    and processed_at < now() - interval '7 days';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$ language plpgsql security definer;
-- ============================================================
-- CoopERP: Migration 00006 — Crispy King Fast Food Module
-- Multi-branch fast food POS with menu, orders, inventory, sales
-- ============================================================

-- ─── Menu Items ─────────────────────────────────────────────
create table if not exists ck_menu_items (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  branch_id text references branches(id),
  item_code text not null,
  name text not null,
  category text not null check (category in ('chicken','sides','drinks','desserts','combos','breakfast','merchandise')),
  price numeric(10,2) not null check (price > 0),
  cost_price numeric(10,2),
  description text,
  image_url text,
  status text default 'available' check (status in ('available','sold_out','discontinued')),
  sort_order int default 0,
  is_featured boolean default false,
  tags text[] default '{}',
  nutrition_info jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_menu_tenant on ck_menu_items(tenant_id) where deleted_at is null;
create index idx_menu_category on ck_menu_items(tenant_id, category) where deleted_at is null;
create unique index idx_menu_code on ck_menu_items(tenant_id, item_code) where deleted_at is null;
alter table ck_menu_items enable row level security;

-- ─── Orders ─────────────────────────────────────────────────
create table if not exists ck_orders (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  branch_id text not null references branches(id),
  order_number text not null,
  order_type text not null check (order_type in ('dine_in','takeout','delivery')),
  status text default 'pending' check (status in ('pending','preparing','ready','served','completed','cancelled')),
  customer_name text,
  customer_phone text,
  table_number text,
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) default 0,
  discount_label text,
  vat_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  amount_tendered numeric(10,2) not null,
  change_amount numeric(10,2) default 0,
  payment_method text not null check (payment_method in ('cash','gcash','maya','card','online_transfer')),
  payment_reference text,
  notes text,
  cashier_name text,
  ordered_at timestamptz not null,
  served_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_orders_tenant on ck_orders(tenant_id) where deleted_at is null;
create index idx_orders_branch on ck_orders(tenant_id, branch_id, ordered_at desc) where deleted_at is null;
create index idx_orders_status on ck_orders(tenant_id, status) where deleted_at is null;
create unique index idx_orders_number on ck_orders(tenant_id, order_number) where deleted_at is null;
alter table ck_orders enable row level security;

-- ─── Order Items ────────────────────────────────────────────
create table if not exists ck_order_items (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  branch_id text not null references branches(id),
  order_id text not null references ck_orders(id),
  menu_item_id text not null references ck_menu_items(id),
  menu_item_name text not null,
  menu_item_code text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  special_request text,
  combo_details jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_oi_order on ck_order_items(order_id) where deleted_at is null;
create index idx_oi_menu on ck_order_items(menu_item_id) where deleted_at is null;
alter table ck_order_items enable row level security;

-- ─── Inventory ──────────────────────────────────────────────
create table if not exists ck_inventory (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  branch_id text not null references branches(id),
  name text not null,
  category text not null,
  unit text not null check (unit in ('kg','g','L','mL','pc','pack','box','sack')),
  quantity_on_hand numeric(10,3) default 0,
  reorder_point numeric(10,3) default 0,
  max_stock numeric(10,3) default 0,
  last_cost_price numeric(10,2),
  supplier text,
  status text default 'in_stock' check (status in ('in_stock','low_stock','out_of_stock')),
  notes text,
  last_restocked_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_inv_tenant on ck_inventory(tenant_id) where deleted_at is null;
create index idx_inv_branch on ck_inventory(tenant_id, branch_id) where deleted_at is null;
create index idx_inv_status on ck_inventory(tenant_id, status) where deleted_at is null;
alter table ck_inventory enable row level security;

-- ─── Daily Sales ────────────────────────────────────────────
create table if not exists ck_daily_sales (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  branch_id text not null references branches(id),
  sales_date date not null,
  opening_cash numeric(10,2) default 0,
  gross_sales numeric(10,2) default 0,
  total_discounts numeric(10,2) default 0,
  total_vat numeric(10,2) default 0,
  net_sales numeric(10,2) default 0,
  order_count int default 0,
  average_order_value numeric(10,2) default 0,
  dine_in_count int default 0, dine_in_sales numeric(10,2) default 0,
  takeout_count int default 0, takeout_sales numeric(10,2) default 0,
  delivery_count int default 0, delivery_sales numeric(10,2) default 0,
  cash_sales numeric(10,2) default 0,
  gcash_sales numeric(10,2) default 0,
  maya_sales numeric(10,2) default 0,
  card_sales numeric(10,2) default 0,
  closing_cash numeric(10,2) default 0,
  cash_variance numeric(10,2) default 0,
  total_expenses numeric(10,2) default 0,
  prepared_by text not null,
  is_closed boolean default false,
  notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, version int default 1, created_by text default 'system', updated_by text default 'system'
);
create index idx_ds_tenant on ck_daily_sales(tenant_id) where deleted_at is null;
create index idx_ds_branch_date on ck_daily_sales(tenant_id, branch_id, sales_date) where deleted_at is null;
create unique index idx_ds_unique on ck_daily_sales(tenant_id, branch_id, sales_date) where deleted_at is null;
alter table ck_daily_sales enable row level security;
-- ============================================================
-- CoopERP: Migration 00007 — Driving School Multi-Branch System
-- Adds all driving school management tables with LTO compliance
-- ============================================================

-- ─── Driving Students ────────────────────────────────────────
create table if not exists driving_students (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  student_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  middle_name text,
  sex text not null check (sex in ('male','female','other')),
  date_of_birth date not null,
  birthplace text,
  nationality text not null default 'Filipino',
  civil_status text not null default 'single' check (civil_status in ('single','married','widowed','separated','divorced')),
  phone text not null,
  email text,
  address text not null,
  barangay text,
  city text not null,
  province text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relation text,
  -- LTO Compliance Fields
  lto_student_permit_number text,
  lto_student_permit_issue_date date,
  lto_student_permit_expiry_date date,
  lto_client_id text,
  -- Medical
  medical_certificate_date date,
  medical_certificate_expiry date,
  blood_type text not null default 'unknown' check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  -- Education
  highest_education text not null default 'high_school' check (highest_education in ('elementary','high_school','college','vocational','post_grad')),
  -- Driving History
  has_prior_driving_experience boolean not null default false,
  prior_driving_years integer,
  has_existing_license boolean not null default false,
  existing_license_type text check (existing_license_type in ('student_permit','non_professional','professional')),
  existing_license_number text,
  -- Vision
  has_eyeglasses boolean not null default false,
  -- Status tracking
  status text not null default 'inquiry' check (status in ('inquiry','enrolled','active','completed','dropped','graduated')),
  registration_date date not null,
  expected_completion_date date,
  actual_completion_date date,
  -- Media
  photo_url text,
  signature_url text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_students_tenant on driving_students(tenant_id) where deleted_at is null;
create index if not exists idx_driving_students_branch on driving_students(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_students_status on driving_students(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_driving_students_code on driving_students(tenant_id, student_code) where deleted_at is null;

alter table driving_students enable row level security;

-- ─── Driving Instructors ─────────────────────────────────────
create table if not exists driving_instructors (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  instructor_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  phone text not null,
  email text,
  address text,
  -- LTO Accreditation
  lto_accreditation_number text not null,
  lto_accreditation_issue_date date not null,
  lto_accreditation_expiry_date date not null,
  -- Specialization
  specializations jsonb not null default '[]',
  -- Experience
  years_of_experience integer not null default 0,
  -- License held
  license_type text not null check (license_type in ('student_permit','non_professional','professional')),
  license_number text not null,
  license_expiry_date date not null,
  -- Employment
  date_hired date not null,
  employment_type text not null default 'full_time' check (employment_type in ('full_time','part_time','contract')),
  max_students_per_day integer not null default 8,
  -- Rate
  rate_per_hour numeric(10,2) not null default 0,
  -- Schedule preferences (metadata-driven)
  schedule_preferences jsonb default '{}',
  status text not null default 'active' check (status in ('active','inactive','on_leave')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_instructors_tenant on driving_instructors(tenant_id) where deleted_at is null;
create index if not exists idx_driving_instructors_branch on driving_instructors(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_instructors_status on driving_instructors(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_driving_instructors_code on driving_instructors(tenant_id, instructor_code) where deleted_at is null;

alter table driving_instructors enable row level security;

-- ─── Driving Courses ─────────────────────────────────────────
create table if not exists driving_courses (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,

  course_code text not null,
  name text not null,
  description text,
  category text not null check (category in (
    'tdc','pdc_motorcycle','pdc_car','pdc_truck',
    'refresher','defensive_driving','heavy_equipment','special_training'
  )),
  -- Duration
  total_hours numeric(5,1) not null,
  theory_hours numeric(5,1) not null default 0,
  practical_hours numeric(5,1) not null default 0,
  min_sessions_required integer not null,
  -- Pricing
  base_tuition_fee numeric(10,2) not null default 0,
  branch_fee_overrides jsonb default '{}',
  registration_fee numeric(10,2) not null default 0,
  assessment_fee numeric(10,2) not null default 0,
  certificate_fee numeric(10,2) not null default 0,
  -- LTO Compliance
  lto_course_code text,
  lto_accredited boolean not null default false,
  requires_student_permit boolean not null default true,
  requires_medical_certificate boolean not null default true,
  -- Prerequisites
  minimum_age integer not null default 17,
  prerequisite_course_id text references driving_courses(id),
  -- Capacity
  max_students_per_class integer not null default 15,
  -- Schedule defaults
  default_start_time text not null default '08:00',
  default_session_hours numeric(3,1) not null default 2,
  status text not null default 'active' check (status in ('active','inactive','coming_soon')),
  sort_order integer not null default 0,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_courses_tenant on driving_courses(tenant_id) where deleted_at is null;
create index if not exists idx_driving_courses_category on driving_courses(tenant_id, category) where deleted_at is null;
create unique index if not exists idx_driving_courses_code on driving_courses(tenant_id, course_code) where deleted_at is null;

alter table driving_courses enable row level security;

-- ─── Driving Enrollments ─────────────────────────────────────
create table if not exists driving_enrollments (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  enrollment_code text not null,
  student_id text not null references driving_students(id),
  student_name text not null,
  course_id text not null references driving_courses(id),
  course_name text not null,
  enrollment_date date not null,
  start_date date,
  expected_end_date date,
  actual_end_date date,
  -- Assigned instructor
  instructor_id text references driving_instructors(id),
  instructor_name text,
  -- Fee breakdown
  tuition_fee numeric(10,2) not null default 0,
  registration_fee numeric(10,2) not null default 0,
  assessment_fee numeric(10,2) not null default 0,
  certificate_fee numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total_fee numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  balance numeric(10,2) not null default 0,
  enrollment_type text not null default 'full' check (enrollment_type in ('full','installment')),
  -- Installment plan
  installment_plan jsonb,
  -- Progress tracking
  theory_hours_completed numeric(5,1) not null default 0,
  practical_hours_completed numeric(5,1) not null default 0,
  sessions_attended integer not null default 0,
  sessions_total integer not null default 0,
  -- Assessment
  theory_exam_score numeric(5,1),
  practical_exam_score numeric(5,1),
  overall_grade numeric(5,1),
  has_certificate_issued boolean not null default false,
  certificate_issue_date date,
  certificate_number text,
  -- LTO
  lto_submission_date date,
  lto_reference_number text,
  status text not null default 'pending' check (status in (
    'pending','confirmed','in_progress','completed','failed','cancelled','refunded'
  )),
  cancellation_reason text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_enrollments_tenant on driving_enrollments(tenant_id) where deleted_at is null;
create index if not exists idx_driving_enrollments_branch on driving_enrollments(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_enrollments_student on driving_enrollments(tenant_id, student_id) where deleted_at is null;
create index if not exists idx_driving_enrollments_status on driving_enrollments(tenant_id, status) where deleted_at is null;
create index if not exists idx_driving_enrollments_date on driving_enrollments(tenant_id, enrollment_date desc) where deleted_at is null;
create unique index if not exists idx_driving_enrollments_code on driving_enrollments(tenant_id, enrollment_code) where deleted_at is null;

alter table driving_enrollments enable row level security;

-- ─── Driving Schedules ───────────────────────────────────────
create table if not exists driving_schedules (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  schedule_code text not null,
  enrollment_id text not null references driving_enrollments(id),
  student_id text not null references driving_students(id),
  student_name text not null,
  instructor_id text not null references driving_instructors(id),
  instructor_name text not null,
  vehicle_id text references driving_vehicles(id),
  session_type text not null check (session_type in ('theory','practical','assessment','remedial')),
  session_date date not null,
  start_time text not null,
  end_time text not null,
  duration_hours numeric(3,1) not null,
  -- Topics
  topics_covered text,
  skills_practiced text,
  -- Assessment
  assessment_score numeric(5,1),
  assessment_notes text,
  -- Attendance
  student_attended boolean not null default false,
  instructor_confirmed boolean not null default false,
  attendance_confirmed_at timestamptz,
  -- Location
  is_onsite boolean not null default true,
  location text,
  -- Vehicle tracking
  odometer_start integer,
  odometer_end integer,
  fuel_used numeric(5,2),
  -- Reschedule
  original_schedule_id text references driving_schedules(id),
  reschedule_reason text,
  reschedule_count integer not null default 0,
  status text not null default 'scheduled' check (status in (
    'scheduled','in_progress','completed','cancelled','no_show','rescheduled'
  )),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_schedules_tenant on driving_schedules(tenant_id) where deleted_at is null;
create index if not exists idx_driving_schedules_enrollment on driving_schedules(tenant_id, enrollment_id) where deleted_at is null;
create index if not exists idx_driving_schedules_instructor on driving_schedules(tenant_id, instructor_id, session_date) where deleted_at is null;
create index if not exists idx_driving_schedules_date on driving_schedules(tenant_id, session_date) where deleted_at is null;
create unique index if not exists idx_driving_schedules_code on driving_schedules(tenant_id, schedule_code) where deleted_at is null;

alter table driving_schedules enable row level security;

-- ─── Driving Payments ────────────────────────────────────────
create table if not exists driving_payments (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  payment_code text not null,
  enrollment_id text not null references driving_enrollments(id),
  student_id text not null references driving_students(id),
  student_name text not null,
  payment_date date not null,
  payment_time text not null,
  amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cash','gcash','maya','bank_transfer','card','check')),
  reference_number text,
  payment_for text not null default 'tuition' check (payment_for in (
    'tuition','registration','assessment','certificate','installment','other'
  )),
  installment_number integer,
  official_receipt_number text,
  received_by text not null,
  is_refund boolean not null default false,
  refund_reason text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_payments_tenant on driving_payments(tenant_id) where deleted_at is null;
create index if not exists idx_driving_payments_enrollment on driving_payments(tenant_id, enrollment_id) where deleted_at is null;
create index if not exists idx_driving_payments_date on driving_payments(tenant_id, payment_date desc) where deleted_at is null;
create unique index if not exists idx_driving_payments_code on driving_payments(tenant_id, payment_code) where deleted_at is null;

alter table driving_payments enable row level security;

-- ─── Driving Vehicles (Training Fleet) ───────────────────────
create table if not exists driving_vehicles (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  vehicle_code text not null,
  plate_number text not null,
  make text not null,
  model text not null,
  year integer not null,
  type text not null check (type in ('sedan','hatchback','suv','pickup','van','truck','bus','motorcycle')),
  transmission text not null check (transmission in ('manual','automatic','semi_automatic')),
  fuel_type text not null check (fuel_type in ('gasoline','diesel','electric','hybrid')),
  color text,
  -- Registration
  lto_registration_number text not null,
  lto_registration_expiry date not null,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry_date date,
  -- Training Equipment
  has_dual_control boolean not null default true,
  has_dash_cam boolean not null default false,
  has_student_signage boolean not null default true,
  -- Maintenance
  odometer_reading integer not null default 0,
  last_maintenance_date date,
  last_maintenance_odometer integer,
  next_maintenance_odometer integer,
  maintenance_notes text,
  -- Assignment
  assigned_branch_id text references branches(id),
  assigned_instructor_id text references driving_instructors(id),
  -- Status
  status text not null default 'active' check (status in ('active','maintenance','out_of_service','for_sale')),
  acquisition_date date,
  acquisition_cost numeric(12,2),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_driving_vehicles_tenant on driving_vehicles(tenant_id) where deleted_at is null;
create index if not exists idx_driving_vehicles_branch on driving_vehicles(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_driving_vehicles_status on driving_vehicles(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_driving_vehicles_code on driving_vehicles(tenant_id, vehicle_code) where deleted_at is null;
create unique index if not exists idx_driving_vehicles_plate on driving_vehicles(tenant_id, plate_number) where deleted_at is null;

alter table driving_vehicles enable row level security;
-- ============================================================
-- Migration 00008: Laundry Promo Codes + Fix Duplicate Numbering
-- Note: 00006_fastfood.sql and 00006_laundry_shop.sql conflict.
-- Retain both with different numbers. This adds the missing
-- laundry_promo_codes table for the promo/discount system.
-- ============================================================

create table if not exists laundry_promo_codes (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id),
  branch_id text references branches(id),
  branch_ids text[],
  code text not null,
  name text not null,
  description text,
  promo_type text not null check (promo_type in ('discount_percent','discount_amount','free_delivery','bonus_points','volume_discount','free_item')),
  value numeric(10,2) not null default 0,
  min_order_amount numeric(10,2) default 0,
  max_discount_cap numeric(10,2),
  target text not null default 'all_customers' check (target in ('all_customers','new_customers','tier_specific','referral','birthday','seasonal')),
  eligible_tiers text[],
  status text not null default 'active' check (status in ('active','expired','scheduled','paused')),
  max_uses int not null default 100,
  current_uses int not null default 0,
  max_uses_per_customer int not null default 1,
  free_item_threshold int,
  free_item_count int default 1,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  campaign text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  version int default 1,
  created_by text default 'system',
  updated_by text default 'system'
);

create index if not exists idx_promo_tenant on laundry_promo_codes(tenant_id) where deleted_at is null;
create index if not exists idx_promo_code on laundry_promo_codes(tenant_id, code) where deleted_at is null;
create unique index if not exists idx_promo_code_unique on laundry_promo_codes(tenant_id, code) where deleted_at is null;

alter table laundry_promo_codes enable row level security;
-- ============================================================
-- CoopERP: Migration 00006 — Laundry Shop Multi-Branch System
-- Adds all laundry management tables with multi-branch support
-- ============================================================

-- ─── Laundry Customers ──────────────────────────────────────
create table if not exists laundry_customers (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  customer_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  phone text,
  email text,
  address text,
  barangay text,
  city text,
  province text,
  customer_type text not null default 'walk_in' check (customer_type in ('walk_in','regular','corporate')),
  customer_tier text not null default 'bronze' check (customer_tier in ('bronze','silver','gold','platinum')),
  lifetime_spend numeric(12,2) not null default 0,
  loyalty_points integer not null default 0,
  preferences text,
  delivery_address text,
  first_visit_date date,
  last_order_date date,
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_laundry_customers_tenant on laundry_customers(tenant_id) where deleted_at is null;
create index if not exists idx_laundry_customers_branch on laundry_customers(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_laundry_customers_tier on laundry_customers(tenant_id, customer_tier) where deleted_at is null;
create unique index if not exists idx_laundry_customers_code on laundry_customers(tenant_id, customer_code) where deleted_at is null;

alter table laundry_customers enable row level security;

-- ─── Laundry Services Catalog ────────────────────────────────
create table if not exists laundry_services (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,

  service_code text not null,
  name text not null,
  description text,
  category text not null check (category in (
    'wash_dry','dry_clean','iron','fold','stain_removal',
    'leather_care','shoe_clean','carpet','curtain','other'
  )),
  pricing_unit text not null check (pricing_unit in ('per_kg','per_piece','per_set','per_pair','flat_rate')),
  base_price numeric(10,2) not null default 0,
  branch_price_overrides jsonb default '{}',
  min_charge numeric(10,2) not null default 0,
  turnaround_hours integer not null default 24,
  requires_special_handling boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active','inactive','seasonal')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_laundry_services_tenant on laundry_services(tenant_id) where deleted_at is null;
create index if not exists idx_laundry_services_category on laundry_services(tenant_id, category) where deleted_at is null;
create unique index if not exists idx_laundry_services_code on laundry_services(tenant_id, service_code) where deleted_at is null;

alter table laundry_services enable row level security;

-- ─── Laundry Orders / Work Orders ────────────────────────────
create table if not exists laundry_orders (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  order_code text not null,
  customer_id text not null references laundry_customers(id),
  customer_name text not null,
  order_date date not null,
  drop_off_time text not null,
  promised_pickup_date date not null,
  promised_pickup_time text not null,
  items jsonb not null default '[]',
  total_weight numeric(8,2),
  subtotal numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  balance numeric(10,2) not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','partial','paid','refunded')),
  order_status text not null default 'dropped_off' check (order_status in (
    'dropped_off','sorted','in_process','quality_check',
    'ready_for_pickup','picked_up','delivered','cancelled'
  )),
  order_priority text not null default 'normal' check (order_priority in ('normal','express','rush')),
  received_by text not null,
  processed_by text,
  checked_by text,
  actual_pickup_date date,
  actual_pickup_time text,
  pickup_confirmed_by text,
  care_instructions text,
  damage_notes text,
  tag_numbers jsonb,
  is_delivery boolean not null default false,
  delivery_address text,
  delivery_fee numeric(10,2) not null default 0,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_laundry_orders_tenant on laundry_orders(tenant_id) where deleted_at is null;
create index if not exists idx_laundry_orders_branch on laundry_orders(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_laundry_orders_customer on laundry_orders(tenant_id, customer_id) where deleted_at is null;
create index if not exists idx_laundry_orders_status on laundry_orders(tenant_id, order_status) where deleted_at is null;
create index if not exists idx_laundry_orders_date on laundry_orders(tenant_id, order_date desc) where deleted_at is null;
create unique index if not exists idx_laundry_orders_code on laundry_orders(tenant_id, order_code) where deleted_at is null;

alter table laundry_orders enable row level security;

-- ─── Laundry Payments ────────────────────────────────────────
create table if not exists laundry_payments (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  payment_code text not null,
  order_id text not null references laundry_orders(id),
  customer_id text not null references laundry_customers(id),
  payment_date date not null,
  payment_time text not null,
  amount numeric(10,2) not null,
  payment_method text not null check (payment_method in (
    'cash','gcash','maya','bank_transfer','card','loyalty_points'
  )),
  reference_number text,
  loyalty_points_redeemed integer not null default 0,
  loyalty_points_earned integer not null default 0,
  received_by text not null,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_laundry_payments_tenant on laundry_payments(tenant_id) where deleted_at is null;
create index if not exists idx_laundry_payments_order on laundry_payments(tenant_id, order_id) where deleted_at is null;
create index if not exists idx_laundry_payments_date on laundry_payments(tenant_id, payment_date desc) where deleted_at is null;
create unique index if not exists idx_laundry_payments_code on laundry_payments(tenant_id, payment_code) where deleted_at is null;

alter table laundry_payments enable row level security;

-- ─── Laundry Inventory ───────────────────────────────────────
create table if not exists laundry_inventory (
  id text primary key default gen_random_uuid()::text,
  tenant_id text not null references tenants(id) on delete cascade,
  branch_id text references branches(id),

  item_code text not null,
  name text not null,
  category text not null check (category in (
    'detergent','softener','bleach','stain_remover',
    'packaging','hanger','tag','other'
  )),
  unit text not null check (unit in ('liter','kilogram','piece','pack','box','bottle')),
  quantity_on_hand numeric(10,2) not null default 0,
  min_stock_level numeric(10,2) not null default 5,
  max_stock_level numeric(10,2) not null default 100,
  cost_per_unit numeric(10,2) not null default 0,
  supplier_name text,
  last_restock_date date,
  last_restock_quantity numeric(10,2),
  last_restock_cost numeric(10,2),
  expiration_date date,
  status text not null default 'in_stock' check (status in ('in_stock','low_stock','out_of_stock','discontinued')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version int not null default 1,
  created_by text not null default 'system',
  updated_by text not null default 'system'
);

create index if not exists idx_laundry_inventory_tenant on laundry_inventory(tenant_id) where deleted_at is null;
create index if not exists idx_laundry_inventory_branch on laundry_inventory(tenant_id, branch_id) where deleted_at is null;
create index if not exists idx_laundry_inventory_category on laundry_inventory(tenant_id, category) where deleted_at is null;
create index if not exists idx_laundry_inventory_status on laundry_inventory(tenant_id, status) where deleted_at is null;
create unique index if not exists idx_laundry_inventory_code on laundry_inventory(tenant_id, item_code) where deleted_at is null;

alter table laundry_inventory enable row level security;
