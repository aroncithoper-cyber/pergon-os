import type {
  CmsHomeDocumentRecord,
  CmsHomePreviewTokenRecord,
  CmsHomeVersionRecord,
  CmsMediaAssetRecord,
  CmsMediaListQuery,
} from "../domain/models";

export type HomeDocumentRepository = {
  findById(id: string): Promise<CmsHomeDocumentRecord | null>;
  findByOrgLocale(organizationId: string, locale: string): Promise<CmsHomeDocumentRecord | null>;
  findPublishedByLocale(locale: string): Promise<CmsHomeDocumentRecord | null>;
  listScheduledDue(nowIso: string): Promise<CmsHomeDocumentRecord[]>;
  listUnpublishDue(nowIso: string): Promise<CmsHomeDocumentRecord[]>;
  save(record: CmsHomeDocumentRecord): Promise<void>;
};

export type HomeVersionRepository = {
  listByDocument(documentId: string): Promise<CmsHomeVersionRecord[]>;
  findById(id: string): Promise<CmsHomeVersionRecord | null>;
  save(record: CmsHomeVersionRecord): Promise<void>;
};

export type HomePreviewTokenRepository = {
  findByTokenHash(tokenHash: string): Promise<CmsHomePreviewTokenRecord | null>;
  save(record: CmsHomePreviewTokenRecord): Promise<void>;
};

export type MediaAssetRepository = {
  findById(id: string): Promise<CmsMediaAssetRecord | null>;
  list(query: CmsMediaListQuery): Promise<{ items: CmsMediaAssetRecord[]; total: number }>;
  save(record: CmsMediaAssetRecord): Promise<void>;
};

export type CmsUnitOfWork = {
  homeDocuments: HomeDocumentRepository;
  homeVersions: HomeVersionRepository;
  homePreviewTokens: HomePreviewTokenRepository;
  mediaAssets: MediaAssetRepository;
};
