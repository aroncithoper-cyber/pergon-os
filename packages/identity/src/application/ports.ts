import type {
  ActorRef,
  AuditLogRecord,
  PassportEventRecord,
  PassportRecord,
  PassportVersionRecord,
  QrCodeRecord,
  RechargeRecord,
  ScanEventRecord,
  TrustSignalRecord,
} from "../domain/models";
import type { PassportState, QrStatus } from "../domain/states";

export type IdentityUnitOfWork = {
  passports: PassportRepository;
  qrCodes: QrRepository;
  events: EventRepository;
  scans: ScanRepository;
  recharges: RechargeRepository;
  trust: TrustRepository;
  audit: AuditRepository;
  versions: VersionRepository;
  commit(): Promise<void>;
};

export interface PassportRepository {
  findById(id: string): Promise<PassportRecord | null>;
  findByPublicId(organizationId: string, publicId: string): Promise<PassportRecord | null>;
  /** Public resolution by presentation id (no org scope). */
  findByPublicIdGlobal(publicId: string): Promise<PassportRecord | null>;
  save(passport: PassportRecord): Promise<void>;
  softDelete(id: string, at: string, by?: string): Promise<void>;
}

export interface QrRepository {
  findById(id: string): Promise<QrCodeRecord | null>;
  findByPublicCode(publicCode: string): Promise<QrCodeRecord | null>;
  findActiveByPassportId(passportId: string): Promise<QrCodeRecord | null>;
  save(qr: QrCodeRecord): Promise<void>;
  updateStatus(id: string, status: QrStatus, version: number): Promise<void>;
}

export interface EventRepository {
  append(event: PassportEventRecord): Promise<void>;
  listByPassportId(
    passportId: string,
    options?: { limit?: number; afterSeq?: number },
  ): Promise<PassportEventRecord[]>;
}

export interface ScanRepository {
  append(scan: ScanEventRecord): Promise<void>;
  countRecentByIpHash(ipHash: string, sinceIso: string): Promise<number>;
  countRecentByPassport(passportId: string, sinceIso: string): Promise<number>;
  listByPassportId(passportId: string, options?: { limit?: number }): Promise<ScanEventRecord[]>;
}

export interface RechargeRepository {
  findByIdempotencyKey(key: string): Promise<RechargeRecord | null>;
  listByPassportId(passportId: string): Promise<RechargeRecord[]>;
  save(recharge: RechargeRecord): Promise<void>;
}

export interface TrustRepository {
  save(signal: TrustSignalRecord): Promise<void>;
  listOpenByPassport(passportId: string): Promise<TrustSignalRecord[]>;
}

export interface AuditRepository {
  append(entry: AuditLogRecord): Promise<void>;
}

export interface VersionRepository {
  save(version: PassportVersionRecord): Promise<void>;
  listByPassportId(passportId: string): Promise<PassportVersionRecord[]>;
}

export type CreatePassportInput = {
  organizationId: string;
  productId: string;
  batchId?: string;
  publicId?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  actor: ActorRef;
  correlationId?: string;
  assignQr?: boolean;
};

export type TransitionPassportInput = {
  passportId: string;
  toState: PassportState;
  reason: string;
  actor: ActorRef;
  correlationId?: string;
};

export type RotateQrInput = {
  passportId: string;
  reason: string;
  actor: ActorRef;
  correlationId?: string;
};

export type VerifyCodeInput = {
  publicCode: string;
  channel: ScanEventRecord["channel"];
  ipHash?: string;
  userAgent?: string;
  geo?: Record<string, unknown>;
};

export type VerifyCodeResult = {
  result: import("../domain/states").ScanResult;
  passport?: {
    publicId: string;
    state: PassportState;
    custodyStage: import("../domain/states").CustodyStage;
    productId: string;
    version: number;
    expiresAt?: string;
  };
  riskScore: number;
  scanId: string;
  trustSignalId?: string;
};

/** Public UI outcome — maps scan/passport state for Web verification. */
export type PublicVerificationOutcome =
  "original" | "blocked" | "suspicious" | "retired" | "unavailable";

export type PublicTimelineItem = {
  id: string;
  kind:
    | "created"
    | "production"
    | "quality"
    | "sale"
    | "delivery"
    | "recharge"
    | "scan"
    | "state"
    | "current";
  label: string;
  occurredAt: string;
  detail: string | null;
};

export type PublicVerificationPassport = {
  publicId: string;
  state: PassportState;
  custodyStage: import("../domain/states").CustodyStage;
  version: number;
  issuedAt: string | null;
  expiresAt: string | null;
  product: {
    id: string;
    name: string | null;
    sku: string | null;
  };
  batch: {
    id: string | null;
    code: string | null;
    manufacturedAt: string | null;
  };
  recharges: {
    count: number;
    lastAt: string | null;
  };
  container: {
    ageDays: number | null;
    state: PassportState;
    custodyStage: import("../domain/states").CustodyStage;
  };
  timeline: PublicTimelineItem[];
};

export type PublicVerificationResult = {
  outcome: PublicVerificationOutcome;
  scanResult: import("../domain/states").ScanResult;
  riskScore: number;
  scanId: string;
  verifiedAt: string;
  passport: PublicVerificationPassport | null;
};

export type GetPublicVerificationInput = {
  passportId: string;
  channel?: ScanEventRecord["channel"];
  ipHash?: string;
  userAgent?: string;
  geo?: Record<string, unknown>;
};

export type RechargePassportInput = {
  passportId: string;
  idempotencyKey: string;
  reason: string;
  toExpiresAt?: string;
  toState?: PassportState;
  actor: ActorRef;
  correlationId?: string;
};
