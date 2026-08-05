"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { CmsHomeDocumentRecord, CmsTechnologySection } from "@pergon/cms/domain";
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

function getTechnology(doc: CmsHomeDocumentRecord): CmsTechnologySection | undefined {
  return doc.workingPayload.sections.find(
    (s): s is CmsTechnologySection => s.type === "technology",
  );
}

function patchTechnology(
  doc: CmsHomeDocumentRecord,
  tech: CmsTechnologySection,
): CmsHomeDocumentRecord {
  return {
    ...doc,
    workingPayload: {
      ...doc.workingPayload,
      sections: doc.workingPayload.sections.map((s) => (s.type === "technology" ? tech : s)),
    },
  };
}

function inferMode(videoUrl: string | undefined): CmsTechnologySection["media"]["mode"] {
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
 * Technology Editor — CMS Home block fields only.
 * Reuses existing Home draft/publish pipeline.
 */
export function CmsTechnologyEditor() {
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
        setError(err instanceof Error ? err.message : "Error al cargar Tecnología");
      }
    });
  }, [canRead, context]);

  useEffect(() => {
    load();
  }, [load]);

  if (!canRead) {
    return (
      <ErrorState title="Sin permiso" description="Se requiere cms:read para editar Tecnología." />
    );
  }

  if (!doc && pending) return <LoadingBlock label="Cargando Tecnología…" />;
  if (error && !doc) return <ErrorState title="Error" description={error} />;
  if (!doc) return <LoadingBlock label="Cargando Tecnología…" />;

  const tech = getTechnology(doc);
  if (!tech) {
    return (
      <ErrorState
        title="Sin Tecnología"
        description="El documento Home no incluye el bloque technology."
      />
    );
  }

  const update = (patch: Partial<CmsTechnologySection>) => {
    setDoc(patchTechnology(doc, { ...tech, ...patch }));
  };

  const updateMedia = (patch: Partial<CmsTechnologySection["media"]>) => {
    const nextMedia = { ...tech.media, ...patch };
    if ("videoUrl" in patch) {
      nextMedia.mode = inferMode(nextMedia.videoUrl);
      if (nextMedia.videoUrl?.trim()) nextMedia.enableVideo = true;
    }
    if ("imageUrl" in patch && nextMedia.imageUrl?.trim()) {
      nextMedia.enableImage = true;
    }
    update({ media: nextMedia });
  };

  const updateChapter = (id: string, patch: { title?: string; body?: string }) => {
    update({
      chapters: tech.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
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
        setMessage("Borrador de Tecnología guardado.");
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
          <h2 className="text-foreground text-lg font-semibold tracking-tight">Tecnología</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Bloque editorial del sistema: QR, Pasaporte, Verificación y Trazabilidad.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{doc.status}</Badge>
            <Badge variant="outline">{tech.enabled ? "Activo" : "Desactivado"}</Badge>
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

      <section className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={tech.enabled}
            disabled={!canWrite}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          Activar bloque en el Home
        </label>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tech-title">Título</Label>
          <Input
            id="tech-title"
            value={tech.title}
            disabled={!canWrite}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tech-subtitle">Subtítulo</Label>
          <Input
            id="tech-subtitle"
            value={tech.subtitle}
            disabled={!canWrite}
            onChange={(e) => update({ subtitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tech-desc">Descripción</Label>
          <Textarea
            id="tech-desc"
            rows={3}
            value={tech.description}
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
            checked={tech.media.enableVideo}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ enableVideo: e.target.checked })}
          />
          Activar video
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={tech.media.enableImage}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ enableImage: e.target.checked })}
          />
          Activar imagen
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-border size-4 cursor-pointer"
            checked={tech.media.loop}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ loop: e.target.checked })}
          />
          Loop de video
        </label>
        <div className="space-y-1.5">
          <Label htmlFor="tech-video">URL de video</Label>
          <Input
            id="tech-video"
            placeholder="YouTube, Vimeo o archivo"
            value={tech.media.videoUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ videoUrl: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tech-image">URL de imagen</Label>
          <Input
            id="tech-image"
            value={tech.media.imageUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => updateMedia({ imageUrl: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tech-poster">Poster</Label>
          <Input
            id="tech-poster"
            value={tech.media.posterUrl ?? ""}
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
            <Label htmlFor="tech-cta-label">Etiqueta</Label>
            <Input
              id="tech-cta-label"
              value={tech.primaryCta.label}
              disabled={!canWrite}
              onChange={(e) =>
                update({ primaryCta: { ...tech.primaryCta, label: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tech-cta-href">Href</Label>
            <Input
              id="tech-cta-href"
              value={tech.primaryCta.href}
              disabled={!canWrite}
              onChange={(e) => update({ primaryCta: { ...tech.primaryCta, href: e.target.value } })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tech-cta2-label">CTA secundario (opcional)</Label>
            <Input
              id="tech-cta2-label"
              value={tech.secondaryCta?.label ?? ""}
              disabled={!canWrite}
              onChange={(e) =>
                update({
                  secondaryCta: {
                    label: e.target.value,
                    href: tech.secondaryCta?.href ?? "#",
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tech-cta2-href">Href secundario</Label>
            <Input
              id="tech-cta2-href"
              value={tech.secondaryCta?.href ?? ""}
              disabled={!canWrite}
              onChange={(e) =>
                update({
                  secondaryCta: {
                    label: tech.secondaryCta?.label ?? "",
                    href: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-6">
        <h3 className="text-foreground text-sm font-medium">
          Pilares (QR · Pasaporte · Verificación · Trazabilidad)
        </h3>
        {tech.chapters.map((chapter, index) => (
          <div key={chapter.id} className="border-border space-y-3 rounded-md border p-4">
            <p className="text-muted-foreground font-mono text-xs">
              {String(index + 1).padStart(2, "0")} · {chapter.id}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor={`ch-title-${chapter.id}`}>Título</Label>
              <Input
                id={`ch-title-${chapter.id}`}
                value={chapter.title}
                disabled={!canWrite}
                onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ch-body-${chapter.id}`}>Descripción</Label>
              <Textarea
                id={`ch-body-${chapter.id}`}
                rows={3}
                value={chapter.body}
                disabled={!canWrite}
                onChange={(e) => updateChapter(chapter.id, { body: e.target.value })}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
