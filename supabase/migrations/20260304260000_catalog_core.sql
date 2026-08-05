-- PerGon OS — Catalog / Product experience (CMS-driven, Admin-editable)
-- Separate from ops_products / identity products (SKU spine).
-- Public web reads published rows only; Admin mutates via service role / authenticated APIs.

create extension if not exists pgcrypto;

-- ——— Categories ———
create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  slug text not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, slug)
);

create index if not exists catalog_categories_org_status_idx
  on public.catalog_categories (organization_id, status)
  where deleted_at is null;

-- ——— Products (experience root) ———
create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  category_id uuid references public.catalog_categories (id),
  ops_product_id uuid,
  slug text not null,
  name text not null,
  tagline text,
  summary text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  -- Hero
  hero_eyebrow text,
  hero_headline text,
  hero_support text,
  hero_primary_cta_label text,
  hero_primary_cta_href text,
  hero_secondary_cta_label text,
  hero_secondary_cta_href text,
  -- SEO
  seo_title text,
  seo_description text,
  og_image_asset_id uuid,
  -- Experience blocks (Admin-editable without code)
  before_after jsonb not null default '{}'::jsonb,
  performance jsonb not null default '{}'::jsonb,
  dilution_calculator jsonb not null default '{}'::jsonb,
  cta jsonb not null default '{}'::jsonb,
  model_3d jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  unique (organization_id, slug)
);

create index if not exists catalog_products_org_status_idx
  on public.catalog_products (organization_id, status)
  where deleted_at is null;

create index if not exists catalog_products_slug_published_idx
  on public.catalog_products (slug)
  where deleted_at is null and status = 'published';

-- ——— Variants ———
create table if not exists public.catalog_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  sku text,
  name text not null,
  slug text not null,
  summary text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  attributes jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (product_id, slug)
);

create index if not exists catalog_variants_product_idx
  on public.catalog_variants (product_id)
  where deleted_at is null;

-- ——— Presentations (pack sizes / formats) ———
create table if not exists public.catalog_presentations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  variant_id uuid references public.catalog_variants (id) on delete set null,
  organization_id uuid not null references public.organizations (id),
  name text not null,
  sku text,
  volume_label text,
  net_content text,
  sort_order integer not null default 0,
  attributes jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists catalog_presentations_product_idx
  on public.catalog_presentations (product_id)
  where deleted_at is null;

-- ——— Media / files / videos / documents / galleries ———
create table if not exists public.catalog_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  product_id uuid references public.catalog_products (id) on delete cascade,
  variant_id uuid references public.catalog_variants (id) on delete set null,
  kind text not null check (
    kind in (
      'gallery',
      'hero',
      'before',
      'after',
      'video',
      'document',
      'datasheet',
      'safety_sheet',
      'file',
      'model_3d'
    )
  ),
  title text,
  alt_text text,
  caption text,
  storage_bucket text not null default 'media',
  storage_path text,
  public_url text,
  mime_type text,
  file_size_bytes bigint,
  width integer,
  height integer,
  duration_seconds numeric,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists catalog_assets_product_kind_idx
  on public.catalog_assets (product_id, kind)
  where deleted_at is null;

alter table public.catalog_products
  drop constraint if exists catalog_products_og_image_asset_id_fkey;

alter table public.catalog_products
  add constraint catalog_products_og_image_asset_id_fkey
  foreign key (og_image_asset_id) references public.catalog_assets (id);

-- ——— Benefits ———
create table if not exists public.catalog_benefits (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ——— Applications ———
create table if not exists public.catalog_applications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ——— Materials (compatible / incompatible) ———
create table if not exists public.catalog_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  name text not null,
  compatibility text not null check (compatibility in ('compatible', 'incompatible')),
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists catalog_materials_product_compat_idx
  on public.catalog_materials (product_id, compatibility)
  where deleted_at is null;

-- ——— Dilutions ———
create table if not exists public.catalog_dilutions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  label text not null,
  ratio text,
  use_case text,
  instructions text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ——— FAQ ———
create table if not exists public.catalog_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ——— Related products ———
create table if not exists public.catalog_product_relations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  product_id uuid not null references public.catalog_products (id) on delete cascade,
  related_product_id uuid not null references public.catalog_products (id) on delete cascade,
  relation_type text not null default 'related' check (relation_type in ('related', 'accessory', 'alternative')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, related_product_id, relation_type),
  check (product_id <> related_product_id)
);

-- RLS fail-closed
alter table public.catalog_categories enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_variants enable row level security;
alter table public.catalog_presentations enable row level security;
alter table public.catalog_assets enable row level security;
alter table public.catalog_benefits enable row level security;
alter table public.catalog_applications enable row level security;
alter table public.catalog_materials enable row level security;
alter table public.catalog_dilutions enable row level security;
alter table public.catalog_faqs enable row level security;
alter table public.catalog_product_relations enable row level security;
