import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tokens = await getAuthServices().refreshSession({
      ...body,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return Response.json({ data: tokens });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
