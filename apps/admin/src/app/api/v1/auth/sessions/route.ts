import { getAuthServices, requireAuthContext, toAuthErrorResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const ctx = await requireAuthContext(request);
    const sessions = await getAuthServices().listSessions(ctx);
    return Response.json({ data: sessions });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
