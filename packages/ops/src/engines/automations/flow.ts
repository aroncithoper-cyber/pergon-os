import { newId } from "../../domain/base";
import type {
  AutomationFlowDefinition,
  AutomationFlowEdge,
  AutomationFlowNode,
  AutomationRecord,
} from "../../domain/models";
import { normalizeActionSteps } from "./actions";

export type FlowBuilderScaffold = {
  flow: AutomationFlowDefinition;
  warnings: string[];
};

/** Validate Flow Builder graph shape (architecture guard — not a full runtime executor). */
export function validateFlowDefinition(
  flow: AutomationFlowDefinition | undefined,
): { ok: true } | { ok: false; errors: string[] } {
  if (!flow) return { ok: false, errors: ["flow missing"] };
  const errors: string[] = [];
  if (flow.schemaVersion !== 1) errors.push("unsupported schemaVersion");
  if (!Array.isArray(flow.nodes) || flow.nodes.length === 0) errors.push("nodes required");
  if (!Array.isArray(flow.edges)) errors.push("edges required");
  const ids = new Set(flow.nodes.map((n) => n.id));
  for (const edge of flow.edges) {
    if (!ids.has(edge.source)) errors.push(`edge source missing: ${edge.source}`);
    if (!ids.has(edge.target)) errors.push(`edge target missing: ${edge.target}`);
  }
  const triggers = flow.nodes.filter((n) => n.type === "trigger");
  if (triggers.length !== 1) errors.push("exactly one trigger node required");
  return errors.length ? { ok: false, errors } : { ok: true };
}

/**
 * Build a Flow Builder graph from flat trigger/conditions/actions.
 * Prepared for a future visual editor — no UI here.
 */
export function buildFlowFromFlatDefinition(
  automation: AutomationRecord,
): AutomationFlowDefinition {
  const nodes: AutomationFlowNode[] = [];
  const edges: AutomationFlowEdge[] = [];

  const triggerId = "trigger_1";
  nodes.push({
    id: triggerId,
    type: "trigger",
    kind: automation.trigger,
    config: {
      eventType: automation.eventType,
      cron: automation.cron,
    },
    position: { x: 0, y: 0 },
  });

  let prev = triggerId;
  let y = 120;

  if (automation.conditions && Object.keys(automation.conditions).length > 0) {
    const conditionId = "condition_1";
    nodes.push({
      id: conditionId,
      type: "condition",
      config: automation.conditions,
      position: { x: 0, y },
    });
    edges.push({ id: newId(), source: prev, target: conditionId, label: "always" });
    prev = conditionId;
    y += 120;
  }

  const steps = normalizeActionSteps(automation.actions);
  for (const [index, step] of steps.entries()) {
    if (step.delayMs) {
      const delayId = `delay_${index + 1}`;
      nodes.push({
        id: delayId,
        type: "delay",
        config: { delayMs: step.delayMs },
        position: { x: 0, y },
      });
      edges.push({ id: newId(), source: prev, target: delayId });
      prev = delayId;
      y += 120;
    }
    const actionId = step.id || `action_${index + 1}`;
    nodes.push({
      id: actionId,
      type: "action",
      kind: step.kind,
      config: step.config,
      position: { x: 0, y },
    });
    edges.push({ id: newId(), source: prev, target: actionId });
    prev = actionId;
    y += 120;
  }

  return { schemaVersion: 1, nodes, edges };
}

export function createEmptyFlowScaffold(triggerKind = "event"): FlowBuilderScaffold {
  const triggerId = "trigger_1";
  return {
    flow: {
      schemaVersion: 1,
      nodes: [
        {
          id: triggerId,
          type: "trigger",
          kind: triggerKind,
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
    },
    warnings: ["Scaffold only — connect condition/action nodes in a future Flow Builder UI."],
  };
}
