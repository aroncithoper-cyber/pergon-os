import type { ActorRef, OpsDomainEvent, OpsModuleKey } from "../domain/base";
import { newId, nowIso } from "../domain/base";
import { createAuditEngine } from "../engines/audit";
import { AUTOMATION_EVENT_TYPES } from "../engines/automations";
import { automationEngineFrom } from "./automation-engine";
import type { OpsUnitOfWork } from "./ports";

const CATALOG_EVENTS = new Set<string>(AUTOMATION_EVENT_TYPES);

export function createOpsHelpers(uow: OpsUnitOfWork) {
  const audit = createAuditEngine({
    append: (entry) => uow.audit.append(entry),
  });

  const automationEngine = automationEngineFrom(uow);

  return {
    audit,
    automations: automationEngine,
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

      if (CATALOG_EVENTS.has(type)) {
        await automationEngine.dispatchEvent({
          organizationId,
          eventType: type,
          payload: { ...payload, entityType, entityId, module },
          correlationId: correlationId ?? event.id,
        });
      }

      return event;
    },
  };
}
