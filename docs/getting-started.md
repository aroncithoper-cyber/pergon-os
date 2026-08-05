# Getting Started

## Prerequisites

- Node.js >= 20
- pnpm **9.15.9** (Corepack: `corepack enable` — versión fijada en `package.json#packageManager`)
- Supabase CLI (optional, for migrations / functions)

## Install

```bash
pnpm install
```

## Environment (required for live Supabase)

1. Copy `apps/web/.env.example` → `apps/web/.env.local`
2. Copy `apps/admin/.env.example` → `apps/admin/.env.local`
3. Fill `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from Dashboard → Settings → API

See [SUPABASE.md](./SUPABASE.md) for full details.

The monorepo **builds without keys**. Clients throw only when invoked without env.

## Development

```bash
pnpm dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3001

## Quality

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```
