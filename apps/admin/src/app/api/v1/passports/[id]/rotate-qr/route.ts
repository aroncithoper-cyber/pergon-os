import { requireApiPermission } from "@/lib/auth";
import { getIdentityServices, toErrorResponse } from "@/lib/identity";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireApiPermission(request, "qr:rotate");
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const services = getIdentityServices();

    const result = await services.rotateQr({
      passportId: id,
      reason: String(body.reason ?? "rotation"),
      actor: {
        type: "user",
        id: ctx.userId,
      },
      correlationId: request.headers.get("x-request-id") ?? undefined,
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
