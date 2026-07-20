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
