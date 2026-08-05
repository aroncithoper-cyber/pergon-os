import type { PassportEventRecord, PassportRecord, ScanEventRecord } from "../../domain/models";
import type { PassportState, ScanResult } from "../../domain/states";
import { ValidationFailedError } from "../../domain/errors";
import { getPublicVerificationSchema } from "../../validation/schemas";
import type {
  GetPublicVerificationInput,
  IdentityUnitOfWork,
  PublicTimelineItem,
  PublicVerificationOutcome,
  PublicVerificationPassport,
  PublicVerificationResult,
} from "../ports";
import { verifyCode } from "./verify-code";

const DETAIL_RESULTS = new Set<ScanResult>(["valid", "suspicious", "blocked", "retired"]);

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readMetadataString(metadata: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = asOptionalString(metadata[key]);
    if (value) return value;
  }
  return null;
}

function mapOutcome(result: ScanResult): PublicVerificationOutcome {
  if (result === "valid") return "original";
  if (result === "blocked") return "blocked";
  if (result === "suspicious") return "suspicious";
  if (result === "retired") return "retired";
  return "unavailable";
}

function ageDaysFrom(iso: string | null | undefined, nowMs: number): number | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((nowMs - then) / 86_400_000));
}

function labelForState(state: PassportState): string {
  switch (state) {
    case "CREATED":
      return "Creación";
    case "PRINTED":
    case "FILLED":
      return "Producción";
    case "QUALITY_CHECK":
      return "Control de calidad";
    case "READY":
      return "Listo para distribución";
    case "SOLD":
      return "Venta";
    case "DELIVERED":
      return "Entrega";
    case "ACTIVE":
      return "Activo en uso";
    case "RETURNED":
      return "Devolución";
    case "WASHING":
      return "Lavado";
    case "REFILLED":
      return "Rellenado";
    case "RETIRED":
      return "Retirado";
    case "BLOCKED":
      return "Bloqueado";
    default:
      return "Estado actualizado";
  }
}

function kindForState(state: PassportState): PublicTimelineItem["kind"] {
  switch (state) {
    case "CREATED":
      return "created";
    case "PRINTED":
    case "FILLED":
    case "READY":
    case "WASHING":
    case "REFILLED":
      return "production";
    case "QUALITY_CHECK":
      return "quality";
    case "SOLD":
      return "sale";
    case "DELIVERED":
      return "delivery";
    default:
      return "state";
  }
}

function mapEventToTimeline(event: PassportEventRecord): PublicTimelineItem | null {
  if (event.type === "PASSPORT_CREATED") {
    return {
      id: event.id,
      kind: "created",
      label: "Creación",
      occurredAt: event.occurredAt,
      detail: "Pasaporte digital emitido",
    };
  }

  if (event.type === "STATE_CHANGED") {
    const to = asOptionalString(event.payload.to) as PassportState | null;
    if (!to) return null;
    return {
      id: event.id,
      kind: kindForState(to),
      label: labelForState(to),
      occurredAt: event.occurredAt,
      detail: asOptionalString(event.payload.reason),
    };
  }

  if (event.type === "RECHARGE_APPLIED") {
    return {
      id: event.id,
      kind: "recharge",
      label: "Recarga",
      occurredAt: event.occurredAt,
      detail: asOptionalString(event.payload.reason) ?? "Recarga aplicada",
    };
  }

  if (event.type === "CLONE_ALERT_RAISED") {
    return {
      id: event.id,
      kind: "scan",
      label: "Escaneo importante",
      occurredAt: event.occurredAt,
      detail: "Señal de confianza elevada",
    };
  }

  return null;
}

function mapImportantScan(scan: ScanEventRecord): PublicTimelineItem | null {
  const important =
    scan.riskScore >= 50 ||
    scan.result === "suspicious" ||
    scan.result === "blocked" ||
    scan.result === "retired";

  if (!important) return null;

  return {
    id: scan.id,
    kind: "scan",
    label: "Escaneo importante",
    occurredAt: scan.createdAt,
    detail: `Resultado: ${scan.result}`,
  };
}

async function buildPublicPassport(
  uow: IdentityUnitOfWork,
  passport: PassportRecord,
  nowIso: string,
): Promise<PublicVerificationPassport> {
  const nowMs = Date.parse(nowIso);
  const recharges = await uow.recharges.listByPassportId(passport.id);
  const events = await uow.events.listByPassportId(passport.id, { limit: 200 });
  const scans = await uow.scans.listByPassportId(passport.id, { limit: 20 });

  const manufacturedAt =
    readMetadataString(passport.metadata, [
      "manufacturedAt",
      "manufactured_at",
      "batchManufacturedAt",
    ]) ?? null;
  const batchCode =
    readMetadataString(passport.metadata, ["batchCode", "batch_code", "lot", "lote"]) ?? null;
  const productName =
    readMetadataString(passport.metadata, ["productName", "product_name", "name"]) ?? null;
  const productSku =
    readMetadataString(passport.metadata, ["productSku", "product_sku", "sku"]) ?? null;

  const timeline: PublicTimelineItem[] = [];

  for (const event of events) {
    const item = mapEventToTimeline(event);
    if (item) timeline.push(item);
  }

  for (const scan of scans) {
    const item = mapImportantScan(scan);
    if (item) timeline.push(item);
  }

  timeline.sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1));

  timeline.push({
    id: `current-${passport.id}`,
    kind: "current",
    label: "Estado actual",
    occurredAt: nowIso,
    detail: labelForState(passport.state),
  });

  const lastRecharge = recharges[0] ?? null;
  const ageAnchor = manufacturedAt ?? passport.issuedAt ?? passport.createdAt;

  return {
    publicId: passport.publicId,
    state: passport.state,
    custodyStage: passport.custodyStage,
    version: passport.version,
    issuedAt: passport.issuedAt ?? null,
    expiresAt: passport.expiresAt ?? null,
    product: {
      id: passport.productId,
      name: productName,
      sku: productSku,
    },
    batch: {
      id: passport.batchId ?? null,
      code: batchCode,
      manufacturedAt,
    },
    recharges: {
      count: recharges.length,
      lastAt: lastRecharge?.createdAt ?? null,
    },
    container: {
      ageDays: ageDaysFrom(ageAnchor, nowMs),
      state: passport.state,
      custodyStage: passport.custodyStage,
    },
    timeline,
  };
}

/**
 * Public verification for Web `/verify/[passportId]`.
 * Resolves presentation id (passport publicId or QR publicCode), records a scan via verifyCode,
 * and returns a privacy-aware view (no oracle on unknown codes).
 */
export async function getPublicVerification(
  uow: IdentityUnitOfWork,
  raw: GetPublicVerificationInput,
): Promise<PublicVerificationResult> {
  const parsed = getPublicVerificationSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(parsed.error.message);
  }

  const input = parsed.data;
  const identifier = input.passportId.trim().toUpperCase();
  const verifiedAt = new Date().toISOString();

  let publicCode = identifier;
  let passportRecord: PassportRecord | null = null;

  const byCode = await uow.qrCodes.findByPublicCode(identifier);
  if (byCode && !byCode.deletedAt) {
    publicCode = byCode.publicCode;
    passportRecord = await uow.passports.findById(byCode.passportId);
  } else {
    const byPublicId = await uow.passports.findByPublicIdGlobal(identifier);
    if (byPublicId && !byPublicId.deletedAt) {
      passportRecord = byPublicId;
      const activeQr = await uow.qrCodes.findActiveByPassportId(byPublicId.id);
      if (activeQr) {
        publicCode = activeQr.publicCode;
      }
    }
  }

  const verification = await verifyCode(uow, {
    publicCode,
    channel: input.channel,
    ipHash: input.ipHash,
    userAgent: input.userAgent,
    geo: input.geo,
  });

  const outcome = mapOutcome(verification.result);

  if (!DETAIL_RESULTS.has(verification.result) || !passportRecord || passportRecord.deletedAt) {
    return {
      outcome,
      scanResult: verification.result,
      riskScore: verification.riskScore,
      scanId: verification.scanId,
      verifiedAt,
      passport: null,
    };
  }

  const fresh = (await uow.passports.findById(passportRecord.id)) ?? passportRecord;

  return {
    outcome,
    scanResult: verification.result,
    riskScore: verification.riskScore,
    scanId: verification.scanId,
    verifiedAt,
    passport: await buildPublicPassport(uow, fresh, verifiedAt),
  };
}
