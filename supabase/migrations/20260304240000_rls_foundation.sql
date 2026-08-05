-- PerGon OS — RLS foundation (fail closed)
-- Enables Row Level Security on all public domain tables.
-- service_role bypasses RLS by default in Supabase.
-- anon / authenticated have no access until explicit policies are added
-- (or until JWT claims + membership helpers are wired to Supabase Auth).

create or replace function public.requesting_user_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;

comment on function public.requesting_user_id() is
  'JWT subject (auth.uid()). Returns null for anon or custom tokens without sub.';

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = target_org_id
      and m.user_id = public.requesting_user_id()
      and m.status = 'active'
  );
$$;

comment on function public.is_org_member(uuid) is
  'True when JWT user has an active membership in the organization. Requires users.id aligned with auth.users.id.';

do $$
declare
  r record;
begin
  for r in
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname not like 'pg_%'
  loop
    execute format('alter table public.%I enable row level security', r.table_name);
  end loop;
end $$;

-- Placeholder org-scoped read policy template (disabled by default).
-- Uncomment and refine once Supabase Auth users map to public.users / memberships.
--
-- create policy org_member_select_products
--   on public.ops_products
--   for select
--   to authenticated
--   using (public.is_org_member(organization_id));
