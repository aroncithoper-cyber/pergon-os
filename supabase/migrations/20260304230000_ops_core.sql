-- PerGon OS Ops / Admin Core (Phase 3)
-- Multi-tenant operational tables for Admin panel logic (no UI).

create extension if not exists "pgcrypto";

create table if not exists public.ops_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  sku text not null,
  name text not null,
  status text not null default 'draft',
  description text,
  metadata jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_ops_products_org_sku
  on public.ops_products (organization_id, sku)
  where deleted_at is null;

create table if not exists public.ops_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  email text,
  phone text,
  status text not null default 'lead',
  segment text,
  distributor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_ops_customers_org_code
  on public.ops_customers (organization_id, code)
  where deleted_at is null;

create table if not exists public.ops_distributors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  email text,
  territory text,
  status text not null default 'prospect',
  metadata jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_ops_distributors_org_code
  on public.ops_distributors (organization_id, code)
  where deleted_at is null;

create table if not exists public.ops_warehouses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_warehouses_org_code
  on public.ops_warehouses (organization_id, code);

create table if not exists public.ops_inventory_levels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  warehouse_id uuid not null references public.ops_warehouses(id),
  product_id uuid not null references public.ops_products(id),
  batch_id uuid,
  quantity numeric not null default 0,
  reserved numeric not null default 0,
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_inventory_level
  on public.ops_inventory_levels (
    organization_id,
    warehouse_id,
    product_id,
    (coalesce(batch_id, '00000000-0000-0000-0000-000000000000'::uuid))
  );

create table if not exists public.ops_stock_moves (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  type text not null,
  warehouse_id uuid not null,
  to_warehouse_id uuid,
  product_id uuid not null,
  batch_id uuid,
  quantity numeric not null,
  reason text not null,
  idempotency_key text not null,
  actor_type text not null,
  actor_id uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_ops_stock_moves_idempotency
  on public.ops_stock_moves (idempotency_key);

create table if not exists public.ops_production_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  product_id uuid not null,
  warehouse_id uuid not null,
  planned_qty numeric not null,
  produced_qty numeric not null default 0,
  status text not null default 'draft',
  batch_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_production_orders_org_code
  on public.ops_production_orders (organization_id, code);

create table if not exists public.ops_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  product_id uuid not null,
  code text not null,
  status text not null default 'open',
  manufactured_at timestamptz,
  expires_at timestamptz,
  production_order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_ops_batches_org_code
  on public.ops_batches (organization_id, code)
  where deleted_at is null;

create table if not exists public.ops_automations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  key text not null,
  name text not null,
  status text not null default 'draft',
  trigger text not null,
  cron text,
  event_type text,
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_automations_org_key
  on public.ops_automations (organization_id, key);

create table if not exists public.ops_automation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  automation_id uuid not null references public.ops_automations(id),
  status text not null default 'pending',
  idempotency_key text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_ops_automation_runs_idempotency
  on public.ops_automation_runs (idempotency_key);

create table if not exists public.ops_ai_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null,
  status text not null default 'open',
  purpose text not null,
  messages jsonb not null default '[]'::jsonb,
  tool_invocations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_report_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  key text not null,
  name text not null,
  kind text not null,
  parameters_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_report_definitions_org_key
  on public.ops_report_definitions (organization_id, key);

create table if not exists public.ops_report_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  definition_id uuid not null references public.ops_report_definitions(id),
  status text not null default 'queued',
  parameters jsonb not null default '{}'::jsonb,
  artifact_url text,
  error text,
  requested_by uuid not null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.ops_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  key text not null,
  value jsonb,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_settings_org_key
  on public.ops_settings (organization_id, key);

create table if not exists public.ops_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  module text not null,
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ops_audit_org_created
  on public.ops_audit_logs (organization_id, created_at desc);

create table if not exists public.ops_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  channel text not null,
  status text not null default 'pending',
  recipient_user_id uuid,
  recipient_address text,
  title text not null,
  body text not null,
  deep_link text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  read_at timestamptz,
  error text
);

create table if not exists public.ops_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  notification_id uuid not null references public.ops_notifications(id),
  channel text not null,
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ops_saved_views (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null,
  module text not null,
  name text not null,
  query jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_dashboard_layouts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid,
  role_key text,
  name text not null,
  widgets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  type text not null,
  severity text not null,
  status text not null default 'open',
  title text not null,
  message text not null,
  module text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.ops_domain_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  module text not null,
  type text not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  actor_type text not null,
  actor_id uuid,
  correlation_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ops_domain_events_org_created
  on public.ops_domain_events (organization_id, created_at desc);
