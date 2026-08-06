# Environment Reference — PerGon OS

Canonical inventory of environment variables used by the monorepo.

**Sources of truth for local bootstrap**

- `apps/web/.env.local`
- `apps/admin/.env.local`

**Templates (no secrets)**

- `.env.example` (root index)
- `apps/web/.env.example`
- `apps/admin/.env.example`

**Deploy**

- `docs/VERCEL_DEPLOY.md`
- `turbo.json` → `globalEnv` (cache invalidation keys)

Never commit real keys. Never put service-role or API keys in `NEXT_PUBLIC_*`.

---

## Bootstrap rule

Local development must start with only:

1. `apps/web/.env.local`
2. `apps/admin/.env.local`
3. Plus Vercel project secrets in deployed environments

Root `.env` is **not** required at runtime for the Next apps.

---

## Groups

### App

| Variable              | Purpose                                                 | Where used                                                            | Web | Admin |  Required  | Notes                                                             |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- | :-: | :---: | :--------: | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Canonical public origin (SEO, absolute URLs, redirects) | `packages/shared/src/env.ts` → `getAppUrl()`; `apps/*/src/lib/env.ts` |  ✓  |   ✓   | Yes (prod) | Different value per app. Local: `http://localhost:3000` / `3001`. |
| `VERCEL_URL`          | Preview origin fallback                                 | `getAppUrl()`                                                         |  ✓  |   ✓   |  Platform  | Injected by Vercel; do not set in `.env.local`.                   |

### Supabase

| Variable                        | Purpose                       | Where used                                            | Web | Admin |       Required        | Notes                                                       |
| ------------------------------- | ----------------------------- | ----------------------------------------------------- | :-: | :---: | :-------------------: | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project API URL               | `getSupabasePublicEnv()`                              |  ✓  |   ✓   |          Yes          | Same project if apps share data.                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon / public key + RLS       | `getSupabasePublicEnv()`                              |  ✓  |   ✓   |          Yes          | Safe for browser; not a secret substitute for service role. |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only privileged client | `requireSupabaseServiceRole()`; CMS/Auth/Ops adapters |  ✓  |   ✓   | Yes (server features) | Never `NEXT_PUBLIC_`. Never expose to client.               |

### Storage

| Variable                                        | Purpose           | Where used                      | Web | Admin | Required | Notes                |
| ----------------------------------------------- | ----------------- | ------------------------------- | :-: | :---: | :------: | -------------------- |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_MEDIA`     | Media bucket name | `getStorageBucket("media")`     |  ✓  |   ✓   | Optional | Default `media`.     |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EXPORTS`   | Exports bucket    | `getStorageBucket("exports")`   |  ✓  |   ✓   | Optional | Default `exports`.   |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_AVATARS`   | Avatars bucket    | `getStorageBucket("avatars")`   |  ✓  |   ✓   | Optional | Default `avatars`.   |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_DOCUMENTS` | Documents bucket  | `getStorageBucket("documents")` |  ✓  |   ✓   | Optional | Default `documents`. |

### Identity / Security

| Variable                | Purpose                                  | Where used                                 | Web | Admin |     Required      | Notes                                                                |
| ----------------------- | ---------------------------------------- | ------------------------------------------ | :-: | :---: | :---------------: | -------------------------------------------------------------------- |
| `PERGON_SETUP_SECRET`   | Gates first-org bootstrap                | `apps/admin/.../organizations/route.ts`    |  —  |   ✓   | Yes (Admin setup) | Long random string. Without it, bootstrap returns disabled.          |
| `ALLOW_DEV_RESET_TOKEN` | Returns password-reset token in API JSON | `apps/*/.../auth/password/forgot/route.ts` |  ✓  |   ✓   |     Dev only      | Set to `1` only locally. **Forbidden** on Vercel Production/Preview. |

### CMS / Preview / Revalidate

| Variable                | Purpose                                   | Where used                                                                                                     | Web | Admin |        Required        | Notes                                                                   |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- | :-: | :---: | :--------------------: | ----------------------------------------------------------------------- |
| `CMS_REVALIDATE_SECRET` | Shared secret for Home cache revalidation | Web: `apps/web/.../cms/revalidate/route.ts`; Admin: `apps/admin/src/lib/cms.ts`; also preview signing fallback |  ✓  |   ✓   | Yes (CMS publish path) | Same value on Web and Admin.                                            |
| `CMS_PREVIEW_SECRET`    | Dedicated HMAC for preview tokens         | `packages/cms/.../home.ts` → `previewSigningSecret()`                                                          |  ✓  |   ✓   |        Optional        | Falls back to `CMS_REVALIDATE_SECRET`, then a local-dev default string. |
| `NEXT_PUBLIC_WEB_URL`   | Public Web origin from Admin              | Admin preview route + `revalidateWebHomeCache()`                                                               |  —  |   ✓   |  Yes (CMS Admin→Web)   | e.g. `http://localhost:3000`. No trailing slash.                        |
| `WEB_APP_URL`           | Legacy alias for Web origin               | `apps/admin/src/lib/cms.ts`                                                                                    |  —  |   ✓   |     Obsolete alias     | Prefer `NEXT_PUBLIC_WEB_URL`. Kept for backward compatibility.          |

### PerGon Expert / AI Providers

| Variable                   | Purpose                     | Where used                               | Web | Admin | Required | Notes                                         |
| -------------------------- | --------------------------- | ---------------------------------------- | :-: | :---: | :------: | --------------------------------------------- |
| `EXPERT_AI_PROVIDER`       | Preferred provider          | `packages/expert/src/providers/index.ts` |  ✓  |   ✓   | Optional | `openai` \| `anthropic` \| `stub`.            |
| `EXPERT_OPENAI_API_KEY`    | OpenAI API key              | `openai-provider.ts`                     |  ✓  |   ✓   | Optional | Preferred over alias.                         |
| `EXPERT_OPENAI_MODEL`      | Chat model                  | `openai-provider.ts`                     |  ✓  |   ✓   | Optional | Default `gpt-4o-mini`.                        |
| `EXPERT_OPENAI_BASE_URL`   | API base URL                | `openai-provider.ts`                     |  ✓  |   ✓   | Optional | Default OpenAI public API.                    |
| `EXPERT_ANTHROPIC_API_KEY` | Anthropic API key           | `anthropic-provider.ts`                  |  ✓  |   ✓   | Optional | Preferred over alias.                         |
| `EXPERT_ANTHROPIC_MODEL`   | Anthropic model             | `anthropic-provider.ts`                  |  ✓  |   ✓   | Optional | Default `claude-3-5-haiku-latest`.            |
| `OPENAI_API_KEY`           | Alias for OpenAI key        | `openai-provider.ts`                     |  ✓  |   ✓   |  Alias   | Use only if `EXPERT_OPENAI_API_KEY` unset.    |
| `ANTHROPIC_API_KEY`        | Alias for Anthropic key     | `anthropic-provider.ts`                  |  ✓  |   ✓   |  Alias   | Use only if `EXPERT_ANTHROPIC_API_KEY` unset. |
| `AI_PROVIDER`              | Alias for provider selector | `providers/index.ts`                     |  ✓  |   ✓   |  Alias   | Prefer `EXPERT_AI_PROVIDER`.                  |

### Automation / Webhooks

No dedicated Automation or webhook **environment secrets** are read from `process.env` today.

- Automation drain / webhook routes authenticate via session + RBAC (and DB path keys), not `CRON_SECRET` / `AUTOMATION_*` env vars.
- See `docs/VERCEL_DEPLOY.md` — do not wire Vercel Cron against drain endpoints until a service-auth secret exists.

| Variable                          | Status                            |
| --------------------------------- | --------------------------------- |
| `CRON_SECRET`                     | **Not used** (documented absence) |
| `AUTOMATION_*` / webhook HMAC env | **Not used**                      |

### Platform (injected — do not put in app `.env.local`)

| Variable                                                                 | Purpose                            |
| ------------------------------------------------------------------------ | ---------------------------------- |
| `NODE_ENV`                                                               | Runtime mode                       |
| `CI`                                                                     | CI detection (skips Husky install) |
| `VERCEL` / `VERCEL_ENV` / `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` | Vercel platform                    |
| `HUSKY`                                                                  | Set `0` to skip Husky              |

---

## Example values (placeholders only)

```bash
# Web
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role
CMS_REVALIDATE_SECRET=long-random-shared-secret
CMS_PREVIEW_SECRET=long-random-preview-secret

# Admin (additional)
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_WEB_URL=http://localhost:3000
PERGON_SETUP_SECRET=long-random-setup-secret
CMS_REVALIDATE_SECRET=long-random-shared-secret
```

---

## Security checklist

| Secret                              | Correct placement                                         | Never                                 |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`         | Server `.env.local` / Vercel server env                   | Client, git, prompts, `NEXT_PUBLIC_*` |
| `PERGON_SETUP_SECRET`               | Admin only                                                | Web, public docs with real value      |
| `CMS_REVALIDATE_SECRET`             | Web **and** Admin (identical)                             | Client bundles                        |
| `CMS_PREVIEW_SECRET`                | Web **and** Admin (if used)                               | Client bundles                        |
| `ALLOW_DEV_RESET_TOKEN`             | Local only                                                | Vercel Production / Preview           |
| `EXPERT_*_API_KEY` / vendor aliases | Server env                                                | Client, git                           |
| Automation webhook path keys        | Database / Admin UI                                       | Hardcoded env (N/A today)             |
| Storage                             | Bucket **names** may be public; objects gated by policies | Putting service role in browser       |

---

## Consistency notes

1. **Duplicates / aliases (intentional)**
   - `NEXT_PUBLIC_WEB_URL` vs `WEB_APP_URL` → prefer `NEXT_PUBLIC_WEB_URL`.
   - `EXPERT_*` vs `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `AI_PROVIDER` → prefer `EXPERT_*`.

2. **Obsolete**
   - None removed from code. `WEB_APP_URL` and vendor aliases remain as fallbacks only.

3. **Required for CMS end-to-end**
   - Shared `CMS_REVALIDATE_SECRET` on Web + Admin.
   - `NEXT_PUBLIC_WEB_URL` on Admin pointing at Web.
   - Without them, publish still works but revalidate is skipped (`cms.revalidate_skipped`).

4. **turbo.json**
   - All application env keys above are listed in `globalEnv` so Turbo cache invalidates correctly when they change.
