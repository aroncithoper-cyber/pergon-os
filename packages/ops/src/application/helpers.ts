import type { ActorRef, OpsDomainEvent, OpsModuleKey } from "../domain/base";
import { newId, nowIso } from "../domain/base";
import { createAuditEngine } from "../engines/audit";
import type { OpsUnitOfWork } from "./ports";

export function createOpsHelpers(uow: OpsUnitOfWork) {
  const audit = createAuditEngine({
    append: (entry) => uow.audit.append(entry),
  });

  return {
    audit,
    async emit(
      organizationId: string,
      module: OpsModuleKey,
      type: string,
      entityType: string,
      entityId: string,
      payload: Record<string, unknown>,
      actor: ActorRef,
      correlationId?: string,
    ): Promise<OpsDomainEvent> {
      const event: OpsDomainEvent = {
        id: newId(),
        organizationId,
        module,
        type,
        entityType,
        entityId,
        payload,
        actor,
        correlationId,
        createdAt: nowIso(),
      };
      await uow.events.append(event);
      return event;
    },
  };
}
