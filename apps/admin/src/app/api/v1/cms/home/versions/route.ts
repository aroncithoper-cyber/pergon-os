import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, toCmsErrorResponse } from "@/lib/cms";

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:read");
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? "es";
    const data = await getCmsServices().listHomeVersions({
      organizationId: ctx.organizationId,
      locale,
    });
    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
