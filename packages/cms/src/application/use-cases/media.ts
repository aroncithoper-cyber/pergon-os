import { formatZodError } from "@pergon/shared/i18n";
import { randomUUID } from "node:crypto";

import { z } from "zod";

import { CmsNotFoundError, CmsValidationError } from "../../domain/errors";
import type { CmsMediaAssetRecord } from "../../domain/models";
import {
  createMediaSchema,
  listMediaSchema,
  mediaIdSchema,
  updateMediaSchema,
} from "../../validation/schemas";
import type { CmsUnitOfWork } from "../ports";

function nowIso() {
  return new Date().toISOString();
}

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CmsValidationError(formatZodError(result.error));
  }
  return result.data;
}

function assertVideoRules(input: { kind: string; videoProvider?: string | null; url: string }) {
  if (input.kind !== "video") return;
  if (!input.videoProvider) {
    throw new CmsValidationError("El proveedor de video es obligatorio para activos de video.");
  }
  // Videos are registered by URL only (no binary upload in Media V1).
  if (!input.url.trim()) {
    throw new CmsValidationError("La URL de video es obligatoria.");
  }
}

function assertLogoRules(input: { kind: string; logoVariant?: string | null }) {
  if (input.kind !== "logo") return;
  if (!input.logoVariant) {
    throw new CmsValidationError("La variante de logo es obligatoria para activos de logo.");
  }
}

export async function listMediaAssets(uow: CmsUnitOfWork, input: unknown) {
  const query = parseOrThrow(listMediaSchema, {
    ...(input && typeof input === "object" ? input : {}),
    sort:
      input && typeof input === "object" && "sort" in input && (input as { sort?: string }).sort
        ? (input as { sort: string }).sort
        : "updated_desc",
    limit:
      input && typeof input === "object" && typeof (input as { limit?: number }).limit === "number"
        ? (input as { limit: number }).limit
        : 50,
    offset:
      input &&
      typeof input === "object" &&
      typeof (input as { offset?: number }).offset === "number"
        ? (input as { offset: number }).offset
        : 0,
  });
  return uow.mediaAssets.list(query);
}

export async function getMediaAsset(uow: CmsUnitOfWork, input: unknown) {
  const data = parseOrThrow(mediaIdSchema, input);
  const row = await uow.mediaAssets.findById(data.id);
  if (!row || row.organizationId !== data.organizationId || row.deletedAt) {
    throw new CmsNotFoundError("No encontramos ese archivo de medios.");
  }
  return row;
}

export async function createMediaAsset(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<CmsMediaAssetRecord> {
  const data = parseOrThrow(createMediaSchema, input);
  assertVideoRules(data);
  assertLogoRules(data);

  if (data.kind === "video" && data.source === "upload") {
    throw new CmsValidationError(
      "La carga de video no está soportada; registra una URL de YouTube, Vimeo o archivo.",
    );
  }

  const ts = nowIso();
  const record: CmsMediaAssetRecord = {
    id: randomUUID(),
    organizationId: data.organizationId,
    kind: data.kind,
    videoProvider: data.kind === "video" ? data.videoProvider : undefined,
    logoVariant: data.kind === "logo" ? data.logoVariant : undefined,
    source: data.source ?? (data.storagePath ? "upload" : "external"),
    name: data.name,
    description: data.description,
    altText: data.altText,
    category: data.category,
    tags: data.tags ?? [],
    url: data.url,
    storageBucket: data.storageBucket,
    storagePath: data.storagePath,
    mimeType: data.mimeType,
    fileSizeBytes: data.fileSizeBytes,
    width: data.width,
    height: data.height,
    isFavorite: data.isFavorite ?? false,
    metadata: data.metadata ?? {},
    createdAt: ts,
    updatedAt: ts,
    createdBy: data.actorId,
    updatedBy: data.actorId,
  };
  await uow.mediaAssets.save(record);
  return record;
}

export async function updateMediaAsset(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<CmsMediaAssetRecord> {
  const data = parseOrThrow(updateMediaSchema, input);
  const existing = await uow.mediaAssets.findById(data.id);
  if (!existing || existing.organizationId !== data.organizationId || existing.deletedAt) {
    throw new CmsNotFoundError("No encontramos ese archivo de medios.");
  }

  const nextUrl = data.url ?? existing.url;
  const nextProvider =
    data.videoProvider === null ? undefined : (data.videoProvider ?? existing.videoProvider);
  const nextLogo =
    data.logoVariant === null ? undefined : (data.logoVariant ?? existing.logoVariant);

  assertVideoRules({
    kind: existing.kind,
    videoProvider: nextProvider,
    url: nextUrl,
  });
  assertLogoRules({ kind: existing.kind, logoVariant: nextLogo });

  const updated: CmsMediaAssetRecord = {
    ...existing,
    name: data.name ?? existing.name,
    description: data.description === null ? undefined : (data.description ?? existing.description),
    altText: data.altText === null ? undefined : (data.altText ?? existing.altText),
    category: data.category === null ? undefined : (data.category ?? existing.category),
    tags: data.tags ?? existing.tags,
    url: nextUrl,
    videoProvider: existing.kind === "video" ? nextProvider : undefined,
    logoVariant: existing.kind === "logo" ? nextLogo : undefined,
    mimeType: data.mimeType === null ? undefined : (data.mimeType ?? existing.mimeType),
    fileSizeBytes:
      data.fileSizeBytes === null ? undefined : (data.fileSizeBytes ?? existing.fileSizeBytes),
    width: data.width === null ? undefined : (data.width ?? existing.width),
    height: data.height === null ? undefined : (data.height ?? existing.height),
    isFavorite: data.isFavorite ?? existing.isFavorite,
    metadata: data.metadata ?? existing.metadata,
    lastUsedAt: data.markUsed ? nowIso() : existing.lastUsedAt,
    updatedAt: nowIso(),
    updatedBy: data.actorId,
  };
  await uow.mediaAssets.save(updated);
  return updated;
}

export async function deleteMediaAsset(uow: CmsUnitOfWork, input: unknown) {
  const data = parseOrThrow(mediaIdSchema, input);
  const existing = await uow.mediaAssets.findById(data.id);
  if (!existing || existing.organizationId !== data.organizationId || existing.deletedAt) {
    throw new CmsNotFoundError("No encontramos ese archivo de medios.");
  }
  const updated: CmsMediaAssetRecord = {
    ...existing,
    deletedAt: nowIso(),
    updatedAt: nowIso(),
    updatedBy: data.actorId,
  };
  await uow.mediaAssets.save(updated);
  return { id: updated.id, deleted: true as const };
}

export async function toggleMediaFavorite(uow: CmsUnitOfWork, input: unknown) {
  const data = parseOrThrow(mediaIdSchema, input);
  const existing = await uow.mediaAssets.findById(data.id);
  if (!existing || existing.organizationId !== data.organizationId || existing.deletedAt) {
    throw new CmsNotFoundError("No encontramos ese archivo de medios.");
  }
  const updated: CmsMediaAssetRecord = {
    ...existing,
    isFavorite: !existing.isFavorite,
    updatedAt: nowIso(),
    updatedBy: data.actorId,
  };
  await uow.mediaAssets.save(updated);
  return updated;
}
