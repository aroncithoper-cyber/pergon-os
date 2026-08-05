import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "dashboard:configure");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().saveDashboardLayout({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
      userId: body.userId ?? ctx.userId,
      actor: actorFromContext(ctx.userId),
      requestId: request.headers.get("x-request-id") ?? undefined,
    });
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
