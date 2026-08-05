"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { CmsExpertSection, CmsHomeDocumentRecord } from "@pergon/cms/domain";
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

function getExpert(doc: CmsHomeDocumentRecord): CmsExpertSection | undefined {
  return doc.workingPayload.sections.find((s): s is CmsExpertSection => s.type === "expert");
}

function patchExpert(doc: CmsHomeDocumentRecord, expert: CmsExpertSection): CmsHomeDocumentRecord {
  return {
    ...doc,
    workingPayload: {
      ...doc.workingPayload,
      sections: doc.workingPayload.sections.map((s) => (s.type === "expert" ? expert : s)),
    },
  };
}

function inferMode(videoUrl: string | undefined): CmsExpertSection["media"]["mode"] {
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

/**
 * Home Expert block editor — editorial CMS fields only.
 * Does not modify the Expert chat product.
 */
export function CmsExpertHomeEditor() {
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
        setError(err instanceof Error ? err.message : "Error al cargar PerGon Expert");
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
        description="Se requiere cms:read para editar PerGon Expert."
      />
    );
  }

  if (!doc && pending) return <LoadingBlock label="Cargando PerGon Expert…" />;
  if (error && !doc) return <ErrorState title="Error" description={error} />;
  if (!doc) return <LoadingBlock label="Cargando PerGon Expert…" />;

  const expert = getExpert(doc);
  if (!expert) {
    return (
      <ErrorState
        title="Sin PerGon Expert"
        description="El documento Home no incluye el bloque expert."
      />
    );
  }

  const update = (patch: Partial<CmsExpertSection>) => {
    setDoc(patchExpert(doc, { ...expert, ...patch }));
  };

  const updateMedia = (patch: Partial<CmsExpertSection["media"]>) => {
    const nextMedia = { ...expert.media, ...patch };
    if ("videoUrl" in patch) {
      nextMedia.mode = inferMode(nextMedia.videoUrl);
      if (nextMedia.videoUrl?.trim()) nextMedia.enableVideo = true;
    }
    if ("imageUrl" in patch && nextMedia.imageUrl?.trim()) {
      nextMedia.enableImage = true;
    }
    update({ media: nextMedia });
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
        setMessage("Borrador de PerGon Expert guardado.");
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
          <h2 className="text-foreground text-lg font-semibold tracking-tight">PerGon Expert</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Bloque editorial del Home. No modifica el chat ni el producto Expert interno.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{doc.status}</Badge>
            <Badge variant="outline">{expert.enabled ? "Activo" : "Desactivado"}</Badge>
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
            checked={expert.enabled}
            disabled={!canWrite}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          Activar bloque en el Home
        </label>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ex-title">Título</Label>
          <Input
            id="ex-title"
            value={expert.title}
            disabled={!canWrite}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ex-subtitle">Subtítulo</Label>
          <Input
            id="ex-subtitle"
            value={expert.subtitle ?? ""}
            disabled={!canWrite}
            onChange={(e) => update({ subtitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ex-desc">Descripción</Label>
          <Textarea
            id="ex-desc"
            rows={4}
            value={expert.description ?? ""}
            disabled={!canWrite}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <h3 className="text-foreground text-sm font-medium">Media</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={expert.media.enableVideo}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ enableVideo: e.target.checked })}
          />
          Activar video
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={expert.media.enableImage}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ enableImage: e.target.checked })}
          />
          Activar imagen
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={expert.media.loop}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ loop: e.target.checked })}
          />
          Loop de video
        </label>
        <div className="space-y-1.5">
          <Label htmlFor="ex-video">URL de video</Label>
          <Input
            id="ex-video"
            placeholder="YouTube, Vimeo o archivo"
            value={expert.media.videoUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ videoUrl: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ex-image">URL de imagen</Label>
          <Input
            id="ex-image"
            value={expert.media.imageUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ imageUrl: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ex-poster">Poster</Label>
          <Input
            id="ex-poster"
            value={expert.media.posterUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ posterUrl: e.target.value || undefined })}
          />
        </div>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <h3 className="text-foreground text-sm font-medium">CTA</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ex-cta-label">Etiqueta</Label>
            <Input
              id="ex-cta-label"
              value={expert.primaryCta.label}
              disabled={!canWrite}
              onChange={(e) =>
                update({ primaryCta: { ...expert.primaryCta, label: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-cta-href">Href</Label>
            <Input
              id="ex-cta-href"
              value={expert.primaryCta.href}
              disabled={!canWrite}
              onChange={(e) =>
                update({ primaryCta: { ...expert.primaryCta, href: e.target.value } })
              }
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ex-cta2-label">CTA secundario (opcional)</Label>
            <Input
              id="ex-cta2-label"
              value={expert.secondaryCta?.label ?? ""}
              disabled={!canWrite}
              onChange={(e) =>
                update({
                  secondaryCta: {
                    label: e.target.value,
                    href: expert.secondaryCta?.href ?? "#",
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-cta2-href">Href secundario</Label>
            <Input
              id="ex-cta2-href"
              value={expert.secondaryCta?.href ?? ""}
              disabled={!canWrite}
              onChange={(e) =>
                update({
                  secondaryCta: {
                    label: expert.secondaryCta?.label ?? "",
                    href: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
