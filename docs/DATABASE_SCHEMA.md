# PerGon OS — Database Schema Design V1

> Modelo conceptual/lógico. **No es SQL.**
> Convenciones: UUID PK, `timestamptz` UTC, soft delete donde aplique, `organization_id` desde temprano, audit append-only.
> Implementación futura vía `supabase/migrations` + tipos en `@pergon/database`.

---

## 1. Convenciones globales

| Convención            | Decisión                                                           |
| --------------------- | ------------------------------------------------------------------ |
| PK                    | `id` UUID                                                          |
| FK                    | `<table_singular>_id`                                              |
| Soft delete           | `deleted_at` timestamptz null en entidades de negocio recuperables |
| Timestamps            | `created_at`, `updated_at`                                         |
| Actor                 | `created_by`, `updated_by` UUID null                               |
| Optimistic lock       | `version` int donde haya edición concurrente                       |
| Tenancy               | `organization_id` UUID en tablas de negocio                        |
| Enums                 | tipos controlados (status machines)                                |
| Money                 | `numeric(18,6)` + `currency_code`                                  |
| JSON extensible       | `metadata jsonb` acotado — no reemplaza columnas de filtro         |
| Audit                 | tabla dedicada, no update-in-place de historia                     |
| Deletes de audit/scan | no soft; archive/partición                                         |

### Índices estándar (patrón)

- PK UUID
- `(organization_id, deleted_at)` parciales en listados
- Unique parciales: `UNIQUE(org, code) WHERE deleted_at IS NULL`
- FKs indexadas
- Status + updated_at para colas operativas

---

## 2. Diagrama de dominios

```text
ORG / IAM          CATALOG           IDENTITY TRUST
organizations      products          passports
org_units          product_media     passport_versions
warehouses         formulations      qr_codes
users              manuals           scan_events
roles/permissions                    trust_signals

COMMERCIAL         SUPPLY            FINANCE
customers          batches           invoices
distributors       inventory_levels  payments
orders             stock_moves       credit_notes
order_lines        production_orders

KNOWLEDGE          OPS PLATFORM      COMMS
courses            automations       notification_outbox
enrollments        automation_runs   message_templates
articles           alerts            webhook_endpoints
ai_conversations   audit_logs        webhook_deliveries
```

---

## 3. IAM & Organization

### `organizations`

- **Claves:** `id`
- **Campos:** `name`, `slug` unique, `status`, `metadata`
- **Soft delete:** sí
- **Notas:** tenant root

### `org_units`

- **Claves:** `id`, FK `organization_id`, optional `parent_org_unit_id`
- **Campos:** `type` (plant|team|division), `name`, `code`
- **Índices:** `(organization_id, code)` unique parcial

### `warehouses`

- **Claves:** `id`, FK `organization_id`, `org_unit_id?`
- **Campos:** `code`, `name`, `is_active`
- **Unique:** `(organization_id, code)` parcial

### `users` (profile app; auth.users enlazado)

- **Claves:** `id` (= auth user uuid)
- **Campos:** `email`, `full_name`, `status`, `locale`, `last_seen_at`
- **Soft delete:** sí (desactivación)

### `memberships`

- **Claves:** `id`
- **Unique:** `(organization_id, user_id)`
- **Campos:** `status`, `default_org_unit_id?`

### `roles`

- **Claves:** `id`, `organization_id?` null = system role
- **Campos:** `key` (super_admin, …), `name`, `is_system`

### `permissions`

- **Claves:** `id`
- **Campos:** `key` unique (`passport:revoke`), `module`, `description`

### `role_permissions`

- **Unique:** `(role_id, permission_id)`

### `user_roles`

- **Campos:** `user_id`, `role_id`, `organization_id`, `org_unit_id?`, `warehouse_id?`
- **Índices:** `(user_id, organization_id)`

### `api_keys`

- **Campos:** `organization_id`, `name`, `key_prefix`, `key_hash`, `scopes[]`, `expires_at`, `revoked_at`, `created_by`
- **Soft delete:** no; revoke via `revoked_at`
- **Índices:** `key_prefix`

### `sessions_meta` (opcional ops)

- Tracking de sesiones admin para Security Center

---

## 4. Catalog & Lab

### `products`

- **Campos:** `organization_id`, `sku`, `name`, `slug`, `status`, `family_id?`, `description`, `attributes jsonb`, `version`
- **Unique:** `(organization_id, sku)`, `(organization_id, slug)` parciales
- **Soft delete:** sí

### `product_families`

- `organization_id`, `name`, `slug`, `sort_order`

### `product_media`

- `product_id`, `media_asset_id`, `role` (hero|gallery|doc), `sort_order`

### `media_assets`

- `organization_id`, `storage_path`, `mime`, `size`, `checksum`, `visibility`, `created_by`
- **Soft delete:** sí

### `formulations`

- `product_id`, `version_number`, `status` (draft|approved|retired), `approved_at`, `approved_by`, `notes`
- **Unique:** `(product_id, version_number)`
- **Versionado:** sí (inmutable approved)

### `formulation_items`

- `formulation_id`, `component_name`, `component_product_id?`, `qty`, `uom`

### `manuals`

- `organization_id`, `product_id?`, `title`, `slug`, `doc_type`, `version_number`, `status`, `media_asset_id`, `published_at`
- **Versionado:** sí

### `price_lists`

- `organization_id`, `name`, `currency_code`, `channel`, `valid_from`, `valid_to`

### `price_list_items`

- `price_list_id`, `product_id`, `unit_price`
- **Unique:** `(price_list_id, product_id)`

---

## 5. Identity trust (núcleo)

### `passports`

- **Campos:** `organization_id`, `public_id` (código presentable), `product_id`, `batch_id?`, `status`, `issued_at`, `expires_at`, `revoked_at`, `revoked_reason`, `current_version`, `metadata`
- **Unique:** `(organization_id, public_id)` parcial
- **Índices:** `(status, expires_at)`, `(product_id)`, `(batch_id)`
- **Soft delete:** sí (raro; prefer revoke)
- **Versionado:** vía `passport_versions`

### `passport_versions`

- **Campos:** `passport_id`, `version_number`, `snapshot jsonb` (datos públicos/ops autorizados), `created_by`, `created_at`, `change_reason`
- **Unique:** `(passport_id, version_number)`
- **Inmutable** tras insert

### `qr_codes`

- **Campos:** `organization_id`, `passport_id`, `public_code`, `status` (active|rotated|suspended|revoked|expired), `resolution_token_hash?`, `rotated_from_id?`, `activated_at`, `expires_at`, `print_batch_id?`
- **Unique:** `(organization_id, public_code)` parcial
- **Índices:** `(passport_id, status)`, `(status, updated_at)`
- **Soft delete:** sí

### `qr_print_batches`

- `organization_id`, `label`, `quantity`, `status`, `created_by`

### `scan_events`

- **Sin soft delete**
- **Campos:** `organization_id?`, `qr_code_id?`, `passport_id?`, `public_code_attempt`, `result` (valid|invalid|revoked|expired|rate_limited|suspicious), `channel`, `ip_hash`, `user_agent`, `geo jsonb`, `risk_score`, `created_at`
- **Índices:** `(qr_code_id, created_at desc)`, `(created_at)`, `(result, created_at)`, `(ip_hash, created_at)` — candidatos a partición por tiempo
- **Retención:** archive policy

### `trust_signals`

- `organization_id`, `passport_id?`, `qr_code_id?`, `signal_type`, `severity`, `payload jsonb`, `status`, `created_at`, `resolved_at`

### `passport_recharges`

- `passport_id`, `from_expires_at`, `to_expires_at`, `order_id?`, `idempotency_key`, `actor_id`, `created_at`
- **Unique:** `idempotency_key`

---

## 6. Supply

### `batches`

- `organization_id`, `product_id`, `code`, `manufactured_at`, `expires_at`, `status`, `formulation_id?`, `warehouse_id?`
- **Unique:** `(organization_id, code)` parcial
- **Índices:** `(product_id, status)`, `(expires_at)`

### `inventory_levels`

- **Unique:** `(warehouse_id, product_id, batch_id)` (batch_id nullable strategy documentada)
- **Campos:** `qty_on_hand`, `qty_reserved`, `qty_available` (generado o derivado), `updated_at`, `version`

### `stock_moves`

- **Sin soft delete** (ledger)
- `organization_id`, `warehouse_id`, `product_id`, `batch_id?`, `qty_delta`, `reason` (receipt|shipment|adjust|produce|consume|return), `ref_type`, `ref_id`, `idempotency_key`, `created_by`, `created_at`
- **Unique:** `idempotency_key`
- **Índices:** `(warehouse_id, created_at)`, `(ref_type, ref_id)`

### `production_orders`

- `organization_id`, `product_id`, `target_qty`, `status`, `scheduled_for`, `batch_id?`, `formulation_id?`, `warehouse_id`
- **Índices:** `(status, scheduled_for)`

### `production_order_consumptions`

- `production_order_id`, `product_id`, `batch_id?`, `qty`

### `purchase_orders`

- `organization_id`, `supplier_id`, `status`, `expected_at`, `currency_code`

### `purchase_order_lines`

- `purchase_order_id`, `product_id`, `qty`, `unit_cost`

### `suppliers`

- `organization_id`, `name`, `code`, `status`, `contacts jsonb`
- Soft delete sí

### `quality_checks`

- `batch_id`, `status` (pending|passed|failed|hold), `checked_by`, `checked_at`, `notes`, `attachments`

---

## 7. Commercial

### `customers`

- `organization_id`, `type` (b2b|b2c), `name`, `tax_id?`, `status`, `segment`, `metadata`
- Soft delete sí
- Índices: `(organization_id, name)`, tax_id unique parcial si aplica

### `customer_contacts`

- `customer_id`, `name`, `email`, `phone`, `is_primary`

### `distributors`

- `organization_id`, `customer_id?` o profile propio, `territory`, `status`, `code`
- Unique code parcial

### `leads`

- `organization_id`, `source`, `stage`, `email`, `phone`, `company`, `owner_user_id`, `payload jsonb`
- Índices: `(stage, owner_user_id)`

### `orders`

- `organization_id`, `customer_id`, `distributor_id?`, `status`, `currency_code`, `ordered_at`, `promised_at`, `totals jsonb|cols`, `version`
- Índices: `(status, ordered_at)`, `(customer_id, ordered_at)`

### `order_lines`

- `order_id`, `product_id`, `qty`, `unit_price`, `warehouse_id?`

### `quotes` / `quote_lines`

- Análogo a orders con `valid_until`, `converted_order_id?`

### `shipments`

- `order_id`, `status`, `shipped_at`, `carrier`, `tracking_code`

### `returns`

- `order_id`, `status`, `reason`, `restock`

---

## 8. Finance

### `invoices`

- `organization_id`, `customer_id`, `order_id?`, `number`, `status`, `issued_at`, `due_at`, `currency_code`, `totals`
- Unique `(organization_id, number)`

### `invoice_lines`

- `invoice_id`, `product_id?`, `description`, `qty`, `unit_price`, `tax_code`

### `payments`

- `organization_id`, `invoice_id?`, `amount`, `method`, `status`, `provider_ref`, `received_at`
- Índices: `provider_ref` unique parcial

### `credit_notes`

- Similar a invoices vinculadas

---

## 9. Knowledge & AI

### `courses`

- `organization_id`, `title`, `slug`, `status`, `audience` (internal|distributor|customer)

### `course_modules` / `lessons`

- Jerarquía contenido, `sort_order`, `media_asset_id?`

### `enrollments`

- Unique `(course_id, user_id|customer_contact_id)`
- `progress_pct`, `completed_at`

### `lesson_progress`

- Unique `(enrollment_id, lesson_id)`, `status`, `score?`

### `help_articles`

- `slug`, `title`, `body`, `status`, `audience`, `seo jsonb`
- Soft delete sí

### `blog_posts`

- Similar a help, `published_at`, author

### `ai_conversations`

- `organization_id?`, `user_id?`, `channel` (web|admin), `status`, `created_at`

### `ai_messages`

- `conversation_id`, `role`, `content`, `tool_trace jsonb`, `created_at`
- Retención/redaction policy

### `ai_tool_invocations`

- `message_id`, `tool_name`, `args_redacted`, `result_status`, `actor_permission_snapshot`

---

## 10. Automations & Comms

### `automation_definitions`

- `organization_id`, `key`, `name`, `trigger_type` (event|cron|manual), `trigger_config jsonb`, `conditions jsonb`, `actions jsonb`, `is_enabled`, `version`
- Versionado al publicar

### `automation_runs`

- `automation_id`, `status`, `started_at`, `finished_at`, `error`, `idempotency_key`, `input_ref`
- Unique idempotency where not null
- Índices: `(status, started_at)`

### `alerts`

- `organization_id`, `severity`, `type`, `title`, `body`, `entity_type`, `entity_id`, `status` (open|ack|closed), `assignee_id?`, `created_at`, `closed_at`
- Índices: `(status, severity, created_at)`

### `notification_outbox`

- Transaccional outbox: `channel`, `template_key`, `payload`, `status`, `attempts`, `next_attempt_at`
- Worker drain

### `message_templates`

- `channel`, `key`, `locale`, `version`, `subject?`, `body`, `status`

### `webhook_endpoints`

- `organization_id`, `url`, `secret_hash`, `events[]`, `is_active`

### `webhook_deliveries`

- `endpoint_id`, `event_type`, `payload`, `status`, `attempts`, `response_code`

### `consent_records`

- `subject_type`, `subject_id`, `channel`, `purpose`, `granted`, `recorded_at`, `source`

---

## 11. Audit & platform

### `audit_logs`

- **Append-only, sin soft delete**
- `organization_id`, `actor_user_id?`, `actor_type` (user|service|ai|system), `action`, `entity_type`, `entity_id`, `before jsonb`, `after jsonb`, `request_id`, `ip_hash`, `created_at`
- Índices: `(entity_type, entity_id, created_at)`, `(actor_user_id, created_at)`, `(created_at)` — partición futura

### `feature_flags`

- `key`, `description`, `rules jsonb`, `is_enabled`

### `idempotency_keys`

- `key`, `scope`, `response_ref`, `created_at`, `expires_at`
- Unique `(scope, key)`

### `job_locks` (opcional)

- Para crons distribuidos

---

## 12. Relaciones críticas (resumen)

```text
organization
  ├─ users via memberships / user_roles
  ├─ products → formulations → production_orders → batches
  ├─ batches → inventory_levels / stock_moves
  ├─ batches → passports → passport_versions
  ├─ passports → qr_codes → scan_events
  ├─ customers → orders → order_lines → shipments/invoices
  ├─ distributors → orders / enrollments
  └─ automation_definitions → automation_runs → alerts / outbox
```

**Regla de integridad:** revocar passport no borra scans; rotar QR crea nuevo registro o marca `rotated` y deja historial; stock solo cambia vía `stock_moves`.

---

## 13. RLS (diseño)

- Políticas por `organization_id` membership.
- Tablas públicas de verificación: **no** exponer tablas raw; acceso vía RPC/service de verificación con DTO.
- `audit_logs` / `scan_events`: lectura restringida por permiso.
- Service role solo workers.

---

## 14. Versionado de schema

- Migraciones timestamped.
- Breaking changes de DTO público de verificación: versionar API (`/v1/verify`) antes de romper.
- Snapshots en `passport_versions` protegen historial aunque cambie schema de columnas “vivas”.

---

## 15. Volumen y archivo

| Tabla                 | Estrategia                       |
| --------------------- | -------------------------------- |
| `scan_events`         | Partición mensual + archive cold |
| `audit_logs`          | Idem                             |
| `automation_runs`     | Retención 90–365d según policy   |
| `ai_messages`         | Retención corta + redaction      |
| `notification_outbox` | Purge delivered                  |

---

## 16. Qué no modelamos aún (consciente)

- Contabilidad de doble entrada completa (se integra ERP).
- WMS de slots ultramicro.
- Multi-tenant hard isolation (preparado con `organization_id`).

Estas omisiones evitan overbuild; el modelo actual no las bloquea.
