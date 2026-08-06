"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { ErrorState } from "@pergon/ui/components/error-state";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { cn } from "@pergon/ui/lib/utils";

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
  const otherWidgets = widgets.filter((w) => w.widgetKey !== "kpi");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-signal text-[10px] font-medium uppercase tracking-[0.24em]">
            Operación
          </p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Centro de control
          </h1>
          <p className="text-muted-foreground text-xs">
            Señales operativas en vivo · mismos endpoints
          </p>
        </div>
        <span className="bg-success/15 text-success inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
          <span className="bg-success animate-pergon-pulse size-1.5 rounded-full" aria-hidden />
          Live
        </span>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.length === 0 ? (
          <div className="glass-panel text-muted-foreground col-span-full rounded-xl px-4 py-6 text-sm">
            Sin KPIs todavía.
          </div>
        ) : (
          kpis.map((kpi, index) => (
            <motion.article
              key={kpi.key}
              className="glass-panel group relative overflow-hidden rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <div
                className="from-signal/15 to-cyan/20 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r"
                aria-hidden
              />
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.18em]">
                {kpi.key.replaceAll("_", " ")}
              </p>
              <p className="text-foreground mt-3 font-mono text-3xl tabular-nums tracking-tight">
                {kpi.value}
              </p>
            </motion.article>
          ))
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {otherWidgets.map((widget, index) => (
          <motion.article
            key={widget.widgetKey}
            className={cn(
              "glass-panel hover:border-signal/30 duration-ui rounded-xl border border-transparent p-4 transition-colors",
            )}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.03, duration: 0.3 }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-foreground text-xs font-medium uppercase tracking-[0.16em]">
                {widget.widgetKey.replaceAll("_", " ")}
              </h2>
              <span className="text-muted-foreground font-mono text-[10px] tabular-nums">
                {widget.fetchedAt.slice(11, 19)}
              </span>
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {summarize(widget.data)}
            </p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
