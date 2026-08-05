import { createHash } from "node:crypto";

import { anonymousKeyFromRequest, getExpertServices, toExpertErrorResponse } from "@/lib/expert";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const keyHash = createHash("sha256")
      .update(anonymousKeyFromRequest(request))
      .digest("hex")
      .slice(0, 32);

    const data = await getExpertServices().submitFeedback({
      conversationId: String(body.conversationId ?? ""),
      messageId: String(body.messageId ?? ""),
      rating: body.rating === "down" ? "down" : "up",
      comment: typeof body.comment === "string" ? body.comment : undefined,
      anonymousKey: keyHash,
    });

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return toExpertErrorResponse(error);
  }
}
