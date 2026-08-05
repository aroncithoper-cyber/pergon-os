import { getAuthServices, requireApiPermission, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "users:invite");
    const body = await request.json();
    const result = await getAuthServices().inviteUser(ctx, body);
    return Response.json(
      {
        data: {
          invitationId: result.invitation.id,
          email: result.invitation.email,
          expiresAt: result.invitation.expiresAt,
          // Token only returned in non-production for wiring tests.
          ...(process.env.NODE_ENV !== "production" ? { token: result.token } : {}),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
