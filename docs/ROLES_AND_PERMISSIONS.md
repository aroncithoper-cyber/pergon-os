# PerGon OS — Roles & Permissions V1

> Modelo RBAC + scopes de servicio.
> **Fail closed.** UI refleja; server+RLS obligan.
> Los keys de permiso son estables; no renombrar sin migración.

---

## 1. Principios

1. Rol = conjunto de permisos; usuario puede tener múltiples roles en una org (y scope de org_unit/warehouse).
2. Permisos son **verbos de dominio** (`resource:action`), no “pantallas”.
3. Roles de sistema inmutables en key; custom roles permitidos después.
4. `guest` / público no es rol DB de admin: es ausencia de sesión + endpoints públicos.
5. `ai` actúa **impersonando** permisos del usuario que confirma; tools no elevan privilegio.
6. Servicios internos usan **service accounts / API keys** con scopes mínimos.

---

## 2. Roles

### 2.1 `super_admin`

- **Quién:** fundadores / plataforma.
- **Poder:** todos los permisos + gestión cross-cutting peligroso (feature flags globales, API keys root, impersonation futura controlada).
- **Restricción:** cuentas nominativas; MFA obligatorio cuando exista; todo auditado.

### 2.2 `admin` (Administrador)

- **Quién:** dirección operativa PerGon.
- **Poder:** configuración org, usuarios (excepto quitar último super_admin), casi toda operación, reportes, automations.
- **No:** destruir audit; rotar secrets de infra fuera de UI permitida.

### 2.3 `production` (Producción)

- **Quién:** planta / calidad operativa.
- **Poder:** production orders, batches, inventory moves de producción, quality checks, emitir/activar passports/QR de producción, ver scans de sus lotes.
- **No:** precios, facturación, borrar usuarios, CRM completo.

### 2.4 `sales` (Ventas)

- **Quién:** equipo comercial.
- **Poder:** customers, leads, quotes, orders (crear/editar según política), ver stock disponible, academia assign light, ver passports read-only.
- **No:** revocar masivo, ajustar inventario libre, formulaciones approved.

### 2.5 `distributor` (Distribuidor)

- **Quién:** usuario portal distribuidor.
- **Poder:** ver su catálogo/precios asignados, crear pedidos propios, academia, materiales, verificar QR, Expert modo partner.
- **No:** Admin interno; no ve costos; no emite pasaportes.

### 2.6 `customer` (Cliente)

- **Quién:** portal cliente / cuenta.
- **Poder:** ver sus pedidos/docs, verificar, help, Expert limitado, academia customer.
- **No:** datos de otros clientes; operación interna.

### 2.7 `guest` (Invitado)

- **Quién:** anónimo web.
- **Poder:** marketing, verify endpoints públicos, Expert público acotado, help/blog.
- **No:** mutaciones de dominio; no listados.

### 2.8 `ai` (PerGon Expert actor)

- **Quién:** principal no humano en audit cuando una tool ejecuta.
- **Poder:** ninguno autónomo; hereda snapshot de permisos del usuario confirmador + allowlist de tools.
- **No:** auto-approve destructivo.

### 2.9 `service` (Servicios internos)

- **Quién:** workers, webhooks processors, automation engine.
- **Poder:** scopes explícitos por key (`scans:write`, `outbox:drain`, `passport:expire_job`).
- **No:** UI login interactivo.

### Roles adicionales recomendados (activar cuando escale)

| Rol                | Uso                                             |
| ------------------ | ----------------------------------------------- |
| `quality`          | Solo quality/quarantine + read batches          |
| `warehouse`        | Inventory/shipments sin producción              |
| `finance`          | Invoices/payments/reports finance               |
| `marketing`        | CMS/campaigns/help/blog                         |
| `support`          | Read-wide + limited customer ops                |
| `security_officer` | Security center, revoke sessions, trust signals |
| `viewer`           | Read-only cross modules                         |

---

## 3. Catálogo de permisos

Formato: `domain:action`.

### IAM

- `users:read` `users:invite` `users:update` `users:deactivate`
- `roles:read` `roles:assign` `roles:manage`
- `org:read` `org:update`
- `org_units:manage` `warehouses:manage`
- `api_keys:manage` `sessions:revoke`
- `settings:read` `settings:update`
- `feature_flags:manage`

### Audit & security

- `audit:read` `audit:export`
- `security:read` `alerts:read` `alerts:manage`
- `trust:read` `trust:manage`

### Catalog

- `products:read` `products:write` `products:publish`
- `media:read` `media:write`
- `manuals:read` `manuals:write` `manuals:publish`
- `formulations:read` `formulations:write` `formulations:approve`
- `prices:read` `prices:write`

### Identity

- `passports:read` `passports:issue` `passports:update` `passports:revoke` `passports:recharge`
- `qr:read` `qr:create` `qr:rotate` `qr:suspend` `qr:print`
- `scans:read` `scans:export`
- `verify:public` (capability endpoint, no rol admin)

### Supply

- `inventory:read` `inventory:adjust` `inventory:move`
- `batches:read` `batches:write`
- `production:read` `production:write` `production:complete`
- `purchasing:read` `purchasing:write`
- `suppliers:read` `suppliers:write`
- `quality:read` `quality:write` `quality:release`

### Commercial

- `customers:read` `customers:write`
- `distributors:read` `distributors:write`
- `leads:read` `leads:write`
- `quotes:read` `quotes:write` `quotes:convert`
- `orders:read` `orders:write` `orders:cancel` `orders:fulfill`
- `shipments:read` `shipments:write`
- `returns:read` `returns:write`

### Finance

- `invoices:read` `invoices:write` `invoices:void`
- `payments:read` `payments:write`
- `finance:reports`

### Knowledge & AI

- `academy:read` `academy:manage` `academy:enroll`
- `help:manage` `blog:manage`
- `expert:use_public` `expert:use_admin` `expert:supervise` `expert:tools_confirm`

### Automations & data

- `automations:read` `automations:manage` `automations:trigger`
- `reports:read` `reports:run` `reports:schedule`
- `imports:run` `exports:run`
- `webhooks:manage`
- `notifications:read` `notifications:send_test`

### Portals

- `portal:distributor` `portal:customer`

---

## 4. Matriz rol → permisos (baseline)

Leyenda: ● full set del bloque · ◐ subset · ○ read · — none

| Permiso bloque         | super | admin | prod      | sales     | dist       | cust     | guest    | service*   |
| ---------------------- | ----- | ----- | --------- | --------- | ---------- | -------- | -------- | ---------- |
| IAM manage             | ●     | ●     | —         | —         | —          | —        | —        | —          |
| Audit read             | ●     | ●     | ◐ propios | ◐         | —          | —        | —        | scoped     |
| Products               | ●     | ●     | ○         | ○/◐       | ○ assigned | ○ public | ○ public | —          |
| Formulations approve   | ●     | ●     | ◐ write   | —         | —          | —        | —        | —          |
| Passports issue/revoke | ●     | ●     | issue+    | ○         | —          | —        | —        | expire job |
| QR rotate/print        | ●     | ●     | ●         | —         | —          | —        | —        | —          |
| Verify public          | —     | —     | —         | —         | ●          | ●        | ●        | —          |
| Inventory adjust       | ●     | ●     | ●         | ○ avail   | —          | —        | —        | sync       |
| Production             | ●     | ●     | ●         | ○         | —          | —        | —        | —          |
| Orders                 | ●     | ●     | ○ fulfill | ●         | own        | own      | —        | import     |
| Customers              | ●     | ●     | ○         | ●         | —          | self     | —        | —          |
| Finance                | ●     | ●     | —         | ○ limited | —          | self inv | —        | pay hooks  |
| Automations manage     | ●     | ●     | —         | —         | —          | —        | —        | run        |
| Expert admin tools     | ●     | ●     | ◐         | ◐         | partner    | limited  | public   | —          |
| API keys               | ●     | ●     | —         | —         | —          | —        | —        | —          |

\*service: solo scopes de la key, nunca “●” implícito.

---

## 5. Scopes de servicio (API keys / workers)

Ejemplos de scopes atómicos:

- `jobs:automation:run`
- `jobs:outbox:drain`
- `jobs:passport:expire`
- `jobs:inventory:reorder_check`
- `hooks:payments:ingest`
- `hooks:whatsapp:ingest`
- `scans:write`
- `webhooks:deliver`
- `search:index`
- `reports:generate`

**Regla:** una key = un propósito; rotación con overlap.

---

## 6. Reglas de elevación y separación

- Emisión de passport + revocación: roles distintos preferibles a largo plazo (`production` issue, `admin`/`security_officer` revoke masivo).
- `formulations:approve` separado de `write`.
- `inventory:adjust` siempre audit + motivo.
- Distribuidores nunca ven `unit_cost` ni formulaciones.
- Guest Expert no puede invocar tools de mutación.

---

## 7. Asignación y lifecycle

1. Invite user → membership pending → accept → assign roles.
2. Desactivar user → revoca sesiones → mantiene audit histórico.
3. Cambio de rol → audit `roles:assign`.
4. Break-glass super_admin: procedimiento documentado + doble control futuro.

---

## 8. Mapeo a UI Admin (orientativo)

| Rol              | Home dashboard énfasis                       |
| ---------------- | -------------------------------------------- |
| super/admin      | ops health, alerts, verify latency, jobs     |
| production       | OP abiertas, quality holds, expiring batches |
| sales            | pipeline, orders pending, stock warnings     |
| finance          | AR aging, failed payments                    |
| security_officer | trust signals, auth anomalies                |

---

## 9. Checklist de authz por feature nueva

- [ ] ¿Permiso nuevo o reusa existente?
- [ ] ¿Check server-side?
- [ ] ¿RLS alineado?
- [ ] ¿Audit si muta identidad/dinero/stock?
- [ ] ¿UI esconde pero no “protege”?
- [ ] ¿Tools AI listadas y gated?

---

## 10. Decisiones obligatorias

| Tema            | Decisión                                           |
| --------------- | -------------------------------------------------- |
| Modelo          | RBAC + scopes servicio                             |
| Público         | guest vía endpoints, no rol admin                  |
| AI              | sin privilegio propio                              |
| Fail            | closed                                             |
| Keys de permiso | estables, versionadas en docs                      |
| MFA             | mandatorio para super_admin cuando esté disponible |
