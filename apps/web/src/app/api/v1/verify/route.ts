import { getIdentityServices, hashIp, toErrorResponse } from "@/lib/identity";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const services = getIdentityServices();
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? null;

    const result = await services.verifyCode({
      publicCode: String(body.publicCode ?? body.code ?? ""),
      channel: "web",
      ipHash: hashIp(ip),
      userAgent: request.headers.get("user-agent") ?? undefined,
      geo:
        typeof body.geo === "object" && body.geo
          ? (body.geo as Record<string, unknown>)
          : undefined,
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
