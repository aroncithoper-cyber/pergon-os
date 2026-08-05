import type { AssetKind, CatalogStatus, MaterialCompatibility, RelationType } from "./states";

export type EntityId = string;

export type CatalogCategoryRecord = {
  id: EntityId;
  organizationId: EntityId;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
  status: CatalogStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CatalogProductRecord = {
  id: EntityId;
  organizationId: EntityId;
  categoryId?: EntityId;
  opsProductId?: EntityId;
  slug: string;
  name: string;
  tagline?: string;
  summary?: string;
  status: CatalogStatus;
  publishedAt?: string;
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSupport?: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageAssetId?: EntityId;
  beforeAfter: Record<string, unknown>;
  performance: Record<string, unknown>;
  dilutionCalculator: Record<string, unknown>;
  cta: Record<string, unknown>;
  model3d: Record<string, unknown>;
  sortOrder: number;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: EntityId;
  updatedBy?: EntityId;
  deletedAt?: string;
};

export type CatalogVariantRecord = {
  id: EntityId;
  productId: EntityId;
  organizationId: EntityId;
  sku?: string;
  name: string;
  slug: string;
  summary?: string;
  sortOrder: number;
  isDefault: boolean;
  attributes: Record<string, unknown>;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CatalogPresentationRecord = {
  id: EntityId;
  productId: EntityId;
  variantId?: EntityId;
  organizationId: EntityId;
  name: string;
  sku?: string;
  volumeLabel?: string;
  netContent?: string;
  sortOrder: number;
  attributes: Record<string, unknown>;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CatalogAssetRecord = {
  id: EntityId;
  organizationId: EntityId;
  productId?: EntityId;
  variantId?: EntityId;
  kind: AssetKind;
  title?: string;
  altText?: string;
  caption?: string;
  storageBucket: string;
  storagePath?: string;
  publicUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CatalogBenefitRecord = {
  id: EntityId;
  productId: EntityId;
  organizationId: EntityId;
  title: string;
  body?: string;
  sortOrder: number;
  createdAt: string;
  deletedAt?: string;
};

export type CatalogApplicationRecord = {
  id: EntityId;
  productId: EntityId;
  organizationId: EntityId;
  title: string;
  body?: string;
  sortOrder: number;
  createdAt: string;
  deletedAt?: string;
};

export type CatalogMaterialRecord = {
  id: EntityId;
  productId: EntityId;
  organizationId: EntityId;
  name: string;
  compatibility: MaterialCompatibility;
  note?: string;
  sortOrder: number;
  createdAt: string;
  deletedAt?: string;
};

export type CatalogDilutionRecord = {
  id: EntityId;
  productId: EntityId;
  organizationId: EntityId;
  label: string;
  ratio?: string;
  useCase?: string;
  instructions?: string;
  sortOrder: number;
  createdAt: string;
  deletedAt?: string;
};

export type CatalogFaqRecord = {
  id: EntityId;
  productId: EntityId;
  organizationId: EntityId;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  deletedAt?: string;
};

export type CatalogProductRelationRecord = {
  id: EntityId;
  organizationId: EntityId;
  productId: EntityId;
  relatedProductId: EntityId;
  relationType: RelationType;
  sortOrder: number;
  createdAt: string;
};

/** Public, privacy-safe product experience DTO for Web PDP. */
export type PublishedProductExperience = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  summary: string | null;
  category: { slug: string; name: string } | null;
  seo: {
    title: string;
    description: string;
    ogImageUrl: string | null;
  };
  hero: {
    eyebrow: string | null;
    headline: string;
    support: string | null;
    primaryCta: { label: string; href: string } | null;
    secondaryCta: { label: string; href: string } | null;
    media: CatalogAssetRecord | null;
  };
  gallery: CatalogAssetRecord[];
  model3d: {
    enabled: boolean;
    asset: CatalogAssetRecord | null;
    config: Record<string, unknown>;
  };
  beforeAfter: {
    before: CatalogAssetRecord | null;
    after: CatalogAssetRecord | null;
    caption: string | null;
  };
  benefits: CatalogBenefitRecord[];
  applications: CatalogApplicationRecord[];
  materialsCompatible: CatalogMaterialRecord[];
  materialsIncompatible: CatalogMaterialRecord[];
  dilutions: CatalogDilutionRecord[];
  dilutionCalculator: Record<string, unknown>;
  performance: Record<string, unknown>;
  datasheet: CatalogAssetRecord | null;
  safetySheet: CatalogAssetRecord | null;
  documents: CatalogAssetRecord[];
  videos: CatalogAssetRecord[];
  faqs: CatalogFaqRecord[];
  variants: CatalogVariantRecord[];
  presentations: CatalogPresentationRecord[];
  cta: Record<string, unknown>;
  related: Array<{
    slug: string;
    name: string;
    tagline: string | null;
    relationType: RelationType;
  }>;
  publishedAt: string | null;
  updatedAt: string;
};
