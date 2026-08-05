import { z } from "zod";
import { listQuerySchema } from "../engines/filters";

const actorSchema = z.object({
  type: z.enum(["user", "service", "system", "ai"]),
  id: z.string().uuid().optional(),
});

export const listProductsSchema = listQuerySchema;
export const upsertProductSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  description: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const listCustomersSchema = listQuerySchema;
export const upsertCustomerSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  status: z.enum(["lead", "active", "inactive", "blocked"]).default("lead"),
  segment: z.string().max(64).optional(),
  distributorId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const listDistributorsSchema = listQuerySchema;
export const upsertDistributorSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  territory: z.string().max(120).optional(),
  status: z.enum(["prospect", "active", "suspended", "terminated"]).default("prospect"),
  metadata: z.record(z.unknown()).optional().default({}),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const createProductionOrderSchema = z.object({
  organizationId: z.string().uuid(),
  code: z.string().min(1).max(64),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  plannedQty: z.number().positive(),
  metadata: z.record(z.unknown()).optional().default({}),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const completeProductionOrderSchema = z.object({
  organizationId: z.string().uuid(),
  productionOrderId: z.string().uuid(),
  producedQty: z.number().positive(),
  batchCode: z.string().min(1).max(64),
  expiresAt: z.string().datetime().optional(),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const adjustInventorySchema = z.object({
  organizationId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  quantityDelta: z.number(),
  reason: z.string().min(1).max(200),
  idempotencyKey: z.string().min(8).max(128),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const transferInventorySchema = z.object({
  organizationId: z.string().uuid(),
  fromWarehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  quantity: z.number().positive(),
  reason: z.string().min(1).max(200),
  idempotencyKey: z.string().min(8).max(128),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const upsertAutomationSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  key: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  status: z.enum(["draft", "enabled", "disabled"]).default("draft"),
  trigger: z.enum(["event", "cron", "manual", "webhook", "schedule"]),
  cron: z.string().optional(),
  eventType: z.string().optional(),
  conditions: z.record(z.unknown()).optional().default({}),
  actions: z.array(z.record(z.unknown())).default([]),
  flow: z
    .object({
      schemaVersion: z.literal(1),
      nodes: z.array(
        z.object({
          id: z.string(),
          type: z.enum(["trigger", "condition", "action", "delay", "schedule"]),
          kind: z.string().optional(),
          config: z.record(z.unknown()).optional(),
          position: z.object({ x: z.number(), y: z.number() }).optional(),
        }),
      ),
      edges: z.array(
        z.object({
          id: z.string(),
          source: z.string(),
          target: z.string(),
          label: z.string().optional(),
        }),
      ),
    })
    .optional(),
  retryPolicy: z
    .object({
      maxAttempts: z.number().int().min(1).max(20).default(3),
      backoffMs: z.number().int().min(100).max(3_600_000).default(2000),
    })
    .optional(),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const triggerAutomationSchema = z.object({
  organizationId: z.string().uuid(),
  automationId: z.string().uuid(),
  input: z.record(z.unknown()).optional().default({}),
  idempotencyKey: z.string().min(8).max(128),
  executeNow: z.boolean().optional().default(true),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const dispatchAutomationEventSchema = z.object({
  organizationId: z.string().uuid(),
  eventType: z.string().min(1).max(120),
  payload: z.record(z.unknown()).optional().default({}),
  correlationId: z.string().optional(),
  drain: z.boolean().optional().default(false),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const drainAutomationsSchema = z.object({
  limit: z.number().int().min(1).max(500).optional().default(50),
  organizationId: z.string().uuid().optional(),
  tickSchedules: z.boolean().optional().default(false),
  actor: actorSchema.optional(),
  requestId: z.string().optional(),
});

export const registerAutomationWebhookSchema = z.object({
  organizationId: z.string().uuid(),
  automationId: z.string().uuid(),
  pathKey: z.string().min(8).max(64),
  secret: z.string().min(8).max(200),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const ingestAutomationWebhookSchema = z.object({
  pathKey: z.string().min(1),
  payload: z.record(z.unknown()).optional().default({}),
  secret: z.string().optional(),
  drain: z.boolean().optional().default(true),
});

export const createAiSessionSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  purpose: z.string().min(1).max(200),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const appendAiMessageSchema = z.object({
  organizationId: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().min(1).max(20000),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const runReportSchema = z.object({
  organizationId: z.string().uuid(),
  definitionId: z.string().uuid().optional(),
  kind: z.enum(["scans", "inventory", "production", "sales", "automations", "trust", "custom"]),
  name: z.string().min(1).max(200).optional(),
  parameters: z.record(z.unknown()).optional().default({}),
  requestedBy: z.string().uuid(),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const upsertSettingSchema = z.object({
  organizationId: z.string().uuid(),
  key: z.string().min(1).max(120),
  value: z.union([z.record(z.unknown()), z.string(), z.number(), z.boolean(), z.null()]),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const enqueueNotificationSchema = z.object({
  organizationId: z.string().uuid(),
  channel: z.enum(["email", "whatsapp", "push", "in_app"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  recipientUserId: z.string().uuid().optional(),
  recipientAddress: z.string().max(320).optional(),
  deepLink: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const saveDashboardLayoutSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  roleKey: z.string().optional(),
  name: z.string().min(1).max(120),
  widgets: z.array(
    z.object({
      id: z.string().min(1),
      widgetKey: z.string().min(1),
      title: z.string().optional(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number(),
      }),
      config: z.record(z.unknown()).default({}),
    }),
  ),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const fetchWidgetSchema = z.object({
  organizationId: z.string().uuid(),
  widgetKey: z.enum([
    "kpi",
    "chart",
    "activity",
    "alerts",
    "production",
    "inventory",
    "sales",
    "qr_scans",
    "ai",
    "automations",
  ]),
  config: z.record(z.unknown()).optional().default({}),
});

export const createWarehouseSchema = z.object({
  organizationId: z.string().uuid(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const createSavedViewSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  module: z.string().min(1),
  name: z.string().min(1).max(120),
  query: z.record(z.unknown()),
  isDefault: z.boolean().optional().default(false),
  actor: actorSchema,
  requestId: z.string().optional(),
});

export const listAuditSchema = listQuerySchema;
export const listNotificationsSchema = listQuerySchema;
