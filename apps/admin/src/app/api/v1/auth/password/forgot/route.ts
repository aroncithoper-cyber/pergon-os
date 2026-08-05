import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await getAuthServices().requestPasswordReset(body);
    return Response.json({
      data: {
        accepted: result.accepted,
        // Token only returned in memory/dev adapters; production must send via email channel.
        ...(process.env.NODE_ENV !== "production" && result.token ? { token: result.token } : {}),
      },
    });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
