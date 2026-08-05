import type { ActorRef, EntityId, OrganizationId } from "./base";

export type ProductStatus = "draft" | "active" | "archived";
export type ProductRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  sku: string;
  name: string;
  status: ProductStatus;
  description?: string;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CustomerStatus = "lead" | "active" | "inactive" | "blocked";
export type CustomerRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  status: CustomerStatus;
  segment?: string;
  distributorId?: EntityId;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type DistributorStatus = "prospect" | "active" | "suspended" | "terminated";
export type DistributorRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  code: string;
  name: string;
  email?: string;
  territory?: string;
  status: DistributorStatus;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type WarehouseRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  code: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type InventoryLevelRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  warehouseId: EntityId;
  productId: EntityId;
  batchId?: EntityId;
  quantity: number;
  reserved: number;
  updatedAt: string;
};

export type StockMoveType = "in" | "out" | "adjust" | "transfer" | "consume" | "produce";
export type StockMoveRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  type: StockMoveType;
  warehouseId: EntityId;
  toWarehouseId?: EntityId;
  productId: EntityId;
  batchId?: EntityId;
  quantity: number;
  reason: string;
  idempotencyKey: string;
  actor: ActorRef;
  createdAt: string;
};

export type ProductionOrderStatus = "draft" | "planned" | "in_progress" | "completed" | "cancelled";
export type ProductionOrderRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  code: string;
  productId: EntityId;
  warehouseId: EntityId;
  plannedQty: number;
  producedQty: number;
  status: ProductionOrderStatus;
  batchId?: EntityId;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type BatchStatus = "open" | "closed" | "quarantine" | "expired";
export type BatchRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  productId: EntityId;
  code: string;
  status: BatchStatus;
  manufacturedAt?: string;
  expiresAt?: string;
  productionOrderId?: EntityId;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type AutomationTrigger = "event" | "cron" | "manual";
export type AutomationStatus = "draft" | "enabled" | "disabled";
export type AutomationRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  key: string;
  name: string;
  status: AutomationStatus;
  trigger: AutomationTrigger;
  cron?: string;
  eventType?: string;
  conditions: Record<string, unknown>;
  actions: Array<Record<string, unknown>>;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type AutomationRunStatus = "pending" | "running" | "succeeded" | "failed" | "cancelled";
export type AutomationRunRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  automationId: EntityId;
  status: AutomationRunStatus;
  idempotencyKey: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
};

export type AiSessionStatus = "open" | "closed";
export type AiSessionRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  userId: EntityId;
  status: AiSessionStatus;
  purpose: string;
  messages: Array<{ role: "user" | "assistant" | "system" | "tool"; content: string; at: string }>;
  toolInvocations: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
};

export type ReportKind =
  "scans" | "inventory" | "production" | "sales" | "automations" | "trust" | "custom";
export type ReportJobStatus = "queued" | "running" | "succeeded" | "failed";
export type ReportDefinitionRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  key: string;
  name: string;
  kind: ReportKind;
  parametersSchema: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
export type ReportJobRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  definitionId: EntityId;
  status: ReportJobStatus;
  parameters: Record<string, unknown>;
  artifactUrl?: string;
  error?: string;
  requestedBy: EntityId;
  createdAt: string;
  finishedAt?: string;
};

export type SettingRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  key: string;
  value: Record<string, unknown> | string | number | boolean | null;
  updatedBy?: EntityId;
  updatedAt: string;
  createdAt: string;
};

export type OpsAuditRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  actor: ActorRef;
  action: string;
  module: string;
  entityType: string;
  entityId: EntityId;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  requestId?: string;
  createdAt: string;
};

export type NotificationChannel = "email" | "whatsapp" | "push" | "in_app";
export type NotificationStatus = "pending" | "queued" | "sent" | "failed" | "read";
export type NotificationRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipientUserId?: EntityId;
  recipientAddress?: string;
  title: string;
  body: string;
  deepLink?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  error?: string;
};

export type NotificationOutboxRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  notificationId: EntityId;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  attempts: number;
  nextAttemptAt: string;
  lockedAt?: string;
  createdAt: string;
};

export type SavedViewRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  userId: EntityId;
  module: string;
  name: string;
  query: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DashboardLayoutRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  userId?: EntityId;
  roleKey?: string;
  name: string;
  widgets: DashboardWidgetInstance[];
  createdAt: string;
  updatedAt: string;
};

export type DashboardWidgetInstance = {
  id: string;
  widgetKey: string;
  title?: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
};

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertRecord = {
  id: EntityId;
  organizationId: OrganizationId;
  type: string;
  severity: AlertSeverity;
  status: "open" | "acknowledged" | "resolved";
  title: string;
  message: string;
  module: string;
  entityType?: string;
  entityId?: EntityId;
  createdAt: string;
  resolvedAt?: string;
};
