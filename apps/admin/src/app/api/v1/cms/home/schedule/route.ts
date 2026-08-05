import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, revalidateWebHomeCache, toCmsErrorResponse } from "@/lib/cms";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:publish");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getCmsServices().scheduleHome({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      locale: typeof body.locale === "string" ? body.locale : "es",
      publishAt:
        body.publishAt === null
          ? null
          : typeof body.publishAt === "string"
            ? body.publishAt
            : undefined,
      unpublishAt:
        body.unpublishAt === null
          ? null
          : typeof body.unpublishAt === "string"
            ? body.unpublishAt
            : undefined,
      actorId: ctx.userId,
    });
    const revalidate = await revalidateWebHomeCache();
    return Response.json({ data: { document: data, revalidate } });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
