# Admin UI i18n (Español México)

Default locale: **es-MX**. English catalog **en-US** is prepared for future switching.

## Structure

- `messages/es-MX.ts` — operator-facing Spanish (México)
- `messages/en-US.ts` — English mirror (inactive by default)
- `dictionary.ts` — `tStatic` / `tLocale` (no React)
- `provider.tsx` — `I18nProvider` + `useI18n`
- Shared server helpers: `@pergon/shared/i18n` (`formatZodError`, HTTP/domain messages)

## Usage

```tsx
const { t } = useI18n();
return <Button>{t("common.save")}</Button>;
```

```ts
import { tStatic } from "@/i18n";
tStatic("nav.dashboard");
```

Do not surface raw Zod JSON or English domain leftovers — `apiFetch` sanitizes via `sanitizeOperatorMessage`.
