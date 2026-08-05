import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

/** Immutable definition history for an automation. */
export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "automations:read");
    const url = new URL(request.url);
    const automationId = url.searchParams.get("automationId");
    if (!automationId) {
      return Response.json(
        { error: { code: "VALIDATION_FAILED", message: "automationId required" } },
        { status: 400 },
      );
    }
    const data = await getOpsServices().listAutomationVersions(automationId, ctx.organizationId);
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
