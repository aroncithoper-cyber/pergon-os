import type { OpsDomainEvent } from "../../domain/base";
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
} from "../../domain/models";
import type { CrudRepo, OpsUnitOfWork } from "../../application/ports";

function clone<T>(v: T): T {
  return structuredClone(v);
}

function createCrud<T extends { id: string; organizationId: string }>(
  map: Map<string, T>,
): CrudRepo<T> {
  return {
    async findById(id) {
      return map.get(id) ? clone(map.get(id)!) : null;
    },
    async listByOrg(organizationId) {
      return [...map.values()].filter((e) => e.organizationId === organizationId).map(clone);
    },
    async save(entity) {
      map.set(entity.id, clone(entity));
    },
  };
}

export class OpsMemoryStore {
  products = new Map<string, ProductRecord>();
  customers = new Map<string, CustomerRecord>();
  distributors = new Map<string, DistributorRecord>();
  warehouses = new Map<string, WarehouseRecord>();
  inventory = new Map<string, InventoryLevelRecord>();
  stockMoves: StockMoveRecord[] = [];
  productionOrders = new Map<string, ProductionOrderRecord>();
  batches = new Map<string, BatchRecord>();
  automations = new Map<string, AutomationRecord>();
  automationRuns = new Map<string, AutomationRunRecord>();
  automationVersions = new Map<string, AutomationVersionRecord>();
  automationWebhooks = new Map<string, AutomationWebhookRecord>();
  aiSessions = new Map<string, AiSessionRecord>();
  reportDefinitions = new Map<string, ReportDefinitionRecord>();
  reportJobs = new Map<string, ReportJobRecord>();
  settings = new Map<string, SettingRecord>();
  audit: OpsAuditRecord[] = [];
  notifications = new Map<string, NotificationRecord>();
  notificationOutbox = new Map<string, NotificationOutboxRecord>();
  savedViews = new Map<string, SavedViewRecord>();
  dashboardLayouts = new Map<string, DashboardLayoutRecord>();
  alerts = new Map<string, AlertRecord>();
  events: OpsDomainEvent[] = [];
}

function inventoryKey(
  organizationId: string,
  warehouseId: string,
  productId: string,
  batchId?: string,
) {
  return `${organizationId}:${warehouseId}:${productId}:${batchId ?? "-"}`;
}

export function createMemoryUnitOfWork(store = new OpsMemoryStore()): OpsUnitOfWork {
  const products = {
    ...createCrud(store.products),
    async findBySku(organizationId: string, sku: string) {
      for (const p of store.products.values()) {
        if (p.organizationId === organizationId && p.sku === sku && !p.deletedAt) return clone(p);
      }
      return null;
    },
  };

  const customers = {
    ...createCrud(store.customers),
    async findByCode(organizationId: string, code: string) {
      for (const c of store.customers.values()) {
        if (c.organizationId === organizationId && c.code === code && !c.deletedAt) return clone(c);
      }
      return null;
    },
  };

  const distributors = {
    ...createCrud(store.distributors),
    async findByCode(organizationId: string, code: string) {
      for (const d of store.distributors.values()) {
        if (d.organizationId === organizationId && d.code === code && !d.deletedAt) return clone(d);
      }
      return null;
    },
  };

  const productionOrders = {
    ...createCrud(store.productionOrders),
    async findByCode(organizationId: string, code: string) {
      for (const o of store.productionOrders.values()) {
        if (o.organizationId === organizationId && o.code === code) return clone(o);
      }
      return null;
    },
  };

  const batches = {
    ...createCrud(store.batches),
    async findByCode(organizationId: string, code: string) {
      for (const b of store.batches.values()) {
        if (b.organizationId === organizationId && b.code === code && !b.deletedAt) return clone(b);
      }
      return null;
    },
  };

  const automations = {
    ...createCrud(store.automations),
    async findByKey(organizationId: string, key: string) {
      for (const a of store.automations.values()) {
        if (a.organizationId === organizationId && a.key === key) return clone(a);
      }
      return null;
    },
  };

  const reportDefinitions = {
    ...createCrud(store.reportDefinitions),
    async findByKey(organizationId: string, key: string) {
      for (const r of store.reportDefinitions.values()) {
        if (r.organizationId === organizationId && r.key === key) return clone(r);
      }
      return null;
    },
  };

  return {
    products,
    customers,
    distributors,
    warehouses: createCrud(store.warehouses),
    inventory: {
      async findLevel(organizationId, warehouseId, productId, batchId) {
        const key = inventoryKey(organizationId, warehouseId, productId, batchId);
        return store.inventory.get(key) ? clone(store.inventory.get(key)!) : null;
      },
      async listByOrg(organizationId) {
        return [...store.inventory.values()]
          .filter((i) => i.organizationId === organizationId)
          .map(clone);
      },
      async save(level) {
        const key = inventoryKey(
          level.organizationId,
          level.warehouseId,
          level.productId,
          level.batchId,
        );
        store.inventory.set(key, clone(level));
      },
    },
    stockMoves: {
      async findByIdempotencyKey(key) {
        return store.stockMoves.find((m) => m.idempotencyKey === key)
          ? clone(store.stockMoves.find((m) => m.idempotencyKey === key)!)
          : null;
      },
      async listByOrg(organizationId, limit = 100) {
        return store.stockMoves
          .filter((m) => m.organizationId === organizationId)
          .slice(-limit)
          .reverse()
          .map(clone);
      },
      async append(move) {
        store.stockMoves.push(clone(move));
      },
    },
    productionOrders,
    batches,
    automations,
    automationRuns: {
      async findById(id) {
        return store.automationRuns.get(id) ? clone(store.automationRuns.get(id)!) : null;
      },
      async findByIdempotencyKey(key) {
        for (const r of store.automationRuns.values()) {
          if (r.idempotencyKey === key) return clone(r);
        }
        return null;
      },
      async listByOrg(organizationId, limit = 100) {
        return [...store.automationRuns.values()]
          .filter((r) => r.organizationId === organizationId)
          .slice(-limit)
          .reverse()
          .map(clone);
      },
      async listRunnable(limit, now) {
        return [...store.automationRuns.values()]
          .filter(
            (r) =>
              (r.status === "pending" || r.status === "waiting") &&
              (!r.nextAttemptAt || r.nextAttemptAt <= now),
          )
          .sort((a, b) =>
            (a.nextAttemptAt ?? a.createdAt).localeCompare(b.nextAttemptAt ?? b.createdAt),
          )
          .slice(0, limit)
          .map(clone);
      },
      async save(run) {
        store.automationRuns.set(run.id, clone(run));
      },
    },
    automationVersions: {
      async save(version) {
        store.automationVersions.set(version.id, clone(version));
      },
      async listByAutomation(automationId) {
        return [...store.automationVersions.values()]
          .filter((v) => v.automationId === automationId)
          .sort((a, b) => b.version - a.version)
          .map(clone);
      },
    },
    automationWebhooks: {
      async findByPathKey(pathKey) {
        for (const w of store.automationWebhooks.values()) {
          if (w.pathKey === pathKey) return clone(w);
        }
        return null;
      },
      async listByOrg(organizationId) {
        return [...store.automationWebhooks.values()]
          .filter((w) => w.organizationId === organizationId)
          .map(clone);
      },
      async save(webhook) {
        store.automationWebhooks.set(webhook.id, clone(webhook));
      },
    },
    aiSessions: createCrud(store.aiSessions),
    reportDefinitions,
    reportJobs: {
      async findById(id) {
        return store.reportJobs.get(id) ? clone(store.reportJobs.get(id)!) : null;
      },
      async listByOrg(organizationId) {
        return [...store.reportJobs.values()]
          .filter((j) => j.organizationId === organizationId)
          .map(clone);
      },
      async save(job) {
        store.reportJobs.set(job.id, clone(job));
      },
    },
    settings: {
      async findByKey(organizationId, key) {
        for (const s of store.settings.values()) {
          if (s.organizationId === organizationId && s.key === key) return clone(s);
        }
        return null;
      },
      async listByOrg(organizationId) {
        return [...store.settings.values()]
          .filter((s) => s.organizationId === organizationId)
          .map(clone);
      },
      async save(setting) {
        store.settings.set(setting.id, clone(setting));
      },
    },
    audit: {
      async append(entry) {
        store.audit.push(clone(entry));
      },
      async listByOrg(organizationId, limit = 100) {
        return store.audit
          .filter((a) => a.organizationId === organizationId)
          .slice(-limit)
          .reverse()
          .map(clone);
      },
    },
    notifications: {
      async findById(id) {
        return store.notifications.get(id) ? clone(store.notifications.get(id)!) : null;
      },
      async listByOrg(organizationId, limit = 100) {
        return [...store.notifications.values()]
          .filter((n) => n.organizationId === organizationId)
          .slice(-limit)
          .reverse()
          .map(clone);
      },
      async save(n) {
        store.notifications.set(n.id, clone(n));
      },
    },
    notificationOutbox: {
      async listPending(limit) {
        const now = Date.now();
        return [...store.notificationOutbox.values()]
          .filter((o) => Date.parse(o.nextAttemptAt) <= now)
          .slice(0, limit)
          .map(clone);
      },
      async save(o) {
        store.notificationOutbox.set(o.id, clone(o));
      },
    },
    savedViews: createCrud(store.savedViews),
    dashboardLayouts: createCrud(store.dashboardLayouts),
    alerts: {
      async findById(id) {
        return store.alerts.get(id) ? clone(store.alerts.get(id)!) : null;
      },
      async listByOrg(organizationId) {
        return [...store.alerts.values()]
          .filter((a) => a.organizationId === organizationId)
          .map(clone);
      },
      async save(alert) {
        store.alerts.set(alert.id, clone(alert));
      },
    },
    events: {
      async append(event) {
        store.events.push(clone(event));
      },
      async listByOrg(organizationId, limit = 100) {
        return store.events
          .filter((e) => e.organizationId === organizationId)
          .slice(-limit)
          .reverse()
          .map(clone);
      },
    },
    async commit() {},
  };
}

export function createSharedMemoryUnitOfWork(): OpsUnitOfWork {
  const g = globalThis as { __pergonOpsStore?: OpsMemoryStore };
  if (!g.__pergonOpsStore) g.__pergonOpsStore = new OpsMemoryStore();
  return createMemoryUnitOfWork(g.__pergonOpsStore);
}
