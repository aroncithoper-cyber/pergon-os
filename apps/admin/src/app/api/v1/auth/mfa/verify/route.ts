import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await getAuthServices().verifyMfaChallenge({
      ...body,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    if (result.status !== "authenticated") {
      return Response.json({ data: result }, { status: 401 });
    }

    return Response.json({
      data: {
        status: result.status,
        tokens: result.tokens,
        context: {
          userId: result.context.userId,
          organizationId: result.context.organizationId,
          sessionId: result.context.sessionId,
          roleKeys: result.context.roleKeys,
          permissions: [...result.context.permissions],
          mfaVerified: result.context.mfaVerified,
        },
      },
    });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
