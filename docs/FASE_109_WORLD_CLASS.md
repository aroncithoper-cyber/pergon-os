# FASE 109 — World Class Product Experience

Fecha: 2026-08-05  
Alcance: elevación creativa de toda la UI Signature. **Sin** cambios a Auth, CMS, Supabase, APIs, Dashboard logic, Expert logic, Persistence, Domain, Routes ni Use Cases.

---

## Problemas encontrados

| Área            | Antes                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| Ritmo           | Gaps mixtos (`space-y-*` + `type-voice`), capítulos comprimidos           |
| Tipografía      | Hero sin dominio tipográfico; lead demasiado ancho; tracking HTML-default |
| Botones         | Escala `active:scale`, sombras SaaS, alturas “Bootstrap”                  |
| Cards / paneles | Sombra + hover glow tipo shadcn/SaaS                                      |
| Navbar          | 3.5rem, padding local inconsistente, peso visual alto                     |
| Hero            | Título modesto; artefacto sin protagonismo cinematográfico                |
| Expert          | Badge “Lab”, orb glow, textarea “chat”, turnos en cards                   |
| Verify          | `rounded-lg` + panel genérico, no documento institucional                 |
| Admin           | Topbar CRUD (Ctrl K, densidad web)                                        |
| Consistencia    | Radios/sombras/hover signal en cards interactivos                         |

---

## Decisiones de diseño

1. **Navbar Apple-quiet:** `--navbar-height: 3rem`, tipografía 13–15px, borde `/50`, sin peso CTA salvo Verificar.
2. **Hero editorial:** `text-hero-title` hasta ~5rem; measure corto del lead; artefacto más alto (`xl:min-h-[34rem]`).
3. **Materiales Signature:** paneles sin sombra por defecto; raised solo en artefactos; cards sin glow hover.
4. **Botones instrumento:** sin scale; h-8/9/11; signal por brightness, no sombra.
5. **Expert = laboratorio:** status rings, `sig-instrument`, dictámenes con regla lateral (no chat bubbles).
6. **Verify = documento:** `sig-document`, tipografía solemne, footer institucional.
7. **Admin = OS operativo:** command denser, ⌘K, chrome más fino — sin tocar lógica.

---

## Componentes refinados

- `Button`, `Input`, `Textarea`, `Navbar`, `Card`
- Utilities: `sig-panel`, `sig-panel-raised`, `sig-card*`, **`sig-document`**, **`sig-instrument`**
- Type roles + `text-hero-title` + `type-voice` cadence
- Home: Hero, SiteHeader, NarrativeChapter, Featured, Expert section, Final CTA
- Product hero
- Expert panel (chrome only)
- Verify experience + verifying screen + result header
- Admin shell + topbar (chrome only)

---

## Archivos modificados

### Design system

- `packages/ui/src/globals.css`
- `packages/ui/src/tokens/index.ts`
- `packages/ui/src/components/button.tsx`
- `packages/ui/src/components/navbar.tsx`
- `packages/ui/src/components/input.tsx`
- `packages/ui/src/components/textarea.tsx`
- `packages/ui/src/components/card.tsx`

### Web

- `apps/web/src/features/home/components/home-hero.tsx`
- `apps/web/src/features/home/components/site-header.tsx`
- `apps/web/src/features/home/components/narrative-chapter.tsx`
- `apps/web/src/features/home/components/featured-products-section.tsx`
- `apps/web/src/features/home/components/expert-section.tsx`
- `apps/web/src/features/home/components/final-cta-section.tsx`
- `apps/web/src/features/products/components/product-hero.tsx`
- `apps/web/src/features/expert/components/expert-panel.tsx`
- `apps/web/src/features/verify/components/verify-experience.tsx`
- `apps/web/src/features/verify/components/verify-result-header.tsx`
- `apps/web/src/features/verify/components/verifying-screen.tsx`

### Admin (chrome)

- `apps/admin/src/features/shell/admin-shell.tsx`
- `apps/admin/src/features/shell/admin-topbar.tsx`

---

## Antes vs después (síntesis)

| Superficie | Antes             | Después                        |
| ---------- | ----------------- | ------------------------------ |
| Navbar     | Barra densa 56px  | 48px, links 13px, marca 15px   |
| Hero title | ~3.5rem max       | hasta ~5rem, leading 1.02      |
| Buttons    | scale + shadow    | quiet hover, h-9 default       |
| Expert     | Chat + badge Lab  | Instrumento + dictamen lateral |
| Verify     | Card redondeada   | Documento `sig-document`       |
| Cards      | Glow signal hover | Solo borde/material            |

---

## Deuda restante

- Algunas tablas Admin aún pueden leerse CRUD en densidad de columna (requiere pase por módulo, sin tocar APIs).
- Product gallery/before-after: ritmo editorial OK; microcopy residual de Section DS.
- Lighthouse real post-deploy (no corrido aquí).
- CSP nonces (heredado FASE 108).

---

## Checks

| Comando          | Resultado              |
| ---------------- | ---------------------- |
| `pnpm lint`      | ✅ verde               |
| `pnpm typecheck` | ✅ verde               |
| `pnpm build`     | ✅ verde (web + admin) |

---

## Qué no cambió

Auth, CMS, Supabase, Expert ask/feedback/escalate, Dashboard APIs, Persistence, Domain, Routes, Zod, Use Cases, arquitectura de features.
