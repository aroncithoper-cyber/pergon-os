import type { PassportState } from "@pergon/identity";

import { requireApiPermission } from "@/lib/auth";
import { getIdentityServices, toErrorResponse } from "@/lib/identity";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireApiPermission(request, "passports:update");
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const services = getIdentityServices();

    const passport = await services.transitionPassport({
      passportId: id,
      toState: String(body.toState) as PassportState,
      reason: String(body.reason ?? ""),
      actor: {
        type: "user",
        id: ctx.userId,
      },
      correlationId: request.headers.get("x-request-id") ?? undefined,
    });

    return Response.json({ data: { passport } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
