import { formatZodError } from "@pergon/shared/i18n";
import { ValidationFailedError, newId, nowIso } from "../../domain/base";
import type { DashboardLayoutRecord, SavedViewRecord } from "../../domain/models";
import { createDashboardEngine } from "../../engines/dashboard";
import { listQuerySchema, runListQuery, toCsv } from "../../engines/filters";
import { createNotificationEngine, type NotificationSink } from "../../engines/notifications";
import {
  createSavedViewSchema,
  enqueueNotificationSchema,
  fetchWidgetSchema,
  saveDashboardLayoutSchema,
} from "../../validation/schemas";
import { createOpsHelpers } from "../helpers";
import type { OpsUnitOfWork } from "../ports";

function notificationSink(uow: OpsUnitOfWork): NotificationSink {
  return {
    saveNotification: (n) => uow.notifications.save(n),
    saveOutbox: (o) => uow.notificationOutbox.save(o),
    listPendingOutbox: (limit) => uow.notificationOutbox.listPending(limit),
    updateOutbox: (o) => uow.notificationOutbox.save(o),
    updateNotification: (n) => uow.notifications.save(n),
    findNotification: (id) => uow.notifications.findById(id),
  };
}

export function getDashboardEngine(uow: OpsUnitOfWork) {
  return createDashboardEngine({
    listAlerts: (orgId) => uow.alerts.listByOrg(orgId),
    listProductionOrders: (orgId) => uow.productionOrders.listByOrg(orgId),
    listInventory: (orgId) => uow.inventory.listByOrg(orgId),
    listStockMoves: (orgId, limit) => uow.stockMoves.listByOrg(orgId, limit),
    listAutomationRuns: (orgId, limit) => uow.automationRuns.listByOrg(orgId, limit),
    listNotifications: (orgId, limit) => uow.notifications.listByOrg(orgId, limit),
    countAiSessions: async (orgId) => (await uow.aiSessions.listByOrg(orgId)).length,
  });
}

export async function fetchDashboardWidget(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = fetchWidgetSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  return getDashboardEngine(uow).fetchWidget(parsed.data);
}

export async function saveDashboardLayout(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = saveDashboardLayoutSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const input = parsed.data;
  const now = nowIso();
  const layout: DashboardLayoutRecord = {
    id: input.id ?? newId(),
    organizationId: input.organizationId,
    userId: input.userId,
    roleKey: input.roleKey,
    name: input.name,
    widgets: input.widgets,
    createdAt: now,
    updatedAt: now,
  };
  if (input.id) {
    const existing = await uow.dashboardLayouts.findById(input.id);
    if (existing) layout.createdAt = existing.createdAt;
  }
  await uow.dashboardLayouts.save(layout);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "dashboard:configure",
    module: "dashboard",
    entityType: "dashboard_layout",
    entityId: layout.id,
    after: { name: layout.name, widgets: layout.widgets.length },
    requestId: input.requestId,
  });
  await uow.commit();
  return layout;
}

export async function getDashboardLayout(uow: OpsUnitOfWork, id: string) {
  return uow.dashboardLayouts.findById(id);
}

export async function listAudit(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const items = await uow.audit.listByOrg(parsed.data.organizationId, 1000);
  const page = runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "action",
    "module",
    "entityType",
    "entityId",
  ]);
  if (parsed.data.exportFormat === "csv") return { ...page, csv: toCsv(page.items) };
  return page;
}

export async function enqueueNotification(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = enqueueNotificationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const input = parsed.data;
  const engine = createNotificationEngine(notificationSink(uow));
  const notification = await engine.enqueue(input);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "notifications:enqueue",
    module: "notifications",
    entityType: "notification",
    entityId: notification.id,
    after: { channel: notification.channel, title: notification.title },
    requestId: input.requestId,
  });
  await uow.commit();
  return notification;
}

export async function listNotifications(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const items = await uow.notifications.listByOrg(parsed.data.organizationId, 500);
  return runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "title",
    "channel",
    "status",
  ]);
}

export async function drainNotificationOutbox(uow: OpsUnitOfWork, limit = 50) {
  const engine = createNotificationEngine(notificationSink(uow));
  const result = await engine.drainOutbox(limit);
  await uow.commit();
  return result;
}

export async function markNotificationRead(
  uow: OpsUnitOfWork,
  notificationId: string,
  userId: string,
) {
  const engine = createNotificationEngine(notificationSink(uow));
  const result = await engine.markRead(notificationId, userId);
  await uow.commit();
  return result;
}

export async function createSavedView(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = createSavedViewSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const input = parsed.data;
  const now = nowIso();
  const view: SavedViewRecord = {
    id: newId(),
    organizationId: input.organizationId,
    userId: input.userId,
    module: input.module,
    name: input.name,
    query: input.query,
    isDefault: input.isDefault,
    createdAt: now,
    updatedAt: now,
  };
  await uow.savedViews.save(view);
  await uow.commit();
  return view;
}

export async function listSavedViews(uow: OpsUnitOfWork, organizationId: string, module?: string) {
  const views = await uow.savedViews.listByOrg(organizationId);
  return module ? views.filter((v) => v.module === module) : views;
}

export async function listAlerts(uow: OpsUnitOfWork, organizationId: string) {
  return uow.alerts.listByOrg(organizationId);
}
