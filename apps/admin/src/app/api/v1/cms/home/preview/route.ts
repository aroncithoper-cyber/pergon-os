import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, toCmsErrorResponse } from "@/lib/cms";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:write");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const webUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const data = await getCmsServices().createPreviewToken({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      locale: typeof body.locale === "string" ? body.locale : "es",
      ttlSeconds: typeof body.ttlSeconds === "number" ? body.ttlSeconds : 1800,
      versionId: typeof body.versionId === "string" ? body.versionId : undefined,
      actorId: ctx.userId,
    });
    return Response.json({
      data: {
        ...data,
        previewUrl: `${webUrl}${data.previewPath}`,
      },
    });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
