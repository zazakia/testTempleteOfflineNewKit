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
