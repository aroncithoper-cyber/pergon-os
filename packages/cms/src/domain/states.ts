export const CMS_HOME_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "unpublished",
  "archived",
  "expired",
] as const;

export type CmsHomeStatus = (typeof CMS_HOME_STATUSES)[number];

/**
 * Official Home Composer blocks (V1).
 * Only these are managed in Layout — not a free page builder.
 */
export const CMS_HOME_V1_BLOCK_TYPES = [
  "hero",
  "featured_products",
  "technology",
  "expert",
  "cta",
  "footer",
] as const;

export type CmsHomeV1BlockType = (typeof CMS_HOME_V1_BLOCK_TYPES)[number];

/** All section types accepted in payloads (V1 + legacy, normalized on read). */
export const CMS_HOME_SECTION_TYPES = [
  ...CMS_HOME_V1_BLOCK_TYPES,
  "why",
  "system",
  "ecosystem",
  "cases",
  "final_cta",
] as const;

export type CmsHomeSectionType = (typeof CMS_HOME_SECTION_TYPES)[number];

export const CMS_HOME_V1_BLOCK_LABELS: Record<CmsHomeV1BlockType, string> = {
  hero: "Hero",
  featured_products: "Productos Destacados",
  technology: "Tecnología",
  expert: "PerGon Expert",
  cta: "CTA Final",
  footer: "Footer",
};

export const CMS_HERO_MEDIA_MODES = ["none", "image", "youtube", "vimeo", "file"] as const;
export type CmsHeroMediaMode = (typeof CMS_HERO_MEDIA_MODES)[number];

export const CMS_VERSION_KINDS = ["publish", "rollback"] as const;
export type CmsVersionKind = (typeof CMS_VERSION_KINDS)[number];

export const CMS_PREVIEW_SOURCES = ["working", "version"] as const;
export type CmsPreviewSource = (typeof CMS_PREVIEW_SOURCES)[number];

/** Well-known org id for memory seed / single-tenant bootstrap. */
export const CMS_DEFAULT_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";

export const CMS_DEFAULT_LOCALE = "es";

export const CMS_MEDIA_KINDS = ["image", "video", "poster", "document", "logo"] as const;
export type CmsMediaKind = (typeof CMS_MEDIA_KINDS)[number];

export const CMS_VIDEO_PROVIDERS = ["youtube", "vimeo", "file"] as const;
export type CmsVideoProvider = (typeof CMS_VIDEO_PROVIDERS)[number];

export const CMS_LOGO_VARIANTS = ["light", "dark", "horizontal", "vertical", "favicon"] as const;
export type CmsLogoVariant = (typeof CMS_LOGO_VARIANTS)[number];

export const CMS_MEDIA_SOURCES = ["upload", "external"] as const;
export type CmsMediaSource = (typeof CMS_MEDIA_SOURCES)[number];

export const CMS_MEDIA_SORTS = [
  "updated_desc",
  "updated_asc",
  "name_asc",
  "name_desc",
  "size_desc",
  "recent",
] as const;
export type CmsMediaSort = (typeof CMS_MEDIA_SORTS)[number];
