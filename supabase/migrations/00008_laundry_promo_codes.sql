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
