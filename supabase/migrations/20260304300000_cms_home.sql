-- PerGon OS — CMS Home (Experience CMS V1)
-- Working copy + published snapshot + versions + preview tokens + schedule fields.
-- Public web reads published_payload only; Admin mutates via service role / authenticated APIs.

create extension if not exists pgcrypto;

create table if not exists public.cms_home_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  locale text not null default 'es',
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published', 'unpublished', 'archived', 'expired')),
  working_payload jsonb not null default '{}'::jsonb,
  published_payload jsonb,
  published_version integer not null default 0,
  publish_at timestamptz,
  unpublish_at timestamptz,
  working_version integer not null default 1,
  last_published_at timestamptz,
  last_published_by uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  unique (organization_id, locale)
);

create index if not exists cms_home_documents_status_idx
  on public.cms_home_documents (status)
  where deleted_at is null;

create index if not exists cms_home_documents_publish_at_idx
  on public.cms_home_documents (publish_at)
  where deleted_at is null and status = 'scheduled';

create index if not exists cms_home_documents_unpublish_at_idx
  on public.cms_home_documents (unpublish_at)
  where deleted_at is null and status = 'published' and unpublish_at is not null;

create index if not exists cms_home_documents_published_locale_idx
  on public.cms_home_documents (locale)
  where deleted_at is null and status = 'published' and published_payload is not null;

create table if not exists public.cms_home_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.cms_home_documents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  version_number integer not null,
  kind text not null check (kind in ('publish', 'rollback')),
  payload jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid,
  unique (document_id, version_number)
);

create index if not exists cms_home_versions_document_idx
  on public.cms_home_versions (document_id, version_number desc);

create table if not exists public.cms_home_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.cms_home_documents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  source text not null default 'working' check (source in ('working', 'version')),
  version_id uuid references public.cms_home_versions (id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid,
  revoked_at timestamptz
);

create index if not exists cms_home_preview_tokens_hash_idx
  on public.cms_home_preview_tokens (token_hash)
  where revoked_at is null;

alter table public.cms_home_documents enable row level security;
alter table public.cms_home_versions enable row level security;
alter table public.cms_home_preview_tokens enable row level security;

-- Fail-closed: no anon/authenticated policies. Access via service_role until org policies ship.
grant select, insert, update, delete on table public.cms_home_documents to service_role;
grant select, insert, update, delete on table public.cms_home_versions to service_role;
grant select, insert, update, delete on table public.cms_home_preview_tokens to service_role;
