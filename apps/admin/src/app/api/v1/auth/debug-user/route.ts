import { getAuthUnitOfWork } from "@/lib/auth";
import { isAuthDebugEnabled, lookupDebugUser } from "@/lib/auth-debug";

/**
 * TEMPORARY development diagnostic — remove after login diagnosis.
 * GET /api/v1/auth/debug-user?email=
 */
export async function GET(request: Request) {
  if (!isAuthDebugEnabled()) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "No encontrado." } },
      { status: 404 },
    );
  }

  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!email) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Query email es obligatorio.",
        },
      },
      { status: 400 },
    );
  }

  const data = await lookupDebugUser(getAuthUnitOfWork(), email);
  return Response.json({ data });
}
