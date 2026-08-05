import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "dashboard:read");
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getOpsServices().fetchDashboardWidget({
      ...body,
      organizationId: body.organizationId ?? ctx.organizationId,
    });
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
