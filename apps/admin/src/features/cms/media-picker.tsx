"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { CmsMediaAssetRecord, CmsMediaKind } from "@pergon/cms/domain";
import { CMS_MEDIA_KINDS } from "@pergon/cms/domain";
import { Button } from "@pergon/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pergon/ui/components/dialog";
import { Input } from "@pergon/ui/components/input";
import { LoadingBlock } from "@pergon/ui/components/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pergon/ui/components/select";

import { apiFetch } from "@/lib/api-client";

type MediaListResult = { items: CmsMediaAssetRecord[]; total: number };

const KIND_LABEL: Record<CmsMediaKind, string> = {
  image: "Imágenes",
  video: "Videos",
  poster: "Posters",
  document: "Documentos",
  logo: "Logos",
};

export type CmsMediaPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Restrict kinds shown (default: all). */
  kinds?: CmsMediaKind[];
  title?: string;
  description?: string;
  onSelect: (asset: CmsMediaAssetRecord) => void;
};

/**
 * Reusable media selector for any CMS module (Hero, Products, Promos, etc.).
 * Marks asset as recently used on select.
 */
export function CmsMediaPicker({
  open,
  onOpenChange,
  kinds,
  title = "Seleccionar media",
  description = "Elige un recurso de la biblioteca CMS para reutilizar.",
  onSelect,
}: CmsMediaPickerProps) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<CmsMediaKind | "all">("all");
  const [items, setItems] = useState<CmsMediaAssetRecord[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allowedKinds = kinds?.length ? kinds : [...CMS_MEDIA_KINDS];

  const load = useCallback(() => {
    if (!open) return;
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        const effectiveKind = kind !== "all" ? kind : undefined;
        if (effectiveKind) params.set("kind", effectiveKind);
        params.set("sort", "recent");
        params.set("limit", "60");
        const data = await apiFetch<MediaListResult>(`/api/v1/cms/media?${params}`);
        const filtered =
          kind === "all" && kinds?.length
            ? data.items.filter((a) => kinds.includes(a.kind))
            : data.items;
        setItems(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      }
    });
  }, [kind, kinds, open, search]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = (asset: CmsMediaAssetRecord) => {
    startTransition(async () => {
      try {
        await apiFetch<CmsMediaAssetRecord>(`/api/v1/cms/media/${asset.id}`, {
          method: "PATCH",
          json: { markUsed: true },
        });
      } catch {
        // Selection still proceeds; last_used is best-effort.
      }
      onSelect(asset);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Input
            className="h-8 max-w-xs"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={kind} onValueChange={(v) => setKind(v as CmsMediaKind | "all")}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {allowedKinds.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <div className="max-h-[50vh] overflow-y-auto">
          {pending && items.length === 0 ? (
            <LoadingBlock label="Cargando…" />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Sin resultados. Sube archivos en CMS → Media.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {items.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => choose(asset)}
                    className="border-border hover:border-foreground/40 focus-visible:ring-ring flex w-full cursor-pointer flex-col overflow-hidden rounded-md border text-left transition-colors focus-visible:outline-none focus-visible:ring-2"
                  >
                    <div className="bg-muted flex aspect-[4/3] items-center justify-center overflow-hidden">
                      {asset.kind !== "video" && asset.kind !== "document" && asset.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.url}
                          alt={asset.altText || asset.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground px-2 text-center text-[11px]">
                          {asset.kind}
                        </span>
                      )}
                    </div>
                    <span className="truncate px-2 py-1.5 text-xs font-medium">{asset.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
