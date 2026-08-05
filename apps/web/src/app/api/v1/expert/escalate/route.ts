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

    const data = await getExpertServices().escalateSupport({
      conversationId: String(body.conversationId ?? ""),
      reason: String(body.reason ?? ""),
      anonymousKey: keyHash,
      metadata:
        typeof body.metadata === "object" && body.metadata
          ? (body.metadata as Record<string, unknown>)
          : {},
    });

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return toExpertErrorResponse(error);
  }
}
