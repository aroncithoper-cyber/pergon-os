# PerGon OS — Modules Catalog V1

> Inventario completo de módulos (actuales y futuros).
> Prioridad: **P0** crítico identidad/ops · **P1** operación core · **P2** crecimiento · **P3** expansión · **P4** plataforma avanzada.

Cada módulo: Objetivo · Entradas · Salidas · Dependencias · Prioridad.

---

## Cómo leer este catálogo

- Un **módulo** es una capacidad de negocio con dueño, datos y UI/API.
- Puede vivir en Admin, Web, Worker, Mobile o varios.
- No implica que todo se construya en Fase 1 (ver `ROADMAP.md`).

---

## 1. Plataforma base

### 1.1 Platform Shell

- **Objetivo:** Shell de apps (nav, auth gate, org context, command palette).
- **Entradas:** sesión, permisos, org/plant actual.
- **Salidas:** layout navegable, contexto global.
- **Dependencias:** Auth, RBAC, Users.
- **Prioridad:** P0.

### 1.2 Auth

- **Objetivo:** Identidad de operadores y accesos seguros.
- **Entradas:** credenciales, magic link, invites, MFA futuro.
- **Salidas:** sesión, recovery, revoke sessions.
- **Dependencias:** Supabase Auth, Users, Audit.
- **Prioridad:** P0.

### 1.3 Users

- **Objetivo:** Ciclo de vida de usuarios internos.
- **Entradas:** invite, perfil, desactivación.
- **Salidas:** user records, membership.
- **Dependencias:** Auth, Roles, Org Units.
- **Prioridad:** P0.

### 1.4 Roles & Permissions

- **Objetivo:** RBAC fino por acción de dominio.
- **Entradas:** role assignments, permission catalog.
- **Salidas:** allow/deny en server y reflejo UI.
- **Dependencias:** Users, Audit.
- **Prioridad:** P0.

### 1.5 Organizations & Org Units

- **Objetivo:** Empresa, plantas, almacenes, equipos.
- **Entradas:** estructura org, asignaciones.
- **Salidas:** scope de datos y operación.
- **Dependencias:** Users.
- **Prioridad:** P0 (modelo), UI P1.

### 1.6 Settings

- **Objetivo:** Configuración de sistema y preferencias.
- **Entradas:** branding ops, locales, feature flags, integraciones keys (refs).
- **Salidas:** config efectiva versionada.
- **Dependencias:** Roles, Audit.
- **Prioridad:** P0–P1.

### 1.7 Audit

- **Objetivo:** Trazabilidad append-only de acciones sensibles.
- **Entradas:** actor, entity, before/after.
- **Salidas:** timeline consultable, exports.
- **Dependencias:** todos los módulos mutadores.
- **Prioridad:** P0.

### 1.8 Notifications (In-app)

- **Objetivo:** Centro de notificaciones del Admin/Web autenticado.
- **Entradas:** eventos de automation/alertas.
- **Salidas:** inbox, read state, deep links.
- **Dependencias:** Automations, Users.
- **Prioridad:** P1.

### 1.9 Feature Flags

- **Objetivo:** Rollout controlado.
- **Entradas:** flags por org/rol/usuario.
- **Salidas:** gates de UI/API.
- **Dependencias:** Settings.
- **Prioridad:** P2.

---

## 2. Identidad digital y confianza

### 2.1 Passport Digital

- **Objetivo:** Fuente de verdad de identidad de unidad/lote/activo.
- **Entradas:** emisión, metadatos, vigencia, revocación.
- **Salidas:** passport DTO, estados, historial.
- **Dependencias:** Products, Batches, QR, Audit, Automations.
- **Prioridad:** P0.

### 2.2 QR System

- **Objetivo:** Puerta de acceso dinámica a pasaportes/recursos.
- **Entradas:** generación, rotación, suspensión, impresión batch.
- **Salidas:** public codes, resolve API, assets imprimibles.
- **Dependencias:** Passport, Products, Audit, Media.
- **Prioridad:** P0.

### 2.3 Verification (Public)

- **Objetivo:** Verificar autenticidad con DTO mínimo.
- **Entradas:** code/scan payload.
- **Salidas:** status público, scan_event, señales fraude.
- **Dependencias:** QR, Passport, Rate limit, Antifraud.
- **Prioridad:** P0.

### 2.4 Antifraud / Trust Signals

- **Objetivo:** Detectar abuso, clones, anomalías de scan.
- **Entradas:** scan_events, geo/ip patterns.
- **Salidas:** risk scores, alertas, recomendaciones de rotación.
- **Dependencias:** Verification, Alerts, Automations.
- **Prioridad:** P1.

### 2.5 Recargas / Renovaciones de identidad

- **Objetivo:** Extender vigencia o créditos asociados al pasaporte/QR.
- **Entradas:** orden de recarga, pago/aprobación.
- **Salidas:** nueva vigencia/versión, audit, notify.
- **Dependencias:** Passport, Orders/Billing, Automations.
- **Prioridad:** P1.

---

## 3. Catálogo y laboratorio

### 3.1 Products

- **Objetivo:** Catálogo maestro SKU/producto.
- **Entradas:** ficha, atributos, media, estado comercial.
- **Salidas:** product API, web PDP data.
- **Dependencias:** Media, Lab, Pricing.
- **Prioridad:** P0.

### 3.2 Product Families / Lines

- **Objetivo:** Agrupar líneas PerGon.
- **Entradas:** taxonomía.
- **Salidas:** navegación web/admin.
- **Dependencias:** Products.
- **Prioridad:** P1.

### 3.3 Formulations / Laboratory

- **Objetivo:** Fórmulas, versiones, cumplimiento interno.
- **Entradas:** composición versionada, cambios aprobados.
- **Salidas:** fórmula vigente ligada a lote/producción.
- **Dependencias:** Products, Audit, Production.
- **Prioridad:** P2.

### 3.4 Media Library

- **Objetivo:** Assets controlados (fichas, fotos, PDS/SDS si aplica).
- **Entradas:** uploads, tags, ACL.
- **Salidas:** URLs firmadas, attachments.
- **Dependencias:** Storage, Roles.
- **Prioridad:** P1.

### 3.5 Manuals & SDS/Tech Docs

- **Objetivo:** Documentación técnica oficial para Expert y Academia.
- **Entradas:** docs versionados.
- **Salidas:** retrieval corpus, downloads.
- **Dependencias:** Media, AI, Academy.
- **Prioridad:** P1.

---

## 4. Comercial

### 4.1 Customers (Clientes)

- **Objetivo:** Cuentas B2B/B2C según modelo.
- **Entradas:** alta, contactos, segmentación.
- **Salidas:** customer 360 light.
- **Dependencias:** CRM, Orders, Users (portal).
- **Prioridad:** P1.

### 4.2 Distributors

- **Objetivo:** Red de distribución, territorios, condiciones.
- **Entradas:** alta, acuerdos, cobertura.
- **Salidas:** portal data, comisiones futuras.
- **Dependencias:** Customers, Orders, Pricing.
- **Prioridad:** P1.

### 4.3 Leads / CRM

- **Objetivo:** Pipeline comercial y seguimiento.
- **Entradas:** leads web, notas, etapas.
- **Salidas:** conversiones, tareas, reportes.
- **Dependencias:** Customers, Notifications, Automations.
- **Prioridad:** P2.

### 4.4 Pricing & Price Lists

- **Objetivo:** Listas por canal/distribuidor.
- **Entradas:** precios, vigencia, moneda.
- **Salidas:** precio efectivo en pedidos.
- **Dependencias:** Products, Distributors.
- **Prioridad:** P2.

### 4.5 Orders (Pedidos)

- **Objetivo:** Captura y ciclo de pedido.
- **Entradas:** líneas, cliente, promesa de entrega.
- **Salidas:** estados, reserva stock, fulfillment trigger.
- **Dependencias:** Inventory, Customers, Pricing, Notifications.
- **Prioridad:** P1.

### 4.6 Quotes

- **Objetivo:** Cotizaciones previas a pedido.
- **Entradas:** draft quote.
- **Salidas:** accept → order.
- **Dependencias:** Pricing, CRM.
- **Prioridad:** P2.

### 4.7 Returns / RMA

- **Objetivo:** Devoluciones y calidad postventa.
- **Entradas:** solicitud, inspección.
- **Salidas:** stock adjust, credit note trigger.
- **Dependencias:** Orders, Inventory, Finance.
- **Prioridad:** P3.

---

## 5. Supply chain

### 5.1 Inventory

- **Objetivo:** Stock por almacén/lote.
- **Entradas:** movimientos, ajustes, conteos.
- **Salidas:** availability, alertas min/max.
- **Dependencias:** Warehouses, Batches, Orders, Production.
- **Prioridad:** P1.

### 5.2 Warehouses / Locations

- **Objetivo:** Estructura física de stock.
- **Entradas:** almacenes, ubicaciones.
- **Salidas:** scope de inventario.
- **Dependencias:** Org Units.
- **Prioridad:** P1.

### 5.3 Batches / Lots

- **Objetivo:** Lotes productivos/comerciales trazables.
- **Entradas:** creación de lote, caducidad.
- **Salidas:** link a passport/QR, recalls.
- **Dependencias:** Production, Passport, Inventory.
- **Prioridad:** P0–P1.

### 5.4 Production

- **Objetivo:** Órdenes de producción y consumo de insumos.
- **Entradas:** OP, BOM/fórmula, mermas.
- **Salidas:** finished goods + batch + passport seed.
- **Dependencias:** Lab, Inventory, Passport, QR.
- **Prioridad:** P1.

### 5.5 Purchasing (Compras)

- **Objetivo:** Órdenes a proveedores, recepción.
- **Entradas:** PO, receipts.
- **Salidas:** stock in, costos.
- **Dependencias:** Suppliers, Inventory, Finance.
- **Prioridad:** P2.

### 5.6 Suppliers

- **Objetivo:** Maestro de proveedores.
- **Entradas:** fichas, términos.
- **Salidas:** POs.
- **Dependencias:** Purchasing.
- **Prioridad:** P2.

### 5.7 Quality / Quarantine

- **Objetivo:** Retener lotes, liberar/rechazar.
- **Entradas:** checks, resultados.
- **Salidas:** hold/release affecting QR validity optionally.
- **Dependencias:** Batches, Passport, Production.
- **Prioridad:** P2.

### 5.8 Logistics / Shipments

- **Objetivo:** Despachos y tracking interno.
- **Entradas:** packing, carrier refs.
- **Salidas:** shipped/delivered events.
- **Dependencias:** Orders, Inventory.
- **Prioridad:** P2.

---

## 6. Finanzas y facturación

### 6.1 Invoicing / Billing

- **Objetivo:** Facturas, notas, estados de cobro (localización fiscal por fase).
- **Entradas:** order → invoice.
- **Salidas:** documentos, saldos.
- **Dependencias:** Orders, Customers, Tax.
- **Prioridad:** P2.

### 6.2 Payments

- **Objetivo:** Registro de pagos / pasarelas.
- **Entradas:** payment events.
- **Salidas:** applied amounts, receipts.
- **Dependencias:** Invoicing, Integrations.
- **Prioridad:** P3.

### 6.3 Finance Hub

- **Objetivo:** Costos, márgenes, reportes financieros operativos.
- **Entradas:** costs from prod/purchasing.
- **Salidas:** dashboards finance.
- **Dependencias:** Inventory, Production, Invoicing.
- **Prioridad:** P3.

### 6.4 Tax & Compliance Docs

- **Objetivo:** Config fiscal y documentos requeridos.
- **Entradas:** tax profiles.
- **Salidas:** invoice lines correctness.
- **Dependencias:** Invoicing, Settings.
- **Prioridad:** P3.

---

## 7. Inteligencia y conocimiento

### 7.1 PerGon Expert (AI)

- **Objetivo:** Asistente de dominio.
- **Entradas:** chat, retrieval corpus, tools.
- **Salidas:** respuestas, acciones confirmadas.
- **Dependencias:** Manuals, Products, Passport (facts), RBAC.
- **Prioridad:** P1 (web guided), P2 (admin tools).

### 7.2 Academy

- **Objetivo:** Formación de personal/distribuidores/clientes.
- **Entradas:** cursos, progreso.
- **Salidas:** completions, certificados light.
- **Dependencias:** Users/Customers, Media, Notifications.
- **Prioridad:** P2.

### 7.3 Courses

- **Objetivo:** Unidades lectivas dentro de Academia.
- **Entradas:** lessons, quizzes.
- **Salidas:** progress events.
- **Dependencias:** Academy.
- **Prioridad:** P2.

### 7.4 Help Center

- **Objetivo:** Artículos de ayuda públicos/auth.
- **Entradas:** articles CMS.
- **Salidas:** search, SEO pages.
- **Dependencias:** Media, Web.
- **Prioridad:** P1.

### 7.5 Insights / Recommendations

- **Objetivo:** Sugerencias operativas (reordenar, rotar QR, riesgo).
- **Entradas:** metrics + antifraud + inventory.
- **Salidas:** recommended actions in Admin.
- **Dependencias:** AI, Automations, Reports.
- **Prioridad:** P3.

---

## 8. Operación digital

### 8.1 Automations Engine

- **Objetivo:** Orquestar trabajo autónomo.
- **Entradas:** events, cron, conditions.
- **Salidas:** job runs, side effects.
- **Dependencias:** casi todos.
- **Prioridad:** P1.

### 8.2 Alerts

- **Objetivo:** Cola de alertas severizadas.
- **Entradas:** detectors.
- **Salidas:** inbox, escalations.
- **Dependencias:** Notifications, Users.
- **Prioridad:** P1.

### 8.3 Reports

- **Objetivo:** Reportes operativos y exports.
- **Entradas:** filtros, schedules.
- **Salidas:** CSV/PDF, email delivery.
- **Dependencias:** Data, Automations.
- **Prioridad:** P1–P2.

### 8.4 Dashboards

- **Objetivo:** Tableros por rol.
- **Entradas:** widgets config.
- **Salidas:** KPIs accionables.
- **Dependencias:** Reports, Permissions.
- **Prioridad:** P1.

### 8.5 Search (Admin Global)

- **Objetivo:** Buscar entidades por ID/código/nombre.
- **Entradas:** query.
- **Salidas:** jump-to entity.
- **Dependencias:** indexed entities.
- **Prioridad:** P1.

### 8.6 Imports / Exports

- **Objetivo:** Cargas masivas y extractos.
- **Entradas:** CSV/XLSX jobs.
- **Salidas:** results, errors file.
- **Dependencias:** Automations/Workers, Audit.
- **Prioridad:** P2.

### 8.7 Backups & Data Retention Ops

- **Objetivo:** Políticas visibles de retención/archivo (ops).
- **Entradas:** policies.
- **Salidas:** jobs de archive.
- **Dependencias:** Automations, Security.
- **Prioridad:** P2.

---

## 9. Comunicaciones y growth

### 9.1 Email Service

- **Objetivo:** Transaccional + campaigns controladas.
- **Entradas:** templates, triggers.
- **Salidas:** deliveries, bounces.
- **Dependencias:** Notifications, Customers.
- **Prioridad:** P1.

### 9.2 WhatsApp Channel

- **Objetivo:** Alertas y atención acotada.
- **Entradas:** templates aprobados, opt-in.
- **Salidas:** messages, status.
- **Dependencias:** Integrations, Customers.
- **Prioridad:** P2.

### 9.3 Marketing Campaigns

- **Objetivo:** Campañas a segmentos.
- **Entradas:** segment + content.
- **Salidas:** sends, metrics.
- **Dependencias:** CRM, Email/WhatsApp.
- **Prioridad:** P3.

### 9.4 Web CMS (Marketing pages)

- **Objetivo:** Contenido landings/blog editable.
- **Entradas:** editors.
- **Salidas:** SSG/ISR pages.
- **Dependencias:** Media, Web.
- **Prioridad:** P2.

### 9.5 Blog

- **Objetivo:** Contenido de autoridad/SEO.
- **Entradas:** posts.
- **Salidas:** articles.
- **Dependencias:** CMS.
- **Prioridad:** P2.

---

## 10. Integraciones y API

### 10.1 Public/Partner API

- **Objetivo:** API versionada para partners/móvil.
- **Entradas:** signed requests, API keys.
- **Salidas:** resources, webhooks.
- **Dependencias:** Authz, Rate limit, Audit.
- **Prioridad:** P2.

### 10.2 Webhooks

- **Objetivo:** Event delivery outbound/inbound.
- **Entradas:** subscriptions.
- **Salidas:** signed payloads, retries.
- **Dependencias:** Automations.
- **Prioridad:** P2.

### 10.3 ERP Integration

- **Objetivo:** Sync órdenes/stock/facturas con ERP externo.
- **Entradas:** mappings.
- **Salidas:** sync jobs.
- **Dependencias:** Orders, Inventory, Finance.
- **Prioridad:** P3.

### 10.4 Payments Gateway Integration

- **Objetivo:** Cobros online si aplica.
- **Entradas:** checkout events.
- **Salidas:** payment confirmed → order/invoice.
- **Dependencias:** Payments.
- **Prioridad:** P3.

### 10.5 E-commerce / Marketplace Connectors

- **Objetivo:** Canales de venta externos.
- **Entradas:** listings, orders in.
- **Salidas:** mapped orders.
- **Dependencias:** Orders, Inventory.
- **Prioridad:** P4.

---

## 11. Experiencias extendidas

### 11.1 Mobile App

- **Objetivo:** Escaneo campo, entregas, academia móvil.
- **Entradas:** device auth.
- **Salidas:** scans, tasks offline-capable futuro.
- **Dependencias:** Verification API, Auth.
- **Prioridad:** P3.

### 11.2 Distributor Portal

- **Objetivo:** Self-service distribuidores.
- **Entradas:** distributor users.
- **Salidas:** orders, academy, materials.
- **Dependencias:** Distributors, Orders, Academy.
- **Prioridad:** P3.

### 11.3 Customer Portal

- **Objetivo:** Historial, docs, verificación asistida.
- **Entradas:** customer auth.
- **Salidas:** self-service.
- **Dependencias:** Customers, Passport.
- **Prioridad:** P3.

### 11.4 Comparador de productos (Web)

- **Objetivo:** Comparar líneas/usos.
- **Entradas:** product attrs.
- **Salidas:** comparison UX.
- **Dependencias:** Products.
- **Prioridad:** P2.

### 11.5 Calculadoras (Web)

- **Objetivo:** Dilución, rendimiento, dosificación (si aplica).
- **Entradas:** params.
- **Salidas:** resultados + disclaimer + link a manual.
- **Dependencias:** Products, Manuals, Expert.
- **Prioridad:** P2.

### 11.6 Contact / Sales Intake

- **Objetivo:** Captura de contacto y routing.
- **Entradas:** forms.
- **Salidas:** leads + automations.
- **Dependencias:** CRM, Email.
- **Prioridad:** P1.

### 11.7 About / Trust Pages

- **Objetivo:** Historia, seguridad, tecnología.
- **Entradas:** CMS.
- **Salidas:** páginas estáticas.
- **Dependencias:** Web CMS.
- **Prioridad:** P1.

---

## 12. Seguridad y compliance extendido

### 12.1 Security Center

- **Objetivo:** Vista de riesgos, sesiones, API keys, anomaly feed.
- **Entradas:** security events.
- **Salidas:** actions (revoke, rotate).
- **Dependencias:** Auth, Antifraud, Audit.
- **Prioridad:** P2.

### 12.2 API Keys & Service Accounts

- **Objetivo:** Credenciales máquina a máquina.
- **Entradas:** create/rotate/revoke.
- **Salidas:** hashed secrets, scopes.
- **Dependencias:** RBAC, Audit.
- **Prioridad:** P2.

### 12.3 Consent & Privacy

- **Objetivo:** Opt-in marketing, retención, DSAR process light.
- **Entradas:** consents.
- **Salidas:** flags en CRM/comms.
- **Dependencias:** Customers, Notifications.
- **Prioridad:** P2.

---

## 13. Matriz de prioridad condensada

| Prioridad | Módulos                                                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0        | Shell, Auth, Users, RBAC, Org model, Audit, Settings core, Products, Passport, QR, Verification, Batches link                                                                                            |
| P1        | Inventory, Warehouses, Production, Orders, Customers, Distributors, Notifications, Alerts, Automations core, Email, Dashboards, Search, Help, Media, Manuals, Expert (guided), Recargas, Antifraud light |
| P2        | CRM, Pricing, Purchasing, Suppliers, Quality, Logistics, Lab, Invoicing, Academy/Courses, CMS/Blog, API/Webhooks, WhatsApp, Imports, Security Center, Comparador, Calculadoras, Feature flags            |
| P3        | Returns, Payments, Finance hub, Tax deep, Insights, Marketing campaigns, Mobile, Portals, ERP                                                                                                            |
| P4        | Marketplace connectors, multi-tenant hard, advanced WMS, etc.                                                                                                                                            |

---

## 14. Módulos añadidos por visión a 20 años

Además de lo pedido, este catálogo incluye: **Antifraud**, **Quality/Quarantine**, **Security Center**, **API Keys**, **Feature Flags**, **Insights**, **Distributor/Customer Portals**, **Quotes**, **Returns**, **Consent/Privacy**, **Search**, **Imports/Exports**, **Org Units/Plants** — porque sin ellos una empresa con miles de clientes no escala con integridad.
