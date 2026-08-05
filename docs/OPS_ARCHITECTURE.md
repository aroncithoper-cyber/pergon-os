# Ops / Admin Core Architecture

Package: `@pergon/ops`

## Propósito

Núcleo lógico del Panel Administrador (sin UI): módulos operativos, motores compartidos y APIs.

## Motores

| Motor         | Capacidad                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Filters       | search, filters, sort, pagination, export CSV/JSON, saved views                                                                   |
| Dashboard     | widgets dinámicos con fetch independiente (KPI, chart, activity, alerts, production, inventory, sales, qr_scans, ai, automations) |
| Audit         | append-only por mutación importante                                                                                               |
| Notifications | email / WhatsApp / push / in_app vía outbox + drain                                                                               |

## Módulos

Dashboard, Productos, Clientes, Distribuidores, Producción, Inventario, QR*, Pasaporte*, Usuarios*, Roles*, Automatizaciones, IA, Reportes, Configuración, Auditoría, Notificaciones.

\* QR / Pasaporte / Usuarios / Roles: contratos bridge hacia `@pergon/identity` y `@pergon/auth` (mismo motor de filtros + permisos).

## Flujo

```text
Admin API → requirePermission → OpsServices → Use Case → Filters/Audit/Events → UoW (memory|supabase)
```

## Persistencia

Migración: `supabase/migrations/20260304230000_ops_core.sql`
