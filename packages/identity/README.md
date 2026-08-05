# @pergon/identity

Núcleo de identidad digital de PerGon OS (Pasaporte + QR dinámico + historial inmutable).

## Capas

- `domain` — estados, transiciones, modelos, errores, IDs
- `application` — puertos, casos de uso, servicios
- `validation` — schemas zod
- `infrastructure/memory` — UoW en memoria (dev / sin Supabase)
- `infrastructure/supabase` — contrato de persistencia (migración en `supabase/migrations`)

## Reglas

- Historial append-only (`passport_events`, `scan_events`, `audit_logs`, versions, recharges)
- Soft delete solo en proyección mutable (`passports`, `qr_codes`)
- Verificación pública nunca confía en el cliente
- Diseñado para decenas de millones de unidades (proyección hot + eventos cold/particionables)
