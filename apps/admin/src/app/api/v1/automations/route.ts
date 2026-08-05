import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "automations:read");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().listAutomations({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
    });
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "automations:manage");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().upsertAutomation({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
      actor: actorFromContext(ctx.userId),
      requestId: request.headers.get("x-request-id") ?? undefined,
    });
    return Response.json({ data }, { status: body.id ? 200 : 201 });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
