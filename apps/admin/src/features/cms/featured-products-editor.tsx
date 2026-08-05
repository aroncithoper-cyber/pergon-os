"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type {
  CmsFeaturedProductItem,
  CmsFeaturedProductsSection,
  CmsHomeDocumentRecord,
  CmsTechnologyMedia,
} from "@pergon/cms/domain";
import { Badge } from "@pergon/ui/components/badge";
import { Button } from "@pergon/ui/components/button";
import { ErrorState } from "@pergon/ui/components/error-state";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { Separator } from "@pergon/ui/components/separator";
import { Textarea } from "@pergon/ui/components/textarea";

import { useAuth } from "@/features/auth/auth-provider";
import { apiFetch } from "@/lib/api-client";

function emptyMedia(): CmsTechnologyMedia {
  return {
    mode: "none",
    loop: false,
    enableVideo: false,
    enableImage: false,
  };
}

function getFeatured(doc: CmsHomeDocumentRecord): CmsFeaturedProductsSection | undefined {
  return doc.workingPayload.sections.find(
    (s): s is CmsFeaturedProductsSection => s.type === "featured_products",
  );
}

function patchFeatured(
  doc: CmsHomeDocumentRecord,
  featured: CmsFeaturedProductsSection,
): CmsHomeDocumentRecord {
  return {
    ...doc,
    workingPayload: {
      ...doc.workingPayload,
      sections: doc.workingPayload.sections.map((s) =>
        s.type === "featured_products" ? featured : s,
      ),
    },
  };
}

function inferMode(videoUrl: string | undefined): CmsTechnologyMedia["mode"] {
  if (!videoUrl?.trim()) return "image";
  try {
    const host = new URL(videoUrl).hostname.replace(/^www\./, "");
    if (host.includes("youtu")) return "youtube";
    if (host.includes("vimeo")) return "vimeo";
  } catch {
    // ignore
  }
  return "file";
}

function newItem(sortOrder: number): CmsFeaturedProductItem {
  return {
    id: `featured-${crypto.randomUUID().slice(0, 8)}`,
    enabled: true,
    sortOrder,
    name: "Nueva unidad",
    description: "Descripción corta de la unidad.",
    benefit: "Beneficio principal.",
    href: "#productos",
    ctaLabel: "Ver detalle",
    media: emptyMedia(),
  };
}

/**
 * Featured Products editor — CMS Home block only.
 * Does not modify the product catalog.
 */
export function CmsFeaturedProductsEditor() {
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
        setError(err instanceof Error ? err.message : "Error al cargar Productos Destacados");
      }
    });
  }, [canRead, context]);

  useEffect(() => {
    load();
  }, [load]);

  if (!canRead) {
    return (
      <ErrorState
        title="Sin permiso"
        description="Se requiere cms:read para editar Productos Destacados."
      />
    );
  }

  if (!doc && pending) return <LoadingBlock label="Cargando Productos Destacados…" />;
  if (error && !doc) return <ErrorState title="Error" description={error} />;
  if (!doc) return <LoadingBlock label="Cargando Productos Destacados…" />;

  const featured = getFeatured(doc);
  if (!featured) {
    return (
      <ErrorState
        title="Sin Productos Destacados"
        description="El documento Home no incluye el bloque featured_products."
      />
    );
  }

  const items = [...(featured.items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const update = (patch: Partial<CmsFeaturedProductsSection>) => {
    setDoc(patchFeatured(doc, { ...featured, ...patch, items: patch.items ?? featured.items }));
  };

  const setItems = (next: CmsFeaturedProductItem[]) => {
    update({
      items: next.map((item, index) => ({ ...item, sortOrder: index })),
    });
  };

  const updateItem = (id: string, patch: Partial<CmsFeaturedProductItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateItemMedia = (id: string, patch: Partial<CmsTechnologyMedia>) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const nextMedia = { ...item.media, ...patch };
    if ("videoUrl" in patch) {
      nextMedia.mode = inferMode(nextMedia.videoUrl);
      if (nextMedia.videoUrl?.trim()) nextMedia.enableVideo = true;
    }
    if ("imageUrl" in patch && nextMedia.imageUrl?.trim()) {
      nextMedia.enableImage = true;
    }
    updateItem(id, { media: nextMedia });
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0) return;
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= items.length) return;
    const next = [...items];
    const a = next[index]!;
    const b = next[swap]!;
    next[index] = b;
    next[swap] = a;
    setItems(next);
  };

  const persistDraft = async () => {
    if (!context) throw new Error("Sin sesión");
    return apiFetch<CmsHomeDocumentRecord>("/api/v1/cms/home", {
      method: "PUT",
      json: {
        organizationId: context.organizationId,
        locale: "es",
        payload: doc.workingPayload,
        expectedWorkingVersion: doc.workingVersion,
      },
    });
  };

  const save = () => {
    if (!canWrite) return;
    startTransition(async () => {
      setError(null);
      setMessage(null);
      try {
        const data = await persistDraft();
        setDoc(data);
        setMessage("Borrador de Productos Destacados guardado.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar");
      }
    });
  };

  const preview = () => {
    if (!canWrite || !context) return;
    startTransition(async () => {
      setError(null);
      try {
        const saved = await persistDraft();
        setDoc(saved);
        const data = await apiFetch<{ previewUrl: string }>("/api/v1/cms/home/preview", {
          method: "POST",
          json: { organizationId: context.organizationId, locale: "es" },
        });
        window.open(data.previewUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo crear preview");
      }
    });
  };

  const publish = () => {
    if (!canPublish || !context) return;
    startTransition(async () => {
      setError(null);
      setMessage(null);
      try {
        const saved = await persistDraft();
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Productos Destacados
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Presentación editorial del Home. No modifica el catálogo de productos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{doc.status}</Badge>
            <Badge variant="outline">{featured.enabled ? "Activo" : "Desactivado"}</Badge>
            <Badge variant="outline">working v{doc.workingVersion}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <Button size="sm" variant="outline" disabled={pending} onClick={save}>
              Guardar
            </Button>
          ) : null}
          {canWrite ? (
            <Button size="sm" variant="outline" disabled={pending} onClick={preview}>
              Preview
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

      <section className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={featured.enabled}
            disabled={!canWrite}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          Activar bloque en el Home
        </label>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fp-title">Título de sección</Label>
          <Input
            id="fp-title"
            value={featured.title}
            disabled={!canWrite}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fp-subtitle">Subtítulo</Label>
          <Input
            id="fp-subtitle"
            value={featured.subtitle ?? ""}
            disabled={!canWrite}
            onChange={(e) => update({ subtitle: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fp-desc">Descripción</Label>
          <Textarea
            id="fp-desc"
            rows={3}
            value={featured.description}
            disabled={!canWrite}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-foreground text-sm font-medium">Productos seleccionados</h3>
          {canWrite ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending || items.length >= 12}
              onClick={() => setItems([...items, newItem(items.length)])}
            >
              Añadir producto
            </Button>
          ) : null}
        </div>

        {items.map((item, index) => (
          <div key={item.id} className="border-border max-w-2xl space-y-4 rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted-foreground font-mono text-xs">
                {String(index + 1).padStart(2, "0")} · {item.id}
              </p>
              <div className="flex flex-wrap gap-2">
                {canWrite ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === 0 || pending}
                      onClick={() => moveItem(item.id, "up")}
                    >
                      Subir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === items.length - 1 || pending}
                      onClick={() => moveItem(item.id, "down")}
                    >
                      Bajar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                    >
                      Quitar
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="border-border size-4 cursor-pointer"
                checked={item.enabled}
                disabled={!canWrite}
                onChange={(e) => updateItem(item.id, { enabled: e.target.checked })}
              />
              Visible en el Home
            </label>

            <div className="space-y-1.5">
              <Label htmlFor={`fp-name-${item.id}`}>Nombre</Label>
              <Input
                id={`fp-name-${item.id}`}
                value={item.name}
                disabled={!canWrite}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`fp-desc-${item.id}`}>Descripción corta</Label>
              <Textarea
                id={`fp-desc-${item.id}`}
                rows={2}
                value={item.description}
                disabled={!canWrite}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`fp-benefit-${item.id}`}>Beneficio principal</Label>
              <Input
                id={`fp-benefit-${item.id}`}
                value={item.benefit}
                disabled={!canWrite}
                onChange={(e) => updateItem(item.id, { benefit: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`fp-cta-${item.id}`}>CTA</Label>
                <Input
                  id={`fp-cta-${item.id}`}
                  value={item.ctaLabel}
                  disabled={!canWrite}
                  onChange={(e) => updateItem(item.id, { ctaLabel: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`fp-href-${item.id}`}>Link al detalle</Label>
                <Input
                  id={`fp-href-${item.id}`}
                  value={item.href}
                  disabled={!canWrite}
                  onChange={(e) => updateItem(item.id, { href: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-foreground text-sm font-medium">Media</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="border-border size-4 cursor-pointer"
                  checked={item.media.enableVideo}
                  disabled={!canWrite}
                  onChange={(e) => updateItemMedia(item.id, { enableVideo: e.target.checked })}
                />
                Activar video
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="border-border size-4 cursor-pointer"
                  checked={item.media.enableImage}
                  disabled={!canWrite}
                  onChange={(e) => updateItemMedia(item.id, { enableImage: e.target.checked })}
                />
                Activar imagen
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="border-border size-4 cursor-pointer"
                  checked={item.media.loop}
                  disabled={!canWrite}
                  onChange={(e) => updateItemMedia(item.id, { loop: e.target.checked })}
                />
                Loop de video
              </label>
              <div className="space-y-1.5">
                <Label htmlFor={`fp-video-${item.id}`}>URL de video</Label>
                <Input
                  id={`fp-video-${item.id}`}
                  value={item.media.videoUrl ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    updateItemMedia(item.id, { videoUrl: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`fp-image-${item.id}`}>URL de imagen</Label>
                <Input
                  id={`fp-image-${item.id}`}
                  value={item.media.imageUrl ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    updateItemMedia(item.id, { imageUrl: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`fp-poster-${item.id}`}>Poster</Label>
                <Input
                  id={`fp-poster-${item.id}`}
                  value={item.media.posterUrl ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    updateItemMedia(item.id, { posterUrl: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
