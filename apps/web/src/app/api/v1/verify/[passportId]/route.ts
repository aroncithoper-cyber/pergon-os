import { getIdentityServices, hashIp, toErrorResponse } from "@/lib/identity";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ passportId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { passportId } = await params;
    const services = getIdentityServices();
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? null;
    const url = new URL(request.url);
    const geoLat = url.searchParams.get("lat");
    const geoLng = url.searchParams.get("lng");

    const result = await services.getPublicVerification({
      passportId,
      channel: "web",
      ipHash: hashIp(ip),
      userAgent: request.headers.get("user-agent") ?? undefined,
      geo: geoLat && geoLng ? { lat: Number(geoLat), lng: Number(geoLng) } : undefined,
    });

    return Response.json(
      { data: result },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
