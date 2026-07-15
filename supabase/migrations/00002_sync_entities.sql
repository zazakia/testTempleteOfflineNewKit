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
