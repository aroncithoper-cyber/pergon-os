import {
  ConflictError,
  NotFoundError,
  ValidationFailedError,
  newId,
  nowIso,
} from "../../domain/base";
import type { AutomationRecord, AutomationRunRecord } from "../../domain/models";
import { listQuerySchema, runListQuery } from "../../engines/filters";
import { triggerAutomationSchema, upsertAutomationSchema } from "../../validation/schemas";
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
  ]);
}

export async function upsertAutomation(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = upsertAutomationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const helpers = createOpsHelpers(uow);
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
      version: existing.version + 1,
      updatedAt: now,
    };
  } else {
    const clash = await uow.automations.findByKey(input.organizationId, input.key);
    if (clash) throw new ConflictError(`Automation key exists: ${input.key}`);
    automation = {
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
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
  }

  await uow.automations.save(automation);
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
    { key: automation.key },
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

  const existing = await uow.automationRuns.findByIdempotencyKey(input.idempotencyKey);
  if (existing) return { run: existing, idempotent: true as const };

  const automation = await uow.automations.findById(input.automationId);
  if (!automation || automation.organizationId !== input.organizationId) {
    throw new NotFoundError("automation", input.automationId);
  }
  if (automation.status !== "enabled" && automation.trigger !== "manual") {
    throw new ConflictError("Automation is not enabled");
  }

  const now = nowIso();
  const run: AutomationRunRecord = {
    id: newId(),
    organizationId: input.organizationId,
    automationId: automation.id,
    status: "running",
    idempotencyKey: input.idempotencyKey,
    input: input.input,
    startedAt: now,
    createdAt: now,
  };
  await uow.automationRuns.save(run);

  // Phase 3: execute actions as recorded stubs (worker will expand later).
  run.status = "succeeded";
  run.output = { actionsExecuted: automation.actions.length };
  run.finishedAt = nowIso();
  await uow.automationRuns.save(run);

  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "automations:trigger",
    module: "automations",
    entityType: "automation_run",
    entityId: run.id,
    after: run,
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "automations",
    "automation.triggered",
    "automation_run",
    run.id,
    { automationId: automation.id },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return { run, idempotent: false as const };
}

export async function listAutomationRuns(uow: OpsUnitOfWork, organizationId: string, limit = 50) {
  return uow.automationRuns.listByOrg(organizationId, limit);
}
