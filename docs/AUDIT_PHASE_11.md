# PerGon OS — Phase 11 Audit

**Date:** 2026-08-04  
**Scope:** Full monorepo refinement (architecture, security, performance, SEO, a11y, APIs, DB, DX).  
**Constraint:** No new product features — only fixes, hardening, and cleanup.

**Verification:** `pnpm lint` ✓ · `pnpm typecheck` ✓ · `pnpm build` ✓

---

## Problems found

### Critical — Security

| #   | Issue                                                                         | Location                                    |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Real Supabase JWTs (incl. `service_role`) committed in `.env.example`         | Root + app env examples; `docs/SUPABASE.md` |
| 2   | Passport Admin APIs had **no authz**; actor spoofable from body               | `apps/admin/.../passports/**`               |
| 3   | Automation webhooks accepted requests **without** a secret                    | `engines/automations` + webhook route       |
| 4   | Webhook secret accepted in JSON body (log leakage risk)                       | Webhook ingress route                       |
| 5   | `ops_automation_versions` / `ops_automation_webhooks` created **without RLS** | Migration `…280000`                         |
| 6   | Org bootstrap (`POST /organizations`) unauthenticated                         | Admin organizations route                   |
| 7   | Expert conversation GET was IDOR (UUID only)                                  | Web expert conversations API                |
| 8   | Expert `dailyLimit` client-controlled                                         | Web expert ask route                        |
| 9   | Auth failures mapped to HTTP **400** on Ops routes                            | `toOpsErrorResponse` / `mapOpsHttpError`    |
| 10  | Password reset tokens gated only on `NODE_ENV`                                | Auth forgot-password routes                 |

### High — Correctness / SEO / Perf

| #   | Issue                                                                  |
| --- | ---------------------------------------------------------------------- |
| 11  | Admin nav used `passport:read` (invalid) vs catalog `passports:read`   |
| 12  | Catalog / Expert Admin error status ternaries were dead (`400 : 400`)  |
| 13  | Product page `force-dynamic` defeated `revalidate`                     |
| 14  | Product JSON-LD / canonical used relative URLs                         |
| 15  | Sitemap only listed `/`                                                |
| 16  | `summary_large_image` without images; no brand icon                    |
| 17  | Expert panel pulled into server page graph without code-split boundary |
| 18  | 3D section always mounted even when model disabled                     |
| 19  | Empty `<track kind="captions" />` without `src`                        |
| 20  | Weak keyboard focus styles on primary brand/nav links; EN error copy   |
| 21  | No baseline security headers on Next apps                              |
| 22  | Duplicated Automation Engine sink wiring (helpers vs use-cases)        |
| 23  | Automation versions list lacked org scope check                        |
| 24  | `docs/SUPABASE.md` migration list outdated                             |

### Deferred (documented, not fully remade)

| #   | Issue                                        | Why deferred                                     |
| --- | -------------------------------------------- | ------------------------------------------------ |
| A   | Admin tokens in `localStorage`               | Requires session cookie redesign (feature-sized) |
| B   | Admin middleware does not gate dashboard/API | Depends on cookie session model                  |
| C   | `@pergon/database` types lag new tables      | Needs generated types from live DB               |
| D   | Duplicate auth route surfaces web↔admin      | Extraction package; no behavior bug              |
| E   | Product gallery still uses `<img>`           | Needs CDN assets + migration to `next/image`     |
| F   | Full CSP / HSTS                              | Needs deploy topology + nonce strategy           |

---

## Changes performed

### Security

- Scrubbed secrets from root and app `.env.example`; documented rotation in `docs/SUPABASE.md`.
- Added `PERGON_SETUP_SECRET` gate for org bootstrap (+ setup form field).
- Locked all passport routes with `requireApiPermission`; actor always from session.
- Webhooks: secret **required**, header-only, compared with `timingSafeEqual`.
- Migration `20260304290000_automation_engine_rls.sql` — RLS + revoke anon/authenticated.
- Expert conversation ownership check via `anonymousKey`; server-fixed `dailyLimit: 30`.
- `mapOpsHttpError` / `toOpsErrorResponse` / identity mapper correctly return 401/403.
- Password reset tokens only when `ALLOW_DEV_RESET_TOKEN=1`.
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` on web + admin.

### Architecture / APIs

- Single `automationEngineFrom(uow)` shared by helpers and use-cases.
- `listAutomationVersions` asserts org membership.
- Catalog / Expert Admin HTTP status mapping fixed (404 / 429 / 400).
- Permission keys aligned to `passports:read` in nav + module definitions.

### SEO / Performance / a11y / UX

- Sitemap includes `/expert`.
- Product pages: ISR via `revalidate` only; absolute canonical + JSON-LD URLs.
- Twitter card defaults to `summary` until real OG assets exist; added `/icon.svg`.
- Expert panel lazy-loaded via client `dynamic(..., { ssr: false })`.
- 3D section gated on `model3d.enabled` + asset URL.
- Removed invalid empty caption track.
- Focus-visible rings on home/product/expert brand links; ES error boundaries.
- `next/image` remotePatterns prepared for Supabase storage.

### Tooling / docs

- `turbo.json` `globalEnv` includes `PERGON_SETUP_SECRET`, `ALLOW_DEV_RESET_TOKEN`.
- `docs/SUPABASE.md` updated with full migration order and key-rotation warning.

---

## Improvements applied (summary)

1. **Fail-closed authz** on previously open passport and bootstrap surfaces.
2. **Webhook authenticity** enforced.
3. **Correct HTTP semantics** for Auth errors through Ops.
4. **Public surface hardening** (Expert IDOR + rate limit).
5. **SEO/ISR/a11y** hygiene for Core Web Vitals readiness.
6. **DB RLS** for new automation tables.
7. **DRY** engine wiring; cleaner Admin permission catalog usage.

---

## Future recommendations

1. **Rotate** any Supabase keys that ever appeared in git history; treat history as compromised until rotated.
2. Move Admin session to **httpOnly Secure cookies**; then enforce auth in middleware for `(dashboard)` + `/api/v1/*` allowlists.
3. Persist Ops/Identity/Auth/Catalog/Expert with real Supabase UoW + **org-scoped RLS policies** (not only ENABLE RLS).
4. Hash webhook secrets at rest; prefer HMAC request signing.
5. Regenerate `packages/database` `Database` types after migrations.
6. Extract shared `apps` auth/API helpers to eliminate web/admin duplication.
7. Migrate product media to `next/image` + real OG/apple icons.
8. Server-render Verify results (SSR fetch) for bots and TTFB.
9. Add CSP with nonces; enable HSTS at the edge.
10. Unify Ops AI sessions vs Expert conversations under one contract before growing both.
11. Add automated security smoke tests (authz matrix on Admin APIs).
12. Run Lighthouse CI on `/`, `/expert`, `/productos/[slug]` in CI.

---

## Out of scope (intentionally unchanged)

- New modules, UI dashboards, Flow Builder UI, worker app.
- New business logic beyond hardening existing flows.
- Full cookie-session rewrite (tracked as recommendation).
