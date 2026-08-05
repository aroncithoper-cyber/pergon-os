import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "audit:read");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().listAudit({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
    });
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
