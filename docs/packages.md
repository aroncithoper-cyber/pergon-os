# Packages

| Package             | Name               | Role                                                     |
| ------------------- | ------------------ | -------------------------------------------------------- |
| `packages/ui`       | `@pergon/ui`       | Design system + shadcn/ui                                |
| `packages/config`   | `@pergon/config`   | ESLint, TypeScript, Prettier, Tailwind                   |
| `packages/database` | `@pergon/database` | Supabase browser/server/service, storage, realtime, edge |
| `packages/shared`   | `@pergon/shared`   | Shared types, constants, utils                           |
| `packages/identity` | `@pergon/identity` | Passport/QR domain + use cases                           |
| `packages/auth`     | `@pergon/auth`     | AuthN/AuthZ, sessions, RBAC→permissions                  |
| `packages/ops`      | `@pergon/ops`      | Admin ops domain, engines, APIs logic                    |
| `packages/cms`      | `@pergon/cms`      | Experience CMS (Home V1: publish, preview, versions)     |
| `packages/three`    | `@pergon/three`    | React Three Fiber utilities                              |

## Adding a package

1. Create `packages/<name>` with `package.json` scoped as `@pergon/<name>`.
2. Export through `exports` in `package.json`.
3. Add workspace dependency from consuming apps.
4. Add to `transpilePackages` in the app `next.config.ts` if needed.
