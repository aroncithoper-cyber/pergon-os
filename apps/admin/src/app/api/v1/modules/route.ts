import { requireAuthContext } from "@/lib/auth";
import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

export async function GET(request: Request) {
  try {
    await requireAuthContext(request);
    const data = getOpsServices().registry;
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
