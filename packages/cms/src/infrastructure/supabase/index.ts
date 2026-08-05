import { createServiceClient, type PergonServiceClient } from "@pergon/database";
import { hasSupabaseServiceRole } from "@pergon/shared/env";

import type {
  CmsHomeDocumentRecord,
  CmsHomePayload,
  CmsHomePreviewTokenRecord,
  CmsHomeVersionRecord,
  CmsMediaAssetRecord,
} from "../../domain/models";
import type {
  CmsHomeStatus,
  CmsLogoVariant,
  CmsMediaKind,
  CmsMediaSource,
  CmsPreviewSource,
  CmsVersionKind,
  CmsVideoProvider,
} from "../../domain/states";
import type {
  CmsUnitOfWork,
  HomeDocumentRepository,
  HomePreviewTokenRepository,
  HomeVersionRepository,
  MediaAssetRepository,
} from "../../application/ports";
import { createSharedMemoryCmsUnitOfWork } from "../memory";

type DocRow = {
  id: string;
  organization_id: string;
  locale: string;
  status: string;
  working_payload: CmsHomePayload;
  published_payload: CmsHomePayload | null;
  published_version: number;
  publish_at: string | null;
  unpublish_at: string | null;
  working_version: number;
  last_published_at: string | null;
  last_published_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
};

type VersionRow = {
  id: string;
  document_id: string;
  organization_id: string;
  version_number: number;
  kind: string;
  payload: CmsHomePayload;
  note: string | null;
  created_at: string;
  created_by: string | null;
};

type PreviewRow = {
  id: string;
  document_id: string;
  organization_id: string;
  token_hash: string;
  expires_at: string;
  source: string;
  version_id: string | null;
  created_at: string;
  created_by: string | null;
  revoked_at: string | null;
};

function mapDoc(row: DocRow): CmsHomeDocumentRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    locale: row.locale,
    status: row.status as CmsHomeStatus,
    workingPayload: row.working_payload,
    publishedPayload: row.published_payload ?? undefined,
    publishedVersion: row.published_version,
    publishAt: row.publish_at ?? undefined,
    unpublishAt: row.unpublish_at ?? undefined,
    workingVersion: row.working_version,
    lastPublishedAt: row.last_published_at ?? undefined,
    lastPublishedBy: row.last_published_by ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
  };
}

function mapVersion(row: VersionRow): CmsHomeVersionRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    organizationId: row.organization_id,
    versionNumber: row.version_number,
    kind: row.kind as CmsVersionKind,
    payload: row.payload,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
  };
}

function mapPreview(row: PreviewRow): CmsHomePreviewTokenRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    organizationId: row.organization_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    source: row.source as CmsPreviewSource,
    versionId: row.version_id ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
    revokedAt: row.revoked_at ?? undefined,
  };
}

function toDocRow(record: CmsHomeDocumentRecord) {
  return {
    id: record.id,
    organization_id: record.organizationId,
    locale: record.locale,
    status: record.status,
    working_payload: record.workingPayload,
    published_payload: record.publishedPayload ?? null,
    published_version: record.publishedVersion,
    publish_at: record.publishAt ?? null,
    unpublish_at: record.unpublishAt ?? null,
    working_version: record.workingVersion,
    last_published_at: record.lastPublishedAt ?? null,
    last_published_by: record.lastPublishedBy ?? null,
    metadata: record.metadata,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    created_by: record.createdBy ?? null,
    updated_by: record.updatedBy ?? null,
    deleted_at: record.deletedAt ?? null,
  };
}

export function createSupabaseCmsUnitOfWork(client?: PergonServiceClient): CmsUnitOfWork {
  const db = client ?? createServiceClient();

  const homeDocuments: HomeDocumentRepository = {
    async findById(id) {
      const { data, error } = await db
        .from("cms_home_documents")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDoc(data as DocRow) : null;
    },
    async findByOrgLocale(organizationId, locale) {
      const { data, error } = await db
        .from("cms_home_documents")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("locale", locale)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDoc(data as DocRow) : null;
    },
    async findPublishedByLocale(locale) {
      const { data, error } = await db
        .from("cms_home_documents")
        .select("*")
        .eq("locale", locale)
        .eq("status", "published")
        .is("deleted_at", null)
        .not("published_payload", "is", null)
        .order("last_published_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDoc(data as DocRow) : null;
    },
    async listScheduledDue(nowIso) {
      const { data, error } = await db
        .from("cms_home_documents")
        .select("*")
        .eq("status", "scheduled")
        .is("deleted_at", null)
        .lte("publish_at", nowIso);
      if (error) throw error;
      return ((data as DocRow[]) ?? []).map(mapDoc);
    },
    async listUnpublishDue(nowIso) {
      const { data, error } = await db
        .from("cms_home_documents")
        .select("*")
        .eq("status", "published")
        .is("deleted_at", null)
        .not("unpublish_at", "is", null)
        .lte("unpublish_at", nowIso);
      if (error) throw error;
      return ((data as DocRow[]) ?? []).map(mapDoc);
    },
    async save(record) {
      const { error } = await db.from("cms_home_documents").upsert(toDocRow(record) as never);
      if (error) throw error;
    },
  };

  const homeVersions: HomeVersionRepository = {
    async listByDocument(documentId) {
      const { data, error } = await db
        .from("cms_home_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return ((data as VersionRow[]) ?? []).map(mapVersion);
    },
    async findById(id) {
      const { data, error } = await db
        .from("cms_home_versions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapVersion(data as VersionRow) : null;
    },
    async save(record) {
      const { error } = await db.from("cms_home_versions").upsert({
        id: record.id,
        document_id: record.documentId,
        organization_id: record.organizationId,
        version_number: record.versionNumber,
        kind: record.kind,
        payload: record.payload as never,
        note: record.note ?? null,
        created_at: record.createdAt,
        created_by: record.createdBy ?? null,
      } as never);
      if (error) throw error;
    },
  };

  const homePreviewTokens: HomePreviewTokenRepository = {
    async findByTokenHash(tokenHash) {
      const { data, error } = await db
        .from("cms_home_preview_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .is("revoked_at", null)
        .maybeSingle();
      if (error) throw error;
      return data ? mapPreview(data as PreviewRow) : null;
    },
    async save(record) {
      const { error } = await db.from("cms_home_preview_tokens").upsert({
        id: record.id,
        document_id: record.documentId,
        organization_id: record.organizationId,
        token_hash: record.tokenHash,
        expires_at: record.expiresAt,
        source: record.source,
        version_id: record.versionId ?? null,
        created_at: record.createdAt,
        created_by: record.createdBy ?? null,
        revoked_at: record.revokedAt ?? null,
      } as never);
      if (error) throw error;
    },
  };

  type MediaRow = {
    id: string;
    organization_id: string;
    kind: string;
    video_provider: string | null;
    logo_variant: string | null;
    source: string;
    name: string;
    description: string | null;
    alt_text: string | null;
    category: string | null;
    tags: string[] | null;
    url: string;
    storage_bucket: string | null;
    storage_path: string | null;
    mime_type: string | null;
    file_size_bytes: number | null;
    width: number | null;
    height: number | null;
    is_favorite: boolean;
    last_used_at: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    deleted_at: string | null;
  };

  function mapMedia(row: MediaRow): CmsMediaAssetRecord {
    return {
      id: row.id,
      organizationId: row.organization_id,
      kind: row.kind as CmsMediaKind,
      videoProvider: (row.video_provider as CmsVideoProvider | null) ?? undefined,
      logoVariant: (row.logo_variant as CmsLogoVariant | null) ?? undefined,
      source: row.source as CmsMediaSource,
      name: row.name,
      description: row.description ?? undefined,
      altText: row.alt_text ?? undefined,
      category: row.category ?? undefined,
      tags: row.tags ?? [],
      url: row.url,
      storageBucket: row.storage_bucket ?? undefined,
      storagePath: row.storage_path ?? undefined,
      mimeType: row.mime_type ?? undefined,
      fileSizeBytes: row.file_size_bytes ?? undefined,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      isFavorite: row.is_favorite,
      lastUsedAt: row.last_used_at ?? undefined,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by ?? undefined,
      updatedBy: row.updated_by ?? undefined,
      deletedAt: row.deleted_at ?? undefined,
    };
  }

  const mediaAssets: MediaAssetRepository = {
    async findById(id) {
      const { data, error } = await db
        .from("cms_media_assets")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data ? mapMedia(data as MediaRow) : null;
    },
    async list(query) {
      let q = db
        .from("cms_media_assets")
        .select("*", { count: "exact" })
        .eq("organization_id", query.organizationId)
        .is("deleted_at", null);

      if (query.kind) q = q.eq("kind", query.kind);
      if (query.videoProvider) q = q.eq("video_provider", query.videoProvider);
      if (query.logoVariant) q = q.eq("logo_variant", query.logoVariant);
      if (query.category) q = q.eq("category", query.category);
      if (query.favoritesOnly) q = q.eq("is_favorite", true);
      if (query.tag) q = q.contains("tags", [query.tag]);
      if (query.search?.trim()) {
        const s = `%${query.search.trim()}%`;
        q = q.or(`name.ilike.${s},description.ilike.${s},alt_text.ilike.${s}`);
      }

      const sort = query.sort ?? "updated_desc";
      if (sort === "name_asc") q = q.order("name", { ascending: true });
      else if (sort === "name_desc") q = q.order("name", { ascending: false });
      else if (sort === "size_desc") q = q.order("file_size_bytes", { ascending: false });
      else if (sort === "updated_asc") q = q.order("updated_at", { ascending: true });
      else if (sort === "recent")
        q = q.order("last_used_at", { ascending: false, nullsFirst: false });
      else q = q.order("updated_at", { ascending: false });

      const offset = query.offset ?? 0;
      const limit = query.limit ?? 50;
      q = q.range(offset, offset + limit - 1);

      const { data, error, count } = await q;
      if (error) throw error;
      return {
        items: ((data as MediaRow[]) ?? []).map(mapMedia),
        total: count ?? 0,
      };
    },
    async save(record) {
      const { error } = await db.from("cms_media_assets").upsert({
        id: record.id,
        organization_id: record.organizationId,
        kind: record.kind,
        video_provider: record.videoProvider ?? null,
        logo_variant: record.logoVariant ?? null,
        source: record.source,
        name: record.name,
        description: record.description ?? null,
        alt_text: record.altText ?? null,
        category: record.category ?? null,
        tags: record.tags,
        url: record.url,
        storage_bucket: record.storageBucket ?? null,
        storage_path: record.storagePath ?? null,
        mime_type: record.mimeType ?? null,
        file_size_bytes: record.fileSizeBytes ?? null,
        width: record.width ?? null,
        height: record.height ?? null,
        is_favorite: record.isFavorite,
        last_used_at: record.lastUsedAt ?? null,
        metadata: record.metadata,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        created_by: record.createdBy ?? null,
        updated_by: record.updatedBy ?? null,
        deleted_at: record.deletedAt ?? null,
      } as never);
      if (error) throw error;
    },
  };

  return { homeDocuments, homeVersions, homePreviewTokens, mediaAssets };
}

/** Prefer Supabase when service role is configured; otherwise shared memory (seeded). */
export function createDefaultCmsUnitOfWork(): CmsUnitOfWork {
  if (hasSupabaseServiceRole()) {
    try {
      return createSupabaseCmsUnitOfWork();
    } catch {
      return createSharedMemoryCmsUnitOfWork();
    }
  }
  return createSharedMemoryCmsUnitOfWork();
}

export { createSharedMemoryCmsUnitOfWork, createMemoryCmsUnitOfWork } from "../memory";
