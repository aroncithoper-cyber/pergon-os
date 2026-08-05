import { newId } from "../../domain/base";
import { AUTOMATION_ACTION_KINDS, type AutomationActionKind } from "./catalog";

export type ActionStep = {
  id: string;
  kind: AutomationActionKind | string;
  config: Record<string, unknown>;
  delayMs?: number;
};

export type ActionExecutionContext = {
  organizationId: string;
  automationId: string;
  runId: string;
  payload: Record<string, unknown>;
  attempt: number;
  step: ActionStep;
};

export type ActionHandlerResult =
  { ok: true; output?: Record<string, unknown> } | { ok: false; error?: string };

export type ActionHandler = (ctx: ActionExecutionContext) => Promise<ActionHandlerResult>;

export type ActionHandlerMap = Record<AutomationActionKind, ActionHandler>;

function stub(kind: AutomationActionKind): ActionHandler {
  return async (ctx) => ({
    ok: true,
    output: {
      kind,
      stub: true,
      config: ctx.step.config,
      at: new Date().toISOString(),
    },
  });
}

/** Default injectable handlers — stubs until channel/infra adapters are wired. */
export function createDefaultActionHandlers(): ActionHandlerMap {
  const map = {} as ActionHandlerMap;
  for (const kind of AUTOMATION_ACTION_KINDS) {
    map[kind] = stub(kind);
  }
  return map;
}

/** Normalize opaque action records into executable steps. */
export function normalizeActionSteps(actions: Array<Record<string, unknown>>): ActionStep[] {
  return actions.map((raw, index) => {
    const kind = String(raw.kind ?? raw.type ?? raw.action ?? "notify_internal");
    const delayRaw = raw.delayMs ?? raw.delay;
    const delayMs =
      typeof delayRaw === "number"
        ? delayRaw
        : typeof delayRaw === "string"
          ? Number(delayRaw) || undefined
          : undefined;
    const config = (raw.config as Record<string, unknown> | undefined) ?? {};
    if (!raw.config) {
      for (const [key, value] of Object.entries(raw)) {
        if (["kind", "type", "action", "id", "delayMs", "delay"].includes(key)) continue;
        config[key] = value;
      }
    }
    return {
      id: String(raw.id ?? `step_${index + 1}`),
      kind,
      config,
      delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
    };
  });
}

export function isKnownActionKind(kind: string): kind is AutomationActionKind {
  return (AUTOMATION_ACTION_KINDS as readonly string[]).includes(kind);
}

export function ensureActionId(step: Partial<ActionStep>): string {
  return step.id ?? newId();
}
