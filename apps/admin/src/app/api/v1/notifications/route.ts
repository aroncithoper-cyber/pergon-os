import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "notifications:read");
    const body = (await request.json()) as Record<string, unknown>;
    if (body.action === "enqueue") {
      await requireApiPermission(request, "notifications:write");
      const data = await getOpsServices().enqueueNotification({
        ...body,
        organizationId: body.organizationId ?? ctx.organizationId,
        actor: actorFromContext(ctx.userId),
        requestId: request.headers.get("x-request-id") ?? undefined,
      });
      return Response.json({ data }, { status: 201 });
    }
    const data = await getOpsServices().listNotifications({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
    });
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
