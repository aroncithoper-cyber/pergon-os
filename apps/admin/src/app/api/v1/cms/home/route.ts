import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, revalidateWebHomeCache, toCmsErrorResponse } from "@/lib/cms";

/**
 * Load Home working document. If it was never published, publish the default
 * seed once so the public Web never stays on "Home sin publicar".
 */
export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:read");
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? "es";
    let data = await getCmsServices().getHomeDocument({
      organizationId: ctx.organizationId,
      locale,
    });

    if (!data.publishedPayload || data.publishedVersion === 0) {
      const published = await getCmsServices().publishHome({
        organizationId: ctx.organizationId,
        locale,
        note: "Publicaci\u00f3n inicial autom\u00e1tica del Home",
        actorId: ctx.userId,
      });
      data = published.document;
      await revalidateWebHomeCache();
    }

    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:write");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getCmsServices().saveHomeDraft({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      locale: typeof body.locale === "string" ? body.locale : "es",
      payload: body.payload,
      expectedWorkingVersion:
        typeof body.expectedWorkingVersion === "number" ? body.expectedWorkingVersion : undefined,
      actorId: ctx.userId,
    });
    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
