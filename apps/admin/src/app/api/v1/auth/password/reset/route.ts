import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await getAuthServices().resetPassword(body);
    return Response.json({ data: result });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
