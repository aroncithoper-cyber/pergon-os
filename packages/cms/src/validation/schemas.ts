import { z } from "zod";

import {
  CMS_HERO_MEDIA_MODES,
  CMS_HOME_SECTION_TYPES,
  CMS_HOME_STATUSES,
  CMS_HOME_V1_BLOCK_LABELS,
  CMS_HOME_V1_BLOCK_TYPES,
  CMS_LOGO_VARIANTS,
  CMS_MEDIA_KINDS,
  CMS_MEDIA_SORTS,
  CMS_MEDIA_SOURCES,
  CMS_VIDEO_PROVIDERS,
} from "../domain/states";

const ctaSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(500),
});

const navItemSchema = z.object({
  href: z.string().min(1).max(500),
  label: z.string().min(1).max(80),
});

const heroMediaSchema = z.object({
  mode: z.enum(CMS_HERO_MEDIA_MODES),
  imageUrl: z.string().max(2000).optional(),
  videoUrl: z.string().max(2000).optional(),
  posterUrl: z.string().max(2000).optional(),
  mobileImageUrl: z.string().max(2000).optional(),
  loop: z.boolean(),
  enableVideo: z.boolean(),
  enableImage: z.boolean(),
});

const sectionBase = {
  id: z.string().min(1).max(80),
  enabled: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
};

const heroSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("hero"),
  brand: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(500),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
  media: heroMediaSchema,
  visualAlt: z.string().max(200).optional(),
});

const blockMediaSchema = heroMediaSchema;

const featuredItemSchema = z.object({
  id: z.string().min(1).max(80),
  enabled: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  benefit: z.string().min(1).max(300),
  href: z.string().min(1).max(500),
  ctaLabel: z.string().min(1).max(80),
  media: blockMediaSchema,
});

const featuredSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("featured_products"),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(1).max(1000),
  items: z.array(featuredItemSchema).max(12).optional(),
  slots: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        label: z.string().min(1).max(40),
        note: z.string().min(1).max(200),
      }),
    )
    .max(12)
    .optional(),
});

const whySectionSchema = z.object({
  ...sectionBase,
  type: z.literal("why"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  pillars: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(500),
      }),
    )
    .max(6),
});

const systemSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("system"),
  chapters: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(800),
        href: z.string().max(500).optional(),
      }),
    )
    .max(12),
});

const technologySectionSchema = z.object({
  ...sectionBase,
  type: z.literal("technology"),
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().min(1).max(300).optional(),
  description: z.string().min(1).max(1000).optional(),
  media: heroMediaSchema.optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
  chapters: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(800),
        href: z.string().max(500).optional(),
      }),
    )
    .max(12)
    .optional(),
});

const expertSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("expert"),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
  body: z.string().max(1000).optional(),
  media: blockMediaSchema.optional(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
});

const ecosystemSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("ecosystem"),
  distributors: z.object({ title: z.string().max(120), body: z.string().max(500) }),
  comparator: z.object({ title: z.string().max(120), body: z.string().max(500) }),
  calculators: z.object({ title: z.string().max(120), body: z.string().max(500) }),
});

const casesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("cases"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  emptyTitle: z.string().min(1).max(200),
  emptyDescription: z.string().min(1).max(1000),
});

const finalCtaSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("final_cta"),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
  media: blockMediaSchema.optional(),
});

const ctaSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("cta"),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  media: blockMediaSchema.optional(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
});

const footerContactSchema = z.object({
  emails: z.array(z.string().max(200)).max(8).optional(),
  phones: z.array(z.string().max(80)).max(8).optional(),
  address: z.string().max(400).optional(),
});

const footerBlocksSchema = z.object({
  brand: z.boolean(),
  contact: z.boolean(),
  social: z.boolean(),
  links: z.boolean(),
  legal: z.boolean(),
});

const footerSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("footer"),
  brand: z.string().min(1).max(80),
  logoUrl: z.string().max(2000).optional(),
  description: z.string().max(400).optional(),
  tagline: z.string().max(400).optional(),
  contact: footerContactSchema.optional(),
  social: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        href: z.string().min(1).max(500),
      }),
    )
    .max(12)
    .optional(),
  columns: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        links: z.array(navItemSchema).max(20),
      }),
    )
    .max(6)
    .optional(),
  privacyLabel: z.string().max(120).optional(),
  privacyHref: z.string().max(500).optional(),
  termsLabel: z.string().max(120).optional(),
  termsHref: z.string().max(500).optional(),
  copyright: z.string().max(280).optional(),
  notices: z.string().max(1000).optional(),
  blocks: footerBlocksSchema.optional(),
});

export const homeSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  featuredSectionSchema,
  whySectionSchema,
  systemSectionSchema,
  technologySectionSchema,
  expertSectionSchema,
  ecosystemSectionSchema,
  casesSectionSchema,
  finalCtaSectionSchema,
  ctaSectionSchema,
  footerSectionSchema,
]);

export const homePayloadSchema = z.object({
  locale: z.string().min(2).max(12),
  nav: z.array(navItemSchema).max(20),
  sections: z.array(homeSectionSchema).min(1).max(40),
  footer: z.object({
    brand: z.string().min(1).max(80),
    logoUrl: z.string().max(2000).optional(),
    description: z.string().max(400).optional(),
    tagline: z.string().max(400).optional(),
    contact: footerContactSchema.optional(),
    social: z
      .array(
        z.object({
          label: z.string().min(1).max(80),
          href: z.string().min(1).max(500),
        }),
      )
      .max(12)
      .optional(),
    columns: z
      .array(
        z.object({
          title: z.string().min(1).max(80),
          links: z.array(navItemSchema).max(20),
        }),
      )
      .max(6)
      .optional(),
    privacyLabel: z.string().max(120).optional(),
    privacyHref: z.string().max(500).optional(),
    termsLabel: z.string().max(120).optional(),
    termsHref: z.string().max(500).optional(),
    copyright: z.string().max(280).optional(),
    notices: z.string().max(1000).optional(),
    blocks: footerBlocksSchema.optional(),
  }),
  seo: z
    .object({
      title: z.string().max(120).optional(),
      description: z.string().max(300).optional(),
      ogImageUrl: z.string().max(2000).optional(),
    })
    .optional(),
});

export const saveHomeDraftSchema = z.object({
  organizationId: z.string().uuid(),
  locale: z.string().min(2).max(12),
  payload: homePayloadSchema,
  expectedWorkingVersion: z.number().int().positive().optional(),
  actorId: z.string().uuid().optional(),
});

export const publishHomeSchema = z.object({
  organizationId: z.string().uuid(),
  locale: z.string().min(2).max(12),
  note: z.string().max(500).optional(),
  actorId: z.string().uuid().optional(),
});

export const scheduleHomeSchema = z.object({
  organizationId: z.string().uuid(),
  locale: z.string().min(2).max(12),
  publishAt: z.string().datetime().optional().nullable(),
  unpublishAt: z.string().datetime().optional().nullable(),
  actorId: z.string().uuid().optional(),
});

export const previewHomeSchema = z.object({
  organizationId: z.string().uuid(),
  locale: z.string().min(2).max(12),
  ttlSeconds: z.number().int().min(60).max(86_400),
  versionId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
});

export const rollbackHomeSchema = z.object({
  organizationId: z.string().uuid(),
  locale: z.string().min(2).max(12),
  versionId: z.string().uuid(),
  publish: z.boolean(),
  note: z.string().max(500).optional(),
  actorId: z.string().uuid().optional(),
});

export const getHomeSchema = z.object({
  organizationId: z.string().uuid().optional(),
  locale: z.string().min(2).max(12),
});

export const listMediaSchema = z.object({
  organizationId: z.string().uuid(),
  search: z.string().max(200).optional(),
  kind: z.enum(CMS_MEDIA_KINDS).optional(),
  videoProvider: z.enum(CMS_VIDEO_PROVIDERS).optional(),
  logoVariant: z.enum(CMS_LOGO_VARIANTS).optional(),
  category: z.string().max(80).optional(),
  tag: z.string().max(60).optional(),
  favoritesOnly: z.boolean().optional(),
  sort: z.enum(CMS_MEDIA_SORTS).optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).max(10_000).optional(),
});

export const createMediaSchema = z.object({
  organizationId: z.string().uuid(),
  kind: z.enum(CMS_MEDIA_KINDS),
  videoProvider: z.enum(CMS_VIDEO_PROVIDERS).optional(),
  logoVariant: z.enum(CMS_LOGO_VARIANTS).optional(),
  source: z.enum(CMS_MEDIA_SOURCES).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  altText: z.string().max(300).optional(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
  // Allows public URLs and local data: URLs (memory adapter / simple upload).
  url: z.string().min(1).max(3_000_000),
  storageBucket: z.string().max(80).optional(),
  storagePath: z.string().max(500).optional(),
  mimeType: z.string().max(120).optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  isFavorite: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  actorId: z.string().uuid().optional(),
});

export const updateMediaSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  altText: z.string().max(300).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().max(60)).max(30).optional(),
  url: z.string().min(1).max(3_000_000).optional(),
  videoProvider: z.enum(CMS_VIDEO_PROVIDERS).optional().nullable(),
  logoVariant: z.enum(CMS_LOGO_VARIANTS).optional().nullable(),
  mimeType: z.string().max(120).optional().nullable(),
  fileSizeBytes: z.number().int().nonnegative().optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  isFavorite: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  markUsed: z.boolean().optional(),
  actorId: z.string().uuid().optional(),
});

export const mediaIdSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid(),
  actorId: z.string().uuid().optional(),
});

export type HomePayloadInput = z.infer<typeof homePayloadSchema>;
export type SaveHomeDraftInput = z.infer<typeof saveHomeDraftSchema>;

export {
  CMS_HOME_SECTION_TYPES,
  CMS_HOME_STATUSES,
  CMS_HOME_V1_BLOCK_LABELS,
  CMS_HOME_V1_BLOCK_TYPES,
  CMS_HERO_MEDIA_MODES,
  CMS_MEDIA_KINDS,
  CMS_VIDEO_PROVIDERS,
  CMS_LOGO_VARIANTS,
};
