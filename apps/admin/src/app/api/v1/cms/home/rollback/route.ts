import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, revalidateWebHomeCache, toCmsErrorResponse } from "@/lib/cms";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:rollback");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getCmsServices().rollbackHome({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      locale: typeof body.locale === "string" ? body.locale : "es",
      versionId: String(body.versionId ?? ""),
      publish: body.publish !== false,
      note: typeof body.note === "string" ? body.note : undefined,
      actorId: ctx.userId,
    });
    const revalidate =
      body.publish === false ? { ok: false, reason: "skipped" } : await revalidateWebHomeCache();
    return Response.json({ data: { ...data, revalidate } });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
