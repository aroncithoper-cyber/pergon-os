"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import type {
  CmsLogoVariant,
  CmsMediaAssetRecord,
  CmsMediaKind,
  CmsMediaSort,
  CmsVideoProvider,
} from "@pergon/cms/domain";
import { CMS_LOGO_VARIANTS, CMS_MEDIA_KINDS, CMS_VIDEO_PROVIDERS } from "@pergon/cms/domain";
import { Badge } from "@pergon/ui/components/badge";
import { Button } from "@pergon/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pergon/ui/components/dialog";
import { ErrorState } from "@pergon/ui/components/error-state";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";
import { LoadingBlock } from "@pergon/ui/components/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pergon/ui/components/select";
import { Separator } from "@pergon/ui/components/separator";
import { Textarea } from "@pergon/ui/components/textarea";
import {
  Copy,
  FileText,
  Grid2X2,
  Heart,
  ImageIcon,
  LayoutList,
  Link2,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import { useAuth } from "@/features/auth/auth-provider";
import { apiFetch, getAccessToken } from "@/lib/api-client";

type MediaListResult = { items: CmsMediaAssetRecord[]; total: number };
type ViewMode = "grid" | "list";

const KIND_LABEL: Record<CmsMediaKind, string> = {
  image: "Imágenes",
  video: "Videos",
  poster: "Posters",
  document: "Documentos",
  logo: "Logos",
};

const DOC_CATEGORIES = ["PDF", "Manual", "Ficha técnica"] as const;

function formatBytes(n?: number) {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function isVisual(kind: CmsMediaKind) {
  return kind === "image" || kind === "poster" || kind === "logo";
}

function KindIcon({ kind }: { kind: CmsMediaKind }) {
  if (kind === "video") return <Video className="size-4" aria-hidden />;
  if (kind === "document") return <FileText className="size-4" aria-hidden />;
  return <ImageIcon className="size-4" aria-hidden />;
}

/**
 * CMS Media Manager — single library for all Experience CMS surfaces.
 * Does not wire into Hero/Products; picker is available for other modules.
 */
export function CmsMediaManager() {
  const { context, hasPermission } = useAuth();
  const canRead =
    hasPermission("cms.media:read") || hasPermission("cms:read") || hasPermission("cms:write");
  const canWrite = hasPermission("cms.media:write") || hasPermission("cms:write");

  const [items, setItems] = useState<CmsMediaAssetRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<CmsMediaKind | "all">("all");
  const [category, setCategory] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<CmsMediaSort>("updated_desc");
  const [view, setView] = useState<ViewMode>("grid");

  const [selected, setSelected] = useState<CmsMediaAssetRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const load = useCallback(() => {
    if (!context || !canRead) return;
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (kind !== "all") params.set("kind", kind);
        if (category.trim()) params.set("category", category.trim());
        if (favoritesOnly) params.set("favoritesOnly", "1");
        params.set("sort", sort);
        params.set("limit", "100");
        const data = await apiFetch<MediaListResult>(`/api/v1/cms/media?${params}`);
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar media");
      }
    });
  }, [canRead, category, context, favoritesOnly, kind, search, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      flash("URL copiada");
    } catch {
      flash("No se pudo copiar");
    }
  };

  const toggleFavorite = (asset: CmsMediaAssetRecord) => {
    if (!canWrite) return;
    startTransition(async () => {
      try {
        const data = await apiFetch<CmsMediaAssetRecord>(`/api/v1/cms/media/${asset.id}`, {
          method: "PATCH",
          json: { action: "favorite" },
        });
        setItems((prev) => prev.map((a) => (a.id === data.id ? data : a)));
        if (selected?.id === data.id) setSelected(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al marcar favorito");
      }
    });
  };

  const removeAsset = (asset: CmsMediaAssetRecord) => {
    if (!canWrite) return;
    if (!window.confirm(`Eliminar «${asset.name}»?`)) return;
    startTransition(async () => {
      try {
        await apiFetch(`/api/v1/cms/media/${asset.id}`, { method: "DELETE" });
        setSelected(null);
        setPreviewOpen(false);
        flash("Eliminado");
        load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    });
  };

  const saveMeta = (patch: Partial<CmsMediaAssetRecord>) => {
    if (!canWrite || !selected) return;
    startTransition(async () => {
      try {
        const data = await apiFetch<CmsMediaAssetRecord>(`/api/v1/cms/media/${selected.id}`, {
          method: "PATCH",
          json: {
            name: patch.name,
            description: patch.description ?? null,
            altText: patch.altText ?? null,
            category: patch.category ?? null,
            tags: patch.tags,
            logoVariant: patch.logoVariant ?? null,
          },
        });
        setSelected(data);
        setItems((prev) => prev.map((a) => (a.id === data.id ? data : a)));
        flash("Metadatos guardados");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  };

  const openPreview = (asset: CmsMediaAssetRecord) => {
    setSelected(asset);
    setPreviewOpen(true);
  };

  if (!canRead) {
    return (
      <ErrorState
        title="Sin permiso"
        description="Se requiere cms.media:read o cms:read para el Media Manager."
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">Media</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Biblioteca multimedia del CMS. Reutilizable por Hero, Productos, Promociones, Academia,
            Blog, Footer, Tecnología y Expert.
          </p>
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setVideoOpen(true)}>
              <Link2 className="mr-1.5 size-3.5" aria-hidden />
              Registrar video
            </Button>
            <Button type="button" size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-1.5 size-3.5" aria-hidden />
              Subir archivo
            </Button>
          </div>
        ) : null}
      </header>

      <div className="border-border bg-background flex flex-col gap-3 border-b pb-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          className="h-8 max-w-xs"
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar media"
        />
        <Select value={kind} onValueChange={(v) => setKind(v as CmsMediaKind | "all")}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CMS_MEDIA_KINDS.map((k) => (
              <SelectItem key={k} value={k}>
                {KIND_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as CmsMediaSort)}>
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="Orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_desc">Más recientes</SelectItem>
            <SelectItem value="recent">Último uso</SelectItem>
            <SelectItem value="name_asc">Nombre A–Z</SelectItem>
            <SelectItem value="name_desc">Nombre Z–A</SelectItem>
            <SelectItem value="size_desc">Peso</SelectItem>
            <SelectItem value="updated_asc">Más antiguos</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="h-8 max-w-[140px]"
          placeholder="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filtrar categoría"
        />
        <Button
          type="button"
          size="sm"
          variant={favoritesOnly ? "default" : "outline"}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          <Star className="mr-1.5 size-3.5" aria-hidden />
          Favoritos
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
            aria-label="Vista grid"
          >
            <Grid2X2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            aria-label="Vista lista"
          >
            <LayoutList className="size-3.5" />
          </Button>
        </div>
      </div>

      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {pending && items.length === 0 ? (
        <LoadingBlock label="Cargando media…" />
      ) : items.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-md border border-dashed px-6 py-12 text-center text-sm">
          No hay archivos. {canWrite ? "Sube una imagen o registra un video." : null}
        </div>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                onClick={() => openPreview(asset)}
                className="border-border hover:border-foreground/30 focus-visible:ring-ring group flex w-full cursor-pointer flex-col overflow-hidden rounded-md border text-left transition-colors focus-visible:outline-none focus-visible:ring-2"
              >
                <div className="bg-muted relative flex aspect-[4/3] items-center justify-center overflow-hidden">
                  {isVisual(asset.kind) && asset.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <KindIcon kind={asset.kind} />
                  )}
                  {asset.isFavorite ? (
                    <Heart className="fill-foreground text-foreground absolute right-2 top-2 size-3.5" />
                  ) : null}
                </div>
                <div className="space-y-1 p-2.5">
                  <p className="text-foreground truncate text-sm font-medium">{asset.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {asset.kind}
                    </Badge>
                    <span className="text-muted-foreground truncate text-[11px]">
                      {formatBytes(asset.fileSizeBytes)}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-border overflow-hidden rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-border border-b text-xs">
              <tr>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">Categoría</th>
                <th className="hidden px-3 py-2 font-medium lg:table-cell">Peso</th>
                <th className="hidden px-3 py-2 font-medium lg:table-cell">Fecha</th>
                <th className="px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-border hover:bg-muted/30 border-b last:border-0"
                >
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-foreground cursor-pointer font-medium hover:underline"
                      onClick={() => openPreview(asset)}
                    >
                      {asset.isFavorite ? "★ " : null}
                      {asset.name}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">{asset.kind}</Badge>
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-2 md:table-cell">
                    {asset.category ?? "—"}
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-2 lg:table-cell">
                    {formatBytes(asset.fileSizeBytes)}
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-2 lg:table-cell">
                    {formatDate(asset.updatedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => void copyUrl(asset.url)}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      {canWrite ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => toggleFavorite(asset)}
                        >
                          <Star className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        {total} recurso{total === 1 ? "" : "s"}
      </p>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {KIND_LABEL[selected.kind]}
                  {selected.videoProvider ? ` · ${selected.videoProvider}` : ""}
                  {selected.logoVariant ? ` · ${selected.logoVariant}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted flex min-h-[160px] items-center justify-center overflow-hidden rounded-md">
                {isVisual(selected.kind) && selected.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.url}
                    alt={selected.altText || selected.name}
                    className="max-h-64 w-full object-contain"
                  />
                ) : selected.kind === "video" ? (
                  <p className="text-muted-foreground break-all px-4 text-center text-sm">
                    {selected.url}
                  </p>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-sm">
                    <FileText className="size-8" />
                    {selected.mimeType ?? "Documento"}
                  </div>
                )}
              </div>

              <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-foreground font-medium">Fecha</dt>
                  <dd>{formatDate(selected.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Peso</dt>
                  <dd>{formatBytes(selected.fileSizeBytes)}</dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Dimensiones</dt>
                  <dd>
                    {selected.width && selected.height
                      ? `${selected.width}×${selected.height}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Fuente</dt>
                  <dd>{selected.source}</dd>
                </div>
              </dl>

              <Separator />

              {canWrite ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="meta-name">Nombre</Label>
                    <Input
                      id="meta-name"
                      defaultValue={selected.name}
                      key={`name-${selected.id}-${selected.updatedAt}`}
                      onBlur={(e) => {
                        if (e.target.value !== selected.name) saveMeta({ name: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="meta-desc">Descripción</Label>
                    <Textarea
                      id="meta-desc"
                      defaultValue={selected.description ?? ""}
                      key={`desc-${selected.id}-${selected.updatedAt}`}
                      rows={2}
                      onBlur={(e) => {
                        const v = e.target.value || undefined;
                        if (v !== selected.description) saveMeta({ description: v });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta-alt">Alt</Label>
                    <Input
                      id="meta-alt"
                      defaultValue={selected.altText ?? ""}
                      key={`alt-${selected.id}-${selected.updatedAt}`}
                      onBlur={(e) => {
                        const v = e.target.value || undefined;
                        if (v !== selected.altText) saveMeta({ altText: v });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta-cat">Categoría</Label>
                    <Input
                      id="meta-cat"
                      list="doc-cats"
                      defaultValue={selected.category ?? ""}
                      key={`cat-${selected.id}-${selected.updatedAt}`}
                      onBlur={(e) => {
                        const v = e.target.value || undefined;
                        if (v !== selected.category) saveMeta({ category: v });
                      }}
                    />
                    <datalist id="doc-cats">
                      {DOC_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="meta-tags">Tags (coma)</Label>
                    <Input
                      id="meta-tags"
                      defaultValue={selected.tags.join(", ")}
                      key={`tags-${selected.id}-${selected.updatedAt}`}
                      onBlur={(e) => {
                        const tags = e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        if (tags.join(",") !== selected.tags.join(",")) saveMeta({ tags });
                      }}
                    />
                  </div>
                  {selected.kind === "logo" ? (
                    <div className="space-y-1.5">
                      <Label>Variante logo</Label>
                      <Select
                        value={selected.logoVariant ?? "light"}
                        onValueChange={(v) => saveMeta({ logoVariant: v as CmsLogoVariant })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CMS_LOGO_VARIANTS.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {selected.description || "Sin descripción"}
                </p>
              )}

              <DialogFooter className="flex-wrap gap-2 sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void copyUrl(selected.url)}
                  >
                    <Copy className="mr-1.5 size-3.5" />
                    Copiar URL
                  </Button>
                  {canWrite ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFavorite(selected)}
                    >
                      <Star className="mr-1.5 size-3.5" />
                      {selected.isFavorite ? "Quitar favorito" : "Favorito"}
                    </Button>
                  ) : null}
                </div>
                {canWrite ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeAsset(selected)}
                  >
                    <Trash2 className="mr-1.5 size-3.5" />
                    Eliminar
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onDone={() => {
          flash("Archivo subido");
          load();
        }}
        onError={setError}
      />
      <RegisterVideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        onDone={() => {
          flash("Video registrado");
          load();
        }}
        onError={setError}
      />
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  onDone,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [kind, setKind] = useState<Exclude<CmsMediaKind, "video">>("image");
  const [logoVariant, setLogoVariant] = useState<CmsLogoVariant>("light");
  const [name, setName] = useState("");
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const accept = useMemo(() => {
    if (kind === "document") return ".pdf,application/pdf";
    return "image/*";
  }, [kind]);

  const submit = async () => {
    if (!file) {
      onError("Selecciona un archivo");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("kind", kind);
      form.set("name", name.trim() || file.name);
      if (altText.trim()) form.set("altText", altText.trim());
      if (kind === "document") {
        form.set("category", category.trim() || "PDF");
      } else if (category.trim()) {
        form.set("category", category.trim());
      }
      if (kind === "logo") form.set("logoVariant", logoVariant);

      const headers = new Headers({ Accept: "application/json" });
      const token = getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const res = await fetch("/api/v1/cms/media", { method: "PUT", headers, body: form });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(payload.error?.message ?? "No fue posible subir el archivo.");

      setFile(null);
      setName("");
      setAltText("");
      setCategory("");
      onOpenChange(false);
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir archivo</DialogTitle>
          <DialogDescription>
            Imágenes, posters, documentos (PDF) y logos. Sin optimización ni storage avanzado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              value={kind}
              onValueChange={(v) => setKind(v as Exclude<CmsMediaKind, "video">)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagen</SelectItem>
                <SelectItem value="poster">Poster</SelectItem>
                <SelectItem value="document">Documento</SelectItem>
                <SelectItem value="logo">Logo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {kind === "logo" ? (
            <div className="space-y-1.5">
              <Label>Variante</Label>
              <Select
                value={logoVariant}
                onValueChange={(v) => setLogoVariant(v as CmsLogoVariant)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CMS_LOGO_VARIANTS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {kind === "document" ? (
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={category || "PDF"} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="up-name">Nombre</Label>
            <Input id="up-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="up-alt">Alt</Label>
            <Input id="up-alt" value={altText} onChange={(e) => setAltText(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="up-file">Archivo</Label>
            <Input
              id="up-file"
              type="file"
              accept={accept}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={busy || !file} onClick={() => void submit()}>
            {busy ? "Subiendo…" : "Subir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RegisterVideoDialog({
  open,
  onOpenChange,
  onDone,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState<CmsVideoProvider>("youtube");
  const [busy, setBusy] = useState(false);

  const inferProvider = (value: string): CmsVideoProvider => {
    try {
      const host = new URL(value).hostname.replace(/^www\./, "");
      if (host.includes("youtu")) return "youtube";
      if (host.includes("vimeo")) return "vimeo";
    } catch {
      // ignore
    }
    return "file";
  };

  const submit = async () => {
    if (!name.trim() || !url.trim()) {
      onError("Nombre y URL son obligatorios");
      return;
    }
    setBusy(true);
    try {
      await apiFetch<CmsMediaAssetRecord>("/api/v1/cms/media", {
        method: "POST",
        json: {
          kind: "video",
          source: "external",
          name: name.trim(),
          url: url.trim(),
          videoProvider: provider,
        },
      });
      setName("");
      setUrl("");
      onOpenChange(false);
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al registrar video");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar video</DialogTitle>
          <DialogDescription>
            Sin subida de archivo. Solo YouTube, Vimeo o URL de archivo propio.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="vid-name">Nombre</Label>
            <Input id="vid-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vid-url">URL</Label>
            <Input
              id="vid-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (e.target.value.trim()) setProvider(inferProvider(e.target.value));
              }}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Proveedor</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as CmsVideoProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CMS_VIDEO_PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={busy} onClick={() => void submit()}>
            {busy ? "Guardando…" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
