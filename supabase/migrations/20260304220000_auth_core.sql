-- PerGon OS Auth & Authorization Core (Phase 2)
-- Permission-based access control, multi-tenant via organization_id.
-- Roles bundle permissions; enforcement always checks permissions.

create extension if not exists "pgcrypto";

-- organizations already created in identity migration; ensure present.
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

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  status text not null default 'invited',
  password_hash text not null,
  mfa_enabled boolean not null default false,
  mfa_secret_encrypted text,
  locale text not null default 'es',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_users_email
  on public.users (email)
  where deleted_at is null;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references public.users(id),
  status text not null default 'pending',
  default_org_unit_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_memberships_org_user
  on public.memberships (organization_id, user_id);

create index if not exists idx_memberships_user
  on public.memberships (user_id);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  key text not null,
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_roles_system_key
  on public.roles (key)
  where organization_id is null;

create unique index if not exists uq_roles_org_key
  on public.roles (organization_id, key)
  where organization_id is not null;

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text not null default ''
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  org_unit_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_user_org
  on public.user_roles (user_id, organization_id);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  status text not null default 'active',
  refresh_token_hash text not null,
  access_token_jti text not null,
  ip_hash text,
  user_agent text,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  mfa_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_sessions_refresh_hash
  on public.sessions (refresh_token_hash);

create unique index if not exists uq_sessions_access_jti
  on public.sessions (access_token_jti);

create index if not exists idx_sessions_user_status
  on public.sessions (user_id, status);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  email text not null,
  role_keys jsonb not null default '[]'::jsonb,
  token_hash text not null,
  status text not null default 'pending',
  invited_by uuid references public.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_invitations_token_hash
  on public.invitations (token_hash);

create index if not exists idx_invitations_org_email
  on public.invitations (organization_id, email);

create table if not exists public.password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_password_resets_token_hash
  on public.password_resets (token_hash);

create table if not exists public.mfa_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  status text not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_mfa_challenges_user
  on public.mfa_challenges (user_id, status);

create table if not exists public.auth_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  actor_user_id uuid references public.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_audit_org_created
  on public.auth_audit_logs (organization_id, created_at desc);

create index if not exists idx_auth_audit_actor_created
  on public.auth_audit_logs (actor_user_id, created_at desc);
