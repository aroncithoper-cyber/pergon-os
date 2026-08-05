import { randomUUID } from "node:crypto";

import { createDefaultHomePayload } from "../../domain/default-home";
import type {
  CmsHomeDocumentRecord,
  CmsHomePayload,
  CmsHomePreviewTokenRecord,
  CmsHomeVersionRecord,
  CmsMediaAssetRecord,
} from "../../domain/models";
import { normalizeHomePayload } from "../../domain/normalize-home";
import { CMS_DEFAULT_LOCALE, CMS_DEFAULT_ORGANIZATION_ID } from "../../domain/states";
import type {
  CmsUnitOfWork,
  HomeDocumentRepository,
  HomePreviewTokenRepository,
  HomeVersionRepository,
  MediaAssetRepository,
} from "../../application/ports";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class CmsMemoryStore {
  documents = new Map<string, CmsHomeDocumentRecord>();
  versions = new Map<string, CmsHomeVersionRecord>();
  previewTokens = new Map<string, CmsHomePreviewTokenRecord>();
  media = new Map<string, CmsMediaAssetRecord>();
}

export function newCmsId(): string {
  return randomUUID();
}

function seedPublishedHome(store: CmsMemoryStore) {
  if (store.documents.size > 0) return;
  const ts = new Date().toISOString();
  const payload = normalizeHomePayload(createDefaultHomePayload(CMS_DEFAULT_LOCALE));
  const id = "00000000-0000-4000-8000-0000000000aa";
  const doc: CmsHomeDocumentRecord = {
    id,
    organizationId: CMS_DEFAULT_ORGANIZATION_ID,
    locale: CMS_DEFAULT_LOCALE,
    status: "published",
    workingPayload: payload,
    publishedPayload: clone(payload),
    publishedVersion: 1,
    workingVersion: 1,
    lastPublishedAt: ts,
    metadata: { seeded: true },
    createdAt: ts,
    updatedAt: ts,
  };
  store.documents.set(id, doc);
  store.versions.set("00000000-0000-4000-8000-0000000000ab", {
    id: "00000000-0000-4000-8000-0000000000ab",
    documentId: id,
    organizationId: CMS_DEFAULT_ORGANIZATION_ID,
    versionNumber: 1,
    kind: "publish",
    payload: clone(payload),
    note: "Seed",
    createdAt: ts,
  });
}

export function createMemoryCmsUnitOfWork(store = new CmsMemoryStore()): CmsUnitOfWork {
  seedPublishedHome(store);

  const homeDocuments: HomeDocumentRepository = {
    async findById(id) {
      const row = store.documents.get(id);
      return row && !row.deletedAt ? clone(row) : null;
    },
    async findByOrgLocale(organizationId, locale) {
      for (const row of store.documents.values()) {
        if (row.organizationId === organizationId && row.locale === locale && !row.deletedAt) {
          return clone(row);
        }
      }
      return null;
    },
    async findPublishedByLocale(locale) {
      let best: CmsHomeDocumentRecord | null = null;
      for (const row of store.documents.values()) {
        if (
          row.locale === locale &&
          row.status === "published" &&
          row.publishedPayload &&
          !row.deletedAt
        ) {
          if (
            !best ||
            (row.lastPublishedAt ?? row.updatedAt) > (best.lastPublishedAt ?? best.updatedAt)
          ) {
            best = row;
          }
        }
      }
      return best ? clone(best) : null;
    },
    async listScheduledDue(nowIso) {
      return [...store.documents.values()]
        .filter(
          (row) =>
            !row.deletedAt &&
            row.status === "scheduled" &&
            row.publishAt &&
            row.publishAt <= nowIso,
        )
        .map(clone);
    },
    async listUnpublishDue(nowIso) {
      return [...store.documents.values()]
        .filter(
          (row) =>
            !row.deletedAt &&
            row.status === "published" &&
            row.unpublishAt &&
            row.unpublishAt <= nowIso,
        )
        .map(clone);
    },
    async save(record) {
      store.documents.set(record.id, clone(record));
    },
  };

  const homeVersions: HomeVersionRepository = {
    async listByDocument(documentId) {
      return [...store.versions.values()]
        .filter((v) => v.documentId === documentId)
        .sort((a, b) => b.versionNumber - a.versionNumber)
        .map(clone);
    },
    async findById(id) {
      const row = store.versions.get(id);
      return row ? clone(row) : null;
    },
    async save(record) {
      store.versions.set(record.id, clone(record));
    },
  };

  const homePreviewTokens: HomePreviewTokenRepository = {
    async findByTokenHash(tokenHash) {
      for (const row of store.previewTokens.values()) {
        if (row.tokenHash === tokenHash) return clone(row);
      }
      return null;
    },
    async save(record) {
      store.previewTokens.set(record.id, clone(record));
    },
  };

  const mediaAssets: MediaAssetRepository = {
    async findById(id) {
      const row = store.media.get(id);
      return row && !row.deletedAt ? clone(row) : null;
    },
    async list(query) {
      let items = [...store.media.values()].filter(
        (row) => row.organizationId === query.organizationId && !row.deletedAt,
      );
      if (query.kind) items = items.filter((r) => r.kind === query.kind);
      if (query.videoProvider) {
        items = items.filter((r) => r.videoProvider === query.videoProvider);
      }
      if (query.logoVariant) items = items.filter((r) => r.logoVariant === query.logoVariant);
      if (query.category) {
        items = items.filter(
          (r) => (r.category ?? "").toLowerCase() === query.category!.toLowerCase(),
        );
      }
      if (query.tag) {
        const tag = query.tag.toLowerCase();
        items = items.filter((r) => r.tags.some((t) => t.toLowerCase() === tag));
      }
      if (query.favoritesOnly) items = items.filter((r) => r.isFavorite);
      if (query.search?.trim()) {
        const q = query.search.trim().toLowerCase();
        items = items.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.description ?? "").toLowerCase().includes(q) ||
            (r.altText ?? "").toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      const sort = query.sort ?? "updated_desc";
      items.sort((a, b) => {
        switch (sort) {
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "size_desc":
            return (b.fileSizeBytes ?? 0) - (a.fileSizeBytes ?? 0);
          case "updated_asc":
            return a.updatedAt.localeCompare(b.updatedAt);
          case "recent":
            return (b.lastUsedAt ?? b.updatedAt).localeCompare(a.lastUsedAt ?? a.updatedAt);
          case "updated_desc":
          default:
            return b.updatedAt.localeCompare(a.updatedAt);
        }
      });

      const total = items.length;
      const offset = query.offset ?? 0;
      const limit = query.limit ?? 50;
      return { items: items.slice(offset, offset + limit).map(clone), total };
    },
    async save(record) {
      store.media.set(record.id, clone(record));
    },
  };

  return { homeDocuments, homeVersions, homePreviewTokens, mediaAssets };
}

let sharedStore: CmsMemoryStore | null = null;

export function createSharedMemoryCmsUnitOfWork(): CmsUnitOfWork {
  if (!sharedStore) sharedStore = new CmsMemoryStore();
  return createMemoryCmsUnitOfWork(sharedStore);
}

export type { CmsHomePayload };
