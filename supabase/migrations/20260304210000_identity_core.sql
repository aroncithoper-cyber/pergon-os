-- PerGon OS Identity Core
-- Designed for high-volume append-only history (target: tens of millions of units).
-- Hot path: passports + qr_codes current projection.
-- Cold path: passport_events, scan_events, audit_logs (partition candidates).

create extension if not exists "pgcrypto";

do $$ begin
  create type public.passport_state as enum (
    'CREATED',
    'PRINTED',
    'FILLED',
    'QUALITY_CHECK',
    'READY',
    'SOLD',
    'DELIVERED',
    'ACTIVE',
    'RETURNED',
    'WASHING',
    'REFILLED',
    'RETIRED',
    'BLOCKED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.custody_stage as enum (
    'production',
    'distribution',
    'customer',
    'returned',
    'retired'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.qr_status as enum (
    'PENDING',
    'ACTIVE',
    'ROTATED',
    'SUSPENDED',
    'REVOKED',
    'EXPIRED'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_organizations_slug
  on public.organizations (slug)
  where deleted_at is null;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  sku text not null,
  name text not null,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_products_org_sku
  on public.products (organization_id, sku)
  where deleted_at is null;

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  product_id uuid not null references public.products(id),
  code text not null,
  status text not null default 'open',
  manufactured_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_batches_org_code
  on public.batches (organization_id, code)
  where deleted_at is null;

create table if not exists public.passports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  public_id text not null,
  product_id uuid not null references public.products(id),
  batch_id uuid references public.batches(id),
  state public.passport_state not null default 'CREATED',
  custody_stage public.custody_stage not null default 'production',
  version integer not null default 1,
  event_seq bigint not null default 0,
  issued_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create unique index if not exists uq_passports_org_public_id
  on public.passports (organization_id, public_id)
  where deleted_at is null;

create index if not exists idx_passports_org_state
  on public.passports (organization_id, state)
  where deleted_at is null;

create index if not exists idx_passports_product
  on public.passports (product_id)
  where deleted_at is null;

create index if not exists idx_passports_batch
  on public.passports (batch_id)
  where deleted_at is null;

create index if not exists idx_passports_expires
  on public.passports (expires_at)
  where deleted_at is null and expires_at is not null;

create table if not exists public.passport_versions (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id),
  version_number integer not null,
  snapshot jsonb not null,
  change_reason text not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  unique (passport_id, version_number)
);

create table if not exists public.passport_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  passport_id uuid not null references public.passports(id),
  seq bigint not null,
  type text not null,
  occurred_at timestamptz not null default now(),
  actor_type text not null,
  actor_id uuid,
  payload jsonb not null default '{}'::jsonb,
  correlation_id uuid,
  unique (passport_id, seq)
);

create index if not exists idx_passport_events_passport_occurred
  on public.passport_events (passport_id, occurred_at);

create index if not exists idx_passport_events_org_occurred
  on public.passport_events (organization_id, occurred_at);

create index if not exists idx_passport_events_type_occurred
  on public.passport_events (type, occurred_at);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  passport_id uuid not null references public.passports(id),
  public_code text not null,
  status public.qr_status not null default 'PENDING',
  version integer not null default 1,
  rotated_from_id uuid references public.qr_codes(id),
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_qr_codes_public_code
  on public.qr_codes (public_code)
  where deleted_at is null;

create index if not exists idx_qr_codes_passport_status
  on public.qr_codes (passport_id, status)
  where deleted_at is null;

create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  qr_code_id uuid references public.qr_codes(id),
  passport_id uuid references public.passports(id),
  public_code_attempt text not null,
  result text not null,
  channel text not null,
  ip_hash text,
  user_agent text,
  geo jsonb,
  risk_score integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_scan_events_created
  on public.scan_events (created_at desc);

create index if not exists idx_scan_events_passport_created
  on public.scan_events (passport_id, created_at desc);

create index if not exists idx_scan_events_qr_created
  on public.scan_events (qr_code_id, created_at desc);

create index if not exists idx_scan_events_ip_created
  on public.scan_events (ip_hash, created_at desc);

create index if not exists idx_scan_events_result_created
  on public.scan_events (result, created_at desc);

create table if not exists public.passport_recharges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  passport_id uuid not null references public.passports(id),
  from_expires_at timestamptz,
  to_expires_at timestamptz,
  from_state public.passport_state,
  to_state public.passport_state,
  idempotency_key text not null unique,
  reason text not null,
  actor_type text not null,
  actor_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_passport_recharges_passport
  on public.passport_recharges (passport_id, created_at desc);

create table if not exists public.trust_signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  passport_id uuid references public.passports(id),
  qr_code_id uuid references public.qr_codes(id),
  type text not null,
  severity text not null,
  status text not null default 'open',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_trust_signals_open
  on public.trust_signals (organization_id, status, severity, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before jsonb,
  after jsonb,
  request_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_entity
  on public.audit_logs (entity_type, entity_id, created_at desc);

create index if not exists idx_audit_logs_org_created
  on public.audit_logs (organization_id, created_at desc);

-- Prevent updates/deletes on immutable history tables via revoke in app roles later.
-- Application rule: never UPDATE/DELETE passport_events, scan_events, audit_logs, passport_versions, passport_recharges.
