import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, toCmsErrorResponse } from "@/lib/cms";

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:read");
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? "es";
    const data = await getCmsServices().getHomeDocument({
      organizationId: ctx.organizationId,
      locale,
    });
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
