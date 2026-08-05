import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await getAuthServices().logout(body);
    return Response.json({ data: result });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
