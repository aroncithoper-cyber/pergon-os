-- Phase 10: Automation Engine persistence (versions, webhooks, run queue fields, flow)

alter table public.ops_automations
  add column if not exists flow jsonb,
  add column if not exists retry_policy jsonb;

alter table public.ops_automation_runs
  add column if not exists automation_version int,
  add column if not exists trigger_source text,
  add column if not exists attempt int not null default 0,
  add column if not exists max_attempts int not null default 3,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists step_index int not null default 0,
  add column if not exists step_logs jsonb not null default '[]'::jsonb;

create index if not exists idx_ops_automation_runs_queue
  on public.ops_automation_runs (status, next_attempt_at)
  where status in ('pending', 'waiting');

create table if not exists public.ops_automation_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  automation_id uuid not null references public.ops_automations(id) on delete cascade,
  version int not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

create unique index if not exists uq_ops_automation_versions
  on public.ops_automation_versions (automation_id, version);

create table if not exists public.ops_automation_webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  automation_id uuid not null references public.ops_automations(id) on delete cascade,
  path_key text not null,
  secret text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_ops_automation_webhooks_path
  on public.ops_automation_webhooks (path_key);
