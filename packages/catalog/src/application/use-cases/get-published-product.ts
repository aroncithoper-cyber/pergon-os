import { formatZodError } from "@pergon/shared/i18n";
import type { CatalogAssetRecord, PublishedProductExperience } from "../../domain/models";
import type {
  CatalogUnitOfWork,
  GetPublishedProductBySlugInput,
  GetPublishedProductBySlugResult,
} from "../ports";
import { getPublishedProductBySlugSchema } from "../../validation/schemas";
import { CatalogValidationError } from "../../domain/errors";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pickAsset(assets: CatalogAssetRecord[], kind: CatalogAssetRecord["kind"]) {
  return assets.find((a) => a.kind === kind) ?? null;
}

function pickAssets(assets: CatalogAssetRecord[], kind: CatalogAssetRecord["kind"]) {
  return assets.filter((a) => a.kind === kind);
}

export async function getPublishedProductBySlug(
  uow: CatalogUnitOfWork,
  raw: GetPublishedProductBySlugInput,
): Promise<GetPublishedProductBySlugResult> {
  const parsed = getPublishedProductBySlugSchema.safeParse(raw);
  if (!parsed.success) {
    throw new CatalogValidationError(formatZodError(parsed.error));
  }

  const product = await uow.products.findPublishedBySlug(parsed.data.slug);
  if (!product) return null;

  const [
    category,
    assets,
    benefits,
    applications,
    materials,
    dilutions,
    faqs,
    variants,
    presentations,
    relations,
  ] = await Promise.all([
    product.categoryId ? uow.categories.findById(product.categoryId) : Promise.resolve(null),
    uow.assets.listByProductId(product.id),
    uow.benefits.listByProductId(product.id),
    uow.applications.listByProductId(product.id),
    uow.materials.listByProductId(product.id),
    uow.dilutions.listByProductId(product.id),
    uow.faqs.listByProductId(product.id),
    uow.variants.listByProductId(product.id),
    uow.presentations.listByProductId(product.id),
    uow.relations.listByProductId(product.id),
  ]);

  const publishedVariants = variants.filter((v) => v.status === "published");
  const publishedPresentations = presentations.filter((p) => p.status === "published");

  const relatedIds = relations.map((r) => r.relatedProductId);
  const relatedProducts = await uow.products.listPublishedByIds(relatedIds);
  const relatedById = new Map(relatedProducts.map((p) => [p.id, p]));

  const ogAsset = product.ogImageAssetId
    ? ((await uow.assets.findById(product.ogImageAssetId)) ?? null)
    : pickAsset(assets, "hero");

  const modelAsset = pickAsset(assets, "model_3d");
  const modelEnabled =
    Boolean(product.model3d.enabled) || Boolean(modelAsset?.publicUrl || modelAsset?.storagePath);

  const experience: PublishedProductExperience = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline ?? null,
    summary: product.summary ?? null,
    category:
      category && category.status === "published"
        ? { slug: category.slug, name: category.name }
        : null,
    seo: {
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.summary ?? product.tagline ?? product.name,
      ogImageUrl: ogAsset?.publicUrl ?? null,
    },
    hero: {
      eyebrow: product.heroEyebrow ?? null,
      headline: product.heroHeadline ?? product.name,
      support: product.heroSupport ?? product.summary ?? null,
      primaryCta:
        product.heroPrimaryCtaLabel && product.heroPrimaryCtaHref
          ? { label: product.heroPrimaryCtaLabel, href: product.heroPrimaryCtaHref }
          : null,
      secondaryCta:
        product.heroSecondaryCtaLabel && product.heroSecondaryCtaHref
          ? { label: product.heroSecondaryCtaLabel, href: product.heroSecondaryCtaHref }
          : null,
      media: pickAsset(assets, "hero"),
    },
    gallery: pickAssets(assets, "gallery"),
    model3d: {
      enabled: modelEnabled,
      asset: modelAsset,
      config: product.model3d,
    },
    beforeAfter: {
      before: pickAsset(assets, "before"),
      after: pickAsset(assets, "after"),
      caption: asString(product.beforeAfter.caption),
    },
    benefits,
    applications,
    materialsCompatible: materials.filter((m) => m.compatibility === "compatible"),
    materialsIncompatible: materials.filter((m) => m.compatibility === "incompatible"),
    dilutions,
    dilutionCalculator: product.dilutionCalculator,
    performance: product.performance,
    datasheet: pickAsset(assets, "datasheet"),
    safetySheet: pickAsset(assets, "safety_sheet"),
    documents: [
      ...pickAssets(assets, "document"),
      ...pickAssets(assets, "file"),
      ...pickAssets(assets, "datasheet"),
      ...pickAssets(assets, "safety_sheet"),
    ],
    videos: pickAssets(assets, "video"),
    faqs,
    variants: publishedVariants,
    presentations: publishedPresentations,
    cta: product.cta,
    related: relations
      .map((rel) => {
        const related = relatedById.get(rel.relatedProductId);
        if (!related) return null;
        return {
          slug: related.slug,
          name: related.name,
          tagline: related.tagline ?? null,
          relationType: rel.relationType,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row)),
    publishedAt: product.publishedAt ?? null,
    updatedAt: product.updatedAt,
  };

  return experience;
}
