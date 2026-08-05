-- PerGon OS — CMS Media Library
-- Shared multimedia registry for Experience CMS (Hero, Products, Promos, Academia, Blog, etc.)
-- Soft delete; org-scoped. Upload binaries via Storage bucket `media` / `documents` (simple paths).

create extension if not exists pgcrypto;

create table if not exists public.cms_media_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  kind text not null
    check (kind in ('image', 'video', 'poster', 'document', 'logo')),
  video_provider text
    check (video_provider is null or video_provider in ('youtube', 'vimeo', 'file')),
  logo_variant text
    check (
      logo_variant is null
      or logo_variant in ('light', 'dark', 'horizontal', 'vertical', 'favicon')
    ),
  source text not null default 'external'
    check (source in ('upload', 'external')),
  name text not null,
  description text,
  alt_text text,
  category text,
  tags text[] not null default '{}',
  url text not null,
  storage_bucket text,
  storage_path text,
  mime_type text,
  file_size_bytes bigint,
  width integer,
  height integer,
  is_favorite boolean not null default false,
  last_used_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists cms_media_assets_org_kind_idx
  on public.cms_media_assets (organization_id, kind)
  where deleted_at is null;

create index if not exists cms_media_assets_org_favorite_idx
  on public.cms_media_assets (organization_id, is_favorite)
  where deleted_at is null and is_favorite = true;

create index if not exists cms_media_assets_org_updated_idx
  on public.cms_media_assets (organization_id, updated_at desc)
  where deleted_at is null;

create index if not exists cms_media_assets_tags_gin
  on public.cms_media_assets using gin (tags)
  where deleted_at is null;

alter table public.cms_media_assets enable row level security;

grant select, insert, update, delete on table public.cms_media_assets to service_role;
