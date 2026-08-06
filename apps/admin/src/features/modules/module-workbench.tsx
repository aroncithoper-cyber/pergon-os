"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { Badge } from "@pergon/ui/components/badge";
import { Button } from "@pergon/ui/components/button";
import { Checkbox } from "@pergon/ui/components/checkbox";
import { DataTable, type DataTableColumn } from "@pergon/ui/components/data-table";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@pergon/ui/components/drawer";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { ErrorState } from "@pergon/ui/components/error-state";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pergon/ui/components/select";
import { Separator } from "@pergon/ui/components/separator";
import { Textarea } from "@pergon/ui/components/textarea";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-provider";

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  csv?: string;
};

export type ModuleDefinition<T extends Record<string, unknown>> = {
  key: string;
  title: string;
  description: string;
  permission: string;
  listPath: string;
  listMethod?: "POST" | "GET";
  /** Extra fields merged into list POST body (e.g. action: "list"). */
  listBody?: Record<string, unknown>;
  searchFieldsHint?: string;
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  upsertPath?: string;
  upsertFields?: Array<{
    key: string;
    label: string;
    type?: "text" | "textarea" | "status";
    required?: boolean;
  }>;
  historyPath?: (row: T) => string | null;
  mode?: "list" | "actions";
  actions?: Array<{
    label: string;
    description: string;
    run: (ctx: { organizationId: string; apiFetch: typeof apiFetch }) => Promise<void>;
  }>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function ModuleWorkbench<T extends Record<string, unknown>>(props: {
  module: ModuleDefinition<T>;
}) {
  const { module } = props;
  const { context, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [result, setResult] = useState<PageResult<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerRow, setDrawerRow] = useState<T | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [savedViews, setSavedViews] = useState<Array<{ id: string; name: string }>>([]);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const canRead = hasPermission(module.permission);

  const load = useCallback(() => {
    if (!context || !canRead || module.mode === "actions") return;
    startTransition(async () => {
      setError(null);
      try {
        const raw = await apiFetch<PageResult<T> | T[]>(module.listPath, {
          method: module.listMethod ?? "POST",
          json:
            (module.listMethod ?? "POST") === "POST"
              ? {
                  organizationId: context.organizationId,
                  search: search || undefined,
                  pagination: { page, pageSize },
                  filters: [],
                  sort: [],
                  ...(module.listBody ?? {}),
                }
              : undefined,
        });
        if (Array.isArray(raw)) {
          setResult({
            items: raw,
            page: 1,
            pageSize: raw.length || pageSize,
            total: raw.length,
            totalPages: 1,
          });
        } else if (raw && typeof raw === "object" && Array.isArray(raw.items)) {
          setResult(raw);
        } else {
          setResult({ items: [], page: 1, pageSize, total: 0, totalPages: 0 });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
        setResult({ items: [], page: 1, pageSize, total: 0, totalPages: 0 });
      }
    });
  }, [canRead, context, module, page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!context || !hasPermission("dashboard:read")) return;
    void apiFetch<Array<{ id: string; name: string; moduleKey?: string }>>(
      `/api/v1/saved-views?module=${encodeURIComponent(module.key)}`,
    )
      .then((data) => setSavedViews(Array.isArray(data) ? data : []))
      .catch(() => setSavedViews([]));
  }, [context, hasPermission, module.key]);

  useEffect(() => {
    if (!drawerRow || !module.historyPath) {
      setHistory([]);
      return;
    }
    const path = module.historyPath(drawerRow);
    if (!path) return;
    void apiFetch<unknown>(path)
      .then((data) => {
        const record = asRecord(data);
        const events = Array.isArray(record.events)
          ? record.events
          : Array.isArray(data)
            ? data
            : [];
        setHistory(events);
      })
      .catch(() => setHistory([]));
  }, [drawerRow, module]);

  const columns = useMemo<DataTableColumn<T>[]>(() => {
    const selectCol: DataTableColumn<T> = {
      id: "_select",
      header: "",
      className: "w-10",
      cell: (row) => {
        const key = module.getRowKey(row);
        return (
          <Checkbox
            checked={selected.has(key)}
            onCheckedChange={(checked) => {
              setSelected((prev) => {
                const next = new Set(prev);
                if (checked) next.add(key);
                else next.delete(key);
                return next;
              });
            }}
            aria-label="Seleccionar fila"
            onClick={(event) => event.stopPropagation()}
          />
        );
      },
    };
    return [selectCol, ...module.columns];
  }, [module, selected]);

  async function exportCsv() {
    if (!context || (module.listMethod ?? "POST") !== "POST") return;
    const data = await apiFetch<PageResult<T>>(module.listPath, {
      method: "POST",
      json: {
        organizationId: context.organizationId,
        search: search || undefined,
        pagination: { page: 1, pageSize: 200 },
        exportFormat: "csv",
        filters: [],
        sort: [],
        ...(module.listBody ?? {}),
      },
    });
    if (!data.csv) return;
    const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${module.key}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function saveView() {
    if (!context) return;
    const name = window.prompt("Nombre de la vista");
    if (!name) return;
    await apiFetch("/api/v1/saved-views", {
      method: "POST",
      json: {
        organizationId: context.organizationId,
        moduleKey: module.key,
        name,
        query: { search, pagination: { page, pageSize } },
      },
    });
    setActionMessage("Vista guardada");
  }

  async function saveUpsert() {
    if (!context || !module.upsertPath || !module.upsertFields) return;
    const payload: Record<string, unknown> = {
      organizationId: context.organizationId,
    };
    for (const field of module.upsertFields) {
      payload[field.key] = editDraft[field.key] ?? "";
    }
    if (drawerRow && "id" in drawerRow) {
      payload.id = drawerRow.id;
    }
    await apiFetch(module.upsertPath, { method: "PUT", json: payload });
    setDrawerRow(null);
    load();
  }

  if (!canRead) {
    return (
      <ErrorState
        title="Sin permiso"
        description={`Se requiere ${module.permission} para este módulo.`}
      />
    );
  }

  if (module.mode === "actions") {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="type-h2 text-foreground">{module.title}</h1>
          <p className="type-small text-muted-foreground max-w-2xl">{module.description}</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {(module.actions ?? []).map((action) => (
            <div
              key={action.label}
              className="border-border bg-background space-y-4 rounded-lg border p-5"
            >
              <div className="space-y-1.5">
                <p className="type-body text-foreground font-medium">{action.label}</p>
                <p className="type-small text-muted-foreground">{action.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!context) return;
                  void action
                    .run({ organizationId: context.organizationId, apiFetch })
                    .then(() => setActionMessage(`${action.label}: listo`))
                    .catch((err: unknown) =>
                      setActionMessage(err instanceof Error ? err.message : "Error al ejecutar"),
                    );
                }}
              >
                Ejecutar
              </Button>
            </div>
          ))}
        </div>
        {actionMessage ? (
          <p className="type-caption text-muted-foreground">{actionMessage}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="type-h2 text-foreground">{module.title}</h1>
          <p className="type-small text-muted-foreground max-w-2xl">{module.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {module.upsertPath ? (
            <Button
              size="sm"
              variant="signal"
              onClick={() => {
                setDrawerRow({} as T);
                setEditDraft({});
              }}
            >
              Nuevo
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => void exportCsv()}>
            Exportar
          </Button>
          <Button size="sm" variant="outline" onClick={() => void saveView()}>
            Guardar vista
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder={module.searchFieldsHint ?? "Buscar…"}
          className="max-w-sm"
        />
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            setPage(1);
            setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / pág
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {savedViews.length > 0 ? (
          <Badge variant="secondary">{savedViews.length} vistas</Badge>
        ) : null}
        {selected.size > 0 ? <Badge variant="outline">{selected.size} seleccionados</Badge> : null}
      </div>

      {error ? <ErrorState title="No se pudo cargar" description={error} /> : null}
      {pending && !result ? (
        <div className="space-y-3" aria-busy="true" aria-label="Cargando registros">
          <div className="bg-muted h-10 animate-pulse rounded-md" />
          <div className="bg-muted h-48 animate-pulse rounded-xl" />
        </div>
      ) : null}

      {result && result.items.length === 0 && !pending ? (
        <EmptyState
          title="Sin registros en este módulo"
          description="Ajuste la búsqueda o cree el primer registro cuando el flujo lo permita."
          action={
            module.upsertPath ? (
              <Button
                size="sm"
                variant="signal"
                onClick={() => {
                  setDrawerRow({} as T);
                  setEditDraft({});
                }}
              >
                Crear registro
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {result && result.items.length > 0 ? (
        <div className="border-border overflow-hidden border">
          <DataTable
            density="compact"
            data={result.items}
            columns={columns}
            getRowKey={(row) => module.getRowKey(row)}
            onRowClick={(row) => {
              setDrawerRow(row);
              const draft: Record<string, string> = {};
              for (const field of module.upsertFields ?? []) {
                draft[field.key] = String(row[field.key] ?? "");
              }
              setEditDraft(draft);
            }}
          />
        </div>
      ) : null}

      {result ? (
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {result.total} total · pág {result.page}/{Math.max(result.totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= result.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <Drawer open={Boolean(drawerRow)} onOpenChange={(open) => !open && setDrawerRow(null)}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Detalle · {module.title}</DrawerTitle>
            <DrawerDescription>
              Edición, timeline e historial desde APIs existentes.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-6 overflow-y-auto px-4 pb-4">
            {module.upsertFields ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">Edición</p>
                {module.upsertFields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        value={editDraft[field.key] ?? ""}
                        onChange={(e) =>
                          setEditDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={editDraft[field.key] ?? ""}
                        onChange={(e) =>
                          setEditDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : drawerRow ? (
              <pre className="bg-panel overflow-auto rounded-md p-3 text-xs">
                {JSON.stringify(drawerRow, null, 2)}
              </pre>
            ) : null}

            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">Timeline / historial</p>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Sin eventos o endpoint no disponible.
                </p>
              ) : (
                <ol className="border-border space-y-3 border-l pl-4">
                  {history.map((event, index) => {
                    const row = asRecord(event);
                    return (
                      <li key={String(row.id ?? index)} className="space-y-1">
                        <p className="text-sm font-medium">
                          {String(row.type ?? row.action ?? row.status ?? "Evento")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {String(row.occurredAt ?? row.createdAt ?? "")}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
          <DrawerFooter>
            {module.upsertPath ? <Button onClick={() => void saveUpsert()}>Guardar</Button> : null}
            <Button variant="outline" onClick={() => setDrawerRow(null)}>
              Cerrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
