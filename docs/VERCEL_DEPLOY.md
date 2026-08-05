# PerGon OS — Deploy on Vercel

Guía oficial para desplegar el monorepo en producción.  
Dos aplicaciones Next.js = **dos proyectos Vercel**.

| App               | Package         | Puerto local | Root Directory |
| ----------------- | --------------- | ------------ | -------------- |
| Web (público)     | `@pergon/web`   | 3000         | `apps/web`     |
| Admin (operación) | `@pergon/admin` | 3001         | `apps/admin`   |

Package manager: **pnpm@9.15.9** vía Corepack (`packageManager` en root + `apps/web` + `apps/admin`).  
Lockfile: `pnpm-lock.yaml` con `lockfileVersion: '9.0'` (pnpm 9). Node: **20** (ver `.nvmrc`).  
No uses pnpm 10 ni `--no-frozen-lockfile`.

---

## 1. Pre-requisitos

1. Repo en GitHub/GitLab/Bitbucket conectado a Vercel.
2. Proyecto Supabase de producción (migraciones aplicadas — ver `docs/SUPABASE.md`).
3. Dominios listos (o usar `*.vercel.app` temporalmente).
4. Localmente: `pnpm install` + `pnpm build` OK.

---

## 2. Crear dos proyectos en Vercel

Repite para **Web** y **Admin**:

1. **Add New Project** → importa el mismo monorepo.
2. **Root Directory** → `apps/web` o `apps/admin` (Edit → seleccionar carpeta).
3. Framework Preset: **Next.js** (auto).
4. Build / Install: deja los de `apps/*/vercel.json` (install en monorepo root + turbo filter).
5. **Node.js Version**: 20.x (Project Settings → General).
6. No marques un único proyecto para ambas apps.

Incluir archivos fuera del Root Directory: Vercel lo hace por defecto en monorepos; no borres `pnpm-workspace.yaml` ni `pnpm-lock.yaml` del root.

---

## 3. Variables de entorno

Configura en **cada** proyecto: Settings → Environment Variables.  
Aplica a **Production** y **Preview** (salvo secretos solo-prod).

### 3.1 Comunes (Web + Admin)

| Variable                                | Público | Notas                                                          |
| --------------------------------------- | ------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                   | Sí      | Origen canónico **de esa app**, sin `/` final. Web ≠ Admin.    |
| `NEXT_PUBLIC_SUPABASE_URL`              | Sí      | Mismo proyecto Supabase si comparten datos.                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | Sí      | Anon key.                                                      |
| `SUPABASE_SERVICE_ROLE_KEY`             | **No**  | Solo server. Nunca `NEXT_PUBLIC_`.                             |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_*` | Sí      | Opcional; defaults `media`, `exports`, `avatars`, `documents`. |

`NEXT_PUBLIC_*` se inlinan en el **build**. Tras cambiarlas, **redeploy**.

Si falta `NEXT_PUBLIC_APP_URL` en Preview, `getAppUrl()` usa `https://$VERCEL_URL` como fallback.

### 3.2 Solo Admin

| Variable              | Notas                                                                          |
| --------------------- | ------------------------------------------------------------------------------ |
| `PERGON_SETUP_SECRET` | Obligatoria para bootstrap de la primera organización. Cadena larga aleatoria. |

### 3.3 Expert (Web; opcional en Admin)

| Variable                                                                   | Notas                             |
| -------------------------------------------------------------------------- | --------------------------------- |
| `EXPERT_AI_PROVIDER`                                                       | `openai` \| `anthropic` \| `stub` |
| `EXPERT_OPENAI_API_KEY` / `EXPERT_OPENAI_MODEL` / `EXPERT_OPENAI_BASE_URL` | OpenAI                            |
| `EXPERT_ANTHROPIC_API_KEY` / `EXPERT_ANTHROPIC_MODEL`                      | Anthropic                         |

Aliases `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_PROVIDER` también funcionan.

### 3.4 Nunca en Production / Preview

| Variable                  | Riesgo                                    |
| ------------------------- | ----------------------------------------- |
| `ALLOW_DEV_RESET_TOKEN=1` | Expone tokens de reset en respuestas API. |

### 3.5 Ejemplo Web Production

```
NEXT_PUBLIC_APP_URL=https://www.pergon.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
EXPERT_AI_PROVIDER=openai
EXPERT_OPENAI_API_KEY=sk-...
```

### 3.6 Ejemplo Admin Production

```
NEXT_PUBLIC_APP_URL=https://admin.pergon.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PERGON_SETUP_SECRET=<random-32+-chars>
```

---

## 4. Supabase Auth (URLs)

En Supabase → Authentication → URL Configuration:

1. **Site URL**: origen de Web (o Admin si el login vive ahí).
2. **Redirect URLs**: añade Production y Preview de **ambas** apps, p. ej.:
   - `https://www.pergon.example/**`
   - `https://admin.pergon.example/**`
   - `https://*-your-team.vercel.app/**`

Sin esto, OAuth / magic links / recovery fallan en Preview.

---

## 5. Dominios

1. Project → Settings → Domains.
2. Web: `www` / apex.
3. Admin: subdominio `admin` (recomendado).
4. Actualiza `NEXT_PUBLIC_APP_URL` al dominio final y **redeploy**.

---

## 6. Qué hace el build

Con Root Directory `apps/web` (análogo Admin):

1. `pnpm install` desde el monorepo root (lockfile + workspaces).
2. `turbo run build --filter=@pergon/web` → `next build` en esa app.
3. Packages `@pergon/*` se consumen como TypeScript vía `transpilePackages` (no requieren `dist` previo).
4. `outputFileTracingRoot` apunta al root del monorepo para que las Serverless Functions incluyan workspace packages.
5. Husky no corre en Vercel (`VERCEL` / `CI`).

Build local de verificación:

```bash
pnpm install
pnpm build
```

---

## 7. Runtime y superficie

| Pieza          | Comportamiento en Vercel                                                                    |
| -------------- | ------------------------------------------------------------------------------------------- |
| Middleware     | Edge (Supabase session refresh; sin Node APIs).                                             |
| Route Handlers | Node.js por defecto; Expert / verify / catalog / webhooks explicitan `nodejs` donde aplica. |
| ISR            | `/productos/[slug]` con `revalidate = 120`.                                                 |
| APIs `/api/*`  | `Cache-Control: private, no-store`.                                                         |
| Imágenes       | `next/image` + `**.supabase.co` storage; 3D vía dynamic `ssr: false`.                       |
| Fonts          | Geist Sans / Mono (paquete `geist`, self-hosted por Next).                                  |
| SEO Web        | `metadataBase`, robots, sitemap, OG; dependen de `NEXT_PUBLIC_APP_URL`.                     |
| SEO Admin      | `robots: noindex`.                                                                          |
| Headers        | `X-Frame-Options`, nosniff, Referrer-Policy, Permissions-Policy, HSTS.                      |

No uses Edge Runtime en handlers que toquen `Buffer` (auth crypto, webhook secrets).

---

## 8. Checklist post-deploy

- [ ] Deploy Web Production verde.
- [ ] Deploy Admin Production verde.
- [ ] Home Web carga; `/robots.txt` y `/sitemap.xml` usan el dominio real.
- [ ] Admin login / setup con `PERGON_SETUP_SECRET`.
- [ ] Verify / Expert responden (con env Expert si aplica).
- [ ] Webhook Admin: `POST /api/v1/automations/webhooks/:pathKey` + header `x-pergon-webhook-secret`.
- [ ] Supabase redirect URLs cubren Production + Preview.
- [ ] `ALLOW_DEV_RESET_TOKEN` **ausente**.
- [ ] Service role solo en env server de Vercel.

---

## 9. Preview deployments

Cada PR genera Preview por proyecto.  
Asegura env Preview = mismas claves Supabase (o proyecto staging) + redirect URLs.  
`NEXT_PUBLIC_APP_URL` en Preview: o bien la URL de preview fija, o confía en el fallback `VERCEL_URL`.

---

## 10. Troubleshooting

| Síntoma                             | Causa probable                          | Acción                                                |
| ----------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| Build: missing module `@pergon/...` | Root Directory / install no en monorepo | Root `apps/<app>`; installCommand del `vercel.json`   |
| SEO / OG apuntan a localhost        | Falta `NEXT_PUBLIC_APP_URL` en build    | Set + Redeploy                                        |
| Auth redirect inválido              | Supabase allow list                     | Añadir URL Vercel                                     |
| Function 500 al importar package    | Tracing incompleto                      | Confirmar `outputFileTracingRoot` en `next.config.ts` |
| Expert stub / error provider        | Falta API key / provider                | Set `EXPERT_*`                                        |
| Org bootstrap 403/disabled          | Sin `PERGON_SETUP_SECRET`               | Set en Admin                                          |
| Husky error en install              | Hooks en CI                             | Ya omitido si `VERCEL`/`CI`; o `HUSKY=0`              |

---

## 11. Limitaciones de producto (no bloquean el build Vercel)

Un deploy verde **no** implica plataforma durable completa. Auditoría de readiness:

| Tema                                              | Estado                                                                                                             | Implicación                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| UoW de dominio (auth/ops/identity/catalog/expert) | Todavía **in-memory** en factories de app; clientes Supabase existen pero no son el path runtime de esos servicios | Datos no persisten entre instancias serverless; no tratar el deploy como “live platform” hasta cablear adapters Supabase |
| Drain de automations / notifications              | Requiere sesión + permiso; **no** hay `CRON_SECRET` ni crons en `vercel.json`                                      | No uses Vercel Cron contra esos endpoints hasta autenticación de servicio                                                |
| Middleware Admin                                  | Solo refresca sesión Supabase; no gatea `(dashboard)` / API (salvo checks por ruta)                                | Superficie Admin pública con auth por handler — endurecer en fase de seguridad                                           |
| ISR `/productos/[slug]`                           | `revalidate = 120` OK en Vercel                                                                                    | Con catálogo en memoria, el cache no refleja un store compartido                                                         |

Ver también `docs/SUPABASE.md` y `docs/AUDIT_PHASE_11.md`.

---

## 12. Comandos útiles (CLI)

```bash
# Desde el monorepo (tras vercel link en cada app)
cd apps/web && vercel --prod
cd apps/admin && vercel --prod
```

O despliega desde el dashboard tras push a la rama de producción.

---

## 13. Referencias internas

- `docs/SUPABASE.md` — migraciones y clientes.
- `docs/getting-started.md` — desarrollo local.
- `docs/AUDIT_PHASE_11.md` — hallazgos de seguridad / deuda.
- `apps/web/vercel.json` / `apps/admin/vercel.json` — install + turbo filter.
- `.env.example` / `apps/*/.env.example` — catálogo de variables.
