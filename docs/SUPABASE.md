# Supabase Integration

Project URL: `https://hrsxzqdfvwwsiiegbzvg.supabase.co`

## Package `@pergon/database`

| Export                          | Role                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `createBrowserClient`           | Client Components (anon + RLS)                            |
| `createServerClient`            | Server Components / Route Handlers (anon + cookies + RLS) |
| `createServiceClient`           | Server-only privileged (service_role, bypasses RLS)       |
| `updateSession`                 | Next middleware session refresh                           |
| `storage` / `realtime` / `edge` | Prepared helpers                                          |

Apps wire through:

- `apps/web/src/lib/supabase.ts`
- `apps/admin/src/lib/supabase.ts`

## Environment

Copy each app `.env.example` → `.env.local` and fill keys from Dashboard → **Settings → API**.

Required:

1. `NEXT_PUBLIC_SUPABASE_URL` (already set in examples)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`anon` `public`)
3. `SUPABASE_SERVICE_ROLE_KEY` (`service_role` `secret` — server only)

Optional storage bucket overrides are documented in `.env.example`.

## Migrations

Apply in order with CLI (or Dashboard SQL):

1. `20260304210000_identity_core.sql`
2. `20260304220000_auth_core.sql`
3. `20260304230000_ops_core.sql`
4. `20260304240000_rls_foundation.sql` — RLS fail-closed
5. `20260304250000_storage_realtime.sql` — buckets + realtime publication

```bash
supabase link --project-ref hrsxzqdfvwwsiiegbzvg
supabase db push
```

## Auth / Storage / Realtime / Edge

- **Auth:** SSR clients + middleware refresh ready for Supabase Auth cookies.
- **Database:** Typed `Database` + migrations; domain UoW still memory until persistence adapters are swapped.
- **Storage:** Buckets `media`, `exports`, `avatars`, `documents` (private).
- **Realtime:** `ops_alerts`, `ops_notifications`, `ops_automation_runs` prepared for publication.
- **Edge:** `supabase/functions/health` + `invokeEdgeFunction`.

## Production vs development

Same variable names. Use separate Supabase projects or Dashboard environments if needed; never commit `.env.local`. Builds succeed without keys; clients throw only when invoked without env.
