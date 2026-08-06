import { formatZodError } from "@pergon/shared/i18n";
import { randomUUID } from "node:crypto";

import type { CatalogProductRecord } from "../../domain/models";
import { CatalogValidationError } from "../../domain/errors";
import { upsertCatalogProductSchema } from "../../validation/schemas";
import type { CatalogUnitOfWork, UpsertCatalogProductInput } from "../ports";

export async function upsertCatalogProduct(
  uow: CatalogUnitOfWork,
  raw: UpsertCatalogProductInput,
): Promise<CatalogProductRecord> {
  const parsed = upsertCatalogProductSchema.safeParse(raw);
  if (!parsed.success) {
    throw new CatalogValidationError(formatZodError(parsed.error));
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const existing = input.id ? await uow.products.findById(input.id) : null;

  const record: CatalogProductRecord = {
    id: existing?.id ?? input.id ?? randomUUID(),
    organizationId: input.organizationId,
    categoryId: input.categoryId ?? existing?.categoryId,
    opsProductId: input.opsProductId ?? existing?.opsProductId,
    slug: input.slug.toLowerCase(),
    name: input.name,
    tagline: input.tagline ?? existing?.tagline,
    summary: input.summary ?? existing?.summary,
    status: input.status ?? existing?.status ?? "draft",
    publishedAt:
      (input.status ?? existing?.status) === "published"
        ? (existing?.publishedAt ?? now)
        : existing?.publishedAt,
    heroEyebrow: input.heroEyebrow ?? existing?.heroEyebrow,
    heroHeadline: input.heroHeadline ?? existing?.heroHeadline,
    heroSupport: input.heroSupport ?? existing?.heroSupport,
    heroPrimaryCtaLabel: input.heroPrimaryCtaLabel ?? existing?.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: input.heroPrimaryCtaHref ?? existing?.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: input.heroSecondaryCtaLabel ?? existing?.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: input.heroSecondaryCtaHref ?? existing?.heroSecondaryCtaHref,
    seoTitle: input.seoTitle ?? existing?.seoTitle,
    seoDescription: input.seoDescription ?? existing?.seoDescription,
    ogImageAssetId: existing?.ogImageAssetId,
    beforeAfter: input.beforeAfter ?? existing?.beforeAfter ?? {},
    performance: input.performance ?? existing?.performance ?? {},
    dilutionCalculator: input.dilutionCalculator ?? existing?.dilutionCalculator ?? {},
    cta: input.cta ?? existing?.cta ?? {},
    model3d: input.model3d ?? existing?.model3d ?? {},
    sortOrder: existing?.sortOrder ?? 0,
    metadata: input.metadata ?? existing?.metadata ?? {},
    version: (existing?.version ?? 0) + 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? input.actorId,
    updatedBy: input.actorId,
    deletedAt: existing?.deletedAt,
  };

  if (record.status === "published" && !record.publishedAt) {
    record.publishedAt = now;
  }

  await uow.products.save(record);
  await uow.commit();
  return record;
}
