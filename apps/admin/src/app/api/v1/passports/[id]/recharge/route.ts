import type { PassportState } from "@pergon/identity";

import { getIdentityServices, toErrorResponse } from "@/lib/identity";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const services = getIdentityServices();

    const result = await services.rechargePassport({
      passportId: id,
      idempotencyKey: String(body.idempotencyKey ?? ""),
      reason: String(body.reason ?? ""),
      toExpiresAt: body.toExpiresAt ? String(body.toExpiresAt) : undefined,
      toState: body.toState ? (String(body.toState) as PassportState) : undefined,
      actor: {
        type: "user",
        id: body.actorId ? String(body.actorId) : undefined,
      },
      correlationId: request.headers.get("x-request-id") ?? undefined,
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
