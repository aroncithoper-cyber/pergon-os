import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

/** Decoupled event bus — any module publishes system events here. */
export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "automations:trigger");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().dispatchAutomationEvent({
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
