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
create unique index if not exists idx_coa_code on chart_of_accounts(tenant_id, code);

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
