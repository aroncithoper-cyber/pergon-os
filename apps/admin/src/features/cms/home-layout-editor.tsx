"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { CmsHomeDocumentRecord, CmsHomeSection } from "@pergon/cms/domain";
import {
  CMS_HOME_V1_BLOCK_LABELS,
  listHomeLayoutBlocks,
  reorderHomeBlock,
  setHomeBlockEnabled,
  type CmsHomeV1BlockType,
} from "@pergon/cms/domain";
import { Badge } from "@pergon/ui/components/badge";
import { Button } from "@pergon/ui/components/button";
import { ErrorState } from "@pergon/ui/components/error-state";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/features/auth/auth-provider";
import { apiFetch } from "@/lib/api-client";

function blockLabel(section: CmsHomeSection): string {
  if (section.type in CMS_HOME_V1_BLOCK_LABELS) {
    return CMS_HOME_V1_BLOCK_LABELS[section.type as CmsHomeV1BlockType];
  }
  return section.type;
}

/**
 * Home Layout composer — official V1 blocks only.
 * Reorder / enable / disable via simple buttons (no drag-and-drop).
 */
export function CmsHomeLayoutEditor() {
  const { context, hasPermission } = useAuth();
  const canRead = hasPermission("cms:read");
  const canWrite = hasPermission("cms:write");
  const canPublish = hasPermission("cms:publish");

  const [doc, setDoc] = useState<CmsHomeDocumentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (!context || !canRead) return;
    startTransition(async () => {
      setError(null);
      try {
        const data = await apiFetch<CmsHomeDocumentRecord>("/api/v1/cms/home?locale=es");
        setDoc(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar Layout");
      }
    });
  }, [canRead, context]);

  useEffect(() => {
    load();
  }, [load]);

  if (!canRead) {
    return (
      <ErrorState title="Sin permiso" description="Se requiere cms:read para el Layout del Home." />
    );
  }

  if (!doc && pending) return <LoadingBlock label="Cargando Layout…" />;
  if (error && !doc) return <ErrorState title="Error" description={error} />;
  if (!doc) return <LoadingBlock label="Cargando Layout…" />;

  const blocks = listHomeLayoutBlocks(doc.workingPayload);

  const persist = async (next: CmsHomeDocumentRecord["workingPayload"]) => {
    if (!context) throw new Error("Sin sesión");
    return apiFetch<CmsHomeDocumentRecord>("/api/v1/cms/home", {
      method: "PUT",
      json: {
        organizationId: context.organizationId,
        locale: "es",
        payload: next,
        expectedWorkingVersion: doc.workingVersion,
      },
    });
  };

  const applyLocal = (payload: CmsHomeDocumentRecord["workingPayload"]) => {
    setDoc({ ...doc, workingPayload: payload });
  };

  const move = (blockId: string, direction: "up" | "down") => {
    if (!canWrite) return;
    const next = reorderHomeBlock(doc.workingPayload, blockId, direction);
    applyLocal(next);
  };

  const toggle = (blockId: string, enabled: boolean) => {
    if (!canWrite) return;
    const next = setHomeBlockEnabled(doc.workingPayload, blockId, enabled);
    applyLocal(next);
  };

  const save = () => {
    if (!canWrite) return;
    startTransition(async () => {
      setError(null);
      setMessage(null);
      try {
        const data = await persist(doc.workingPayload);
        setDoc(data);
        setMessage("Layout guardado.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar");
      }
    });
  };

  const publish = () => {
    if (!canPublish || !context) return;
    startTransition(async () => {
      setError(null);
      setMessage(null);
      try {
        const saved = await persist(doc.workingPayload);
        setDoc(saved);
        const data = await apiFetch<{
          document: CmsHomeDocumentRecord;
          version: { versionNumber: number };
        }>("/api/v1/cms/home/publish", {
          method: "POST",
          json: { organizationId: context.organizationId, locale: "es" },
        });
        setDoc(data.document);
        setMessage(`Home publicado (v${data.version.versionNumber}).`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo publicar");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">Layout</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Orden y visibilidad de los bloques oficiales del Home. Sin HTML ni componentes
            arbitrarios.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{doc.status}</Badge>
            <Badge variant="outline">working v{doc.workingVersion}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <Button size="sm" variant="outline" disabled={pending} onClick={save}>
              Guardar
            </Button>
          ) : null}
          {canPublish ? (
            <Button size="sm" disabled={pending} onClick={publish}>
              Publicar
            </Button>
          ) : null}
        </div>
      </div>

      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <ul className="border-border divide-border divide-y rounded-md border">
        {blocks.map((block, index) => (
          <li key={block.id} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap">
            <span className="text-muted-foreground w-6 shrink-0 font-mono text-xs tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-medium">{blockLabel(block)}</p>
              <p className="text-muted-foreground truncate text-xs">
                {block.type} · {block.id}
              </p>
            </div>
            <Badge variant={block.enabled ? "secondary" : "outline"}>
              {block.enabled ? "Activo" : "Oculto"}
            </Badge>
            {canWrite ? (
              <div className="flex shrink-0 flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  disabled={index === 0 || pending}
                  onClick={() => move(block.id, "up")}
                  aria-label={`Mover ${blockLabel(block)} arriba`}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  disabled={index === blocks.length - 1 || pending}
                  onClick={() => move(block.id, "down")}
                  aria-label={`Mover ${blockLabel(block)} abajo`}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  disabled={pending}
                  onClick={() => toggle(block.id, !block.enabled)}
                  aria-label={
                    block.enabled ? `Ocultar ${blockLabel(block)}` : `Activar ${blockLabel(block)}`
                  }
                >
                  {block.enabled ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
