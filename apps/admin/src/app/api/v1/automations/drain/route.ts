import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

/** Background drain — pending / waiting / retries (+ optional schedule tick). */
export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "automations:manage");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data = await getOpsServices().drainAutomations({
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
