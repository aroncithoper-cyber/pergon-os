# FASE 108 — Launch Readiness

Fecha: 2026-08-05  
Alcance: preparación de lanzamiento visual/técnico de `apps/web` (+ hardening ligero de `apps/admin` sin tocar dominio/APIs).

**Restricciones respetadas:** sin cambios a Auth, CMS (modelos/APIs), Supabase, Expert APIs, Dashboard APIs, Persistence, Domain, Routes de negocio, Zod ni Use Cases.

---

## 1. Problemas encontrados

| Área        | Hallazgo                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| SEO         | Twitter Home sin `images`; Expert sin canonical/OG url/images; Product/Verify sin fallback OG                    |
| Sitemap     | Solo `/` y `/expert`; productos publicados ausentes                                                              |
| Robots      | `/preview/` no disallowed                                                                                        |
| Favicons    | Solo `icon.svg`; sin ICO, apple-touch, 192/512, manifest, theme-color, mask-icon                                 |
| Social      | Sin `opengraph-image` / `twitter-image` de marca                                                                 |
| Seguridad   | Headers fuertes pero **sin CSP**; Permissions-Policy incompleta                                                  |
| A11y        | Nav móvil inexistente; Navbar sin `aria-label`; Home sin `<main>`; Expert sin live region; 404 en inglés sin CTA |
| Performance | Product hero LCP con `<img>` crudo; gallery sin `next/image`                                                     |
| Estados     | `loading`/`not-found`/`global-error` débiles o no alineados a marca                                              |
| Admin       | Sin skip link; sin `#main`; sin favicons en `public`                                                             |

---

## 2. Problemas corregidos

- Metadata base + viewport `themeColor`, keywords, twitter `summary_large_image`, icons completos, manifest.
- OG/Twitter default vía `app/opengraph-image.tsx` + `twitter-image.tsx`.
- Home/Expert/Product/Verify: canonical, OG, Twitter, fallback `DEFAULT_OG_IMAGE`.
- Sitemap: productos desde featured CMS (read-only, sin nuevos use cases).
- Robots: `disallow` `/api/` + `/preview/`.
- Favicon set: 16/32/48/180/192/512 PNG, `favicon.ico`, apple-touch, SVG, safari-pinned-tab, `manifest.ts`.
- CSP + COOP + Permissions-Policy ampliada (web + admin).
- Site header: menú móvil (Dialog) + Verificar accesible en touch.
- Landmark `<main id="main">`, skip link Admin, `aria-label` Navbar, Expert `aria-live`/`aria-busy`.
- Product hero + gallery → `next/image` (`priority`/`sizes`/`lazy`).
- 404/500/loading/global-error en español, con recuperación y marca.

---

## 3. Archivos modificados / creados

### Web — SEO / launch assets

- `apps/web/src/lib/seo.ts`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/expert/page.tsx`
- `apps/web/src/app/productos/[slug]/page.tsx`
- `apps/web/src/app/verify/[passportId]/page.tsx`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/robots.ts`
- `apps/web/src/app/manifest.ts`
- `apps/web/src/app/icon.tsx`
- `apps/web/src/app/apple-icon.tsx`
- `apps/web/src/app/opengraph-image.tsx`
- `apps/web/src/app/twitter-image.tsx`
- `apps/web/src/app/favicon.ico`
- `apps/web/public/favicon.ico`
- `apps/web/public/icon.svg`
- `apps/web/public/safari-pinned-tab.svg`
- `apps/web/public/icons/*` (16–512, apple-touch)

### Web — UX / perf / a11y

- `apps/web/src/features/home/components/site-header.tsx`
- `apps/web/src/features/home/home-page.tsx`
- `apps/web/src/features/products/components/product-hero.tsx`
- `apps/web/src/features/products/components/product-gallery.tsx`
- `apps/web/src/features/expert/components/expert-panel.tsx`
- `apps/web/src/app/not-found.tsx`
- `apps/web/src/app/loading.tsx`
- `apps/web/src/app/error.tsx`
- `apps/web/src/app/global-error.tsx`
- `apps/web/next.config.ts`

### Shared UI / Admin (chrome only)

- `packages/ui/src/components/navbar.tsx`
- `apps/admin/src/app/layout.tsx`
- `apps/admin/src/features/shell/admin-shell.tsx`
- `apps/admin/src/lib/seo.ts`
- `apps/admin/next.config.ts`
- `apps/admin/public/**` (iconos)

---

## 4. Decisiones tomadas

1. **OG por defecto en código** (`/opengraph-image`) cuando CMS no provee `ogImageUrl` — evita previews vacíos sin tocar CMS.
2. **Sitemap de productos vía featured del Home publicado** — no se añadió `listPublishedProducts` (prohibido tocar use cases/catalog).
3. **CSP pragmática** con `'unsafe-inline'`/`'unsafe-eval'` para Next 15; `frame-ancestors 'none'` + YouTube/Vimeo/Supabase allowlists.
4. **Menú móvil con Dialog existente** — sin librerías nuevas.
5. **Admin noindex** se mantiene; iconos solo para bookmark chrome.

---

## 5. Deuda técnica restante

| Ítem                          | Notas                                                                       |
| ----------------------------- | --------------------------------------------------------------------------- |
| CSP nonces                    | Sustituir `unsafe-inline`/`unsafe-eval` con nonces por request              |
| Sitemap completo de catálogo  | Requiere puerto de listado publicado en catalog (fuera de alcance)          |
| Lighthouse real en CI         | No se ejecutó Lighthouse headless en este entorno; estimaciones abajo       |
| Gallery/before-after residual | Antes/después puede seguir con `<img>` si existe                            |
| Offline/PWA service worker    | Manifest listo; no SW (evitar scope nuevo sin plan)                         |
| Blur placeholders             | No añadidos (evita dependencia/asset pipeline); LCP cubierto con `priority` |
| Admin login `#main`           | Skip apunta a shell autenticado; login/setup sin landmark aún               |

---

## 6. Resultados de calidad

| Comando          | Resultado              |
| ---------------- | ---------------------- |
| `pnpm lint`      | ✅ verde               |
| `pnpm typecheck` | ✅ verde               |
| `pnpm build`     | ✅ verde (web + admin) |

---

## 7. Lighthouse (estimado)

Estimación post-cambios en Home pública (producción, red buena, mobile):

| Categoría      | Antes (aprox.) | Después (estimado) | Objetivo |
| -------------- | -------------- | ------------------ | -------- |
| Performance    | 85–92          | **94–98**          | 95+      |
| Accessibility  | 92–96          | **98–100**         | 100      |
| Best Practices | 90–96          | **96–100**         | 100      |
| SEO            | 90–95          | **98–100**         | 100      |

Factores +perf: LCP product/home con `next/image`, OG estático, menos glass/blur residual previo.  
Factores −perf residuales: Lenis + Framer + posible iframe hero video; CSP no afecta score.

**Acción recomendada pre-ship:** correr Lighthouse CI (mobile + desktop) contra preview de producción real.

---

## 8. Qué no cambió

Backend, Auth flows, CMS schemas/APIs, Supabase, Expert ask/feedback/escalate, Dashboard logic, Persistence, Domain, Zod, Use Cases, arquitectura de features, rutas de negocio.
