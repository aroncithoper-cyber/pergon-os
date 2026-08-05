# PerGon OS — Admin Modules UX Spec V1

> Especificación del panel `apps/admin` como mejor software operativo: pantallas, widgets, acciones, búsquedas, filtros, reportes.
> Densidad alta · accionable · sin theater. Cumple rules `06-admin`, `02-ui`, `03-ux`.

---

## 1. Principios del Admin UX

1. **Home role-aware:** cada rol ve trabajo, no vanity KPIs.
2. **Entity pages** con timeline + acciones primarias fijas.
3. **List pages** = search + filtros en URL + tabla + bulk + export.
4. **Drawers** para detalle rápido; full page para edición profunda.
5. **Command palette** (⌘K) salta a entidades y acciones permitidas.
6. **Empty states** con CTA real.
7. **Permisos:** botones ausentes si deny; server enforce.

---

## 2. Shell global

### Elementos

- Sidebar por módulos (colapsable).
- Topbar: org/plant switcher, global search, alerts bell, user menu, Expert entry.
- Context bar: warehouse/plant actual cuando aplica.
- Keyboard: `g` then letter jumps (g-o orders, g-p passports…).

### Global search

- Índices: passport public_id, qr public_code, order number, customer name, product sku, batch code, user email.
- Resultados agrupados; Enter abre entity.

---

## 3. Dashboard Home `/`

### Widgets (componibles por rol)

| Widget              | Contenido                            | Acción          |
| ------------------- | ------------------------------------ | --------------- |
| Attention Now       | alertas open high/critical           | abrir alert     |
| Verification Health | p95 latency, valid/invalid ratio 24h | to scans        |
| Expiring            | passports/batches T-30               | filtered list   |
| Production Board    | OP by status                         | to production   |
| Fulfillment         | orders to pick/ship                  | to orders       |
| Inventory Risk      | below min SKUs                       | to inventory    |
| Automation Pulse    | failed runs 24h                      | to runs         |
| Trust               | open trust signals                   | to trust        |
| Sales Pulse         | orders today / pipeline              | to orders/leads |
| Academy             | incomplete mandatory                 | to enrollments  |

### Acciones rápidas

Emitir pasaporte · Generar QR batch · Nuevo pedido · Ajuste inventario (si perm) · Trigger automation · Invitar usuario.

---

## 4. Módulo Alertas `/alerts`

**Lista:** severity chips, status, type, entity link, age, assignee.  
**Filtros:** severity, status, type, assignee, date.  
**Acciones fila:** ack, assign, close, snooze.  
**Detalle:** payload, linked entity, suggested automation, audit.  
**Bulk:** ack/close.

---

## 5. Módulo Notificaciones `/notifications`

Inbox in-app; mark read; deep link; filters unread; prefs deep-link a settings.

---

## 6. Usuarios `/users`

**Lista columnas:** name, email, status, roles, last seen.  
**Filtros:** status, role, org_unit.  
**Acciones:** invite, deactivate, resend invite, impersonate (super only future).  
**Detalle:** memberships, roles editor, sessions revoke, audit trail user.  
**Invite modal:** email, roles, org_unit, message.

---

## 7. Roles `/roles`

**Lista** system + custom.  
**Detalle:** matrix permissions checkbox by module; danger summary; copy role.  
**Acción:** assign users shortcut.

---

## 8. Settings hub `/settings`

Páginas:

- Organization profile
- Plants / org units (tree)
- Warehouses
- Notification channels & quiet hours
- Integrations (status cards + connect)
- Templates (email/WA) with preview/version
- Feature flags
- Branding ops (logo admin only; no marketing playground)

Cada save → toast + audit si sensible.

---

## 9. Security Center `/security`

**Widgets:** failed logins, API keys count, open trust, verify anomalies.  
**API keys:** create (show secret once), rotate, revoke, scopes editor.  
**Sessions:** list & revoke.  
**Actions:** force logout user, freeze verify (kill switch flag).

---

## 10. Audit `/audit`

**Explorer:** infinite/table by time.  
**Filtros:** actor, action, entity_type, entity_id, date range, request_id.  
**Detalle:** before/after JSON diff.  
**Export:** async job si grande.  
**Prohibido:** editar/borrar eventos.

---

## 11. Products `/products`

**Lista:** sku, name, status, family, updated.  
**Filtros:** status, family, search sku/name.  
**Acciones:** create, publish/unpublish, duplicate, export.  
**Detalle tabs:** Overview · Media · Manuals · Formulations · Prices · Related passports/batches · Activity.  
**Primary CTA:** Save / Publish.  
**Widget:** open orders referencing SKU; stock by warehouse.

---

## 12. Media `/media`

Grid/list; upload; tags; visibility; attach to product; replace version; forbid orphan delete if referenced without confirm.

---

## 13. Formulations `/formulations`

**Lista** by product/version/status.  
**Detalle:** items table; approve gate with comment; diff vs previous version; lock when approved.

---

## 14. Passports `/passports`

**Lista columnas:** public_id, product, batch, status, issued, expires, scans_24h.  
**Filtros:** status, product, batch, expires range, q.  
**Bulk:** export; limited bulk suspend (perm).  
**Create wizard:** product → batch → metadata → preview public DTO → issue → offer generate QR.  
**Detalle:**

- Header status badge + expiry
- Acciones: recharge, revoke, generate QR, print, open public preview
- Tabs: Overview · Versions · QR codes · Scans · Recharges · Audit · Related order/batch
- Widget risk: trust signals

**Revoke screen:** reason required, consequence copy, type-to-confirm id.

---

## 15. QR `/qr`

**Lista:** public_code, passport, status, scans, updated.  
**Filtros:** status, print_batch, product.  
**Acciones:** create one, create batch, rotate, suspend, download PNG/SVG, print PDF.  
**Batch page:** qty, template label, progress job, download zip, reprint.  
**Detalle:** resolve test (admin), scan chart, rotate history, linked passport.

---

## 16. Scans `/scans`

**Lista densa:** time, code, result, channel, risk, ip_hash, geo.  
**Filtros:** result, channel, risk min, passport/qr, time window.  
**Saved views:** “Invalid spikes”, “Suspicious”.  
**Detalle:** raw payload safe fields, map approx, links.  
**Report:** invalid ratio; CSV export job.

---

## 17. Trust `/trust`

Kanban or table of signals; severity; link entity; actions: dismiss, rotate QR, suspend, open investigation note.

---

## 18. Customers `/customers`

**Lista** + segment filter.  
**Detalle 360:** contacts, orders, invoices, passports associated (if any), notes, consent flags.  
**Acciones:** create order, invite portal, merge duplicates (admin).  
**Search:** name, tax_id, email.

---

## 19. Distributors `/distributors`

**Lista** territory/status.  
**Detalle:** price list, users, performance widgets (orders), academy compliance, apply documents.  
**Acciones:** approve application, suspend, assign territory.

---

## 20. Leads `/leads`

Kanban + tabla. Drag stage. SLA badges. Activities timeline. Convert to customer/distributor. Filters owner/source/stage.

---

## 21. Quotes & Orders

### Quotes

Line editor, validity, send PDF, convert to order, version history.

### Orders `/orders`

**Lista:** number, customer, status, total, promised, age.  
**Filtros:** status, customer, distributor, date, sku contains.  
**Detalle:**

- Status stepper
- Lines editable until locked
- Allocation panel (stock)
- Shipments
- Invoices
- Activity / automations fired  
  **Acciones:** confirm, cancel, fulfill, create shipment, recalc, duplicate.  
  **Bulk:** export; status transition where safe.

---

## 22. Shipments & Returns

**Shipments:** packing checklist, tracking, notify customer button (or auto).  
**Returns:** reason codes, photos media, restock decision, credit draft link.

---

## 23. Inventory `/inventory`

**Vista niveles:** warehouse × product × batch, qty_on_hand/reserved/available.  
**Filtros:** below min, warehouse, product, batch expiry.  
**Acciones:** adjust (modal motivo+approval), transfer, export.  
**Moves ledger:** immutable list; filter reason/ref.  
**Widget:** top stockouts risk.

---

## 24. Batches `/batches`

Lista code/product/status/expiry. Detalle: composition link, inventory positions, passports count, quality status, recall action (suspend related QR).

---

## 25. Production `/production`

**Board:** planned / in progress / done / blocked.  
**Detalle OP:** BOM check, consume materials, report output qty, create batch, trigger identity seeding.  
**Acciones:** start, complete, cancel, print traveler doc.

---

## 26. Purchasing & Suppliers

PO list/detail/receive UI (partial receipts). Supplier page with POs and docs expiry. Auto-draft PO from reorder suggestions inbox.

---

## 27. Quality `/quality`

Queue pending checks; form pass/fail/hold; attachments; blocks shipping banner on related entities.

---

## 28. Finance

**Invoices list/detail** PDF preview, send, void, register payment.  
**Payments** reconcile.  
**Finance home:** AR aging widget, failed payments, revenue MTD (permissioned).  
**Reports:** aging, sales tax summary (phase).

---

## 29. Academy Admin

Course builder (modules/lessons), publish, enrollments table, completion funnel widget, remind action, cert templates.

---

## 30. Help & Blog CMS

Article editor, SEO fields, publish, preview, stale flag. Same pattern for blog.

---

## 31. PerGon Expert Admin `/expert`

Chat with admin tools (confirm gates).  
Conversations supervision list (privacy masked).  
Corpus status (last index).  
Thumbs-down queue.  
**Prohibido:** mostrar system prompt secrets.

---

## 32. Insights `/insights`

Cards “recommended actions” (reorder, rotate QR, stale leads) with Accept→creates task/automation run, Dismiss.

---

## 33. Automations `/automations`

**Lista:** key, enabled, last run status, owner.  
**Editor:** trigger, conditions JSON/UI builder, actions, dry-run, version history, enable toggle.  
**Runs:** filter failed; retry; payload; logs.  
**Manual trigger** with input form.

---

## 34. Reports `/reports`

Catalog cards; runner with date/warehouse filters; schedule modal (cron, recipients); history of generated files.

Reportes clave: scans, expiry, inventory min, sales SKU, automation health, AR aging, academy completion, trust open.

---

## 35. Imports / Exports

Upload wizard mapping columns; validation errors download; commit job; audit. Export center with async files.

---

## 36. Búsqueda, filtros y patrones reutilizables

### Patrones obligatorios en listados

- Debounced search
- Filters → URL query
- Column visibility prefs (local)
- Density comfortable/compact toggle
- Empty / loading skeleton / error retry
- Export current filter set

### Acciones destructivas

Modal + consequence + confirm text cuando severo.

---

## 37. Dashboards adicionales (no solo home)

| Dashboard      | Ruta sugerida            | Audiencia      |
| -------------- | ------------------------ | -------------- |
| Trust & Verify | `/dashboards/trust`      | security/admin |
| Plant floor    | `/dashboards/production` | production     |
| Commercial     | `/dashboards/sales`      | sales          |
| Cash           | `/dashboards/finance`    | finance        |

Widgets deep-linkeados a listas prefiltradas (nunca callejón sin salida).

---

## 38. Mapa de módulos sidebar (IA)

1. Home
2. Alertas
3. Identidad (Passports, QR, Scans, Trust)
4. Catálogo (Products, Media, Manuals, Formulations, Prices)
5. Inventario (Levels, Moves, Batches)
6. Producción & Calidad
7. Compras
8. Comercial (Leads, Customers, Distributors, Quotes, Orders, Shipments, Returns)
9. Finanzas
10. Academia & Contenido
11. Expert & Insights
12. Automatizaciones & Reportes
13. Datos (Imports/Exports)
14. Seguridad
15. Auditoría
16. Ajustes
17. Usuarios & Roles

Visible según permisos (hide empty groups).

---

## 39. Criterio “mejor Admin del mundo” aplicado

- Toda métrica es clicable hacia la cola de trabajo.
- Todo estado de identidad es inequívoco.
- Toda automation es observable.
- Todo peligro tiene fricción y audit.
- Cero glassmorphism / storytelling scroll / KPI vanity sin acción.

---

## 40. Orden de construcción UI Admin

1. Shell + auth + users/roles + audit read
2. Products + Passports + QR + Scans
3. Alerts + notifications
4. Inventory + production
5. Orders + customers
6. Automations + reports
7. Rest per roadmap
