import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "alerts:read");
    const data = await getOpsServices().listAlerts(ctx.organizationId);
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
