-- PerGon OS — Storage buckets + Realtime publication prep
-- Buckets are private by default. Policies remain fail-closed (no public anon writes).

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('media', 'media', false, 52428800),
  ('exports', 'exports', false, 104857600),
  ('avatars', 'avatars', false, 5242880),
  ('documents', 'documents', false, 52428800)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Storage RLS is enabled by default on storage.objects in Supabase.
-- No permissive policies here = only service_role can manage objects until policies are added.

-- Realtime: add high-signal tables to supabase_realtime publication when available.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.ops_alerts;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.ops_notifications;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.ops_automation_runs;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
