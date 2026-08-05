import type { OpsDomainEvent } from "../domain/base";
import type {
  AiSessionRecord,
  AlertRecord,
  AutomationRecord,
  AutomationRunRecord,
  AutomationVersionRecord,
  AutomationWebhookRecord,
  BatchRecord,
  CustomerRecord,
  DashboardLayoutRecord,
  DistributorRecord,
  InventoryLevelRecord,
  NotificationOutboxRecord,
  NotificationRecord,
  OpsAuditRecord,
  ProductRecord,
  ProductionOrderRecord,
  ReportDefinitionRecord,
  ReportJobRecord,
  SavedViewRecord,
  SettingRecord,
  StockMoveRecord,
  WarehouseRecord,
} from "../domain/models";

export interface OpsUnitOfWork {
  products: CrudRepo<ProductRecord> & {
    findBySku(organizationId: string, sku: string): Promise<ProductRecord | null>;
  };
  customers: CrudRepo<CustomerRecord> & {
    findByCode(organizationId: string, code: string): Promise<CustomerRecord | null>;
  };
  distributors: CrudRepo<DistributorRecord> & {
    findByCode(organizationId: string, code: string): Promise<DistributorRecord | null>;
  };
  warehouses: CrudRepo<WarehouseRecord>;
  inventory: {
    findLevel(
      organizationId: string,
      warehouseId: string,
      productId: string,
      batchId?: string,
    ): Promise<InventoryLevelRecord | null>;
    listByOrg(organizationId: string): Promise<InventoryLevelRecord[]>;
    save(level: InventoryLevelRecord): Promise<void>;
  };
  stockMoves: {
    findByIdempotencyKey(key: string): Promise<StockMoveRecord | null>;
    listByOrg(organizationId: string, limit?: number): Promise<StockMoveRecord[]>;
    append(move: StockMoveRecord): Promise<void>;
  };
  productionOrders: CrudRepo<ProductionOrderRecord> & {
    findByCode(organizationId: string, code: string): Promise<ProductionOrderRecord | null>;
  };
  batches: CrudRepo<BatchRecord> & {
    findByCode(organizationId: string, code: string): Promise<BatchRecord | null>;
  };
  automations: CrudRepo<AutomationRecord> & {
    findByKey(organizationId: string, key: string): Promise<AutomationRecord | null>;
  };
  automationRuns: {
    findById(id: string): Promise<AutomationRunRecord | null>;
    findByIdempotencyKey(key: string): Promise<AutomationRunRecord | null>;
    listByOrg(organizationId: string, limit?: number): Promise<AutomationRunRecord[]>;
    listRunnable(limit: number, nowIso: string): Promise<AutomationRunRecord[]>;
    save(run: AutomationRunRecord): Promise<void>;
  };
  automationVersions: {
    save(version: AutomationVersionRecord): Promise<void>;
    listByAutomation(automationId: string): Promise<AutomationVersionRecord[]>;
  };
  automationWebhooks: {
    findByPathKey(pathKey: string): Promise<AutomationWebhookRecord | null>;
    listByOrg(organizationId: string): Promise<AutomationWebhookRecord[]>;
    save(webhook: AutomationWebhookRecord): Promise<void>;
  };
  aiSessions: CrudRepo<AiSessionRecord>;
  reportDefinitions: CrudRepo<ReportDefinitionRecord> & {
    findByKey(organizationId: string, key: string): Promise<ReportDefinitionRecord | null>;
  };
  reportJobs: {
    findById(id: string): Promise<ReportJobRecord | null>;
    listByOrg(organizationId: string): Promise<ReportJobRecord[]>;
    save(job: ReportJobRecord): Promise<void>;
  };
  settings: {
    findByKey(organizationId: string, key: string): Promise<SettingRecord | null>;
    listByOrg(organizationId: string): Promise<SettingRecord[]>;
    save(setting: SettingRecord): Promise<void>;
  };
  audit: {
    append(entry: OpsAuditRecord): Promise<void>;
    listByOrg(organizationId: string, limit?: number): Promise<OpsAuditRecord[]>;
  };
  notifications: {
    findById(id: string): Promise<NotificationRecord | null>;
    listByOrg(organizationId: string, limit?: number): Promise<NotificationRecord[]>;
    save(n: NotificationRecord): Promise<void>;
  };
  notificationOutbox: {
    listPending(limit: number): Promise<NotificationOutboxRecord[]>;
    save(o: NotificationOutboxRecord): Promise<void>;
  };
  savedViews: CrudRepo<SavedViewRecord>;
  dashboardLayouts: CrudRepo<DashboardLayoutRecord>;
  alerts: {
    findById(id: string): Promise<AlertRecord | null>;
    listByOrg(organizationId: string): Promise<AlertRecord[]>;
    save(alert: AlertRecord): Promise<void>;
  };
  events: {
    append(event: OpsDomainEvent): Promise<void>;
    listByOrg(organizationId: string, limit?: number): Promise<OpsDomainEvent[]>;
  };
  commit(): Promise<void>;
}

export type CrudRepo<T extends { id: string }> = {
  findById(id: string): Promise<T | null>;
  listByOrg(organizationId: string): Promise<T[]>;
  save(entity: T): Promise<void>;
};
