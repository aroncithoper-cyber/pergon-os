import type {
  CmsHeroMediaMode,
  CmsHomeSectionType,
  CmsHomeStatus,
  CmsLogoVariant,
  CmsMediaKind,
  CmsMediaSort,
  CmsMediaSource,
  CmsPreviewSource,
  CmsVersionKind,
  CmsVideoProvider,
} from "./states";

export type EntityId = string;

export type CmsCta = {
  label: string;
  href: string;
};

export type CmsNavItem = {
  href: string;
  label: string;
};

export type CmsHeroMedia = {
  mode: CmsHeroMediaMode;
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  mobileImageUrl?: string;
  loop: boolean;
  enableVideo: boolean;
  enableImage: boolean;
};

export type CmsHomeSectionBase = {
  id: string;
  type: CmsHomeSectionType;
  enabled: boolean;
  sortOrder: number;
};

export type CmsHeroSection = CmsHomeSectionBase & {
  type: "hero";
  brand: string;
  title: string;
  subtitle: string;
  primaryCta: CmsCta;
  secondaryCta?: CmsCta;
  media: CmsHeroMedia;
  visualAlt?: string;
};

/** Shared block media (Technology, Featured Products, Expert). */
export type CmsTechnologyMedia = {
  mode: CmsHeroMediaMode;
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  loop: boolean;
  enableVideo: boolean;
  enableImage: boolean;
};

export type CmsFeaturedProductItem = {
  id: string;
  enabled: boolean;
  sortOrder: number;
  name: string;
  description: string;
  benefit: string;
  href: string;
  ctaLabel: string;
  media: CmsTechnologyMedia;
};

export type CmsFeaturedProductsSection = CmsHomeSectionBase & {
  type: "featured_products";
  title: string;
  subtitle?: string;
  description: string;
  items: CmsFeaturedProductItem[];
  /** @deprecated legacy placeholders — hydrated into items */
  slots?: Array<{ key: string; label: string; note: string }>;
};

export type CmsWhySection = CmsHomeSectionBase & {
  type: "why";
  title: string;
  description: string;
  pillars: Array<{ title: string; body: string }>;
};

export type CmsSystemSection = CmsHomeSectionBase & {
  type: "system";
  chapters: Array<{ id: string; title: string; body: string; href?: string }>;
};

export type CmsTechnologyChapter = {
  id: string;
  title: string;
  body: string;
};

/** V1 Technology block — editorial system narrative (QR, Pasaporte, Verificación, Trazabilidad). */
export type CmsTechnologySection = CmsHomeSectionBase & {
  type: "technology";
  title: string;
  subtitle: string;
  description: string;
  media: CmsTechnologyMedia;
  primaryCta: CmsCta;
  secondaryCta?: CmsCta;
  /** Editorial beats — typically QR, Pasaporte, Verificación, Trazabilidad. */
  chapters: CmsTechnologyChapter[];
};

export type CmsExpertSection = CmsHomeSectionBase & {
  type: "expert";
  title: string;
  subtitle: string;
  description: string;
  media: CmsTechnologyMedia;
  primaryCta: CmsCta;
  secondaryCta?: CmsCta;
  /** @deprecated hydrated into description */
  body?: string;
};

export type CmsEcosystemSection = CmsHomeSectionBase & {
  type: "ecosystem";
  distributors: { title: string; body: string };
  comparator: { title: string; body: string };
  calculators: { title: string; body: string };
};

export type CmsCasesSection = CmsHomeSectionBase & {
  type: "cases";
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export type CmsFinalCtaSection = CmsHomeSectionBase & {
  type: "final_cta";
  title: string;
  body: string;
  primaryCta: CmsCta;
  secondaryCta?: CmsCta;
  media?: CmsTechnologyMedia;
};

/** V1 Final CTA — narrative close of the Home. */
export type CmsCtaSection = CmsHomeSectionBase & {
  type: "cta";
  title: string;
  body: string;
  media: CmsTechnologyMedia;
  primaryCta: CmsCta;
  secondaryCta?: CmsCta;
};

export type CmsFooterColumn = {
  title: string;
  links: CmsNavItem[];
};

export type CmsFooterSocialLink = {
  label: string;
  href: string;
};

export type CmsFooterContact = {
  emails: string[];
  phones: string[];
  address?: string;
};

/** Toggle visible regions in the institutional Footer. */
export type CmsFooterBlocks = {
  brand: boolean;
  contact: boolean;
  social: boolean;
  links: boolean;
  legal: boolean;
};

export type CmsFooterSection = CmsHomeSectionBase & {
  type: "footer";
  brand: string;
  logoUrl?: string;
  /** Institutional description under the brand. */
  description: string;
  /** @deprecated hydrated into description */
  tagline?: string;
  contact: CmsFooterContact;
  social: CmsFooterSocialLink[];
  columns: CmsFooterColumn[];
  privacyLabel: string;
  privacyHref: string;
  termsLabel: string;
  termsHref: string;
  copyright: string;
  /** Optional institutional notices / disclaimers. */
  notices?: string;
  blocks: CmsFooterBlocks;
};

export type CmsHomeSection =
  | CmsHeroSection
  | CmsFeaturedProductsSection
  | CmsWhySection
  | CmsSystemSection
  | CmsTechnologySection
  | CmsExpertSection
  | CmsEcosystemSection
  | CmsCasesSection
  | CmsFinalCtaSection
  | CmsCtaSection
  | CmsFooterSection;

/** Top-level footer mirror — kept in sync from the footer section. */
export type CmsHomeFooter = {
  brand: string;
  logoUrl?: string;
  description: string;
  /** @deprecated */
  tagline?: string;
  contact: CmsFooterContact;
  social: CmsFooterSocialLink[];
  columns: CmsFooterColumn[];
  privacyLabel: string;
  privacyHref: string;
  termsLabel: string;
  termsHref: string;
  copyright: string;
  notices?: string;
  blocks: CmsFooterBlocks;
};

export type CmsHomeSeo = {
  title?: string;
  description?: string;
  ogImageUrl?: string;
};

/** Full Home experience payload (working or published). */
export type CmsHomePayload = {
  locale: string;
  nav: CmsNavItem[];
  sections: CmsHomeSection[];
  footer: CmsHomeFooter;
  seo?: CmsHomeSeo;
};

export type CmsHomeDocumentRecord = {
  id: EntityId;
  organizationId: EntityId;
  locale: string;
  status: CmsHomeStatus;
  workingPayload: CmsHomePayload;
  publishedPayload?: CmsHomePayload;
  publishedVersion: number;
  publishAt?: string;
  unpublishAt?: string;
  workingVersion: number;
  lastPublishedAt?: string;
  lastPublishedBy?: EntityId;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: EntityId;
  updatedBy?: EntityId;
  deletedAt?: string;
};

export type CmsHomeVersionRecord = {
  id: EntityId;
  documentId: EntityId;
  organizationId: EntityId;
  versionNumber: number;
  kind: CmsVersionKind;
  payload: CmsHomePayload;
  note?: string;
  createdAt: string;
  createdBy?: EntityId;
};

export type CmsHomePreviewTokenRecord = {
  id: EntityId;
  documentId: EntityId;
  organizationId: EntityId;
  tokenHash: string;
  expiresAt: string;
  source: CmsPreviewSource;
  versionId?: EntityId;
  createdAt: string;
  createdBy?: EntityId;
  revokedAt?: string;
};

/** Shared Media Library asset — reusable across all CMS surfaces. */
export type CmsMediaAssetRecord = {
  id: EntityId;
  organizationId: EntityId;
  kind: CmsMediaKind;
  videoProvider?: CmsVideoProvider;
  logoVariant?: CmsLogoVariant;
  source: CmsMediaSource;
  name: string;
  description?: string;
  altText?: string;
  category?: string;
  tags: string[];
  url: string;
  storageBucket?: string;
  storagePath?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  isFavorite: boolean;
  lastUsedAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: EntityId;
  updatedBy?: EntityId;
  deletedAt?: string;
};

export type CmsMediaListQuery = {
  organizationId: EntityId;
  search?: string;
  kind?: CmsMediaKind;
  videoProvider?: CmsVideoProvider;
  logoVariant?: CmsLogoVariant;
  category?: string;
  tag?: string;
  favoritesOnly?: boolean;
  sort?: CmsMediaSort;
  limit?: number;
  offset?: number;
};
