import { getAuthServices, requireApiPermission, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "roles:assign");
    const body = await request.json();
    const result = await getAuthServices().assignRoles(ctx, body);
    return Response.json({ data: result });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
