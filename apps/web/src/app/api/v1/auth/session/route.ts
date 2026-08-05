import { extractBearerToken } from "@pergon/auth";
import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));
    const { context, user, session } = await getAuthServices().getSessionFromAccessToken(token);
    return Response.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          status: user.status,
          mfaEnabled: user.mfaEnabled,
          locale: user.locale,
        },
        session: {
          id: session.id,
          organizationId: session.organizationId,
          status: session.status,
          expiresAt: session.expiresAt,
          mfaVerifiedAt: session.mfaVerifiedAt,
        },
        context: {
          userId: context.userId,
          organizationId: context.organizationId,
          sessionId: context.sessionId,
          roleKeys: context.roleKeys,
          permissions: [...context.permissions],
          mfaVerified: context.mfaVerified,
        },
      },
    });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
