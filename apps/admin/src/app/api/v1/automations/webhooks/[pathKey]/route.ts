import { getOpsServices, toOpsErrorResponse } from "@/lib/ops";

/** Node required: webhook secret compare uses Buffer timing-safe APIs. */
export const runtime = "nodejs";

/**
 * Public webhook ingress authenticated by header secret only.
 * Auth via `x-pergon-webhook-secret` — not session JWT.
 */
export async function POST(request: Request, context: { params: Promise<{ pathKey: string }> }) {
  try {
    const { pathKey } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const secret = request.headers.get("x-pergon-webhook-secret") ?? undefined;
    const { secret: _ignored, drain, ...payload } = body;
    void _ignored;
    const data = await getOpsServices().ingestAutomationWebhook({
      pathKey,
      payload,
      secret,
      drain: drain !== false,
    });
    if (!data.ok) {
      return Response.json(
        { error: { code: "WEBHOOK_REJECTED", message: data.error } },
        { status: 401 },
      );
    }
    return Response.json({ data });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
