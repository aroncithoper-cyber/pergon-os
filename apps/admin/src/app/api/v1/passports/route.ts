import { getIdentityServices, toErrorResponse } from "@/lib/identity";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const services = getIdentityServices();

    const result = await services.createPassport({
      organizationId: String(body.organizationId),
      productId: String(body.productId),
      batchId: body.batchId ? String(body.batchId) : undefined,
      publicId: body.publicId ? String(body.publicId) : undefined,
      expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
      metadata:
        typeof body.metadata === "object" && body.metadata
          ? (body.metadata as Record<string, unknown>)
          : undefined,
      assignQr: body.assignQr !== false,
      actor: {
        type: "user",
        id: body.actorId ? String(body.actorId) : undefined,
      },
      correlationId: request.headers.get("x-request-id") ?? undefined,
    });

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
