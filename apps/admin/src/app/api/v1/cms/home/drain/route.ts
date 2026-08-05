import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, revalidateWebHomeCache, toCmsErrorResponse } from "@/lib/cms";

/** Process due publish / unpublish schedules for Home CMS. */
export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:publish");
    const data = await getCmsServices().drainHomeSchedule(ctx.userId);
    const revalidate =
      data.published.length > 0 || data.unpublished.length > 0
        ? await revalidateWebHomeCache()
        : { ok: false as const, reason: "noop" };
    return Response.json({ data: { ...data, revalidate } });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
