import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "dashboard:read");
    const moduleKey = new URL(request.url).searchParams.get("module") ?? undefined;
    const data = await getOpsServices().listSavedViews(ctx.organizationId, moduleKey);
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "dashboard:configure");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().createSavedView({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
      userId: body.userId ?? ctx.userId,
      actor: actorFromContext(ctx.userId),
      requestId: request.headers.get("x-request-id") ?? undefined,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
