import { createAutomationEngine, type AutomationEngine } from "../engines/automations";
import type { OpsUnitOfWork } from "./ports";

/** Single wiring for Automation Engine sinks — used by helpers and use-cases. */
export function automationEngineFrom(uow: OpsUnitOfWork): AutomationEngine {
  return createAutomationEngine({
    listAutomations: (organizationId) => uow.automations.listByOrg(organizationId),
    findAutomation: (id) => uow.automations.findById(id),
    saveRun: (run) => uow.automationRuns.save(run),
    findRunByIdempotencyKey: (key) => uow.automationRuns.findByIdempotencyKey(key),
    listRunnableJobs: (limit, now) => uow.automationRuns.listRunnable(limit, now),
    saveVersion: (version) => uow.automationVersions.save(version),
    listVersions: (automationId) => uow.automationVersions.listByAutomation(automationId),
    findWebhookByPathKey: (pathKey) => uow.automationWebhooks.findByPathKey(pathKey),
    saveWebhook: (webhook) => uow.automationWebhooks.save(webhook),
  });
}
