# PerGon OS — Master Architecture V1

> Documento normativo de arquitectura.
> Complementa `.cursor/rules/*`, `PERGON_DESIGN_BIBLE.md` y `UI_UX_PRINCIPLES.md`.
> No describe implementación de features: define el sistema que debe sostener 20 años de crecimiento.

---

## 1. Tesis arquitectónica

**PerGon OS es un sistema operativo de negocio** para identidad digital de producto, trazabilidad, operación industrial/comercial y confianza verificable (QR + Pasaporte Digital), con un panel administrativo como núcleo operativo y una web pública como superficie de confianza.

### Decisiones fundacionales (justificadas)

| Decisión                              | Justificación                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| Monorepo pnpm + Turborepo             | Un solo contrato de tipos/UI/datos; releases coordinados; onboarding único            |
| Dos apps Next.js (`web`, `admin`)     | Separar confianza pública de operación; distintos threat models y densidades UX       |
| Packages `@pergon/*`                  | Reuso forzado; evita forks visuales y de clientes de datos                            |
| Supabase (Postgres + Auth + RLS)      | Relacional fuerte para trazabilidad; RLS como frontera; time-to-value sin abdicar SQL |
| Eventos de dominio + automatizaciones | La empresa debe “trabajar sola”; el Admin orquesta, no teclea todo                    |
| QR dinámico + Pasaporte como verdad   | Antifalsificación y ciclo de vida no viven en un JPEG                                 |
| IA PerGon Expert acotada al dominio   | Valor alto sin convertirse en chatbot genérico inseguro                               |

### Qué nunca debe romperse

1. **Verificación pública de QR/Pasaporte** (disponibilidad, veracidad, anti-oráculo).
2. **Integridad de identidad digital** (emisión, rotación, revocación, audit trail).
3. **Frontera de autorización** (server + RLS; nunca solo UI).
4. **Design system único** (`@pergon/ui`) entre superficies.
5. **Separación Web ↔ Admin** (threat model y UX).
6. **Migraciones forward-only** y schema auditable.
7. **Secretos fuera del cliente y del git**.
8. **Idempotencia** en mutaciones de dinero/stock/recargas/rotaciones.

### Qué puede (y debe) crecer

- Módulos de dominio en Admin (`features/*`) y packages nuevos `@pergon/*`.
- Canales: WhatsApp, email, webhooks, app móvil, APIs partner.
- Automatizaciones y workers.
- Multi-organización / multi-planta (tenancy) cuando el negocio lo exija.
- Lectura analítica (replicas / warehouse) sin tocar el OLTP de verificación.

---

## 2. Diagrama lógico

```text
                    ┌─────────────────────────┐
                    │   Clients / Channels      │
                    │ Web · Admin · Mobile ·    │
                    │ WhatsApp · Partners API   │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   Edge / Next App Layer   │
                    │ apps/web · apps/admin     │
                    │ Route Handlers · Actions  │
                    └────────────┬──────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
 ┌────────▼────────┐   ┌─────────▼─────────┐   ┌───────▼────────┐
 │ @pergon/ui      │   │ Domain Features   │   │ @pergon/shared │
 │ Design system   │   │ (per app)         │   │ types/utils    │
 └─────────────────┘   └─────────┬─────────┘   └────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   @pergon/database        │
                    │   Supabase clients        │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   Postgres + Auth + RLS   │
                    │   Storage · Realtime*     │
                    └────────────┬──────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼───────┐  ┌───────▼──────┐  ┌───────▼────────┐
     │ Automations    │  │ PerGon Expert│  │ Integrations   │
     │ Jobs · Queues  │  │ AI Gateway   │  │ ERP · WA · Pay │
     └────────────────┘  └──────────────┘  └────────────────┘
```

\*Realtime solo donde aporte operación (alertas, estados de job), no como bus general.

---

## 3. Apps

### 3.1 `apps/web` — superficie de confianza

**Responsabilidad:** narrativa de producto, verificación pública, academia ligera, ayuda, captación de distribuidores/contactos, PerGon Expert (modo público).

**No es:** ERP, inventario, emisión masiva, finanzas internas.

**Características arquitectónicas:**

- Mayoría Server Components; client en islas (scan UI, chat, 3D).
- Cache/CDN agresivo en contenido; **TTL corto / revalidación** en resolve de QR.
- Rate limit estricto en verificación e IA.
- SEO en rutas indexables; no-index en flujos privados.

### 3.2 `apps/admin` — corazón operativo

**Responsabilidad:** CRUD operacional, dashboards, automatizaciones, auditoría, roles, producción, QR/pasaporte, CRM light, reportes.

**Características:**

- Densidad alta; shell `(dashboard)` estable.
- Auth obligatoria en todo el árbol admin.
- Feature modules por dominio.
- Preferir Server Actions / route handlers con validación zod + RBAC.

### 3.3 Apps futuras (planificadas, no scaffold hoy)

| App                                 | Rol                               | Momento           |
| ----------------------------------- | --------------------------------- | ----------------- |
| `apps/mobile` o app nativa          | Escaneo campo, entregas, academia | Fase 3–4          |
| `apps/partner-portal`               | Distribuidores B2B                | Fase 3            |
| `apps/docs-site`                    | Docs desarrollador API            | Fase 4            |
| Workers (`apps/worker` o funciones) | Jobs, colas, cron                 | Fase 2 (temprano) |

**Decisión:** no fragmentar en microfrontends prematuros. Nuevas apps solo con threat model o canal distinto.

---

## 4. Packages

| Package            | Responsabilidad                          | Regla de oro              |
| ------------------ | ---------------------------------------- | ------------------------- |
| `@pergon/ui`       | Design system, primitives shadcn, tokens | Cero fetch, cero secretos |
| `@pergon/config`   | ESLint, TS, Prettier, Tailwind preset    | Única config compartida   |
| `@pergon/database` | Clients browser/server, tipos DB         | Única puerta a Supabase   |
| `@pergon/shared`   | Tipos dominio, constants, utils puros    | Sin React/UI              |
| `@pergon/three`    | Utilidades R3F                           | Solo web/producto visual  |

### Packages futuros (cuando duela la ausencia)

| Package                               | Cuándo                                                        |
| ------------------------------------- | ------------------------------------------------------------- |
| `@pergon/domain` o `@pergon/passport` | Reglas de estado QR/pasaporte compartidas server+admin+worker |
| `@pergon/automations`                 | Definiciones de jobs, schemas de eventos                      |
| `@pergon/ai`                          | Gateway PerGon Expert, tools, redaction                       |
| `@pergon/notifications`               | Email/WhatsApp/push adapters                                  |
| `@pergon/analytics`                   | Event tracking tipado                                         |

**Criterio para nacer un package:** ≥2 consumidores reales o boundary de seguridad claro.

---

## 5. Features (unidad de crecimiento)

Cada capacidad de negocio vive como **feature module**:

```text
apps/<app>/src/features/<domain>/
  components/   # composición UI (usa @pergon/ui)
  hooks/
  lib/
  types/
  server/       # queries/mutations server-only
```

### Dominios feature (mapa)

Ver `MODULES.md` para catálogo completo. Agrupación arquitectónica:

- **Identity & Trust:** passport, qr, verification, antifraud
- **Catalog:** products, formulations (lab), media
- **Commercial:** customers, distributors, orders, pricing, invoicing
- **Supply:** inventory, purchasing, production, batches
- **People:** users, roles, org units, plants
- **Knowledge:** academy, courses, manuals, help
- **Intelligence:** ai-expert, insights
- **Ops platform:** automations, notifications, audit, reports, settings
- **Growth:** crm, marketing, campaigns

**Regla:** una feature no importa internals de otra; solo APIs públicas de feature o packages.

---

## 6. Servicios (lógicos)

Aunque hoy corran “dentro” de Next/Supabase, se diseñan como **servicios lógicos** desacoplables:

| Servicio                  | Función                                  | SLO mental                                    |
| ------------------------- | ---------------------------------------- | --------------------------------------------- |
| **Verification Service**  | Resolve QR → estado pasaporte            | Alta disponibilidad, baja latencia, fail-safe |
| **Passport Service**      | Emisión, vigencia, revocación, versiones | Consistencia fuerte + audit                   |
| **Identity/Auth Service** | Sesiones, MFA futuro, invites            | Seguridad                                     |
| **RBAC Service**          | Roles/permisos                           | Fail closed                                   |
| **Catalog Service**       | Productos, SKUs, fichas                  | Consistencia                                  |
| **Inventory Service**     | Stock, movimientos, reservas             | Idempotencia                                  |
| **Orders Service**        | Pedidos, estados, fulfillment            | Idempotencia                                  |
| **Production Service**    | Órdenes de producción, lotes             | Trazabilidad                                  |
| **Automation Engine**     | Triggers, schedules, retries             | At-least-once + idempotent handlers           |
| **Notification Hub**      | Email, WhatsApp, in-app                  | Dedup, templates versionados                  |
| **AI Gateway**            | PerGon Expert                            | Domain filter, redaction, tool RBAC           |
| **Audit Service**         | Append-only logs                         | Inmutable en práctica                         |
| **Reporting/Analytics**   | Agregados, exports                       | Puede ser eventual                            |
| **Integration Bus**       | Webhooks in/out, ERP, pagos              | Firmas, retries                               |
| **File/Media Service**    | Storage firmado                          | ACL                                           |
| **Search Service**        | Admin global search                      | Index eventual OK                             |

**Decisión de despliegue V1–V2:** servicios como módulos server en monorepo + DB. **Extraer workers** cuando el cron/cola saturate request/response.

---

## 7. Flujo de datos (patrones)

### 7.1 Lectura Admin

`UI → Server Component / Action → @pergon/database (SSR client) → RLS → Postgres`

### 7.2 Mutación sensible

`UI → validated input → RBAC check → domain transition → DB transaction → audit_log → domain event → automation/notifier`

### 7.3 Verificación pública QR

`Scan/Web → rate limit → Verification Service → status machine → minimal public DTO → scan_event → (optional) fraud signals`

### 7.4 Automatización

`Event | Cron → Automation Engine → idempotent handler → side effects (notify, stock, revoke warn) → run log`

### 7.5 IA

`User → AI Gateway → domain retrieval (manuals/products/passport public facts) → model → tool calls (RBAC) → audit of tool use`

### 7.6 Integraciones

`External webhook (signed) → validate → map to domain command → same mutation path as Admin`

---

## 8. Dependencias entre capas

```text
apps → features → (@pergon/ui | @pergon/shared | @pergon/database | @pergon/three | @pergon/ai*)
@pergon/ui → tokens/config only (no database)
@pergon/database → supabase SDKs
@pergon/shared → pure TS
workers → domain packages → database
```

**Prohibido:**

- `ui` → `database`
- `web` importando internals de `admin` features
- Client components importando server-only
- Bypass de Verification Service “porque es más fácil”

---

## 9. Multi-tenancy y escala organizacional

**Decisión V1:** single-organization PerGon (tenant único) con **unidades organizativas** (`org_units`, plantas, almacenes) para no pintar la esquina.

**Camino a 20 años:**

1. Tenant único + plants/warehouses
2. Soft multi-tenant (distributor portal como org hija)
3. Hard multi-tenant si PerGon OS se vende como plataforma blanca

Todas las tablas de negocio llevan `organization_id` **desde temprano** (aunque sea constante) para no reescribir el mundo.

---

## 10. Escalabilidad

### Datos

- Índices de verificación y listados Admin desde día 1 (ver `DATABASE_SCHEMA.md`).
- Particionar/archivar `scan_events` y `audit_logs` por tiempo cuando el volumen lo exija.
- Read replica / warehouse para reportes pesados (Fase 4+).

### Cómputo

- Edge cache para marketing.
- Workers para PDF masivo, generación QR batch, imports, embeddings.
- Cola (Supabase + cron al inicio; cola dedicada después: Queue/SQS/Cloud Tasks).

### Equipo

- CODEOWNERS por dominio (`passport`, `billing`, `security`).
- Rules `.cursor` + docs como contrato de IA/humanos.

---

## 11. Observabilidad

- Structured logs server (`request_id`, `actor_id`, `organization_id`).
- Métricas: verify latency, invalidate rate, job failure rate, auth failures.
- Alertas (ver `AUTOMATIONS.md` seguridad).
- Error tracking (Sentry u equivalente) en web+admin+worker.

---

## 12. Seguridad (resumen arquitectónico)

Detalle en `ROLES_AND_PERMISSIONS.md` + rule `11-security`.

- Public surface: minimal DTO, rate limit, anti-enumeration.
- Admin: auth + RBAC + RLS.
- Service role: workers/server only.
- Domain events no transportan secretos.

---

## 13. Evolución sin romper

| Cambio                 | Estrategia                                                                 |
| ---------------------- | -------------------------------------------------------------------------- |
| Nuevo módulo Admin     | Feature folder + tablas + permisos + rutas; no hack en dashboard catch-all |
| Nuevo canal (WhatsApp) | Adapter en Notification/Integration; mismos comandos de dominio            |
| Cambiar estado QR      | State machine versionada; nunca “update suelto”                            |
| Extraer microservicio  | Primero package de dominio + worker; red después                           |
| App móvil              | Consume Verification + Auth APIs; no clona lógica                          |

---

## 14. Relación con otros documentos

| Doc                        | Rol                                   |
| -------------------------- | ------------------------------------- |
| `MODULES.md`               | Catálogo de capacidades               |
| `DATABASE_SCHEMA.md`       | Modelo de datos                       |
| `ROUTES.md`                | Superficie HTTP/App Router            |
| `ROLES_AND_PERMISSIONS.md` | Authz                                 |
| `AUTOMATIONS.md`           | Motor que hace trabajar solo a PerGon |
| `ADMIN_MODULES.md`         | UX/IA del corazón operativo           |
| `WEB_STRUCTURE.md`         | IA de confianza pública               |
| `ROADMAP.md`               | Secuencia de construcción             |

---

## 15. Principio final

Si una decisión hace más rápido el demo pero pone en riesgo verificación, auditabilidad o límites app/package, **se rechaza**. PerGon OS se construye como infraestructura de confianza, no como sitio de catálogo.
