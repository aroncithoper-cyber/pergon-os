import { getAuthUnitOfWork, toAuthErrorResponse } from "@/lib/auth";
import { isAuthDebugEnabled, probeAuthLogin } from "@/lib/auth-debug";

/**
 * TEMPORARY development diagnostic — remove after login diagnosis.
 * POST /api/v1/auth/debug-user/probe-login
 * Body: { email, password, organizationSlug?, organizationId? }
 *
 * Always HTTP 200 with step results (never 401) so the operator session is preserved.
 */
export async function POST(request: Request) {
  if (!isAuthDebugEnabled()) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "No encontrado." } },
      { status: 404 },
    );
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      organizationSlug?: string;
      organizationId?: string;
    };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || password.length < 8) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "email y password (mín. 8) son obligatorios.",
          },
        },
        { status: 400 },
      );
    }

    const data = await probeAuthLogin(getAuthUnitOfWork(), {
      email,
      password,
      organizationSlug: body.organizationSlug?.trim() || undefined,
      organizationId: body.organizationId?.trim() || undefined,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return Response.json({ data });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
