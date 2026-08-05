import type { ActorRef, OrganizationId } from "../../domain/base";
import { newId, nowIso } from "../../domain/base";
import type { OpsAuditRecord } from "../../domain/models";

export type AuditAppendInput = {
  organizationId: OrganizationId;
  actor: ActorRef;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  requestId?: string;
};

export interface AuditSink {
  append(entry: OpsAuditRecord): Promise<void>;
}

/** Audit engine — every important mutation must call append. */
export function createAuditEngine(sink: AuditSink) {
  return {
    async record(input: AuditAppendInput): Promise<OpsAuditRecord> {
      const entry: OpsAuditRecord = {
        id: newId(),
        organizationId: input.organizationId,
        actor: input.actor,
        action: input.action,
        module: input.module,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ?? null,
        after: input.after ?? null,
        requestId: input.requestId,
        createdAt: nowIso(),
      };
      await sink.append(entry);
      return entry;
    },
  };
}

export type AuditEngine = ReturnType<typeof createAuditEngine>;
