# PerGon OS — CMS Architecture Masterplan

> **Plano maestro del CMS propio de PerGon OS.**  
> Documento de arquitectura de producto y sistema. **No es implementación.**  
> Complementa: `MASTER_ARCHITECTURE.md`, `MODULES.md`, `WEB_STRUCTURE.md`, `ROLES_AND_PERMISSIONS.md`, `PERGON_VISUAL_BIBLE.md`, `BRAND_SYSTEM.md`.  
> Estado: **Fase 14 — Diseño**. Sin código, sin SQL, sin APIs, sin UI specs de componentes.

---

## 0. Tesis

### 0.1 Cambio de estrategia

PerGon Web deja de ser una superficie con contenido embebido en código.  
Pasa a ser una **superficie de lectura** alimentada por un **Experience CMS** operado desde Admin.

| Antes                                    | Después                                            |
| ---------------------------------------- | -------------------------------------------------- |
| Textos/imágenes/videos en código         | Contenido en base de datos + Media Library         |
| Deploy para cambiar un título            | Publicar desde Admin                               |
| Home estático                            | Home compuesto por secciones tipadas versionadas   |
| Productos parcialmente CMS (`catalog_*`) | Productos unificados bajo el módulo CMS + Catálogo |
| Marketing pide a ingeniería              | Marketing opera con permisos y gobernanza          |

### 0.2 Qué es el CMS de PerGon

**PerGon CMS** es el cerebro de la **experiencia pública**: páginas, secciones, menús, footer, promociones, academia, blog, SEO, media y configuración visual acotada.

No es:

- un page builder de HTML libre (WordPress-like),
- un ecommerce headless genérico (Shopify-like),
- un CMS headless de bloques arbitrarios sin dominio (Strapi-like).

Es un **CMS de dominio**: tipado, gobernado por Visual Bible, unido al catálogo, al SEO y al ciclo de publicación — y **separado** del motor de identidad (QR, Pasaporte), de Expert runtime y del motor de automatizaciones.

### 0.3 Una frase de norte

> La Web solo muestra. Admin decide qué se muestra, cuándo y a quién — sin tocar el código ni romper la confianza.

### 0.4 Principios de diseño (CTO + Product + UX + Architecture)

1. **Schema-first, no HTML-first.** Todo campo editable tiene tipo, validación y contrato de render.
2. **Typed sections.** El Home no es un lienzo libre; es una partitura de secciones aprobadas.
3. **Publish is a verb.** Borrador ≠ publicado. Programar ≠ vivir en prod.
4. **Preview before trust.** Nadie publica a ciegas; existe vista previa fiel.
5. **Version + rollback.** Todo cambio reversible de experiencia es recuperable.
6. **Media is reference.** Prioridad: YouTube → Vimeo → archivo propio (último recurso, peso controlado).
7. **Catalog is CMS, identity is not.** El copy de producto se edita; el SKU de pasaporte/ops no se corrompe desde marketing.
8. **Visual Bible is law.** Colores/tipografía/logo editables solo dentro de tokens y assets aprobados.
9. **RBAC + audit.** Cada publicación deja rastro.
10. **Cache for readers, freshness for editors.** La Web es rápida; Admin ve la verdad editorial.
11. **Locale is first-class.** Multilenguaje desde el modelo, no como afterthought.
12. **10-year growth.** Extensible por tipos de sección/entidad — no por plugins caóticos.

---

## 1. Cómo funcionará (modelo mental)

```text
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN — Módulo CMS                        │
│  Editores crean/editan → borrador → preview → programar/    │
│  publicar → versionar → (rollback si hace falta)            │
└────────────────────────────┬────────────────────────────────┘
                             │ Publication Pipeline
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPERIENCE STORE (Supabase / dominio CMS)        │
│  Pages · Sections · Entries · Menus · Theme · Media refs    │
│  Locales · Schedules · Versions · SEO records               │
└────────────────────────────┬────────────────────────────────┘
                             │ Read path (published only)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              WEB — Experience Renderer                        │
│  Resuelve ruta → carga snapshot publicado → render tipado   │
│  Cache / revalidación → SEO metadata → sin lógica editorial │
└─────────────────────────────────────────────────────────────┘
```

**Regla de oro**  
Web nunca escribe contenido CMS. Web solo lee el **snapshot publicado** (o preview token en entorno de vista previa).

---

## 2. Capas del sistema

| Capa                | Responsabilidad                                           | Vive en                                                         |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| **Editorial UI**    | Formularios densos Admin, media picker, schedule, preview | `apps/admin` → feature `cms`                                    |
| **CMS Domain**      | Reglas de publicación, validación de schemas, versionado  | Package futuro `@pergon/cms` (+ extensión de `@pergon/catalog`) |
| **Experience Data** | Persistencia de páginas, secciones, entradas, menús, SEO  | Postgres (org-scoped)                                           |
| **Media Plane**     | Assets + proveedores externos de video                    | Storage + tablas de media                                       |
| **Renderer**        | Mapear tipos de sección → experiencia Web                 | `apps/web` features de lectura                                  |
| **Delivery**        | Cache, ISR/revalidate, CDN imágenes, sitemap              | Edge/Next + automatizaciones                                    |

---

## 3. Módulos del CMS (Admin)

El módulo raíz en Admin se llama **CMS**.  
Navegación propuesta (orden operativo):

| Submódulo                | Controla                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Home**                 | Hero + secciones del home + orden + activación                                     |
| **Productos**            | Experiencia de catálogo público (unifica/extiende `catalog_*`)                     |
| **Tecnología**           | Página sistema: QR, Pasaporte, Expert, Automatizaciones (contenido presentacional) |
| **Academia**             | Cursos, manuales, videos, PDFs, niveles                                            |
| **Promociones**          | Campañas con ventana temporal y prioridad                                          |
| **Blog**                 | Artículos / noticias                                                               |
| **Footer**               | Bloques de pie, redes, legales, contacto                                           |
| **Menús**                | Menú principal, submenús, orden, iconos, visibilidad                               |
| **Media**                | Biblioteca: imágenes, PDF, links YouTube/Vimeo, archivos propios                   |
| **SEO**                  | Defaults globales, overrides por página/entrada, sitemap triggers                  |
| **Configuración Visual** | Logos, favicon, tokens permitidos, assets globales                                 |

> **Nota de producto:** “Productos” en CMS es la **experiencia pública**. El spine operativo (`ops_products`) y el spine de identidad (`products` / pasaporte) permanecen en sus módulos de dominio. El CMS **enlaza** (soft link), no sustituye.

---

## 4. Modelo de contenido (entidades conceptuales)

### 4.1 Jerarquía

```text
Organization
  └── Site (default: Web pública PerGon)
        ├── Locale (es, en, …)
        ├── Navigation trees (main, footer, legal…)
        ├── Theme / Visual config (versioned)
        ├── Pages (home, technology, products index, …)
        │     └── Sections (typed blocks, ordered, toggleable)
        ├── Entries
        │     ├── Catalog Product (experience)
        │     ├── Promotion
        │     ├── Academy Course / Lesson
        │     └── Blog Post
        ├── Media Assets
        └── SEO records
```

### 4.2 Page

Una **Page** es una ruta pública con:

- slug / path estable,
- estado editorial,
- locale,
- SEO,
- lista ordenada de **Sections**,
- ventanas de publicación (opcional a nivel página).

### 4.3 Section (bloque tipado)

Una **Section** no es HTML libre. Es una instancia de un **Section Type** registrado en un catálogo de schemas.

Cada section type declara:

- campos editables (texto, media ref, CTA, color token, flags),
- validaciones,
- restricciones Visual Bible,
- comportamiento de render en Web,
- si admite schedule propio o hereda de la página.

**Home Hero** (ejemplo de contrato de campos — diseño, no schema SQL):

| Campo                            | Tipo conceptual                                       |
| -------------------------------- | ----------------------------------------------------- |
| Título                           | texto localizado                                      |
| Subtítulo                        | texto localizado                                      |
| Video (YouTube/Vimeo preferente) | media ref externa                                     |
| Imagen poster                    | media ref imagen                                      |
| Imagen mobile                    | media ref imagen                                      |
| Botón primario                   | CTA (label + href interno/externo + estilo permitido) |
| Botón secundario                 | CTA                                                   |
| Activar video                    | boolean                                               |
| Activar imagen                   | boolean                                               |
| Activar loop                     | boolean                                               |
| Orden                            | entero                                                |
| Idioma / locale                  | locale                                                |
| Fecha publicación                | datetime                                              |
| Fecha expiración                 | datetime                                              |
| Estado                           | draft / scheduled / published / expired / archived    |

Otras secciones del Home (sistema, productos destacados, ecosystem, CTA final, etc.) siguen el mismo patrón: **tipo + campos + orden + on/off**.

### 4.4 Entry

Entidades de listado/detalle (producto, post, curso, promo) con ciclo de vida propio, SEO propio, media y relaciones.

### 4.5 Media Asset

Referencia unificada:

| Origen                     | Uso                                                         |
| -------------------------- | ----------------------------------------------------------- |
| **YouTube**                | Video preferente (solo URL/ID + metadata)                   |
| **Vimeo**                  | Video alternativo preferente                                |
| **Storage propio**         | Imagen, PDF, video corto solo si no hay alternativa externa |
| **URL externa controlada** | Casos excepcionales allowlisted                             |

Nunca se obliga a subir videos pesados. El CMS almacena **referencias + metadata** (título, duración, thumbnail, provider, id externo).

### 4.6 Navigation Item

Nodo de menú: label, href interno tipado o externo, icono del sistema, orden, visibilidad por locale, flag “activo”, hijos (submenu), y **permisos de visibilidad** solo cuando el ítem apunta a zonas autenticadas (la Web pública rara vez lo necesita; el modelo lo soporta a 10 años).

### 4.7 Theme / Visual Config

Assets y tokens **acotados**:

- logo claro / logo oscuro / favicon,
- tipografías del Brand System (selección, no upload libre de fuentes pirata),
- colores solo dentro de tokens aprobados (no hex libre que rompa Instrumental Realism),
- videos/imágenes globales (og default, poster fallback).

---

## 5. Qué puede editarse

| Dominio                                                                                                                                        | Editable desde CMS                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Home hero y secciones                                                                                                                          | Sí — tipado                                 |
| Orden / activación de secciones                                                                                                                | Sí                                          |
| Fondos/colores de sección                                                                                                                      | Sí — **solo tokens / presets Visual Bible** |
| Textos, CTAs, media de experiencia                                                                                                             | Sí                                          |
| Productos (experiencia): destacados, categorías, galería, video, PDF, ficha, diluciones, beneficios, aplicaciones, FAQ, relacionados, CTA, SEO | Sí                                          |
| Página Tecnología (copy, media, orden de capítulos presentacionales)                                                                           | Sí                                          |
| Promociones + schedule                                                                                                                         | Sí                                          |
| Academia (cursos, media, categorías, instructor, duración, nivel)                                                                              | Sí                                          |
| Blog (artículos, tags, categorías, autor, SEO)                                                                                                 | Sí                                          |
| Footer, menús                                                                                                                                  | Sí                                          |
| Media library                                                                                                                                  | Sí                                          |
| SEO por página/entrada + defaults                                                                                                              | Sí                                          |
| Logos / favicon / assets globales                                                                                                              | Sí — con validación de formato/zona segura  |

---

## 6. Qué nunca debe editarse desde el CMS

Estas superficies **no** son contenido de marketing. El CMS no es dueño de su verdad.

| Dominio                                                          | Por qué está fuera                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Emisión / revocación / estados de Pasaporte                      | Integridad de identidad                                                  |
| Rotación / resolución criptográfica de QR                        | Antifalsificación                                                        |
| Scan events, alertas de seguridad                                | Auditoría y seguridad                                                    |
| Motor de automatizaciones (código/reglas de ejecución)           | Operación industrial; el CMS solo puede **describir** el concepto en Web |
| System prompt core / tools RBAC de Expert                        | Seguridad IA; CMS puede editar copy de la página Expert, no el cerebro   |
| RLS, roles de sistema, secrets                                   | Seguridad                                                                |
| Tokens de diseño fuera de Visual Bible                           | Identidad de marca a 10 años                                             |
| HTML/JS arbitrario en secciones                                  | XSS + ruptura de marca                                                   |
| Métricas/testimonios inventados                                  | Filosofía de confianza (prohibición de ficción)                          |
| Precios críticos / formulaciones secretas sin permiso de dominio | Separación marketing vs ops/quality                                      |
| Soft-delete de audit / historial de publicación sensible         | Cumplimiento                                                             |

**Regla:** el CMS puede **narrar** el sistema; no puede **mutar** el sistema de confianza.

---

## 7. Relación con lo ya construido

| Existente                                    | Relación con CMS                                                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalog_*` + `@pergon/catalog`              | **Núcleo de Productos CMS.** Se absorbe UX-wise bajo Admin → CMS → Productos. Se extiende lifecycle (preview, schedule, versions) al resto del CMS. |
| `apps/web/.../home/content.ts`               | **Deuda a retirar.** Pasa a ser seed inicial → luego solo lectura desde Experience Store.                                                           |
| `ops_products` / identity `products`         | Spines enlazados por ID; no se editan como páginas de marketing.                                                                                    |
| Storage buckets `media` / `documents`        | Backend del Media plane; políticas de acceso endurecidas por org.                                                                                   |
| Automations (`seo.sitemap_regenerate`, etc.) | Disparadas en publish/unpublish.                                                                                                                    |
| Rol `marketing` (documentado)                | Rol primario del CMS + permisos granulares.                                                                                                         |
| Visual Bible / Brand System                  | Guardrails de Configuración Visual y de section schemas.                                                                                            |

---

## 8. Cómo se almacenará (conceptual — sin SQL)

### 8.1 Principios de almacenamiento

- **Org-scoped** (multi-tenant listo).
- **UUID** en entidades.
- **Soft delete** en entradas recuperables.
- **Timestamps + actor** en mutaciones editoriales.
- **Locale** como dimensión (traducciones por campo o por fila de traducción — decisión de implementación futura; el plano exige paridad de locales).
- **JSON tipado** solo dentro de schemas versionados de section types (no JSON caótico sin contrato).
- **Referencias a media** por ID; nunca blobs embebidos en filas de página.

### 8.2 Familias de datos

1. **Structure:** sites, pages, sections, menus.
2. **Entries:** products, posts, courses, promotions.
3. **Media:** assets + provider refs.
4. **Publication:** status, publish_at, unpublish_at, priority.
5. **Versions:** snapshots inmutables de documentos editoriales.
6. **SEO:** records por entidad.
7. **Theme:** visual config versionada.
8. **Audit:** eventos CMS (quién publicó qué).

### 8.3 Separación published vs working copy

Cada documento editorial tiene:

- **Working copy** (lo que edita el redactor),
- **Published snapshot** (lo que lee la Web),
- **Version history** (snapshots etiquetados).

La Web **nunca** lee la working copy salvo preview autenticado/tokenizado.

---

## 9. Ciclo de publicación

### 9.1 Estados

```text
draft → in_review (opcional) → scheduled → published ⇄ unpublished
                              ↘ expired (por end date)
published → archived
cualquier estado editable → nueva version al publicar
```

| Estado      | Visible en Web pública         |
| ----------- | ------------------------------ |
| draft       | No                             |
| in_review   | No                             |
| scheduled   | No (hasta `publish_at`)        |
| published   | Sí (si dentro de ventana)      |
| expired     | No (tras `unpublish_at` / end) |
| archived    | No                             |
| unpublished | No                             |

### 9.2 Programación

- **Programar publicación:** `publish_at` futuro → worker/cron de dominio marca published y dispara revalidación.
- **Programar ocultamiento:** `unpublish_at` / `ends_at` (promos) → mismo mecanismo.
- **Prioridad** (promociones): desempate cuando varias activas compiten por el mismo slot.
- Idempotencia: jobs de schedule con clave estable para no doble-publicar.

### 9.3 Quién publica

Permisos separados:

- `cms:write` — editar borradores
- `cms:publish` — publicar / programar / despublicar
- `cms:rollback` — restaurar versión
- Granularidad por área: `cms.home:*`, `cms.products:*`, `cms.blog:*`, etc.

---

## 10. Borradores

- Toda edición ocurre sobre **working copy**.
- Autosave editorial (Admin) sin publicar.
- Indicador claro: “Borrador distinto de lo publicado”.
- Diff humano: título/campos críticos cambiados antes de publish.
- Bloqueo optimista (`version` / `updated_at`) para dos editores concurrentes.
- No hay “guardar = publicar”. Publicar es acción explícita (y a menudo confirmada).

---

## 11. Vista previa (Preview)

### 11.1 Requisitos

- Preview **fiel** al renderer Web (mismos section types).
- Accesible desde Admin (“Abrir preview”).
- No indexable (noindex, token, short TTL).
- Puede mostrar working copy o una versión histórica.

### 11.2 Mecánica conceptual

1. Editor genera **preview token** firmado (TTL corto, scope documento+locale).
2. Web ruta de preview valida token en server.
3. Renderer carga working copy / version, no snapshot público.
4. Token no concede permisos de escritura ni acceso a otros documentos.

### 11.3 UX Admin

- Preview desktop / mobile viewport.
- Banner “PREVIEW — no público”.
- CTA “Publicar” vuelve al flujo editorial, no vive solo en la preview.

---

## 12. Versionado

- Cada **publish** crea una **versión inmutable** (snapshot del documento + metadata: actor, timestamp, nota opcional).
- Versiones numeradas por documento (`v1`, `v2`…).
- Working copy puede basarse en “editar desde versión N”.
- Media refs se versionan por ID (si un asset se reemplaza, las versiones viejas conservan el ref histórico o un pin de URL — política: **pin de media en snapshot** para no reescribir el pasado).

---

## 13. Rollback

- Acción `cms:rollback`: selecciona versión N → la copia como nueva working copy **o** la republica como N+1 (recomendado: **republicar como nueva versión**, nunca reescribir historia).
- Rollback deja audit log.
- Rollback de Theme / Menús / Home sigue el mismo patrón (documentos versionables).
- No hay rollback de eventos de identidad (fuera de CMS).

---

## 14. Permisos

### 14.1 Rol ancla

**`marketing`** — operación diaria del CMS.  
**`admin` / `super_admin`** — todo + Configuración Visual sensible.  
Otros roles (`sales`, etc.) pueden tener `cms:read` o publicación limitada según política.

### 14.2 Permisos propuestos (catálogo)

| Permiso                                             | Capacidad                          |
| --------------------------------------------------- | ---------------------------------- |
| `cms:read`                                          | Ver módulo CMS                     |
| `cms:write`                                         | Editar borradores                  |
| `cms:publish`                                       | Publicar / programar / despublicar |
| `cms:rollback`                                      | Restaurar versiones                |
| `cms.media:read` / `cms.media:write`                | Biblioteca                         |
| `cms.seo:write`                                     | SEO global y overrides             |
| `cms.theme:write`                                   | Logos / tokens permitidos          |
| `cms.menus:write`                                   | Menús                              |
| `cms.products:write` / `publish`                    | Experiencia catálogo               |
| `cms.blog:*` / `cms.academy:*` / `cms.promotions:*` | Áreas                              |

UI Admin **refleja** permisos; el server **aplica** (fail closed).  
Toda publicación sensible → `audit_logs`.

---

## 15. Cache y delivery (Web)

### 15.1 Objetivos

- Lectores: TTFB bajo, HTML estable, imágenes optimizadas.
- Editores: ver cambios tras publish en segundos/minutos, no horas.
- Verify/QR paths **no** dependen del cache del CMS (dominio separado).

### 15.2 Estrategia conceptual

| Capa                    | Comportamiento                                                    |
| ----------------------- | ----------------------------------------------------------------- |
| Snapshot publicado      | Fuente de verdad de lectura                                       |
| Cache de página/sección | Key: `site + path + locale + version_id`                          |
| On publish              | Invalidación / revalidación dirigida (path + layout + sitemap)    |
| On schedule fire        | Igual que publish                                                 |
| Preview                 | Sin cache compartido con público (o cache privado por token)      |
| Stale-while-revalidate  | Permitido en marketing; **prohibido** para estado de pasaporte/QR |

### 15.3 Automatización

Hook de dominio: `cms.content_published` → jobs:

- revalidate paths,
- regenerar sitemap,
- refrescar OG si cambió,
- notificar canal interno opcional.

---

## 16. Optimización de imágenes

| Regla        | Detalle                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| Upload       | Tipos allowlisted; tamaño máximo; virus policy cuando exista                             |
| Derivados    | Generar variantes (hero, card, og, mobile) en pipeline de media                          |
| Web          | Servir vía optimizador de imágenes de la app / CDN; nunca full-res innecesario           |
| Alt text     | Campo editorial obligatorio en assets usados en contenido                                |
| Focal point  | Opcional para crops responsive                                                           |
| Visual Bible | Rechazo editorial de assets que fallen criterios de calidad (proceso humano + checklist) |

El CMS no “inventa” dirección de arte: el editor elige; la Bible juzga.

---

## 17. Videos

### 17.1 Orden de prioridad (normativo)

1. **YouTube** (preferido)
2. **Vimeo**
3. **Archivo propio** (solo si compliance/offline/demo lo exige; límite de peso y duración)

### 17.2 Modelo

- Guardar provider + external id / URL canónica + thumbnail + título.
- Flags de sección: activar video, loop (solo si el player lo permite sin autoscroll agresivo), poster.
- Mobile: imagen mobile / poster como fallback (reduced data / autoplay policies).
- Admin nunca obliga a subir MP4 de hero.

### 17.3 Experiencia

- Hero y secciones respetan Instrumental Realism (sin whoosh de plantilla).
- Reduced motion: poster + copy, sin autoplay forzado.

---

## 18. SEO

### 18.1 Por entidad

Campos: `seo_title`, `seo_description`, `og_image`, canonical opcional, index/noindex (default index en públicos; noindex en preview, drafts, admin).

### 18.2 Globales

- Defaults de sitio (title template, descripción corta, OG default).
- Redirects gestionados (lista controlada; no `.htaccess` libre).
- Sitemap generado desde páginas/entradas **published**.
- Schema.org tipado por tipo de página (Organization, Product experience, Article) — sin claims inventados.

### 18.3 Gobernanza

- SEO no puede marcar “index” en preview tokens.
- Cambios SEO relevantes disparan revalidación y sitemap job.
- Admin permanece `noindex`.

---

## 19. Multilenguaje

### 19.1 Modelo

- Locales activos por Site (ej. `es` default, `en` futuro).
- Cada documento tiene traducciones por locale; publicación puede ser **independiente por idioma** (un locale published no fuerza otro).
- Menús/footer/theme labels localizables.
- Slugs localizados con mapa de alternates (`hreflang`).

### 19.2 UX Admin

- Selector de locale persistente en el módulo CMS.
- Indicador de “faltan traducciones”.
- Prohibido mezclar idiomas en un mismo snapshot de locale.

### 19.3 Fallback

Política explícita: ¿mostrar default locale o 404?  
**Recomendación PerGon:** no servir idioma mezclado; fallback solo si configuración lo declara, y siempre honesto.

---

## 20. Mapas de superficie editable

### 20.1 Home

- Hero completo (campos listados en §4.3).
- Secciones: activar/desactivar, orden, textos, media, CTAs, fondos/colores tokenizados.
- Productos destacados: selección desde catálogo publicado + orden.
- Programación a nivel hero/sección/página.

### 20.2 Productos

Todo lo pedido (destacados, categorías, orden, imágenes, video, PDF, ficha, diluciones, beneficios, aplicaciones, FAQ, relacionados, CTA, SEO) bajo el modelo Entry + children ya iniciado en `catalog_*`, elevado al estándar de preview/version/schedule del CMS.

### 20.3 Tecnología

Página (o conjunto de secciones) presentacional sobre QR, Pasaporte, Expert, Automatizaciones: copy, media, orden de capítulos.  
**No** edita el comportamiento runtime de esos sistemas.

### 20.4 Promociones

Imagen/video, ventana temporal, prioridad, flags, slots (home banner, products strip, etc.).  
Solo una promo “ganadora” por slot según prioridad + ventana.

### 20.5 Academia

Cursos como entries; lecciones con video (YouTube/Vimeo), PDF/manuales, categorías, instructor, duración, nivel.  
Puede enlazar knowledge de Expert **sin** mutar embeddings automáticamente salvo job explícito (futuro).

### 20.6 Blog

Posts con autor, tags, categorías, hero media, SEO, schedule.

### 20.7 Footer & Menús

Árboles editables; links internos tipados (elige página/entrada existente) preferibles a URLs sueltas; externos allowlisted/confirmados.

### 20.8 Configuración Visual

Logos, favicon, tokens permitidos, media global.  
Cambios de theme = documento versionable + publish (no hot-edit silencioso en prod sin snapshot).

---

## 21. UX del módulo CMS (Admin) — dirección, no wireframes

- Densidad Admin: tablas + formularios, no page-builder canvas tipo Wix.
- Para Home: **lista ordenable de secciones** + editor del tipo seleccionado (rápido, auditable).
- Media picker único reutilizable en todos los submódulos.
- Estados visibles: draft / scheduled / published / expired.
- Confirmación en publish/rollback.
- Empty states con CTA (“Crear sección”, “Subir media”, “Nueva promo”).
- Nunca glass/cinematic en Admin.

**Tarea primaria por vista** (UX):  
“Publicar el contenido correcto en el momento correcto sin romper la marca.”

---

## 22. Seguridad

- Solo roles autorizados mutan CMS.
- Preview tokens de corto TTL.
- Sanitización: no HTML libre; rich text allowlist estricto si se introduce.
- Media: tipos MIME allowlisted; paths por org.
- SSRF: fetch de oEmbed YouTube/Vimeo solo a endpoints conocidos.
- Audit en publish/rollback/theme.
- Separación: service role solo server; Web anon lee published vía políticas/lectura controlada.

---

## 23. Cómo crecerá 10 años (futuro)

| Horizonte   | Capacidad                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| **V1**      | Home + Media + Menús/Footer + Theme básico + Productos unificados al pipeline CMS + SEO + preview + publish/schedule |
| **V2**      | Tecnología + Promociones + Blog + Academia + versionado completo + rollback UX                                       |
| **V3**      | Workflow `in_review`, comentarios editoriales, locales adicionales, redirects CMS                                    |
| **V4**      | Experimentos A/B controlados (solo marketing slots), personalización light por segmento                              |
| **V5**      | Multi-site (microsites de marca/región) reutilizando el mismo CMS domain                                             |
| **Siempre** | Nuevos **Section Types** versionados; deprecation controlada; nunca plugins opacos                                   |

### Extensibilidad

El CMS crece registrando:

- nuevos **Section Types**,
- nuevos **Entry Types**,
- nuevos **slots de promoción**,

…no permitiendo código arbitrario de terceros en runtime.

---

## 24. Anti-objetivos (lo que deliberadamente no seremos)

| No ser                     | Por qué                                        |
| -------------------------- | ---------------------------------------------- |
| WordPress                  | Temas/plugins = deuda y XSS; no dominio PerGon |
| Shopify                    | Commerce-first; PerGon es confianza + ops      |
| Strapi genérico            | Blocs sin Visual Bible ni spines de identidad  |
| Visual page builder libre  | Rompe Instrumental Realism y a11y              |
| CMS que edita Pasaporte/QR | Mezcla amenaza models                          |

---

## 25. Criterios de éxito

El CMS está bien diseñado si:

1. Marketing cambia el Home **sin** deploy de código.
2. Un publish incorrecto se **revierte** en minutos con rollback.
3. La Web nunca muestra borradores.
4. Los videos de hero son YouTube/Vimeo por defecto.
5. Productos públicos se editan en CMS y siguen enlazados a ops/identity sin corrupción.
6. Nada del CMS puede falsificar un pasaporte ni debilitar verify.
7. Toda pieza visual publicada puede auditarse contra Visual Bible.
8. Un nuevo locale no requiere rediseñar el modelo.
9. Un section type nuevo no requiere reescribir el núcleo de publicación.
10. En 10 años, el mismo cerebro CMS sigue siendo el de la plataforma.

---

## 26. Plan de fases de implementación (solo roadmap — sin build aún)

| Fase      | Alcance                                                                 |
| --------- | ----------------------------------------------------------------------- |
| **14.0**  | Este masterplan (aprobación)                                            |
| **14.1**  | Contratos de Section Types + Information Architecture detallada de Home |
| **14.2**  | Modelo de datos + permisos (diseño de schema; aún aprobación)           |
| **14.3**  | Media plane + política YouTube/Vimeo                                    |
| **14.4**  | Publication pipeline (draft/preview/schedule/publish/version)           |
| **14.5**  | Admin CMS shell + Home editor                                           |
| **14.6**  | Web renderer dinámico (retirar `content.ts`)                            |
| **14.7**  | Unificar Productos al pipeline                                          |
| **14.8**  | Tecnología, Promos, Blog, Academia (por prioridad de negocio)           |
| **14.9**  | SEO global, menús, footer, theme                                        |
| **14.10** | Hardening: audit, cache, rollback drills                                |

Ninguna fase escribe código hasta aprobación explícita de este plano y de la subfase correspondiente.

---

## 27. Decisiones obligatorias (tabla normativa)

| Decisión               | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Naturaleza             | CMS de dominio PerGon (Experience CMS)                       |
| Superficie de edición  | Solo Admin → módulo CMS                                      |
| Superficie de lectura  | Web (published snapshots)                                    |
| Builder                | Secciones tipadas — no HTML libre                            |
| Video                  | YouTube → Vimeo → archivo propio                             |
| Productos              | Extender `catalog_*` bajo CMS; spines ops/identity separados |
| Identidad QR/Pasaporte | Fuera de mutación CMS                                        |
| Publicación            | draft / schedule / publish / expire + versions + rollback    |
| Preview                | Token TTL + renderer real                                    |
| Marca                  | Visual Bible + Brand System como guardrail                   |
| Permisos               | RBAC + audit; rol `marketing`                                |
| Cache                  | Invalidación en publish; nunca stale en verify               |
| i18n                   | First-class por locale                                       |
| Crecimiento            | Nuevos types registrados, no plugins caóticos                |

---

## 28. Preguntas abiertas (requieren decisión de negocio antes de construir)

1. ¿Workflow `in_review` obligatorio en V1 o solo publish directo con `cms:publish`?
2. ¿Locales V1: solo `es`, o `es`+`en` desde día uno?
3. ¿Promociones V1 en Home solamente, o también slots en Productos?
4. ¿Academia y Blog son P1 o P2 respecto a Home+Productos?
5. ¿Rich text limitado en blog/academia, o solo bloques tipados sin rich text en V1?
6. ¿Theme color picker libre dentro de neutros, o solo presets nombrados (Panel, Ink, Elevated…)?

---

## 29. Cierre

PerGon CMS no reemplaza el sistema operativo de confianza.  
Lo **alimenta visualmente**: la Web se convierte en el escenario; Admin, en la cabina de control editorial.

Cuando este plano se apruebe, el siguiente entregable de diseño (aún sin código) es **14.1 — Section Type Catalog + IA del Home**: el inventario cerrado de secciones permitidas y sus campos, alineado a Visual Bible y al Cinematic Masterplan.
