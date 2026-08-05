import { z } from "zod";

import { CATALOG_STATUSES } from "../domain/states";

export const getPublishedProductBySlugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .transform((v) => v.trim().toLowerCase()),
});

export const upsertCatalogProductSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  opsProductId: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i),
  name: z.string().min(1).max(200),
  tagline: z.string().max(280).optional(),
  summary: z.string().max(2000).optional(),
  status: z.enum(CATALOG_STATUSES).optional(),
  heroEyebrow: z.string().max(80).optional(),
  heroHeadline: z.string().max(200).optional(),
  heroSupport: z.string().max(500).optional(),
  heroPrimaryCtaLabel: z.string().max(80).optional(),
  heroPrimaryCtaHref: z.string().max(500).optional(),
  heroSecondaryCtaLabel: z.string().max(80).optional(),
  heroSecondaryCtaHref: z.string().max(500).optional(),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(300).optional(),
  beforeAfter: z.record(z.unknown()).optional(),
  performance: z.record(z.unknown()).optional(),
  dilutionCalculator: z.record(z.unknown()).optional(),
  cta: z.record(z.unknown()).optional(),
  model3d: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  actorId: z.string().uuid().optional(),
});
