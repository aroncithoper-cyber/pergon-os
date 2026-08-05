import type { OrganizationId } from "../../domain/base";
import type {
  AlertRecord,
  AutomationRunRecord,
  DashboardLayoutRecord,
  DashboardWidgetInstance,
  InventoryLevelRecord,
  NotificationRecord,
  ProductionOrderRecord,
  StockMoveRecord,
} from "../../domain/models";

export const DASHBOARD_WIDGET_KEYS = [
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
] as const;

export type DashboardWidgetKey = (typeof DASHBOARD_WIDGET_KEYS)[number];

export type WidgetDataRequest = {
  organizationId: OrganizationId;
  widgetKey: DashboardWidgetKey;
  config?: Record<string, unknown>;
};

export type WidgetDataResult = {
  widgetKey: DashboardWidgetKey;
  fetchedAt: string;
  data: Record<string, unknown>;
};

export type DashboardDataSources = {
  listAlerts(organizationId: string): Promise<AlertRecord[]>;
  listProductionOrders(organizationId: string): Promise<ProductionOrderRecord[]>;
  listInventory(organizationId: string): Promise<InventoryLevelRecord[]>;
  listStockMoves(organizationId: string, limit: number): Promise<StockMoveRecord[]>;
  listAutomationRuns(organizationId: string, limit: number): Promise<AutomationRunRecord[]>;
  listNotifications(organizationId: string, limit: number): Promise<NotificationRecord[]>;
  countScans?(organizationId: string): Promise<number>;
  sumSales?(organizationId: string): Promise<number>;
  countAiSessions?(organizationId: string): Promise<number>;
};

type WidgetResolver = (
  sources: DashboardDataSources,
  req: WidgetDataRequest,
) => Promise<Record<string, unknown>>;

const resolvers: Record<DashboardWidgetKey, WidgetResolver> = {
  async kpi(sources, req) {
    const [inventory, production, alerts] = await Promise.all([
      sources.listInventory(req.organizationId),
      sources.listProductionOrders(req.organizationId),
      sources.listAlerts(req.organizationId),
    ]);
    const openAlerts = alerts.filter((a) => a.status === "open").length;
    const inProgress = production.filter((p) => p.status === "in_progress").length;
    const onHand = inventory.reduce((s, i) => s + i.quantity, 0);
    return {
      kpis: [
        { key: "inventory_on_hand", value: onHand },
        { key: "production_in_progress", value: inProgress },
        { key: "open_alerts", value: openAlerts },
        {
          key: "qr_scans",
          value: sources.countScans ? await sources.countScans(req.organizationId) : 0,
        },
      ],
    };
  },
  async chart(sources, req) {
    const moves = await sources.listStockMoves(req.organizationId, 100);
    const byDay: Record<string, number> = {};
    for (const m of moves) {
      const day = m.createdAt.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + Math.abs(m.quantity);
    }
    return {
      series: Object.entries(byDay).map(([date, value]) => ({ date, value })),
      metric: (req.config?.metric as string) ?? "stock_moves",
    };
  },
  async activity(sources, req) {
    const moves = await sources.listStockMoves(req.organizationId, 20);
    return {
      items: moves.map((m) => ({
        id: m.id,
        type: "stock_move",
        summary: `${m.type} ${m.quantity}`,
        at: m.createdAt,
      })),
    };
  },
  async alerts(sources, req) {
    const alerts = await sources.listAlerts(req.organizationId);
    return {
      items: alerts.filter((a) => a.status === "open").slice(0, 20),
    };
  },
  async production(sources, req) {
    const orders = await sources.listProductionOrders(req.organizationId);
    return {
      items: orders
        .filter((o) => o.status === "planned" || o.status === "in_progress")
        .slice(0, 20),
    };
  },
  async inventory(sources, req) {
    const levels = await sources.listInventory(req.organizationId);
    const low = levels
      .filter((l) => l.quantity - l.reserved <= Number(req.config?.threshold ?? 10))
      .slice(0, 20);
    return { items: low, threshold: Number(req.config?.threshold ?? 10) };
  },
  async sales(sources, req) {
    const total = sources.sumSales ? await sources.sumSales(req.organizationId) : 0;
    return { total, currency: (req.config?.currency as string) ?? "MXN" };
  },
  async qr_scans(sources, req) {
    const count = sources.countScans ? await sources.countScans(req.organizationId) : 0;
    return { count };
  },
  async ai(sources, req) {
    const count = sources.countAiSessions ? await sources.countAiSessions(req.organizationId) : 0;
    return { sessions: count };
  },
  async automations(sources, req) {
    const runs = await sources.listAutomationRuns(req.organizationId, 20);
    return {
      items: runs,
      failed: runs.filter((r) => r.status === "failed").length,
    };
  },
};

/** Dashboard engine — each widget fetches data independently. */
export function createDashboardEngine(sources: DashboardDataSources) {
  return {
    listWidgetKeys(): DashboardWidgetKey[] {
      return [...DASHBOARD_WIDGET_KEYS];
    },

    async fetchWidget(req: WidgetDataRequest): Promise<WidgetDataResult> {
      const resolver = resolvers[req.widgetKey];
      const data = await resolver(sources, req);
      return {
        widgetKey: req.widgetKey,
        fetchedAt: new Date().toISOString(),
        data,
      };
    },

    async fetchLayoutWidgets(layout: DashboardLayoutRecord): Promise<WidgetDataResult[]> {
      return Promise.all(
        layout.widgets.map((w: DashboardWidgetInstance) =>
          this.fetchWidget({
            organizationId: layout.organizationId,
            widgetKey: w.widgetKey as DashboardWidgetKey,
            config: w.config,
          }),
        ),
      );
    },
  };
}

export type DashboardEngine = ReturnType<typeof createDashboardEngine>;
