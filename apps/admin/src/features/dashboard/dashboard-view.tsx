"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ErrorState } from "@pergon/ui/components/error-state";
import { Skeleton } from "@pergon/ui/components/skeleton";
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

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando centro de control">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const { context, hasPermission } = useAuth();
  const reduce = useReducedMotion();
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
      <ErrorState
        title="Sin acceso al centro de control"
        description="Se requiere el permiso dashboard:read."
      />
    );
  }

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return <ErrorState title="Centro de control no disponible" description={error} />;
  }

  const kpiWidget = widgets.find((w) => w.widgetKey === "kpi");
  const kpis = Array.isArray(kpiWidget?.data.kpis)
    ? (kpiWidget.data.kpis as Array<{ key: string; value: number }>)
    : [];
  const otherWidgets = widgets.filter((w) => w.widgetKey !== "kpi");

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-signal text-[10px] font-medium uppercase tracking-[0.24em]">
            Sistema operativo
          </p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
            Centro de control
          </h1>
          <p className="text-muted-foreground text-sm">
            Señales operativas en vivo · mismos endpoints
          </p>
        </div>
        <span className="bg-success/15 text-success inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider">
          <span className="bg-success size-1.5 rounded-full" aria-hidden />
          Live
        </span>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.length === 0 ? (
          <div className="border-border/60 bg-panel/25 text-muted-foreground col-span-full rounded-xl border border-dashed px-4 py-8 text-center text-sm">
            Sin KPIs todavía. Cuando el dominio publique señales, aparecerán aquí.
          </div>
        ) : (
          kpis.map((kpi, index) => (
            <motion.article
              key={kpi.key}
              className="border-border bg-background hover:border-foreground/20 group relative overflow-hidden rounded-lg border p-5 transition-colors"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02, duration: 0.25 }}
            >
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.18em]">
                {kpi.key.replaceAll("_", " ")}
              </p>
              <p className="text-foreground mt-4 font-mono text-3xl tabular-nums tracking-tight">
                {kpi.value}
              </p>
            </motion.article>
          ))
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {otherWidgets.map((widget, index) => (
          <motion.article
            key={widget.widgetKey}
            className={cn(
              "border-border bg-background duration-ui hover:border-foreground/20 rounded-lg border p-5 transition-colors",
            )}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.04 + index * 0.02, duration: 0.25 }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-foreground text-xs font-medium uppercase tracking-[0.16em]">
                {widget.widgetKey.replaceAll("_", " ")}
              </h2>
              <span className="text-muted-foreground font-mono text-[10px] tabular-nums">
                {widget.fetchedAt.slice(11, 19)}
              </span>
            </div>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              {summarize(widget.data)}
            </p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
