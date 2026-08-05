# PerGon OS — UX / UI Experience Audit

**Phase:** Experience & Brand  
**Date:** 2026-08-04  
**Scope:** Frontend only (`apps/web`, `apps/admin`, `@pergon/ui` tokens/components). No backend, APIs, or database changes.

**Verification:** `pnpm lint` ✓ · `pnpm typecheck` ✓ · `pnpm build` ✓

---

## Cambios realizados

### Sistema de diseño

- Tipografía display más expresiva (tracking de marca, escala 4xl/display refinada).
- Radios más técnicos (menos “soft SaaS”).
- Layout chrome más tenso (sidebar, navbar, container max).
- Utilidades nuevas: `text-brand`, `text-lede`, `surface-stage`, `surface-solemn`, densidad de sección `cinematic`.
- Section DS con más aire y jerarquía tipográfica más clara.

### Home

- Hero brand-first cinematográfico: marca como display; headline subordinado; plano visual `surface-stage` full-bleed (sin gradientes decorativos).
- Copy reescrito hacia **tecnología / confianza / sistema** (no commodity químico).
- Capítulos del sistema con ritmo vertical mayor, fondos alternados y CTA a Expert.
- Productos / por qué / CTA final / ecosistema alineados a narrativa por scroll.
- Nav: acceso directo a Expert; sin estética de plantilla.

### Verify

- Pantalla de verificación institucional (sin pulse infinito).
- Resultado como **dictamen** tipográfico, no alert-card genérica.
- Superficie solemn (`surface-solemn`); ritmo vertical amplio; metadata en mono discreto.

### Productos

- Hero: marca PerGon explícita + nombre como display; media edge-to-edge.
- “Beneficios” → **Capacidades**; “Aplicaciones” → **Contextos de uso**.
- Menos lenguaje de catálogo químico; más ancla tecnológica.

### PerGon Expert

- Deja de parecer chat: layout especialista (contexto sticky + consulta/dictamen).
- Labels “Consulta / Dictamen”; fuentes en borde; feedback ghost.
- Sin burbujas, sin estética AI.

### Admin

- Shell más denso (padding reducido).
- Dashboard operativo en filas compactas (sin muro de JSON/cards KPI).
- Login y módulos con tipografía más de herramienta.
- Marca sidebar: “PerGon”.

---

## Mejoras UX

- Claridad de intención por superficie (Web narra; Admin opera; Verify dictamina; Expert asesora).
- Menos clics mentales: Expert en nav/CTA; Verify sin ruido.
- Feedback de carga más serio (spinner contenido, sin animación teatral).
- Empty/honest states preservados (sin prueba social falsa).
- Persistencia de contexto Expert vía query params, ahora más legible.

---

## Mejoras UI

- Jerarquía tipográfica dominante (marca → mensaje → soporte → metadata).
- Menos contenedores / sin dashed “placeholder SaaS”.
- Grid y ritmo 8px; capítulos con aire cinematográfico controlado.
- Contraste y focus visibles mantenidos.
- Identidad más tecnológica, menos “template limpio”.

---

## Mejoras Motion

- Presupuesto respetado: reveals más cortos (≈350ms).
- Eliminado pulse infinito en Verify.
- Hero: fade/entrada única; sin parallax ni glow.
- Admin: sin motion cinematográfico.

---

## Mejoras Responsive

- Heroes en grid que colapsan a stack con plano visual generoso en mobile.
- Expert: sidebar de contexto se apila arriba en viewport estrecho.
- Admin: densidad usable en tablet (padding y tipografía compacta).

---

## Mejoras Performance

- Sin nuevos assets pesados ni librerías.
- Motion reducido / `prefers-reduced-motion` intacto.
- Expert sigue lazy-loaded; 3D de producto sigue gateado.
- Dashboard Admin deja de renderizar JSON masivo en pre (menos layout cost).

---

## Recomendaciones futuras

1. Fotografía / renders reales full-bleed para hero Home y Producto (LCP con `next/image`).
2. OG image de marca real para `summary_large_image`.
3. SSR del resultado Verify (menos flash de “verificando”).
4. Microinteracciones de fila Admin (hover sutil) sin entrance stagger.
5. Dark mode editorial revisado sobre surfaces `stage` / `solemn`.
6. Lighthouse CI en `/`, `/expert`, `/verify/[id]`, `/productos/[slug]`.
7. Contenido de catálogo y casos reales para completar la narrativa sin placeholders.

---

## Principio de cierre

La experiencia debe recordarse por **precisión y confianza**, no por efectos.  
Web cuenta el sistema. Verify certifica. Expert dictamina. Admin produce.
