import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "reports:read");
    const data = await getOpsServices().listReportJobs(ctx.organizationId);
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
