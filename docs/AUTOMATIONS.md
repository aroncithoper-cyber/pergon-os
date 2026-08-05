# PerGon OS — Automations V1

> Objetivo: **PerGon trabaja solo**.
> Humanos aprueban excepciones, diseñan reglas y atienden alertas — no re-tipean lo repetible.
> Cada automatización: trigger · condiciones · acciones · idempotencia · dueño · severidad si falla · fase sugerida.

---

## 0. Arquitectura del motor

### Componentes

- **Triggers:** `event`, `cron`, `condition_poll`, `manual`, `webhook`.
- **Conditions:** filtros sobre payload + estado DB.
- **Actions:** comandos de dominio (mismos paths que UI).
- **Outbox:** side-effects externos (email, WhatsApp, webhooks).
- **Runs:** historial, retries, dead-letter.
- **Idempotency keys:** obligatorias en acciones con efecto externo o financiero/stock.

### Políticas globales

1. At-least-once delivery + handlers idempotentes.
2. Backoff exponencial; max attempts configurables; luego alerta `sev=high`.
3. Quiet hours para canales comerciales (no para seguridad/fraude).
4. Deduplicación de alertas (fingerprint).
5. Feature flag por automation key.
6. Dry-run / test run en Admin antes de enable en prod.
7. Versionado de definición al publicar.

### Severidades de fallo

`low` (retry) · `medium` (alerta assignee) · `high` (alerta admin + pager futuro) · `critical` (seguridad/identidad).

---

## 1. Ventas & CRM

| Key                              | Trigger            | Acciones                                           | Fase |
| -------------------------------- | ------------------ | -------------------------------------------------- | ---- |
| `lead.created.notify_owner`      | event lead created | assign round-robin si sin owner; notify; SLA timer | 2    |
| `lead.sla_breach`                | cron 15m           | si stage no avanza N horas → escalate + task       | 2    |
| `lead.nurture_drip`              | event + cron       | secuencia email 3 pasos si no convert (opt-in)     | 3    |
| `lead.to_customer`               | stage=won          | crear customer; link lead; notify sales            | 2    |
| `quote.expiring`                 | cron daily         | avisar owner 3 días antes                          | 2    |
| `quote.accepted`                 | event              | crear order draft; notify ops                      | 2    |
| `order.created.ack`              | event              | email/WA confirmación cliente; notify warehouse    | 1–2  |
| `order.payment_due_reminder`     | cron               | recordatorios AR                                   | 3    |
| `order.stale`                    | cron               | orders `pending` > N días → alerta sales           | 2    |
| `cart_or_form.abandoned_contact` | event              | si contacto empezó apply/distribuidor y no terminó | 2    |
| `upsell_academy_after_order`     | order delivered    | enroll sugerido / email academia                   | 3    |
| `winback_inactive_customer`      | cron monthly       | segmento sin orders 90d                            | 3    |

---

## 2. Producción & calidad

| Key                                  | Trigger          | Acciones                                             |
| ------------------------------------ | ---------------- | ---------------------------------------------------- |
| `production.scheduled_remind`        | cron             | OP del día → notify production                       |
| `production.materials_short`         | event OP release | chequear BOM vs stock; bloquear o alertar            |
| `production.completed.seed_identity` | OP complete      | crear batch; draft passports; queue QR print batch   |
| `production.yield_anomaly`           | event            | merma > umbral → quality alert                       |
| `quality.hold_blocks_ship`           | quality=hold     | impedir shipment/fulfill del batch                   |
| `quality.failed.quarantine`          | failed           | mover stock quarantine location; suspend QR opcional |
| `quality.release.unlock`             | passed           | liberar stock; activar passports                     |
| `formulation.approved.notify`        | event            | notify production + update default formulation       |
| `batch.expiry_warning`               | cron daily       | T-90/T-30/T-7 alerts; sugerir promo o hold           |

---

## 3. QR, Pasaporte, Trust

| Key                                   | Trigger             | Acciones                                             | Criticidad    |
| ------------------------------------- | ------------------- | ---------------------------------------------------- | ------------- |
| `passport.auto_expire`                | cron hourly         | status→expired; invalidate active QR resolve         | critical path |
| `passport.expiry_notify_ops`          | cron                | alertas T-30/T-7                                     | high          |
| `passport.recharge.applied`           | event               | version snapshot; notify; audit already              |               |
| `qr.batch_print.ready`                | QR batch generated  | notify print ops + download package                  |               |
| `qr.rotate_on_signal`                 | trust signal high   | sugerir o auto-rotate si policy=auto                 | critical      |
| `qr.suspend_on_fraud_spike`           | anomaly             | suspend codes + alert security                       | critical      |
| `scan.invalid_burst`                  | windowed count      | alert + possible IP throttle flag                    | critical      |
| `scan.geo_impossibility`              | consecutive geos    | trust_signal + alert                                 | high          |
| `scan.first_valid.celebrate_internal` | first scan optional | notify product owner (ops insight)                   | low           |
| `verify.latency_slo_breach`           | metric              | alert platform                                       | high          |
| `passport.revoked.fanout`             | event               | invalidate QR; notify stakeholders; webhook partners | critical      |
| `public_verify.cache_purge`           | revoke/rotate       | purge CDN/cache keys                                 | critical      |

---

## 4. Inventario & almacenes

| Key                                         | Trigger                          | Acciones                                                    |
| ------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| `inventory.reorder_point`                   | cron/poll                        | si qty_available < min → crear draft PO o alerta purchasing |
| `inventory.overstock`                       | cron weekly                      | report slow movers                                          |
| `inventory.negative_guard`                  | before move                      | deny + alert if would go negative (policy)                  |
| `inventory.cycle_count_due`                 | cron                             | generar tareas conteo                                       |
| `inventory.adjust_requires_second_approval` | event adjust > threshold         | workflow approval                                           |
| `stock.move.from_order_fulfill`             | order fulfill                    | create stock_moves idempotent                               |
| `stock.move.from_receipt`                   | PO receive                       | increase levels + notify                                    |
| `warehouse.transfer_auto_complete`          | ETA passed + confirm scan future | complete transfer                                           |

---

## 5. Compras & proveedores

| Key                          | Trigger            | Acciones                             |
| ---------------------------- | ------------------ | ------------------------------------ |
| `po.auto_draft_from_reorder` | reorder automation | draft PO lines grouped by supplier   |
| `po.pending_approval`        | draft created      | notify finance/admin                 |
| `po.sent.followup`           | cron               | PO open > N days → remind            |
| `po.partial_receipt_alert`   | receipt            | alert if short ship                  |
| `supplier.score_update`      | monthly            | lead time / quality metrics (future) |
| `supplier.cert_expiry`       | cron               | docs expiry alerts                   |

---

## 6. Clientes & distribuidores

| Key                                | Trigger      | Acciones                                                            |
| ---------------------------------- | ------------ | ------------------------------------------------------------------- |
| `customer.created.welcome`         | event        | email welcome + help links                                          |
| `customer.segment_recompute`       | cron nightly | RFM light / volume tiers                                            |
| `distributor.application_received` | web form     | lead + notify sales + SLA                                           |
| `distributor.approved.provision`   | event        | create distributor user invite + price list attach + academy enroll |
| `distributor.inactive`             | cron         | flag + outreach task                                                |
| `distributor.order_limit_breach`   | order create | hold for approval if over credit                                    |
| `customer.portal_invite`           | manual/event | send magic link                                                     |
| `consent.marketing_withdraw`       | event        | stop campaigns immediately                                          |

---

## 7. Pedidos, logistics, postventa

| Key                       | Trigger            | Acciones                                             |
| ------------------------- | ------------------ | ---------------------------------------------------- |
| `order.allocate_stock`    | confirmed          | reservations                                         |
| `order.cannot_allocate`   | fail               | alert sales + suggest substitutes                    |
| `order.pick_list`         | ready_to_pick      | notify warehouse                                     |
| `shipment.created.notify` | event              | tracking email/WA                                    |
| `shipment.delivered`      | event/carrier hook | close order; trigger academy/review request (opt-in) |
| `shipment.delayed`        | cron/ETA           | notify customer + ops                                |
| `return.requested`        | event              | create RMA; notify quality                           |
| `return.received.restock` | event              | stock_move + credit note draft                       |

---

## 8. Academia & conocimiento

| Key                                     | Trigger | Acciones                        |
| --------------------------------------- | ------- | ------------------------------- |
| `academy.enroll_on_distributor_approve` | event   | enroll path mandatory           |
| `academy.reminder_incomplete`           | cron    | nudge learners                  |
| `academy.completed.cert`                | event   | generate cert asset + notify    |
| `academy.new_course_publish`            | event   | notify audience segment         |
| `manual.published.reindex_ai`           | event   | refresh Expert retrieval corpus |
| `help.article_stale`                    | cron    | flag articles > 180d sin review |

---

## 9. IA PerGon Expert

| Key                               | Trigger          | Acciones                                |
| --------------------------------- | ---------------- | --------------------------------------- |
| `ai.abuse_rate_limit`             | burst            | throttle + alert                        |
| `ai.tool_requested`               | tool intent      | require human confirm UI; log           |
| `ai.hallucination_report`         | user thumbs down | queue review + optional disable snippet |
| `ai.corpus_drift`                 | manuals change   | rebuild embeddings/job                  |
| `ai.conversation_retention_purge` | cron             | delete/redact old messages per policy   |
| `ai.suggest_reorder`              | insights cron    | create insight cards for admin          |
| `ai.suggest_qr_rotate`            | trust+ai         | recommendation not auto unless policy   |

---

## 10. Marketing & web

| Key                              | Trigger           | Acciones                             |
| -------------------------------- | ----------------- | ------------------------------------ |
| `marketing.welcome_series`       | newsletter opt-in | drip                                 |
| `marketing.blog_publish_social`  | event             | outbox to connectors (future)        |
| `marketing.segment_campaign`     | manual/cron       | send with suppressions               |
| `web.contact_form`               | event             | lead + auto-reply + notify           |
| `web.verify_to_help_cta`         | first invalid?    | no creepy stalking; only show UI CTA |
| `seo.sitemap_regenerate`         | publish content   | rebuild sitemap job                  |
| `web.product_publish_invalidate` | product publish   | ISR/revalidate paths                 |

---

## 11. Finanzas & facturación

| Key                            | Trigger          | Acciones                                |
| ------------------------------ | ---------------- | --------------------------------------- |
| `invoice.generate_on_delivery` | delivered policy | create invoice draft/final              |
| `invoice.send`                 | issued           | email PDF                               |
| `invoice.overdue`              | cron             | dunning sequence + alert finance        |
| `payment.received.apply`       | webhook          | apply payment idempotent; update status |
| `payment.failed`               | webhook          | alert + customer notify                 |
| `credit_note.after_return`     | return approved  | draft credit                            |
| `fx_or_tax_table_update`       | manual           | version prices (future)                 |
| `revenue_daily_digest`         | cron             | email finance snapshot                  |

---

## 12. Alertas transversales

| Key                      | Trigger           | Acciones                   |
| ------------------------ | ----------------- | -------------------------- |
| `alert.dedupe`           | any alert create  | merge fingerprint 15m      |
| `alert.escalate_unacked` | cron              | severity bump / reassign   |
| `alert.storm_detect`     | volume            | pause noncritical notifies |
| `digest.daily_ops`       | cron 07:00 org tz | email summary alerts+KPIs  |
| `digest.weekly_exec`     | cron              | exec PDF/report            |

---

## 13. Correos (transaccionales)

Templates versionados + automations:

- Auth: invite, reset, magic link
- Orders: confirm, shipped, delivered, cancelled
- Identity: passport issued (internal), recharge receipt, revoke notice (policy)
- Finance: invoice, overdue, receipt
- Academy: enroll, remind, complete
- Security: new login, API key created, role changed
- System: automation failed, export ready

**Reglas:** unsubscribe solo marketing; transaccional separado; bounce handling → suppress.

---

## 14. WhatsApp

| Key                           | Uso            | Cuidado           |
| ----------------------------- | -------------- | ----------------- |
| `wa.order_shipped`            | tracking corto | template aprobado |
| `wa.payment_reminder`         | opt-in strict  | quiet hours       |
| `wa.distributor_approved`     | onboarding     |                   |
| `wa.alert_critical_to_oncall` | security/ops   | allowlist numbers |
| `wa.expert_handoff`           | future         | human takeover    |

Sin WhatsApp spam de marketing hasta compliance maduro.

---

## 15. Reportes programados

| Report                     | Cron    | Destinatarios |
| -------------------------- | ------- | ------------- |
| Scans daily                | daily   | ops/security  |
| Expiring batches/passports | daily   | production    |
| Inventory below min        | daily   | purchasing    |
| Sales by SKU               | weekly  | sales/exec    |
| Automation failure rate    | daily   | platform      |
| Invalid verify ratio       | hourly  | security      |
| AR aging                   | weekly  | finance       |
| Academy completion         | monthly | L&D/sales     |
| Trust signals open         | daily   | security      |

Exports a Storage + link; opcional email.

---

## 16. Backups, retención, integridad

| Key                            | Trigger      | Acciones                                            |
| ------------------------------ | ------------ | --------------------------------------------------- |
| `db.backup_verify`             | cron         | verify backup freshness (infra hook) alert if stale |
| `scan_events.archive`          | cron monthly | move cold                                           |
| `audit.archive`                | cron         | cold storage                                        |
| `outbox.purge_delivered`       | cron         | delete old delivered                                |
| `media.orphan_gc`              | cron weekly  | soft-delete orphans                                 |
| `idempotency_keys.purge`       | cron         | expire keys                                         |
| `storage.signed_url_leak_scan` | cron         | heuristic (future)                                  |

---

## 17. Seguridad

| Key                                      | Trigger            | Acciones                | Sev      |
| ---------------------------------------- | ------------------ | ----------------------- | -------- |
| `security.auth_bruteforce`               | failures window    | throttle + alert        | high     |
| `security.new_admin_role`                | role assign admin+ | notify all super_admins | critical |
| `security.api_key_created`               | event              | notify security         | high     |
| `security.api_key_unused_rotate`         | cron 90d           | alert rotate            | med      |
| `security.rls_disabled_detected`         | check job          | critical halt flag      | critical |
| `security.service_role_misuse_heuristic` | anomaly            | alert                   | critical |
| `security.export_large`                  | export > N rows    | require reauth + audit  | high     |
| `security.geo_login_anomaly`             | login              | step-up MFA future      | high     |
| `security.revoke_all_sessions`           | manual automation  | mass revoke             |          |

---

## 18. Integraciones & API

| Key                        | Trigger                 | Acciones                       |
| -------------------------- | ----------------------- | ------------------------------ |
| `webhook.deliver`          | domain event subscribed | signed POST retries            |
| `webhook.endpoint_failing` | N failures              | disable endpoint + alert       |
| `erp.order_push`           | order confirmed         | map+push                       |
| `erp.stock_pull`           | cron                    | reconcile with conflict report |
| `payments.sync`            | webhook                 | canonical payment apply        |
| `partner.catalog_sync`     | cron/manual             | publish subset                 |

---

## 19. App móvil / campo (futuro)

| Key                           | Acciones                            |
| ----------------------------- | ----------------------------------- |
| `mobile.offline_scan_sync`    | batch upload scans with idempotency |
| `mobile.route_tasks_daily`    | push tareas warehouse/driver        |
| `mobile.version_force_update` | kill switch outdated clients        |

---

## 20. “Empresa con miles de clientes” — paquetes de autonomía

### Pack A — Trust Autopilot (P0/P1)

expire passports, purge verify cache, fraud spike suspend, invalid burst alerts, daily trust digest.

### Pack B — Stock Autopilot (P1)

reorder points, allocate on order, short-material block, expiry batch warnings.

### Pack C — Revenue Autopilot (P2)

order ack, shipment notify, invoice on policy, overdue dunning, payment apply.

### Pack D — Network Autopilot (P2)

distributor apply→approve provisioning, academy enroll+remind, welcome series.

### Pack E — Platform Autopilot (P1)

outbox drain, automation DLQ, backup verify, sitemap/revalidate, AI corpus refresh.

---

## 21. Playbooks de fallo

1. **Verification down:** kill nonessential jobs; serve stale-negative carefully; page on-call; never serve false “valid”.
2. **Outbox jammed:** pause campaigns; keep transactional security mails; alert.
3. **False fraud suspend:** automation `trust.false_positive_revert` with human confirm.
4. **Duplicate recharge:** idempotency prevents; alert finance if conflict.

---

## 22. Gobernanza

- Cada automation tiene **owner role** (no persona única opaca).
- Cambios a automations `critical` requieren rol `admin`+ y audit.
- Catálogo en Admin `/automations` es la verdad operativa; este doc es el diseño maestro.
- KPI norte: **% tareas repetitivas sin toque humano** y **MTTR de alertas**.

---

## 23. Prioridad de construcción del motor

1. Outbox + email transactional + run log
2. Cron expire passport + expiry alerts
3. Order/shipment notifications
4. Inventory reorder
5. Fraud/scan anomaly
6. Builder UI de automations
7. WhatsApp + webhooks partners
8. Insights AI suggestions

---

## 24. Decisión final

Si una tarea ocurre **≥3 veces/semana** con reglas claras, **debe** convertirse en automation o justificarse por excepción humana (juicio, negociación, ética). PerGon no escala a miles de clientes con operadores como middleware humano de copy-paste.
