export type EntityId = string;

export type ActorRef = {
  type: import("./states").ActorType;
  id?: EntityId;
};

export type PassportRecord = {
  id: EntityId;
  organizationId: EntityId;
  publicId: string;
  productId: EntityId;
  batchId?: EntityId;
  state: import("./states").PassportState;
  custodyStage: import("./states").CustodyStage;
  version: number;
  eventSeq: number;
  issuedAt?: string;
  expiresAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: EntityId;
  updatedBy?: EntityId;
  deletedAt?: string;
};

export type PassportVersionRecord = {
  id: EntityId;
  passportId: EntityId;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  changeReason: string;
  createdAt: string;
  createdBy?: EntityId;
};

export type PassportEventRecord = {
  id: EntityId;
  organizationId: EntityId;
  passportId: EntityId;
  seq: number;
  type: import("./states").PassportEventType;
  occurredAt: string;
  actor: ActorRef;
  payload: Record<string, unknown>;
  correlationId?: string;
};

export type QrCodeRecord = {
  id: EntityId;
  organizationId: EntityId;
  passportId: EntityId;
  publicCode: string;
  status: import("./states").QrStatus;
  version: number;
  rotatedFromId?: EntityId;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type ScanEventRecord = {
  id: EntityId;
  organizationId?: EntityId;
  qrCodeId?: EntityId;
  passportId?: EntityId;
  publicCodeAttempt: string;
  result: import("./states").ScanResult;
  channel: "web" | "admin" | "mobile" | "api" | "partner";
  ipHash?: string;
  userAgent?: string;
  geo?: Record<string, unknown>;
  riskScore: number;
  createdAt: string;
};

export type RechargeRecord = {
  id: EntityId;
  passportId: EntityId;
  organizationId: EntityId;
  fromExpiresAt?: string;
  toExpiresAt?: string;
  fromState?: import("./states").PassportState;
  toState?: import("./states").PassportState;
  idempotencyKey: string;
  reason: string;
  actor: ActorRef;
  createdAt: string;
};

export type TrustSignalRecord = {
  id: EntityId;
  organizationId: EntityId;
  passportId?: EntityId;
  qrCodeId?: EntityId;
  type: import("./states").TrustSignalType;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "ack" | "closed";
  payload: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
};

export type AuditLogRecord = {
  id: EntityId;
  organizationId: EntityId;
  actor: ActorRef;
  action: string;
  entityType: string;
  entityId: EntityId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  requestId?: string;
  createdAt: string;
};
