import { createHash } from "node:crypto";

import { anonymousKeyFromRequest, getExpertServices, toExpertErrorResponse } from "@/lib/expert";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const anon = anonymousKeyFromRequest(request);
    const keyHash = createHash("sha256").update(anon).digest("hex").slice(0, 32);
    const data = await getExpertServices().getConversation(id, { anonymousKey: keyHash });
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toExpertErrorResponse(error);
  }
}
