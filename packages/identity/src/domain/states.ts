export const PASSPORT_STATES = [
  "CREATED",
  "PRINTED",
  "FILLED",
  "QUALITY_CHECK",
  "READY",
  "SOLD",
  "DELIVERED",
  "ACTIVE",
  "RETURNED",
  "WASHING",
  "REFILLED",
  "RETIRED",
  "BLOCKED",
] as const;

export type PassportState = (typeof PASSPORT_STATES)[number];

export const TERMINAL_STATES = ["RETIRED"] as const satisfies readonly PassportState[];

/** Allowed transitions for the unit lifecycle state machine. */
export const PASSPORT_TRANSITIONS: Record<PassportState, readonly PassportState[]> = {
  CREATED: ["PRINTED", "BLOCKED", "RETIRED"],
  PRINTED: ["FILLED", "BLOCKED", "RETIRED"],
  FILLED: ["QUALITY_CHECK", "BLOCKED", "RETIRED"],
  QUALITY_CHECK: ["READY", "BLOCKED", "RETIRED"],
  READY: ["SOLD", "BLOCKED", "RETIRED"],
  SOLD: ["DELIVERED", "RETURNED", "BLOCKED", "RETIRED"],
  DELIVERED: ["ACTIVE", "RETURNED", "BLOCKED", "RETIRED"],
  ACTIVE: ["RETURNED", "WASHING", "BLOCKED", "RETIRED"],
  RETURNED: ["WASHING", "BLOCKED", "RETIRED"],
  WASHING: ["REFILLED", "BLOCKED", "RETIRED"],
  REFILLED: ["QUALITY_CHECK", "READY", "BLOCKED", "RETIRED"],
  RETIRED: [],
  BLOCKED: ["READY", "ACTIVE", "RETURNED", "WASHING", "RETIRED"],
};

export function canTransition(from: PassportState, to: PassportState): boolean {
  return PASSPORT_TRANSITIONS[from].includes(to);
}

export const QR_STATUSES = [
  "PENDING",
  "ACTIVE",
  "ROTATED",
  "SUSPENDED",
  "REVOKED",
  "EXPIRED",
] as const;

export type QrStatus = (typeof QR_STATUSES)[number];

export const ACTOR_TYPES = [
  "system",
  "user",
  "service",
  "production",
  "distribution",
  "customer",
  "ai",
] as const;

export type ActorType = (typeof ACTOR_TYPES)[number];

export const PASSPORT_EVENT_TYPES = [
  "PASSPORT_CREATED",
  "STATE_CHANGED",
  "QR_ASSIGNED",
  "QR_ROTATED",
  "QR_STATUS_CHANGED",
  "RECHARGE_APPLIED",
  "METADATA_UPDATED",
  "VERSION_SNAPSHOT",
  "CLONE_ALERT_RAISED",
  "SOFT_DELETED",
  "RESTORED",
  "CUSTODY_CHANGED",
] as const;

export type PassportEventType = (typeof PASSPORT_EVENT_TYPES)[number];

export const SCAN_RESULTS = [
  "valid",
  "invalid",
  "blocked",
  "retired",
  "expired",
  "rotated",
  "suspended",
  "rate_limited",
  "suspicious",
] as const;

export type ScanResult = (typeof SCAN_RESULTS)[number];

export const TRUST_SIGNAL_TYPES = [
  "CLONE_SUSPECTED",
  "GEO_IMPOSSIBLE",
  "SCAN_BURST",
  "REPLAY_SUSPECTED",
  "CODE_ENUMERATION",
] as const;

export type TrustSignalType = (typeof TRUST_SIGNAL_TYPES)[number];

export const CUSTODY_STAGES = [
  "production",
  "distribution",
  "customer",
  "returned",
  "retired",
] as const;

export type CustodyStage = (typeof CUSTODY_STAGES)[number];
