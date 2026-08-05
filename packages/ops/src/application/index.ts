import type { OpsUnitOfWork } from "./ports";
import * as products from "./use-cases/products";
import * as commercial from "./use-cases/commercial";
import * as operations from "./use-cases/operations";
import * as automations from "./use-cases/automations";
import * as intelligence from "./use-cases/intelligence";
import * as platform from "./use-cases/platform";
import { ADMIN_MODULE_REGISTRY } from "./use-cases/bridges";

export function createOpsServices(uow: OpsUnitOfWork) {
  return {
    registry: ADMIN_MODULE_REGISTRY,

    // Products
    listProducts: (input: unknown) => products.listProducts(uow, input),
    upsertProduct: (input: unknown) => products.upsertProduct(uow, input),
    getProduct: (id: string) => products.getProduct(uow, id),

    // Customers / Distributors
    listCustomers: (input: unknown) => commercial.listCustomers(uow, input),
    upsertCustomer: (input: unknown) => commercial.upsertCustomer(uow, input),
    listDistributors: (input: unknown) => commercial.listDistributors(uow, input),
    upsertDistributor: (input: unknown) => commercial.upsertDistributor(uow, input),

    // Production / Inventory
    createWarehouse: (input: unknown) => operations.createWarehouse(uow, input),
    listInventory: (input: unknown) => operations.listInventory(uow, input),
    adjustInventory: (input: unknown) => operations.adjustInventory(uow, input),
    transferInventory: (input: unknown) => operations.transferInventory(uow, input),
    createProductionOrder: (input: unknown) => operations.createProductionOrder(uow, input),
    completeProductionOrder: (input: unknown) => operations.completeProductionOrder(uow, input),
    listProductionOrders: (input: unknown) => operations.listProductionOrders(uow, input),
    listBatches: (input: unknown) => operations.listBatches(uow, input),

    // Automations
    listAutomations: (input: unknown) => automations.listAutomations(uow, input),
    upsertAutomation: (input: unknown) => automations.upsertAutomation(uow, input),
    triggerAutomation: (input: unknown) => automations.triggerAutomation(uow, input),
    dispatchAutomationEvent: (input: unknown) => automations.dispatchAutomationEvent(uow, input),
    drainAutomations: (input?: unknown) => automations.drainAutomations(uow, input ?? {}),
    registerAutomationWebhook: (input: unknown) =>
      automations.registerAutomationWebhook(uow, input),
    ingestAutomationWebhook: (input: unknown) => automations.ingestAutomationWebhook(uow, input),
    listAutomationRuns: (organizationId: string, limit?: number) =>
      automations.listAutomationRuns(uow, organizationId, limit),
    listAutomationVersions: (automationId: string, organizationId?: string) =>
      automations.listAutomationVersions(uow, automationId, organizationId),
    getAutomationCatalog: () => automations.getAutomationCatalog(),

    // AI / Reports / Settings
    createAiSession: (input: unknown) => intelligence.createAiSession(uow, input),
    appendAiMessage: (input: unknown) => intelligence.appendAiMessage(uow, input),
    listAiSessions: (input: unknown) => intelligence.listAiSessions(uow, input),
    runReport: (input: unknown) => intelligence.runReport(uow, input),
    listReportJobs: (organizationId: string) => intelligence.listReportJobs(uow, organizationId),
    upsertSetting: (input: unknown) => intelligence.upsertSetting(uow, input),
    listSettings: (organizationId: string) => intelligence.listSettings(uow, organizationId),

    // Dashboard / Audit / Notifications / Filters
    fetchDashboardWidget: (input: unknown) => platform.fetchDashboardWidget(uow, input),
    saveDashboardLayout: (input: unknown) => platform.saveDashboardLayout(uow, input),
    getDashboardLayout: (id: string) => platform.getDashboardLayout(uow, id),
    listAudit: (input: unknown) => platform.listAudit(uow, input),
    enqueueNotification: (input: unknown) => platform.enqueueNotification(uow, input),
    listNotifications: (input: unknown) => platform.listNotifications(uow, input),
    drainNotificationOutbox: (limit?: number) => platform.drainNotificationOutbox(uow, limit),
    markNotificationRead: (notificationId: string, userId: string) =>
      platform.markNotificationRead(uow, notificationId, userId),
    createSavedView: (input: unknown) => platform.createSavedView(uow, input),
    listSavedViews: (organizationId: string, module?: string) =>
      platform.listSavedViews(uow, organizationId, module),
    listAlerts: (organizationId: string) => platform.listAlerts(uow, organizationId),
  };
}

export type OpsServices = ReturnType<typeof createOpsServices>;

export type { OpsUnitOfWork } from "./ports";
export { ADMIN_MODULE_REGISTRY } from "./use-cases/bridges";
export {
  passportModuleContract,
  qrModuleContract,
  usersModuleContract,
  rolesModuleContract,
  parseBridgeListQuery,
} from "./use-cases/bridges";
export { mapOpsHttpError } from "./http";
