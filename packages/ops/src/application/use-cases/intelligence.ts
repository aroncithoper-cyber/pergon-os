import { NotFoundError, ValidationFailedError, newId, nowIso } from "../../domain/base";
import type { AiSessionRecord, ReportDefinitionRecord, ReportJobRecord } from "../../domain/models";
import { listQuerySchema, runListQuery } from "../../engines/filters";
import {
  appendAiMessageSchema,
  createAiSessionSchema,
  runReportSchema,
  upsertSettingSchema,
} from "../../validation/schemas";
import { createOpsHelpers } from "../helpers";
import type { OpsUnitOfWork } from "../ports";

export async function createAiSession(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = createAiSessionSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const now = nowIso();
  const session: AiSessionRecord = {
    id: newId(),
    organizationId: input.organizationId,
    userId: input.userId,
    status: "open",
    purpose: input.purpose,
    messages: [],
    toolInvocations: [],
    createdAt: now,
    updatedAt: now,
  };
  await uow.aiSessions.save(session);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "ai:session_create",
    module: "ai",
    entityType: "ai_session",
    entityId: session.id,
    after: { purpose: session.purpose },
    requestId: input.requestId,
  });
  await uow.commit();
  return session;
}

export async function appendAiMessage(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = appendAiMessageSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const session = await uow.aiSessions.findById(input.sessionId);
  if (!session || session.organizationId !== input.organizationId) {
    throw new NotFoundError("ai_session", input.sessionId);
  }
  if (session.status !== "open") throw new ValidationFailedError("Session is closed");

  session.messages.push({ role: input.role, content: input.content, at: nowIso() });
  session.updatedAt = nowIso();
  await uow.aiSessions.save(session);
  await uow.commit();
  return session;
}

export async function listAiSessions(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.aiSessions.listByOrg(parsed.data.organizationId);
  return runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "purpose",
    "status",
    "userId",
  ]);
}

export async function runReport(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = runReportSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const helpers = createOpsHelpers(uow);
  const now = nowIso();

  let definitionId = input.definitionId;
  if (!definitionId) {
    const def: ReportDefinitionRecord = {
      id: newId(),
      organizationId: input.organizationId,
      key: `adhoc_${input.kind}_${Date.now()}`,
      name: input.name ?? `Report ${input.kind}`,
      kind: input.kind,
      parametersSchema: {},
      createdAt: now,
      updatedAt: now,
    };
    await uow.reportDefinitions.save(def);
    definitionId = def.id;
  }

  const job: ReportJobRecord = {
    id: newId(),
    organizationId: input.organizationId,
    definitionId,
    status: "running",
    parameters: input.parameters,
    requestedBy: input.requestedBy,
    createdAt: now,
  };
  await uow.reportJobs.save(job);

  // Stub result snapshot for architecture phase.
  const snapshot: Record<string, unknown> = { kind: input.kind, parameters: input.parameters };
  if (input.kind === "inventory") {
    snapshot.levels = await uow.inventory.listByOrg(input.organizationId);
  } else if (input.kind === "production") {
    snapshot.orders = await uow.productionOrders.listByOrg(input.organizationId);
  } else if (input.kind === "automations") {
    snapshot.runs = await uow.automationRuns.listByOrg(input.organizationId, 100);
  }

  job.status = "succeeded";
  job.artifactUrl = `memory://reports/${job.id}.json`;
  job.finishedAt = nowIso();
  await uow.reportJobs.save(job);

  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "reports:run",
    module: "reports",
    entityType: "report_job",
    entityId: job.id,
    after: { kind: input.kind, artifactUrl: job.artifactUrl },
    requestId: input.requestId,
  });
  await uow.commit();
  return { job, snapshot };
}

export async function listReportJobs(uow: OpsUnitOfWork, organizationId: string) {
  return uow.reportJobs.listByOrg(organizationId);
}

export async function upsertSetting(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = upsertSettingSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const existing = await uow.settings.findByKey(input.organizationId, input.key);
  const now = nowIso();
  const setting = existing
    ? {
        ...existing,
        value: input.value,
        updatedBy: input.actor.id,
        updatedAt: now,
      }
    : {
        id: newId(),
        organizationId: input.organizationId,
        key: input.key,
        value: input.value,
        updatedBy: input.actor.id,
        createdAt: now,
        updatedAt: now,
      };
  await uow.settings.save(setting);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "settings:update",
    module: "settings",
    entityType: "setting",
    entityId: setting.id,
    after: { key: setting.key, value: setting.value },
    requestId: input.requestId,
  });
  await uow.commit();
  return setting;
}

export async function listSettings(uow: OpsUnitOfWork, organizationId: string) {
  return uow.settings.listByOrg(organizationId);
}
