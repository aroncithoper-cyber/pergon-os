import { requireApiPermission } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function POST(request: Request) {
  try {
    await requireApiPermission(request, "notifications:manage");
    const body = (await request.json()) as { limit?: number };
    const data = await getOpsServices().drainNotificationOutbox(body.limit ?? 50);
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
