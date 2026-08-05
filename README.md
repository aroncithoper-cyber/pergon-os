# PerGon OS

Monorepo enterprise for PerGon OS.

## Requirements

- Node.js >= 20
- pnpm **9.15.9** (`packageManager` + Corepack)

## Setup

```bash
pnpm install
```

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start all apps in development |
| `pnpm build`     | Build all packages and apps   |
| `pnpm lint`      | Lint the monorepo             |
| `pnpm typecheck` | Type-check the monorepo       |
| `pnpm format`    | Format with Prettier          |

## Apps

- `apps/web` — public / product surface (port 3000)
- `apps/admin` — operational control panel (port 3001)

## Packages

- `@pergon/ui` — design system (shadcn/ui)
- `@pergon/config` — shared ESLint, TypeScript, Prettier, Tailwind configs
- `@pergon/database` — Supabase clients and types
- `@pergon/shared` — shared types, constants, utilities
- `@pergon/three` — React Three Fiber utilities
