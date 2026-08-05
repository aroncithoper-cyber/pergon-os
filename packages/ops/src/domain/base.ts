import { randomUUID } from "node:crypto";

export type EntityId = string;
export type OrganizationId = string;
export type ActorRef = { type: "user" | "service" | "system" | "ai"; id?: string };

export function newId(): EntityId {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export class OpsError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "OpsError";
    this.code = code;
  }
}

export class ValidationFailedError extends OpsError {
  constructor(message: string) {
    super("VALIDATION_FAILED", message);
    this.name = "ValidationFailedError";
  }
}

export class NotFoundError extends OpsError {
  constructor(entity: string, id?: string) {
    super("NOT_FOUND", id ? `${entity} not found: ${id}` : `${entity} not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends OpsError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class ForbiddenOpsError extends OpsError {
  constructor(permission?: string) {
    super("FORBIDDEN", permission ? `Missing permission: ${permission}` : "Forbidden");
    this.name = "ForbiddenOpsError";
  }
}

/** Domain event envelope — append-only operational trail. */
export type OpsDomainEvent = {
  id: EntityId;
  organizationId: OrganizationId;
  module: OpsModuleKey;
  type: string;
  entityType: string;
  entityId: EntityId;
  payload: Record<string, unknown>;
  actor: ActorRef;
  correlationId?: string;
  createdAt: string;
};

export const OPS_MODULE_KEYS = [
  "dashboard",
  "products",
  "customers",
  "distributors",
  "production",
  "inventory",
  "qr",
  "passport",
  "users",
  "roles",
  "automations",
  "ai",
  "reports",
  "settings",
  "audit",
  "notifications",
] as const;

export type OpsModuleKey = (typeof OPS_MODULE_KEYS)[number];

/** Module → permission map for route/use-case authorization. */
export const MODULE_PERMISSIONS = {
  dashboard: { read: "dashboard:read", write: "dashboard:configure" },
  products: { read: "products:read", write: "products:write", publish: "products:publish" },
  customers: { read: "customers:read", write: "customers:write" },
  distributors: { read: "distributors:read", write: "distributors:write" },
  production: { read: "production:read", write: "production:write" },
  inventory: { read: "inventory:read", write: "inventory:adjust", transfer: "inventory:transfer" },
  qr: { read: "qr:read", write: "qr:create", rotate: "qr:rotate", suspend: "qr:suspend" },
  passport: {
    read: "passports:read",
    write: "passports:update",
    issue: "passports:issue",
    revoke: "passports:revoke",
  },
  users: { read: "users:read", write: "users:update", invite: "users:invite" },
  roles: { read: "roles:read", write: "roles:manage", assign: "roles:assign" },
  automations: {
    read: "automations:read",
    write: "automations:manage",
    trigger: "automations:trigger",
  },
  ai: { read: "expert:use_admin", write: "expert:tools_confirm" },
  reports: { read: "reports:read", write: "reports:run", schedule: "reports:schedule" },
  settings: { read: "settings:read", write: "settings:update" },
  audit: { read: "audit:read", export: "audit:export" },
  notifications: {
    read: "notifications:read",
    write: "notifications:write",
    manage: "notifications:manage",
  },
} as const;
