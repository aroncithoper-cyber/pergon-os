import { CmsError } from "@pergon/cms";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, toCmsErrorResponse } from "@/lib/cms";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(request, "cms:read");
    const { id } = await context.params;
    const data = await getCmsServices().getMediaAsset({
      organizationId: ctx.organizationId,
      id,
    });
    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(request, "cms:write");
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    if (body.action === "favorite") {
      const data = await getCmsServices().toggleMediaFavorite({
        organizationId: ctx.organizationId,
        id,
        actorId: ctx.userId,
      });
      return Response.json({ data });
    }
    const data = await getCmsServices().updateMediaAsset({
      ...body,
      organizationId: ctx.organizationId,
      id,
      actorId: ctx.userId,
    });
    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(_request, "cms:write");
    const { id } = await context.params;
    const data = await getCmsServices().deleteMediaAsset({
      organizationId: ctx.organizationId,
      id,
      actorId: ctx.userId,
    });
    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
