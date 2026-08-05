# PerGon OS — Roadmap V1

> Secuencia de construcción a 20 años de ambición, con pragmatismo de entrega.
> Regla: **no construir módulo comercial avanzado antes de identidad verificable y Admin operable.**
> Las fases son capacidad-driven, no solo calendario.

---

## Principios de priorización

1. Primero lo que **nunca debe romperse**: verify + passport + QR + authz + audit.
2. Luego lo que hace **trabajar a la empresa**: inventory/production/orders + automations core.
3. Luego **red y conocimiento**: distributors, academy, Expert.
4. Luego **dinero e integraciones**.
5. Luego **canales móviles/portales/ERP**.

Dependencia dura: schema + RBAC + `@pergon/ui` tokens antes de UI masiva.

---

## Fase 0 — Cimientos (HECHO / en curso)

**Meta:** monorepo listo sin features de negocio.

- [x] Apps web/admin scaffold
- [x] Packages ui/config/database/shared/three
- [x] Docs Design Bible skeleton + UI principles
- [x] Cursor foundation rules 01–12
- [x] Master architecture docs set (este paquete)

**Exit criteria:** typecheck/build; rules obligatorias; docs arquitectura aprobadas como norte.

---

## Fase 1 — Trust Core (P0)

**Meta:** emitir identidad y verificarla en producción controlada.

### Build order

1. Auth Admin + users + roles + permissions baseline
2. Organization/warehouse skeleton
3. Products (CRUD mínimo)
4. Batches mínimo
5. Passports issue/read/revoke + versions
6. QR create/resolve dinámico + rotate
7. Web `/verificar` + scan_events
8. Admin scans explorer + audit_logs
9. Automations: `passport.auto_expire`, cache purge on revoke
10. Email transactional auth + security basics

### Dependencias

DB tables IAM + catalog light + identity; RLS; rate limit verify.

### No hacer aún

E-commerce, WhatsApp marketing, lab completo, IA tools mutadoras, ERP.

### Exit criteria

- Emitir pasaporte+QR en Admin
- Verificar en Web con estados correctos
- Revocar → verify ya no valid
- Audit en issue/revoke/rotate
- Super_admin/admin/production roles útiles

---

## Fase 2 — Operations Core (P1)

**Meta:** PerGon opera stock, planta y pedidos básicos; empieza a trabajar solo.

### Build order

1. Inventory levels + stock_moves + adjust
2. Production orders → batch → seed identity hook
3. Customers + Orders + shipments light
4. Distributors master (sin portal full)
5. Alerts center + notification inbox
6. Automations Pack A+B+C parcial (reorder, order ack, shipment notify, expiry warns)
7. Dashboards role-aware v1
8. Global search
9. Media + manuals publish
10. Expert público retrieval sobre manuals/products (sin tools peligrosas)
11. Help center
12. Web tecnología/seguridad/productos PDP

### Exit criteria

- Pedido reserva stock y notifica
- OP completa genera batch + ofrece passports/QR
- Alertas de expiry y verify health
- Expert responde dominio con corpus real

---

## Fase 3 — Network & Intelligence (P1–P2)

**Meta:** red de distribución, academia, antifraud, API inicial.

### Build

- Distributor apply + approve provisioning automation
- Academy courses/enrollments/reminders
- Antifraud trust_signals + rotate suggestions
- Recharges flow
- CRM leads pipeline
- Purchasing + suppliers
- Quality hold/release
- WhatsApp transactional allowlist
- Public/Partner API v1 + webhooks
- Automations builder UI
- Comparador + calculadoras web
- Blog/CMS
- Security center + API keys

### Exit criteria

- Distribuidor aprobado recibe acceso/academia
- Fraud spike genera alerta y playbook
- Partner puede resolve autenticado
- Ops crea automation sin deploy

---

## Fase 4 — Commerce Depth & Scale (P2–P3)

**Meta:** dinero, profundidad comercial, escala de datos.

### Build

- Pricing lists
- Quotes
- Invoicing + payments gateway
- Returns/RMA
- Finance dashboards
- Imports/exports masivos
- Scan/audit archival partitioning
- Insights recommendations
- Feature flags
- Worker platform dedicada si carga lo exige
- Distributor portal v1
- Customer portal v1
- Mobile app scan-first

### Exit criteria

- Ciclo order→invoice→payment cerrado
- Portales self-service útiles
- Archivo de scans sin degradar verify
- App móvil de campo en piloto

---

## Fase 5 — Platform Company (P3–P4)

**Meta:** PerGon OS como plataforma industrial de largo plazo.

### Build

- ERP connectors maduros
- Marketplace connectors
- Multi-plant advanced WMS
- Hard multi-tenant si negocio white-label
- Advanced MFA/SSO enterprise
- Data warehouse / BI
- Edge verify global
- Certificaciones/compliance packs regionales
- AI tools admin con gobernanza fuerte
- Marketing automation maduro (consent-first)

### Exit criteria

- Multi-entidad sin rewrite
- SLOs verify multi-región
- Integraciones ERP en producción
- Gobierno de IA auditable

---

## Matriz “qué primero / qué después”

| Primero                | Después                | Nunca “antes de tiempo”                      |
| ---------------------- | ---------------------- | -------------------------------------------- |
| Verify + Passport + QR | Academy polish         | Vanity marketing site sin verify             |
| RBAC + Audit           | Custom roles UX sugar  | Service role en client                       |
| Inventory ledger       | Beautiful stock charts | Adjust sin audit                             |
| Order + notify         | Payments               | Full ERP custom                              |
| Expert retrieval       | Agent mutaciones       | Chatbot generalista                          |
| Email transactional    | WhatsApp marketing     | Spam sin consent                             |
| Single org + org_units | Hard multi-tenant      | Tenancy rewrite tardío sin `organization_id` |

---

## Dependencias críticas (diagrama corto)

```text
Auth/RBAC → Products → Batches → Passport → QR → Verify(Web)
                ↘ Inventory → Production ↗
Orders → Inventory moves → Shipments → (Invoice → Payments)
Manuals → Expert
Events → Automations → Outbox (Email/WA/Webhooks)
```

---

## Riesgos y mitigaciones

| Riesgo                              | Mitigación                                   |
| ----------------------------------- | -------------------------------------------- |
| Sobreconstruir Admin antes de trust | Fase 1 gate estricto                         |
| Cache sirviendo valid tras revoke   | purge automation + TTL corto                 |
| Automations no idempotentes         | keys + tests                                 |
| IA alucina fichas                   | solo corpus publicado; rechazo fuera dominio |
| Escala scans                        | partición desde diseño; no esperar OOM       |
| Dual design systems                 | rules + codeowners ui package                |

---

## Gobernanza del roadmap

- Cambios de fase requieren actualizar este archivo.
- Cada módulo nuevo: entrada en MODULES + ROUTES + permisos + tablas.
- Demo no sustituye exit criteria.
- Deuda consciente: ticket + fecha; no “ya luego” eterno.

---

## Norte a 20 años (visión)

PerGon OS será el **sistema de confianza y operación** de la empresa y su red: cada unidad física habla con un pasaporte vivo; el Admin dirige excepciones; las automatizaciones mueven el trabajo rutinario; la Web y Expert educan y verifican; los partners integran por API. La arquitectura de V1 existe para no tener que nacer de nuevo en la década siguiente.
