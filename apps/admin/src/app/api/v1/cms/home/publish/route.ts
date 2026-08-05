import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, revalidateWebHomeCache, toCmsErrorResponse } from "@/lib/cms";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:publish");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data = await getCmsServices().publishHome({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      locale: typeof body.locale === "string" ? body.locale : "es",
      note: typeof body.note === "string" ? body.note : undefined,
      actorId: ctx.userId,
    });
    const revalidate = await revalidateWebHomeCache();
    return Response.json({ data: { ...data, revalidate } });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
