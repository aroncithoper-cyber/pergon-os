# PerGon OS — Routes V1

> Mapa de rutas App Router + API.
> Convenciones: kebab-case en URLs públicas; grupos `(…)` no afectan URL; Admin autenticado; verificación pública rate-limited.
> Las rutas listadas son **diseño objetivo**; no implica que existan en código hoy.

---

## 1. Convenciones

| Superficie            | Base                        | Auth                       |
| --------------------- | --------------------------- | -------------------------- |
| Web                   | `apps/web` `/`              | Pública salvo áreas portal |
| Admin                 | `apps/admin` `/`            | Obligatoria                |
| API interna Next      | `/api/*` en cada app        | Según ruta                 |
| API versionada futura | `/api/v1/*` (web o gateway) | API key / session          |

**Errores:** `not-found`, `error`, `global-error` por app. Códigos de verificación nunca enumeran de más.

---

## 2. Web — Marketing & confianza

### Core

| Ruta                      | Propósito                     |
| ------------------------- | ----------------------------- |
| `/`                       | Landing principal             |
| `/nosotros`               | Empresa / trust               |
| `/tecnologia`             | Plataforma, QR, pasaporte     |
| `/seguridad`              | Antifalsificación & prácticas |
| `/contacto`               | Intake comercial              |
| `/distribuidores`         | Programa / postulación        |
| `/distribuidores/aplicar` | Formulario lead distributor   |

### Productos

| Ruta                          | Propósito                       |
| ----------------------------- | ------------------------------- |
| `/productos`                  | Índice catálogo                 |
| `/productos/[slug]`           | Ficha producto                  |
| `/productos/comparar`         | Comparador                      |
| `/productos/comparar/[slugs]` | Comparación concreta (opcional) |
| `/calculadoras`               | Índice calculadoras             |
| `/calculadoras/[slug]`        | Calculadora específica          |

### Pasaporte & QR

| Ruta                    | Propósito                                        |
| ----------------------- | ------------------------------------------------ |
| `/verificar`            | Entrada manual de código                         |
| `/verificar/[code]`     | Resultado de verificación                        |
| `/pasaporte/[publicId]` | Vista pasaporte público (si política lo permite) |
| `/qr/[code]`            | Alias corto → resolve (redirect o render)        |
| `/escaneo`              | UI cámara (client island)                        |

### IA

| Ruta                         | Propósito                                      |
| ---------------------------- | ---------------------------------------------- |
| `/expert`                    | PerGon Expert (público acotado)                |
| `/expert/c/[conversationId]` | Continuación conversación (si auth/anon token) |

### Academia & ayuda

| Ruta                                     | Propósito      |
| ---------------------------------------- | -------------- |
| `/academia`                              | Hub            |
| `/academia/cursos`                       | Listado        |
| `/academia/cursos/[slug]`                | Curso          |
| `/academia/cursos/[slug]/l/[lessonSlug]` | Lección        |
| `/ayuda`                                 | Help center    |
| `/ayuda/[slug]`                          | Artículo       |
| `/ayuda/buscar`                          | Búsqueda ayuda |

### Contenido

| Ruta                | Propósito |
| ------------------- | --------- |
| `/blog`             | Índice    |
| `/blog/[slug]`      | Post      |
| `/legal/privacidad` | Privacy   |
| `/legal/terminos`   | Terms     |
| `/legal/cookies`    | Cookies   |

### Portales futuros (Web o apps dedicadas)

| Ruta               | Propósito                 |
| ------------------ | ------------------------- |
| `/portal`          | Gate customer/distributor |
| `/portal/pedidos`  | …                         |
| `/portal/academia` | …                         |

### Auth Web (si portales)

| Ruta              | Propósito            |
| ----------------- | -------------------- |
| `/auth/login`     | Login                |
| `/auth/callback`  | OAuth/magic callback |
| `/auth/logout`    | Logout               |
| `/auth/recuperar` | Recovery             |

---

## 3. Admin — Shell & sistema

| Ruta                      | Propósito                                           |
| ------------------------- | --------------------------------------------------- |
| `/login`                  | Login admin                                         |
| `/auth/callback`          | Callback                                            |
| `/`                       | Dashboard home (role-aware)                         |
| `/search`                 | Resultados búsqueda global (o command palette only) |
| `/settings`               | Settings hub                                        |
| `/settings/organization`  | Org                                                 |
| `/settings/plants`        | Org units / plants                                  |
| `/settings/warehouses`    | Almacenes                                           |
| `/settings/notifications` | Prefs alertas                                       |
| `/settings/integrations`  | Integraciones                                       |
| `/settings/feature-flags` | Flags                                               |
| `/settings/templates`     | Message templates                                   |
| `/notifications`          | Inbox                                               |
| `/alerts`                 | Alert center                                        |
| `/alerts/[id]`            | Detalle alerta                                      |
| `/audit`                  | Audit explorer                                      |
| `/audit/[id]`             | Evento                                              |
| `/security`               | Security center                                     |
| `/security/api-keys`      | API keys                                            |
| `/security/sessions`      | Sesiones                                            |

### Usuarios y acceso

| Ruta            | Propósito        |
| --------------- | ---------------- |
| `/users`        | Lista            |
| `/users/invite` | Invitar          |
| `/users/[id]`   | Detalle          |
| `/roles`        | Roles            |
| `/roles/[id]`   | Permisos del rol |

---

## 4. Admin — Identidad digital

| Ruta                       | Propósito                 |
| -------------------------- | ------------------------- |
| `/passports`               | Lista / filtros           |
| `/passports/new`           | Emitir                    |
| `/passports/[id]`          | Detalle + timeline        |
| `/passports/[id]/versions` | Versiones                 |
| `/passports/[id]/recharge` | Recarga                   |
| `/passports/[id]/revoke`   | Flujo revocación          |
| `/qr`                      | Lista QR                  |
| `/qr/new`                  | Generar                   |
| `/qr/batches`              | Print batches             |
| `/qr/batches/[id]`         | Detalle batch             |
| `/qr/[id]`                 | Detalle QR + scans        |
| `/qr/[id]/rotate`          | Rotación                  |
| `/scans`                   | Explorador de escaneos    |
| `/scans/[id]`              | Evento                    |
| `/trust`                   | Trust signals / antifraud |

---

## 5. Admin — Catálogo & lab

| Ruta                     | Propósito       |
| ------------------------ | --------------- |
| `/products`              | Lista           |
| `/products/new`          | Alta            |
| `/products/[id]`         | Detalle         |
| `/products/[id]/media`   | Media           |
| `/products/[id]/manuals` | Manuales        |
| `/families`              | Familias        |
| `/formulations`          | Fórmulas        |
| `/formulations/[id]`     | Detalle versión |
| `/media`                 | Media library   |
| `/manuals`               | Manuales        |
| `/manuals/[id]`          | Editor/detalle  |
| `/prices`                | Price lists     |
| `/prices/[id]`           | Items           |

---

## 6. Admin — Comercial

| Ruta                 | Propósito      |
| -------------------- | -------------- |
| `/customers`         | Clientes       |
| `/customers/new`     | Alta           |
| `/customers/[id]`    | 360            |
| `/distributors`      | Distribuidores |
| `/distributors/[id]` | Detalle        |
| `/leads`             | CRM pipeline   |
| `/leads/[id]`        | Lead           |
| `/quotes`            | Cotizaciones   |
| `/quotes/[id]`       | Detalle        |
| `/orders`            | Pedidos        |
| `/orders/new`        | Crear          |
| `/orders/[id]`       | Detalle        |
| `/shipments`         | Despachos      |
| `/returns`           | Devoluciones   |

---

## 7. Admin — Supply

| Ruta                | Propósito          |
| ------------------- | ------------------ |
| `/inventory`        | Niveles            |
| `/inventory/moves`  | Ledger movimientos |
| `/inventory/adjust` | Ajuste controlado  |
| `/batches`          | Lotes              |
| `/batches/[id]`     | Detalle            |
| `/production`       | Órdenes producción |
| `/production/new`   | Nueva OP           |
| `/production/[id]`  | Detalle            |
| `/purchasing`       | Órdenes compra     |
| `/purchasing/[id]`  | Detalle            |
| `/suppliers`        | Proveedores        |
| `/quality`          | Cola quality       |
| `/quality/[id]`     | Check              |

---

## 8. Admin — Finanzas

| Ruta               | Propósito    |
| ------------------ | ------------ |
| `/invoices`        | Facturas     |
| `/invoices/[id]`   | Detalle      |
| `/payments`        | Pagos        |
| `/finance`         | Hub finanzas |
| `/finance/reports` | Reportes     |

---

## 9. Admin — Knowledge & IA

| Ruta                         | Propósito           |
| ---------------------------- | ------------------- |
| `/academy`                   | Hub                 |
| `/academy/courses`           | Cursos              |
| `/academy/courses/[id]`      | Builder/detalle     |
| `/academy/enrollments`       | Inscripciones       |
| `/help/articles`             | CMS ayuda           |
| `/blog/posts`                | CMS blog            |
| `/expert`                    | PerGon Expert admin |
| `/expert/conversations`      | Supervisión         |
| `/expert/conversations/[id]` | Detalle             |
| `/insights`                  | Recomendaciones     |

---

## 10. Admin — Automations & reports

| Ruta                        | Propósito         |
| --------------------------- | ----------------- |
| `/automations`              | Definiciones      |
| `/automations/new`          | Crear             |
| `/automations/[id]`         | Editor            |
| `/automations/[id]/runs`    | Runs              |
| `/automations/runs/[runId]` | Run detail        |
| `/reports`                  | Catálogo reportes |
| `/reports/[key]`            | Runner            |
| `/reports/schedules`        | Schedules         |
| `/imports`                  | Jobs import       |
| `/imports/[id]`             | Resultado         |
| `/exports`                  | Exports           |

---

## 11. API — Web (`apps/web/src/app/api`)

| Ruta                      | Método   | Propósito                |
| ------------------------- | -------- | ------------------------ |
| `/api/verify`             | POST     | Verificar código (body)  |
| `/api/verify/[code]`      | GET      | Verify shortcut          |
| `/api/scan`               | POST     | Evento de escaneo cámara |
| `/api/expert/chat`        | POST     | Chat público Expert      |
| `/api/expert/chat/[id]`   | GET/POST | Continuación             |
| `/api/contact`            | POST     | Contact form             |
| `/api/distributors/apply` | POST     | Aplicación               |
| `/api/calculators/[slug]` | POST     | Eval calculadora         |
| `/api/health`             | GET      | Health                   |

Todas las de verify/scan/expert: **rate limit + abuse protection**.

---

## 12. API — Admin (`apps/admin/src/app/api`)

| Ruta                            | Propósito                  |
| ------------------------------- | -------------------------- |
| `/api/search`                   | Global search              |
| `/api/export/[type]`            | Export streams             |
| `/api/imports`                  | Upload init                |
| `/api/automations/[id]/trigger` | Manual trigger             |
| `/api/revalidate`               | Ops revalidate (protegido) |
| `/api/health`                   | Health autenticable        |

Mutaciones preferentes: **Server Actions** namespaced por feature; APIs para streams/webhooks.

---

## 13. API versionada pública / partners (futuro gateway)

| Ruta                        | Propósito              |
| --------------------------- | ---------------------- |
| `/api/v1/passports/{id}`    | Lectura partner scoped |
| `/api/v1/qr/{code}/resolve` | Resolve autenticado    |
| `/api/v1/orders`            | Partner orders         |
| `/api/v1/webhooks`          | Manage webhooks        |
| `/api/v1/openapi.json`      | Spec                   |

Auth: API keys + scopes. Versionado obligatorio.

---

## 14. Webhooks inbound

| Ruta                             | Propósito          |
| -------------------------------- | ------------------ |
| `/api/hooks/payments/[provider]` | Payment events     |
| `/api/hooks/whatsapp`            | Provider callbacks |
| `/api/hooks/email`               | Inbound/bounce     |
| `/api/hooks/erp/[system]`        | ERP sync           |

Firma HMAC + idempotency.

---

## 15. Auth routes (compartidas conceptualmente)

| Ruta                   | App                  |
| ---------------------- | -------------------- |
| `/login`               | admin (y web portal) |
| `/auth/callback`       | ambos                |
| `/auth/logout`         | ambos                |
| `/auth/mfa`            | admin futuro         |
| `/auth/invite/[token]` | aceptar invite       |

---

## 16. Errores & sistema

| Ruta / archivo                 | Propósito               |
| ------------------------------ | ----------------------- |
| `not-found`                    | 404 por app             |
| `error`                        | Error boundary segmento |
| `global-error`                 | Fallo root              |
| `/mantenimiento`               | Flag maintenance (web)  |
| `/403` o UI forbidden embebida | Sin permiso admin       |
| `/429` messaging               | Rate limit UX en verify |

**Decisión:** Admin no usa páginas marketing de error; componente forbidden in-shell.

---

## 17. Redirects estratégicos

| From            | To                             |
| --------------- | ------------------------------ |
| `/qr/[code]`    | resolve pipeline               |
| `/p/[publicId]` | `/pasaporte/[publicId]`        |
| `/v/[code]`     | `/verificar/[code]`            |
| Legacy future   | map en `next.config` redirects |

---

## 18. Prioridad de implementación de rutas

1. Admin auth + shell + users/roles
2. Products + Passports + QR + Verify web
3. Scans explorer + audit
4. Inventory/production/orders
5. Expert + help
6. Automations UI
7. Rest per roadmap
