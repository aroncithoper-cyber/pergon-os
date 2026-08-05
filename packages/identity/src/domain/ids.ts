import { randomUUID } from "node:crypto";

import type { ActorRef, PassportEventRecord } from "./models";
import type { PassportEventType } from "./states";

export function newId(): string {
  return randomUUID();
}

/** Time-sortable public identifiers for human/ops use (not security secrets). */
export function newPublicId(prefix = "PG"): string {
  const raw = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `${prefix}${raw}`;
}

export function newPublicCode(): string {
  return randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
}

export function buildPassportEvent(input: {
  organizationId: string;
  passportId: string;
  seq: number;
  type: PassportEventType;
  actor: ActorRef;
  payload: Record<string, unknown>;
  correlationId?: string;
  occurredAt?: string;
}): PassportEventRecord {
  return {
    id: newId(),
    organizationId: input.organizationId,
    passportId: input.passportId,
    seq: input.seq,
    type: input.type,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    actor: input.actor,
    payload: input.payload,
    correlationId: input.correlationId,
  };
}
