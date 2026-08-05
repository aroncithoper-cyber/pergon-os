# Architecture

## Overview

PerGon OS is a pnpm + Turborepo monorepo.

```
apps/          Next.js applications
packages/      Shared libraries
docs/          System documentation
supabase/      Database migrations and local config
.cursor/rules/ Agent rules
```

## Apps

- `apps/web` — public / product surface
- `apps/admin` — operational control panel (system core)

## Packages

- `@pergon/ui` — design system (shadcn/ui ready)
- `@pergon/config` — shared tooling configs
- `@pergon/database` — Supabase clients and types
- `@pergon/shared` — cross-app types, constants, utils
- `@pergon/three` — React Three Fiber utilities

## Boundaries

- Apps depend on packages; packages do not depend on apps.
- Domain features live under each app's `src/features/`.
- Shared UI components belong in `@pergon/ui`.
