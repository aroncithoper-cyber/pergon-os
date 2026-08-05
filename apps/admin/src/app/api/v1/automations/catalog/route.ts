import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

/** Trigger / action catalogs for Flow Builder and module integrations. */
export async function GET(request: Request) {
  try {
    await requireApiPermission(request, "automations:read");
    const data = getOpsServices().getAutomationCatalog();
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
