"use client";

import { useEffect, useState } from "react";

import { ErrorState } from "@pergon/ui/components/error-state";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { Separator } from "@pergon/ui/components/separator";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-provider";

const WIDGET_KEYS = [
  "kpi",
  "activity",
  "alerts",
  "qr_scans",
  "production",
  "inventory",
  "sales",
  "ai",
  "automations",
] as const;

type WidgetResult = {
  widgetKey: string;
  fetchedAt: string;
  data: Record<string, unknown>;
};

function summarize(data: Record<string, unknown>): string {
  if (Array.isArray(data.items)) return `${data.items.length} ítems`;
  if (Array.isArray(data.kpis)) return `${data.kpis.length} KPIs`;
  if (typeof data.count === "number") return String(data.count);
  if (typeof data.failed === "number") return `${data.failed} fallidos`;
  const keys = Object.keys(data);
  return keys.length ? keys.slice(0, 4).join(" · ") : "sin datos";
}

export function DashboardView() {
  const { context, hasPermission } = useAuth();
  const [widgets, setWidgets] = useState<WidgetResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context || !hasPermission("dashboard:read")) {
      setLoading(false);
      return;
    }

    void Promise.all(
      WIDGET_KEYS.map((widgetKey) =>
        apiFetch<WidgetResult>("/api/v1/dashboard/widgets", {
          method: "POST",
          json: { organizationId: context.organizationId, widgetKey },
        }).catch(() => null),
      ),
    )
      .then((results) => {
        setWidgets(results.filter((item): item is WidgetResult => Boolean(item)));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error al cargar el panel");
      })
      .finally(() => setLoading(false));
  }, [context, hasPermission]);

  if (!hasPermission("dashboard:read")) {
    return (
      <ErrorState title="Sin permiso de dashboard" description="Se requiere dashboard:read." />
    );
  }

  if (loading) return <LoadingBlock label="Cargando centro de control…" />;
  if (error) return <ErrorState title="Panel" description={error} />;

  const kpiWidget = widgets.find((w) => w.widgetKey === "kpi");
  const kpis = Array.isArray(kpiWidget?.data.kpis)
    ? (kpiWidget.data.kpis as Array<{ key: string; value: number }>)
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            Centro de control
          </h1>
          <p className="text-muted-foreground text-xs">
            Señales operativas · widgets vía API existente
          </p>
        </div>
      </header>

      <section className="divide-border border-border divide-y border">
        {kpis.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-between px-3 py-2.5 text-xs">
            <span>KPIs</span>
            <span className="font-mono">0</span>
          </div>
        ) : (
          kpis.map((kpi) => (
            <div key={kpi.key} className="flex items-center justify-between gap-4 px-3 py-2.5">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                {kpi.key.replaceAll("_", " ")}
              </span>
              <span className="text-foreground font-mono text-sm tabular-nums">{kpi.value}</span>
            </div>
          ))
        )}
      </section>

      <Separator />

      <section className="divide-border border-border divide-y border">
        {widgets
          .filter((w) => w.widgetKey !== "kpi")
          .map((widget) => (
            <article
              key={widget.widgetKey}
              className="grid gap-1 px-3 py-2.5 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4"
            >
              <h2 className="text-foreground text-xs font-medium uppercase tracking-wide">
                {widget.widgetKey.replaceAll("_", " ")}
              </h2>
              <p className="text-muted-foreground truncate text-xs">{summarize(widget.data)}</p>
              <span className="text-muted-foreground font-mono text-[10px] tabular-nums">
                {widget.fetchedAt.slice(11, 19)}
              </span>
            </article>
          ))}
      </section>
    </div>
  );
}
