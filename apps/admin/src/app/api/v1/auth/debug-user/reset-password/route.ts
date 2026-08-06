import { getAuthUnitOfWork, toAuthErrorResponse } from "@/lib/auth";
import { isAuthDebugEnabled, resetDebugUserPassword } from "@/lib/auth-debug";

/**
 * TEMPORARY development diagnostic — remove after login diagnosis.
 * POST /api/v1/auth/debug-user/reset-password
 * Body: { email, password }
 */
export async function POST(request: Request) {
  if (!isAuthDebugEnabled()) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "No encontrado." } },
      { status: 404 },
    );
  }

  try {
    const body = (await request.json()) as { email?: string; password?: string };
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

    const data = await resetDebugUserPassword(getAuthUnitOfWork(), { email, password });
    if (!data.ok) {
      return Response.json(
        { error: { code: "VALIDATION_FAILED", message: data.message }, data },
        { status: 400 },
      );
    }

    return Response.json({ data });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
