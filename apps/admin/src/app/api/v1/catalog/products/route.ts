import {
  CatalogError,
  createCatalogServices,
  createSharedMemoryCatalogUnitOfWork,
  type UpsertCatalogProductInput,
} from "@pergon/catalog";

import { requireApiPermission } from "@/lib/auth";
import { toOpsErrorResponse } from "@/lib/ops";

function getCatalogServices() {
  return createCatalogServices(createSharedMemoryCatalogUnitOfWork());
}

function toCatalogErrorResponse(error: unknown) {
  if (error instanceof CatalogError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "VALIDATION_FAILED"
          ? 400
          : error.code === "CONFLICT"
            ? 409
            : 400;
    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }
  return toOpsErrorResponse(error);
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "products:write");
    const body = (await request.json()) as Partial<UpsertCatalogProductInput> &
      Record<string, unknown>;

    const data = await getCatalogServices().upsertCatalogProduct({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      id: typeof body.id === "string" ? body.id : undefined,
      categoryId: typeof body.categoryId === "string" ? body.categoryId : undefined,
      opsProductId: typeof body.opsProductId === "string" ? body.opsProductId : undefined,
      slug: String(body.slug ?? ""),
      name: String(body.name ?? ""),
      tagline: typeof body.tagline === "string" ? body.tagline : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
      status: body.status,
      heroEyebrow: typeof body.heroEyebrow === "string" ? body.heroEyebrow : undefined,
      heroHeadline: typeof body.heroHeadline === "string" ? body.heroHeadline : undefined,
      heroSupport: typeof body.heroSupport === "string" ? body.heroSupport : undefined,
      heroPrimaryCtaLabel:
        typeof body.heroPrimaryCtaLabel === "string" ? body.heroPrimaryCtaLabel : undefined,
      heroPrimaryCtaHref:
        typeof body.heroPrimaryCtaHref === "string" ? body.heroPrimaryCtaHref : undefined,
      heroSecondaryCtaLabel:
        typeof body.heroSecondaryCtaLabel === "string" ? body.heroSecondaryCtaLabel : undefined,
      heroSecondaryCtaHref:
        typeof body.heroSecondaryCtaHref === "string" ? body.heroSecondaryCtaHref : undefined,
      seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : undefined,
      seoDescription: typeof body.seoDescription === "string" ? body.seoDescription : undefined,
      beforeAfter: body.beforeAfter,
      performance: body.performance,
      dilutionCalculator: body.dilutionCalculator,
      cta: body.cta,
      model3d: body.model3d,
      metadata: body.metadata,
      actorId: ctx.userId,
    });

    return Response.json({ data }, { status: body.id ? 200 : 201 });
  } catch (error) {
    if (error instanceof CatalogError) return toCatalogErrorResponse(error);
    return toOpsErrorResponse(error);
  }
}
