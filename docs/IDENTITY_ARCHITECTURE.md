# Identity Module Architecture

Package: `@pergon/identity`

## Propósito

Sistema de identidad digital por envase/unidad: Pasaporte + QR dinámico + historial inmutable + verificación + señales anti-clonación.

## Decisiones de escala (50M+)

1. **Proyección hot** en `passports` / `qr_codes` para lecturas O(1) por id/código.
2. **Event log append-only** en `passport_events` (fuente de verdad del ciclo de vida).
3. **Scans** en tabla separada indexada por tiempo ( candidata a partición mensual ).
4. **UUID** como PK; `public_id` / `public_code` opacos no secuenciales.
5. **Optimistic concurrency** vía `version` en passports/qr.
6. **Idempotencia** en recargas.
7. Soft delete en proyección; **nunca borrar** eventos/scans/audit/versions/recharges.

## Flujo

```text
Command API → Use Case → Ports (UoW) → Memory|Supabase
Verify API → verifyCode → scan_events (+ trust_signals)
```

## Estados

CREATED → PRINTED → FILLED → QUALITY_CHECK → READY → SOLD → DELIVERED → ACTIVE
ACTIVE ↔ RETURNED → WASHING → REFILLED → QUALITY_CHECK/READY
BLOCKED / RETIRED según máquina de estados en código.
