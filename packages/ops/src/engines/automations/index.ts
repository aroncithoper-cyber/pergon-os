import type { OrganizationId } from "../../domain/base";
import { newId, nowIso } from "../../domain/base";
import { timingSafeEqual } from "node:crypto";
import type {
  AutomationRecord,
  AutomationRunRecord,
  AutomationStepLog,
  AutomationTriggerSource,
  AutomationVersionRecord,
  AutomationWebhookRecord,
} from "../../domain/models";
import {
  AUTOMATION_ACTION_KINDS,
  AUTOMATION_EVENT_TYPES,
  type AutomationActionKind,
  type AutomationEventType,
} from "./catalog";
import {
  createDefaultActionHandlers,
  normalizeActionSteps,
  type ActionHandlerMap,
} from "./actions";
import { evaluateConditions } from "./conditions";
import { buildFlowFromFlatDefinition, validateFlowDefinition } from "./flow";

export {
  AUTOMATION_ACTION_KINDS,
  AUTOMATION_EVENT_TYPES,
  type AutomationActionKind,
  type AutomationEventType,
} from "./catalog";
export {
  evaluateConditions,
  type AutomationConditionTree,
  type AutomationPredicate,
} from "./conditions";
export {
  createDefaultActionHandlers,
  normalizeActionSteps,
  type ActionExecutionContext,
  type ActionHandler,
  type ActionHandlerMap,
  type ActionStep,
  type ActionHandlerResult,
} from "./actions";
export {
  buildFlowFromFlatDefinition,
  createEmptyFlowScaffold,
  validateFlowDefinition,
  type FlowBuilderScaffold,
} from "./flow";

export type AutomationEngineSink = {
  listAutomations(organizationId: string): Promise<AutomationRecord[]>;
  findAutomation(id: string): Promise<AutomationRecord | null>;
  saveRun(run: AutomationRunRecord): Promise<void>;
  findRunByIdempotencyKey(key: string): Promise<AutomationRunRecord | null>;
  listRunnableJobs(limit: number, nowIso: string): Promise<AutomationRunRecord[]>;
  saveVersion(version: AutomationVersionRecord): Promise<void>;
  listVersions(automationId: string): Promise<AutomationVersionRecord[]>;
  findWebhookByPathKey(pathKey: string): Promise<AutomationWebhookRecord | null>;
  saveWebhook(webhook: AutomationWebhookRecord): Promise<void>;
};

export type EnqueueRunInput = {
  organizationId: OrganizationId;
  automation: AutomationRecord;
  input: Record<string, unknown>;
  idempotencyKey: string;
  triggerSource: AutomationTriggerSource;
  delayMs?: number;
};

export type DispatchEventInput = {
  organizationId: OrganizationId;
  eventType: AutomationEventType | string;
  payload: Record<string, unknown>;
  correlationId?: string;
};

const DEFAULT_RETRY = { maxAttempts: 3, backoffMs: 2000 };

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function withConsumedDelay(automation: AutomationRecord, stepIndex: number): AutomationRecord {
  return {
    ...automation,
    actions: automation.actions.map((raw, i) =>
      i === stepIndex ? { ...raw, delayMs: 0, delay: 0 } : raw,
    ),
  };
}

/**
 * Reusable Automation Engine — triggers, conditions, actions, delays,
 * schedules, webhooks, step logs, retries, versioning, flow scaffold.
 * Module-agnostic: any producer can enqueue via event / webhook / schedule / manual.
 */
export function createAutomationEngine(
  sink: AutomationEngineSink,
  handlers: Partial<ActionHandlerMap> = {},
) {
  const actionHandlers = { ...createDefaultActionHandlers(), ...handlers };

  async function persistVersion(
    automation: AutomationRecord,
    createdBy?: string,
  ): Promise<AutomationVersionRecord> {
    const version: AutomationVersionRecord = {
      id: newId(),
      organizationId: automation.organizationId,
      automationId: automation.id,
      version: automation.version,
      snapshot: {
        key: automation.key,
        name: automation.name,
        status: automation.status,
        trigger: automation.trigger,
        cron: automation.cron,
        eventType: automation.eventType,
        conditions: automation.conditions,
        actions: automation.actions,
        flow: automation.flow,
        retryPolicy: automation.retryPolicy,
      },
      createdAt: nowIso(),
      createdBy,
    };
    await sink.saveVersion(version);
    return version;
  }

  async function enqueueRun(input: EnqueueRunInput): Promise<{
    run: AutomationRunRecord;
    idempotent: boolean;
  }> {
    const existing = await sink.findRunByIdempotencyKey(input.idempotencyKey);
    if (existing) return { run: existing, idempotent: true };

    const retry = input.automation.retryPolicy ?? DEFAULT_RETRY;
    const now = nowIso();
    const delayMs = input.delayMs ?? 0;
    const run: AutomationRunRecord = {
      id: newId(),
      organizationId: input.organizationId,
      automationId: input.automation.id,
      status: delayMs > 0 ? "waiting" : "pending",
      idempotencyKey: input.idempotencyKey,
      input: input.input,
      createdAt: now,
      automationVersion: input.automation.version,
      triggerSource: input.triggerSource,
      attempt: 0,
      maxAttempts: retry.maxAttempts,
      nextAttemptAt: new Date(Date.now() + delayMs).toISOString(),
      stepIndex: 0,
      stepLogs: [],
    };
    await sink.saveRun(run);
    return { run, idempotent: false };
  }

  async function executeSteps(
    automation: AutomationRecord,
    run: AutomationRunRecord,
    options: { skipDelayAtIndex?: number } = {},
  ): Promise<AutomationRunRecord> {
    const steps = normalizeActionSteps(automation.actions);
    const startIndex = run.stepIndex ?? 0;
    const logs: AutomationStepLog[] = [...(run.stepLogs ?? [])];
    const ctxBase = {
      organizationId: run.organizationId,
      automationId: automation.id,
      runId: run.id,
      payload: run.input,
      attempt: (run.attempt ?? 0) + 1,
    };

    run.status = "running";
    run.startedAt = run.startedAt ?? nowIso();
    run.attempt = (run.attempt ?? 0) + 1;
    await sink.saveRun(run);

    for (let i = startIndex; i < steps.length; i += 1) {
      const step = steps[i]!;

      if (step.delayMs && step.delayMs > 0 && options.skipDelayAtIndex !== i) {
        run.status = "waiting";
        run.stepIndex = i;
        run.nextAttemptAt = new Date(Date.now() + step.delayMs).toISOString();
        run.stepLogs = logs;
        run.output = {
          ...(run.output ?? {}),
          waitingForDelayMs: step.delayMs,
          nextStep: i,
          skipDelayOnResume: true,
        };
        await sink.saveRun(run);
        return run;
      }

      const log: AutomationStepLog = {
        stepId: step.id,
        kind: step.kind,
        status: "running",
        startedAt: nowIso(),
        input: step.config,
      };
      logs.push(log);
      run.stepLogs = logs;
      run.stepIndex = i;
      await sink.saveRun(run);

      const handler = actionHandlers[step.kind as AutomationActionKind];
      try {
        const result = handler
          ? await handler({ ...ctxBase, step })
          : { ok: false as const, error: `No handler for action kind: ${step.kind}` };
        log.finishedAt = nowIso();
        if (result.ok) {
          log.status = "succeeded";
          log.output = result.output ?? {};
        } else {
          log.status = "failed";
          log.error = result.error ?? "Action failed";
          run.stepLogs = logs;
          const max = run.maxAttempts ?? DEFAULT_RETRY.maxAttempts;
          const backoff = automation.retryPolicy?.backoffMs ?? DEFAULT_RETRY.backoffMs;
          if ((run.attempt ?? 1) < max) {
            run.status = "pending";
            run.triggerSource = "retry";
            run.nextAttemptAt = new Date(
              Date.now() + Math.min(3600_000, backoff * 2 ** ((run.attempt ?? 1) - 1)),
            ).toISOString();
            run.error = log.error;
            run.finishedAt = undefined;
          } else {
            run.status = "failed";
            run.error = log.error;
            run.finishedAt = nowIso();
          }
          await sink.saveRun(run);
          return run;
        }
      } catch (error) {
        log.status = "failed";
        log.finishedAt = nowIso();
        log.error = error instanceof Error ? error.message : "Action threw";
        run.status = "failed";
        run.error = log.error;
        run.finishedAt = nowIso();
        run.stepLogs = logs;
        await sink.saveRun(run);
        return run;
      }
    }

    run.status = "succeeded";
    run.finishedAt = nowIso();
    run.stepIndex = steps.length;
    run.stepLogs = logs;
    run.nextAttemptAt = undefined;
    run.output = {
      actionsExecuted: steps.length,
      stepLogs: logs.length,
      automationVersion: automation.version,
    };
    await sink.saveRun(run);
    return run;
  }

  return {
    catalogs: {
      eventTypes: AUTOMATION_EVENT_TYPES,
      actionKinds: AUTOMATION_ACTION_KINDS,
    },

    persistVersion,

    scaffoldFlow(automation: AutomationRecord) {
      if (automation.flow && validateFlowDefinition(automation.flow).ok) {
        return automation.flow;
      }
      return buildFlowFromFlatDefinition(automation);
    },

    evaluateConditions,
    enqueueRun,

    async dispatchEvent(
      input: DispatchEventInput,
    ): Promise<{ enqueued: number; runIds: string[] }> {
      const automations = await sink.listAutomations(input.organizationId);
      const matched = automations.filter(
        (a) => a.status === "enabled" && a.trigger === "event" && a.eventType === input.eventType,
      );
      const runIds: string[] = [];
      for (const automation of matched) {
        if (!evaluateConditions(automation.conditions, input.payload)) continue;
        const key =
          `evt:${input.organizationId}:${automation.id}:${input.eventType}:${input.correlationId ?? newId()}`.slice(
            0,
            128,
          );
        const { run, idempotent } = await enqueueRun({
          organizationId: input.organizationId,
          automation,
          input: {
            eventType: input.eventType,
            payload: input.payload,
            correlationId: input.correlationId,
          },
          idempotencyKey: key,
          triggerSource: "event",
        });
        if (!idempotent) runIds.push(run.id);
      }
      return { enqueued: runIds.length, runIds };
    },

    async tickSchedules(
      organizationId: OrganizationId,
      at = new Date(),
    ): Promise<{ enqueued: number }> {
      const automations = await sink.listAutomations(organizationId);
      const due = automations.filter(
        (a) =>
          a.status === "enabled" &&
          (a.trigger === "cron" || a.trigger === "schedule") &&
          Boolean(a.cron),
      );
      let enqueued = 0;
      const slot = [
        at.getUTCFullYear(),
        String(at.getUTCMonth() + 1).padStart(2, "0"),
        String(at.getUTCDate()).padStart(2, "0"),
        String(at.getUTCHours()).padStart(2, "0"),
        String(at.getUTCMinutes()).padStart(2, "0"),
      ].join("");
      for (const automation of due) {
        const { idempotent } = await enqueueRun({
          organizationId,
          automation,
          input: { scheduledAt: at.toISOString(), cron: automation.cron },
          idempotencyKey: `cron:${automation.id}:${slot}`,
          triggerSource: automation.trigger === "schedule" ? "schedule" : "cron",
        });
        if (!idempotent) enqueued += 1;
      }
      return { enqueued };
    },

    async ingestWebhook(pathKey: string, payload: Record<string, unknown>, secret?: string) {
      const webhook = await sink.findWebhookByPathKey(pathKey);
      if (!webhook || webhook.status !== "active") {
        return { ok: false as const, error: "Webhook not found" };
      }
      if (!secret) {
        return { ok: false as const, error: "Webhook secret required" };
      }
      const expected = Buffer.from(webhook.secret);
      const provided = Buffer.from(secret);
      if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
        return { ok: false as const, error: "Invalid webhook secret" };
      }
      const automation = await sink.findAutomation(webhook.automationId);
      if (!automation || automation.status !== "enabled") {
        return { ok: false as const, error: "Automation not enabled" };
      }
      if (!evaluateConditions(automation.conditions, payload)) {
        return { ok: true as const, skipped: true as const, reason: "conditions_not_met" as const };
      }
      const idem = typeof payload.idempotencyKey === "string" ? payload.idempotencyKey : newId();
      const { run } = await enqueueRun({
        organizationId: webhook.organizationId,
        automation,
        input: { webhookId: webhook.id, payload },
        idempotencyKey: `wh:${webhook.id}:${idem}`.slice(0, 128),
        triggerSource: "webhook",
      });
      return { ok: true as const, skipped: false as const, runId: run.id };
    },

    async registerWebhook(input: {
      organizationId: OrganizationId;
      automationId: string;
      pathKey: string;
      secret: string;
    }): Promise<AutomationWebhookRecord> {
      const now = nowIso();
      const webhook: AutomationWebhookRecord = {
        id: newId(),
        organizationId: input.organizationId,
        automationId: input.automationId,
        pathKey: input.pathKey,
        secret: input.secret,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
      await sink.saveWebhook(webhook);
      return webhook;
    },

    async drainQueue(limit = 50): Promise<{ processed: number; failed: number; waiting: number }> {
      const now = nowIso();
      const jobs = await sink.listRunnableJobs(limit, now);
      let processed = 0;
      let failed = 0;
      let waiting = 0;

      for (const job of jobs) {
        const automation = await sink.findAutomation(job.automationId);
        if (!automation) {
          job.status = "failed";
          job.error = "Automation missing";
          job.finishedAt = nowIso();
          await sink.saveRun(job);
          failed += 1;
          continue;
        }

        const payload = (job.input.payload as Record<string, unknown> | undefined) ?? job.input;
        if (!evaluateConditions(automation.conditions, payload)) {
          job.status = "succeeded";
          job.output = { skipped: true, reason: "conditions_not_met" };
          job.finishedAt = nowIso();
          await sink.saveRun(job);
          processed += 1;
          continue;
        }

        const skipDelayAtIndex =
          job.output?.skipDelayOnResume === true ? (job.stepIndex ?? 0) : undefined;
        const definition =
          skipDelayAtIndex !== undefined
            ? withConsumedDelay(automation, skipDelayAtIndex)
            : automation;

        const result = await executeSteps(definition, job, { skipDelayAtIndex });
        if (result.status === "succeeded") processed += 1;
        else if (result.status === "waiting" || result.status === "pending") waiting += 1;
        else failed += 1;
      }

      return { processed, failed, waiting };
    },

    async runNow(
      automation: AutomationRecord,
      run: AutomationRunRecord,
    ): Promise<AutomationRunRecord> {
      const payload = (run.input.payload as Record<string, unknown> | undefined) ?? run.input;
      if (!evaluateConditions(automation.conditions, payload)) {
        run.status = "succeeded";
        run.output = { skipped: true, reason: "conditions_not_met" };
        run.finishedAt = nowIso();
        await sink.saveRun(run);
        return run;
      }
      return executeSteps(automation, run);
    },

    listVersions: (automationId: string) => sink.listVersions(automationId),
    getPath,
  };
}

export type AutomationEngine = ReturnType<typeof createAutomationEngine>;
