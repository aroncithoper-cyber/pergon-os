import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "settings:read");
    const data = await getOpsServices().listSettings(ctx.organizationId);
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "settings:update");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().upsertSetting({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
      actor: actorFromContext(ctx.userId),
      requestId: request.headers.get("x-request-id") ?? undefined,
    });
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
