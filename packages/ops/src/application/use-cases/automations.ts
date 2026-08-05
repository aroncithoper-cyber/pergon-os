import {
  ConflictError,
  NotFoundError,
  ValidationFailedError,
  newId,
  nowIso,
} from "../../domain/base";
import type { AutomationRecord } from "../../domain/models";
import { listQuerySchema, runListQuery } from "../../engines/filters";
import { AUTOMATION_ACTION_KINDS, AUTOMATION_EVENT_TYPES } from "../../engines/automations";
import {
  dispatchAutomationEventSchema,
  drainAutomationsSchema,
  ingestAutomationWebhookSchema,
  registerAutomationWebhookSchema,
  triggerAutomationSchema,
  upsertAutomationSchema,
} from "../../validation/schemas";
import { automationEngineFrom } from "../automation-engine";
import { createOpsHelpers } from "../helpers";
import type { OpsUnitOfWork } from "../ports";

export async function listAutomations(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.automations.listByOrg(parsed.data.organizationId);
  return runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "key",
    "name",
    "status",
    "trigger",
    "eventType",
  ]);
}

export async function upsertAutomation(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = upsertAutomationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const helpers = createOpsHelpers(uow);
  const engine = automationEngineFrom(uow);
  const now = nowIso();

  let automation: AutomationRecord;
  if (input.id) {
    const existing = await uow.automations.findById(input.id);
    if (!existing || existing.organizationId !== input.organizationId) {
      throw new NotFoundError("automation", input.id);
    }
    automation = {
      ...existing,
      key: input.key,
      name: input.name,
      status: input.status,
      trigger: input.trigger,
      cron: input.cron,
      eventType: input.eventType,
      conditions: input.conditions,
      actions: input.actions,
      flow:
        input.flow ??
        engine.scaffoldFlow({
          ...existing,
          key: input.key,
          name: input.name,
          status: input.status,
          trigger: input.trigger,
          cron: input.cron,
          eventType: input.eventType,
          conditions: input.conditions,
          actions: input.actions,
          retryPolicy: input.retryPolicy ?? existing.retryPolicy,
        }),
      retryPolicy: input.retryPolicy ?? existing.retryPolicy,
      version: existing.version + 1,
      updatedAt: now,
    };
  } else {
    const clash = await uow.automations.findByKey(input.organizationId, input.key);
    if (clash) throw new ConflictError(`Automation key exists: ${input.key}`);
    const draft: AutomationRecord = {
      id: newId(),
      organizationId: input.organizationId,
      key: input.key,
      name: input.name,
      status: input.status,
      trigger: input.trigger,
      cron: input.cron,
      eventType: input.eventType,
      conditions: input.conditions,
      actions: input.actions,
      retryPolicy: input.retryPolicy,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    automation = {
      ...draft,
      flow: input.flow ?? engine.scaffoldFlow(draft),
    };
  }

  await uow.automations.save(automation);
  await engine.persistVersion(automation, input.actor.id);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: input.id ? "automations:update" : "automations:create",
    module: "automations",
    entityType: "automation",
    entityId: automation.id,
    after: automation,
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "automations",
    input.id ? "automation.updated" : "automation.created",
    "automation",
    automation.id,
    { key: automation.key, version: automation.version },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return automation;
}

export async function triggerAutomation(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = triggerAutomationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const engine = automationEngineFrom(uow);

  const existing = await uow.automationRuns.findByIdempotencyKey(input.idempotencyKey);
  if (existing) return { run: existing, idempotent: true as const };

  const automation = await uow.automations.findById(input.automationId);
  if (!automation || automation.organizationId !== input.organizationId) {
    throw new NotFoundError("automation", input.automationId);
  }
  if (automation.status !== "enabled" && automation.trigger !== "manual") {
    throw new ConflictError("Automation is not enabled");
  }

  const { run, idempotent } = await engine.enqueueRun({
    organizationId: input.organizationId,
    automation,
    input: input.input,
    idempotencyKey: input.idempotencyKey,
    triggerSource: "manual",
  });
  if (idempotent) return { run, idempotent: true as const };

  const executed = input.executeNow ? await engine.runNow(automation, run) : run;

  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "automations:trigger",
    module: "automations",
    entityType: "automation_run",
    entityId: executed.id,
    after: executed,
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "automations",
    "automation.triggered",
    "automation_run",
    executed.id,
    {
      automationId: automation.id,
      status: executed.status,
      version: automation.version,
    },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return { run: executed, idempotent: false as const };
}

/** Decoupled bus entry — any module can publish a typed system event. */
export async function dispatchAutomationEvent(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = dispatchAutomationEventSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const engine = automationEngineFrom(uow);
  const result = await engine.dispatchEvent({
    organizationId: input.organizationId,
    eventType: input.eventType,
    payload: input.payload,
    correlationId: input.correlationId ?? input.requestId,
  });

  let drain = null;
  if (input.drain && result.enqueued > 0) {
    drain = await engine.drainQueue(Math.min(50, result.enqueued));
  }

  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "automations:dispatch",
    module: "automations",
    entityType: "automation_event",
    entityId: input.correlationId ?? newId(),
    after: { eventType: input.eventType, ...result, drain },
    requestId: input.requestId,
  });
  await uow.commit();
  return { ...result, drain };
}

/** Background worker drain — retries, delays, pending queue. */
export async function drainAutomations(uow: OpsUnitOfWork, raw: unknown = {}) {
  const parsed = drainAutomationsSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const engine = automationEngineFrom(uow);

  let schedules = null;
  if (input.tickSchedules && input.organizationId) {
    schedules = await engine.tickSchedules(input.organizationId);
  }

  const drain = await engine.drainQueue(input.limit);
  await uow.commit();
  return { ...drain, schedules };
}

export async function registerAutomationWebhook(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = registerAutomationWebhookSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const automation = await uow.automations.findById(input.automationId);
  if (!automation || automation.organizationId !== input.organizationId) {
    throw new NotFoundError("automation", input.automationId);
  }
  const clash = await uow.automationWebhooks.findByPathKey(input.pathKey);
  if (clash) throw new ConflictError(`Webhook path exists: ${input.pathKey}`);

  const engine = automationEngineFrom(uow);
  const webhook = await engine.registerWebhook(input);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "automations:webhook_register",
    module: "automations",
    entityType: "automation_webhook",
    entityId: webhook.id,
    after: { ...webhook, secret: "[redacted]" },
    requestId: input.requestId,
  });
  await uow.commit();
  return webhook;
}

export async function ingestAutomationWebhook(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = ingestAutomationWebhookSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const engine = automationEngineFrom(uow);
  const result = await engine.ingestWebhook(input.pathKey, input.payload, input.secret);
  let drain = null;
  if (result.ok && !result.skipped && input.drain) {
    drain = await engine.drainQueue(1);
  }
  await uow.commit();
  return { ...result, drain };
}

export async function listAutomationRuns(uow: OpsUnitOfWork, organizationId: string, limit = 50) {
  return uow.automationRuns.listByOrg(organizationId, limit);
}

export async function listAutomationVersions(
  uow: OpsUnitOfWork,
  automationId: string,
  organizationId?: string,
) {
  const automation = await uow.automations.findById(automationId);
  if (!automation) throw new NotFoundError("automation", automationId);
  if (organizationId && automation.organizationId !== organizationId) {
    throw new NotFoundError("automation", automationId);
  }
  return uow.automationVersions.listByAutomation(automationId);
}

export function getAutomationCatalog() {
  return {
    eventTypes: [...AUTOMATION_EVENT_TYPES],
    actionKinds: [...AUTOMATION_ACTION_KINDS],
  };
}
