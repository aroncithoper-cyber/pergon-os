"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type {
  CmsFooterColumn,
  CmsFooterSection,
  CmsFooterSocialLink,
  CmsHomeDocumentRecord,
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

function getFooter(doc: CmsHomeDocumentRecord): CmsFooterSection | undefined {
  return doc.workingPayload.sections.find((s): s is CmsFooterSection => s.type === "footer");
}

function patchFooter(doc: CmsHomeDocumentRecord, footer: CmsFooterSection): CmsHomeDocumentRecord {
  return {
    ...doc,
    workingPayload: {
      ...doc.workingPayload,
      sections: doc.workingPayload.sections.map((s) => (s.type === "footer" ? footer : s)),
      footer: {
        brand: footer.brand,
        logoUrl: footer.logoUrl,
        description: footer.description,
        contact: footer.contact,
        social: footer.social,
        columns: footer.columns,
        privacyLabel: footer.privacyLabel,
        privacyHref: footer.privacyHref,
        termsLabel: footer.termsLabel,
        termsHref: footer.termsHref,
        copyright: footer.copyright,
        notices: footer.notices,
        blocks: footer.blocks,
      },
    },
  };
}

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Institutional Footer editor — CMS Home block only.
 */
export function CmsFooterEditor() {
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
        setError(err instanceof Error ? err.message : "Error al cargar Footer");
      }
    });
  }, [canRead, context]);

  useEffect(() => {
    load();
  }, [load]);

  if (!canRead) {
    return (
      <ErrorState title="Sin permiso" description="Se requiere cms:read para editar Footer." />
    );
  }

  if (!doc && pending) return <LoadingBlock label="Cargando Footer…" />;
  if (error && !doc) return <ErrorState title="Error" description={error} />;
  if (!doc) return <LoadingBlock label="Cargando Footer…" />;

  const footer = getFooter(doc);
  if (!footer) {
    return (
      <ErrorState title="Sin Footer" description="El documento Home no incluye el bloque footer." />
    );
  }

  const update = (patch: Partial<CmsFooterSection>) => {
    setDoc(patchFooter(doc, { ...footer, ...patch }));
  };

  const updateBlock = (key: keyof CmsFooterSection["blocks"], value: boolean) => {
    update({ blocks: { ...footer.blocks, [key]: value } });
  };

  const updateColumn = (index: number, patch: Partial<CmsFooterColumn>) => {
    const columns = footer.columns.map((col, i) => (i === index ? { ...col, ...patch } : col));
    update({ columns });
  };

  const updateColumnLinksText = (index: number, text: string) => {
    const links = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((p) => p.trim());
        return { label: label || "Link", href: href || "#" };
      });
    updateColumn(index, { links });
  };

  const columnLinksText = (col: CmsFooterColumn) =>
    col.links.map((l) => `${l.label} | ${l.href}`).join("\n");

  const socialText = footer.social.map((s) => `${s.label} | ${s.href}`).join("\n");

  const setSocialFromText = (text: string) => {
    const social: CmsFooterSocialLink[] = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((p) => p.trim());
        return { label: label || "Red", href: href || "#" };
      });
    update({ social });
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
        setMessage("Borrador de Footer guardado.");
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
          <h2 className="text-foreground text-lg font-semibold tracking-tight">Footer</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Footer institucional del Home. Marca, contacto, links y avisos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{doc.status}</Badge>
            <Badge variant="outline">{footer.enabled ? "Activo" : "Desactivado"}</Badge>
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
              Vista previa
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
            checked={footer.enabled}
            disabled={!canWrite}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          Activar Footer en el Home
        </label>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-3">
        <h3 className="text-foreground text-sm font-medium">Bloques visibles</h3>
        {(
          [
            ["brand", "Marca / descripción"],
            ["contact", "Contacto"],
            ["social", "Redes"],
            ["links", "Links rápidos"],
            ["legal", "Legal / copyright"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="border-border size-4 cursor-pointer"
              checked={footer.blocks[key]}
              disabled={!canWrite}
              onChange={(e) => updateBlock(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <h3 className="text-foreground text-sm font-medium">Marca</h3>
        <div className="space-y-1.5">
          <Label htmlFor="ft-brand">Nombre / marca</Label>
          <Input
            id="ft-brand"
            value={footer.brand}
            disabled={!canWrite}
            onChange={(e) => update({ brand: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ft-logo">Logo (URL)</Label>
          <Input
            id="ft-logo"
            value={footer.logoUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => update({ logoUrl: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ft-desc">Descripción</Label>
          <Textarea
            id="ft-desc"
            rows={3}
            value={footer.description}
            disabled={!canWrite}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <h3 className="text-foreground text-sm font-medium">Contacto</h3>
        <div className="space-y-1.5">
          <Label htmlFor="ft-emails">Correos (uno por línea)</Label>
          <Textarea
            id="ft-emails"
            rows={3}
            value={footer.contact.emails.join("\n")}
            disabled={!canWrite}
            onChange={(e) =>
              update({
                contact: { ...footer.contact, emails: linesToList(e.target.value) },
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ft-phones">Teléfonos (uno por línea)</Label>
          <Textarea
            id="ft-phones"
            rows={2}
            value={footer.contact.phones.join("\n")}
            disabled={!canWrite}
            onChange={(e) =>
              update({
                contact: { ...footer.contact, phones: linesToList(e.target.value) },
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ft-address">Dirección</Label>
          <Textarea
            id="ft-address"
            rows={2}
            value={footer.contact.address ?? ""}
            disabled={!canWrite}
            onChange={(e) =>
              update({
                contact: { ...footer.contact, address: e.target.value || undefined },
              })
            }
          />
        </div>
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <h3 className="text-foreground text-sm font-medium">Redes</h3>
        <p className="text-muted-foreground text-xs">Formato: Etiqueta | URL (una por línea)</p>
        <Textarea
          rows={4}
          value={socialText}
          disabled={!canWrite}
          onChange={(e) => setSocialFromText(e.target.value)}
        />
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-foreground text-sm font-medium">Links rápidos</h3>
          {canWrite ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending || footer.columns.length >= 6}
              onClick={() =>
                update({
                  columns: [
                    ...footer.columns,
                    { title: "Nueva columna", links: [{ label: "Productos", href: "#productos" }] },
                  ],
                })
              }
            >
              Añadir columna
            </Button>
          ) : null}
        </div>
        {footer.columns.map((col, index) => (
          <div
            key={`${col.title}-${index}`}
            className="border-border space-y-3 rounded-md border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted-foreground font-mono text-xs">
                Columna {String(index + 1).padStart(2, "0")}
              </p>
              {canWrite ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => update({ columns: footer.columns.filter((_, i) => i !== index) })}
                >
                  Quitar
                </Button>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ft-col-title-${index}`}>Título</Label>
              <Input
                id={`ft-col-title-${index}`}
                value={col.title}
                disabled={!canWrite}
                onChange={(e) => updateColumn(index, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ft-col-links-${index}`}>Links (Etiqueta | URL)</Label>
              <Textarea
                id={`ft-col-links-${index}`}
                rows={5}
                value={columnLinksText(col)}
                disabled={!canWrite}
                onChange={(e) => updateColumnLinksText(index, e.target.value)}
              />
            </div>
          </div>
        ))}
      </section>

      <Separator />

      <section className="grid max-w-2xl gap-4">
        <h3 className="text-foreground text-sm font-medium">Legal y avisos</h3>
        <div className="space-y-1.5">
          <Label htmlFor="ft-copyright">Copyright</Label>
          <Input
            id="ft-copyright"
            value={footer.copyright}
            disabled={!canWrite}
            onChange={(e) => update({ copyright: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ft-privacy-label">Aviso de privacidad</Label>
            <Input
              id="ft-privacy-label"
              value={footer.privacyLabel}
              disabled={!canWrite}
              onChange={(e) => update({ privacyLabel: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ft-privacy-href">Link privacidad</Label>
            <Input
              id="ft-privacy-href"
              value={footer.privacyHref}
              disabled={!canWrite}
              onChange={(e) => update({ privacyHref: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ft-terms-label">Términos</Label>
            <Input
              id="ft-terms-label"
              value={footer.termsLabel}
              disabled={!canWrite}
              onChange={(e) => update({ termsLabel: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ft-terms-href">Link términos</Label>
            <Input
              id="ft-terms-href"
              value={footer.termsHref}
              disabled={!canWrite}
              onChange={(e) => update({ termsHref: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ft-notices">Avisos</Label>
          <Textarea
            id="ft-notices"
            rows={3}
            value={footer.notices ?? ""}
            disabled={!canWrite}
            onChange={(e) => update({ notices: e.target.value || undefined })}
          />
        </div>
      </section>
    </div>
  );
}
