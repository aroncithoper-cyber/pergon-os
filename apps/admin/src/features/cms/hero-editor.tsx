"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { CmsHeroSection, CmsHomeDocumentRecord } from "@pergon/cms";
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

function getHero(doc: CmsHomeDocumentRecord): CmsHeroSection | undefined {
  return doc.workingPayload.sections.find((s): s is CmsHeroSection => s.type === "hero");
}

function patchHero(doc: CmsHomeDocumentRecord, hero: CmsHeroSection): CmsHomeDocumentRecord {
  return {
    ...doc,
    workingPayload: {
      ...doc.workingPayload,
      sections: doc.workingPayload.sections.map((s) => (s.type === "hero" ? hero : s)),
    },
  };
}

function inferMode(videoUrl: string | undefined): CmsHeroSection["media"]["mode"] {
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
 * Hero Editor — only Home hero fields.
 * Save / Preview / Publish keep the CMS pipeline; no other Home sections.
 */
export function CmsHeroEditor() {
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
        setError(err instanceof Error ? err.message : "Error al cargar Hero");
      }
    });
  }, [canRead, context]);

  useEffect(() => {
    load();
  }, [load]);

  if (!canRead) {
    return (
      <ErrorState title="Sin permiso" description="Se requiere cms:read para editar el Hero." />
    );
  }

  if (!doc && pending) return <LoadingBlock label="Cargando Hero…" />;
  if (error && !doc) return <ErrorState title="Error" description={error} />;
  if (!doc) return <LoadingBlock label="Cargando Hero…" />;

  const hero = getHero(doc);
  if (!hero) {
    return <ErrorState title="Sin Hero" description="El documento Home no incluye sección hero." />;
  }

  const updateHero = (patch: Partial<CmsHeroSection>) => {
    setDoc(patchHero(doc, { ...hero, ...patch }));
  };

  const updateMedia = (patch: Partial<CmsHeroSection["media"]>) => {
    const nextMedia = { ...hero.media, ...patch };
    if ("videoUrl" in patch) {
      nextMedia.mode = inferMode(nextMedia.videoUrl);
      if (nextMedia.videoUrl?.trim()) {
        nextMedia.enableVideo = true;
      }
    }
    if ("imageUrl" in patch && nextMedia.imageUrl?.trim()) {
      nextMedia.enableImage = true;
    }
    updateHero({ media: nextMedia });
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
        setMessage("Borrador del Hero guardado.");
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
        setMessage(`Hero publicado (v${data.version.versionNumber}).`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo publicar");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">Hero</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Edita el primer viewport del Home. La Web muestra solo lo publicado.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{doc.status}</Badge>
            <Badge variant="outline">{hero.enabled ? "Activo" : "Desactivado"}</Badge>
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
            checked={hero.enabled}
            disabled={!canWrite || pending}
            onChange={(e) => updateHero({ enabled: e.target.checked })}
          />
          Activar Hero en el Home
        </label>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-foreground text-sm font-medium tracking-tight">Copy</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-brand">Marca</Label>
            <Input
              id="hero-brand"
              value={hero.brand}
              disabled={!canWrite || pending}
              onChange={(e) => updateHero({ brand: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-title">Título</Label>
            <Input
              id="hero-title"
              value={hero.title}
              disabled={!canWrite || pending}
              onChange={(e) => updateHero({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-subtitle">Subtítulo</Label>
            <Textarea
              id="hero-subtitle"
              value={hero.subtitle}
              disabled={!canWrite || pending}
              onChange={(e) => updateHero({ subtitle: e.target.value })}
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-foreground text-sm font-medium tracking-tight">Botones</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cta-primary-label">CTA principal · texto</Label>
            <Input
              id="cta-primary-label"
              value={hero.primaryCta.label}
              disabled={!canWrite || pending}
              onChange={(e) =>
                updateHero({ primaryCta: { ...hero.primaryCta, label: e.target.value } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-primary-href">CTA principal · enlace</Label>
            <Input
              id="cta-primary-href"
              value={hero.primaryCta.href}
              disabled={!canWrite || pending}
              onChange={(e) =>
                updateHero({ primaryCta: { ...hero.primaryCta, href: e.target.value } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-secondary-label">CTA secundario · texto</Label>
            <Input
              id="cta-secondary-label"
              value={hero.secondaryCta?.label ?? ""}
              disabled={!canWrite || pending}
              onChange={(e) =>
                updateHero({
                  secondaryCta: {
                    label: e.target.value,
                    href: hero.secondaryCta?.href ?? "#",
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-secondary-href">CTA secundario · enlace</Label>
            <Input
              id="cta-secondary-href"
              value={hero.secondaryCta?.href ?? ""}
              disabled={!canWrite || pending}
              onChange={(e) =>
                updateHero({
                  secondaryCta: {
                    label: hero.secondaryCta?.label ?? "",
                    href: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-foreground text-sm font-medium tracking-tight">Media</h2>
        <p className="text-muted-foreground text-xs">
          Prioridad en Web: si hay video (YouTube / Vimeo / archivo), se muestra el video; si no, la
          imagen.
        </p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="border-border size-4 cursor-pointer"
              checked={hero.media.enableVideo}
              disabled={!canWrite || pending}
              onChange={(e) => updateMedia({ enableVideo: e.target.checked })}
            />
            Activar video
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="border-border size-4 cursor-pointer"
              checked={hero.media.enableImage}
              disabled={!canWrite || pending}
              onChange={(e) => updateMedia({ enableImage: e.target.checked })}
            />
            Activar imagen
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="border-border size-4 cursor-pointer"
              checked={hero.media.loop}
              disabled={!canWrite || pending}
              onChange={(e) => updateMedia({ loop: e.target.checked })}
            />
            Loop
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-video">Video (URL YouTube, Vimeo o archivo)</Label>
            <Input
              id="hero-video"
              placeholder="https://www.youtube.com/watch?v=… o https://vimeo.com/…"
              value={hero.media.videoUrl ?? ""}
              disabled={!canWrite || pending}
              onChange={(e) => updateMedia({ videoUrl: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-image">Imagen</Label>
            <Input
              id="hero-image"
              placeholder="https://…"
              value={hero.media.imageUrl ?? ""}
              disabled={!canWrite || pending}
              onChange={(e) => updateMedia({ imageUrl: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-poster">Poster</Label>
            <Input
              id="hero-poster"
              placeholder="https://…"
              value={hero.media.posterUrl ?? ""}
              disabled={!canWrite || pending}
              onChange={(e) => updateMedia({ posterUrl: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-alt">Texto alternativo del visual</Label>
            <Input
              id="hero-alt"
              value={hero.visualAlt ?? ""}
              disabled={!canWrite || pending}
              onChange={(e) => updateHero({ visualAlt: e.target.value })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
