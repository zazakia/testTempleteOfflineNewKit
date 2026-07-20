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
