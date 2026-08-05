import { createHash } from "node:crypto";

import { anonymousKeyFromRequest, getExpertServices, toExpertErrorResponse } from "@/lib/expert";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const services = getExpertServices();
    const anon = anonymousKeyFromRequest(request);
    const keyHash = createHash("sha256").update(anon).digest("hex").slice(0, 32);

    const data = await services.askExpert({
      message: String(body.message ?? ""),
      conversationId: typeof body.conversationId === "string" ? body.conversationId : undefined,
      productSlug: typeof body.productSlug === "string" ? body.productSlug : undefined,
      passportId: typeof body.passportId === "string" ? body.passportId : undefined,
      qrCode: typeof body.qrCode === "string" ? body.qrCode : undefined,
      channel: "web",
      anonymousKey: keyHash,
      dailyLimit: 30,
    });

    return Response.json({ data });
  } catch (error) {
    return toExpertErrorResponse(error);
  }
}
