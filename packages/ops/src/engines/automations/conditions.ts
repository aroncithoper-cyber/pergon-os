export type AutomationPredicateOp =
  "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "exists" | "contains";

export type AutomationPredicate = {
  path: string;
  op: AutomationPredicateOp;
  value?: unknown;
};

/** Structured condition tree. Empty / missing tree always passes. */
export type AutomationConditionTree = {
  all?: AutomationPredicate[];
  any?: AutomationPredicate[];
  none?: AutomationPredicate[];
};

function readPath(payload: Record<string, unknown>, path: string): unknown {
  if (!path) return payload;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload);
}

function compare(op: AutomationPredicateOp, left: unknown, right: unknown): boolean {
  switch (op) {
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
    case "gt":
      return Number(left) > Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "in":
      return Array.isArray(right) && right.includes(left);
    case "exists":
      return left !== undefined && left !== null;
    case "contains":
      if (typeof left === "string" && typeof right === "string") return left.includes(right);
      if (Array.isArray(left)) return left.includes(right);
      return false;
    default:
      return false;
  }
}

function isPredicate(value: unknown): value is AutomationPredicate {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as AutomationPredicate).path === "string" &&
    typeof (value as AutomationPredicate).op === "string",
  );
}

function isTree(value: unknown): value is AutomationConditionTree {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as AutomationConditionTree;
  return "all" in obj || "any" in obj || "none" in obj;
}

function evalPredicate(predicate: AutomationPredicate, payload: Record<string, unknown>): boolean {
  return compare(predicate.op, readPath(payload, predicate.path), predicate.value);
}

/**
 * Evaluate automation conditions against an event/run payload.
 * Accepts structured trees or legacy empty objects.
 */
export function evaluateConditions(
  conditions: Record<string, unknown> | AutomationConditionTree | undefined,
  payload: Record<string, unknown>,
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  if (isTree(conditions)) {
    const allOk = (conditions.all ?? []).every((p) => evalPredicate(p, payload));
    const anyList = conditions.any ?? [];
    const anyOk = anyList.length === 0 || anyList.some((p) => evalPredicate(p, payload));
    const noneOk = (conditions.none ?? []).every((p) => !evalPredicate(p, payload));
    return allOk && anyOk && noneOk;
  }

  // Legacy flat map: every key must deep-equal payload[key]
  return Object.entries(conditions).every(([key, expected]) => {
    if (isPredicate({ path: key, op: "eq", value: expected })) {
      return compare("eq", readPath(payload, key), expected);
    }
    return readPath(payload, key) === expected;
  });
}
