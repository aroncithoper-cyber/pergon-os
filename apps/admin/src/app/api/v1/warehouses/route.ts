import { requireApiPermission } from "@/lib/auth";
import { actorFromContext, getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "warehouses:manage");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().createWarehouse({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
      actor: actorFromContext(ctx.userId),
      requestId: request.headers.get("x-request-id") ?? undefined,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
