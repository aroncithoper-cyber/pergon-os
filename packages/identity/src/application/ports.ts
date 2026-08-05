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
}

export interface RechargeRepository {
  findByIdempotencyKey(key: string): Promise<RechargeRecord | null>;
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

export type RechargePassportInput = {
  passportId: string;
  idempotencyKey: string;
  reason: string;
  toExpiresAt?: string;
  toState?: PassportState;
  actor: ActorRef;
  correlationId?: string;
};
