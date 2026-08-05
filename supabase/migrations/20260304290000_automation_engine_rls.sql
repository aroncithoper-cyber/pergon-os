-- Phase 11: RLS fail-closed for automation engine tables created after foundation

alter table public.ops_automation_versions enable row level security;
alter table public.ops_automation_webhooks enable row level security;

-- No anon/authenticated policies: access only via service_role until org policies ship.
revoke all on table public.ops_automation_versions from anon, authenticated;
revoke all on table public.ops_automation_webhooks from anon, authenticated;

grant select, insert, update, delete on table public.ops_automation_versions to service_role;
grant select, insert, update, delete on table public.ops_automation_webhooks to service_role;
