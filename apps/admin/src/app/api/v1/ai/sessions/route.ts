import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.action === "list") {
      const ctx = await requireApiPermission(request, "expert:use_admin");
      const data = await getOpsServices().listAiSessions({
        ...body,
        organizationId: body.organizationId ?? ctx.organizationId,
      });
      return Response.json({ data });
    }
    const ctx = await requireApiPermission(request, "expert:use_admin");
    const data = await getOpsServices().createAiSession({
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
