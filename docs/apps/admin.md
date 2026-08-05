# Admin App

Package: `@pergon/admin`

Port: `3001`

Operational control panel — core of PerGon OS.

## Structure

```
src/
  app/
    (dashboard)/   Dashboard route group shell
    api/
  components/
  features/
    auth/
    users/
    settings/
  hooks/
  lib/
  types/
```

## Dependencies

- `@pergon/ui`
- `@pergon/shared`
- `@pergon/database`
- `framer-motion`
