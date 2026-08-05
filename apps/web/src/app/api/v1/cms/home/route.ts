import { getCmsServices, toCmsErrorResponse } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? "es";
    const data = await getCmsServices().getPublishedHome({ locale });
    return Response.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return toCmsErrorResponse(error);
  }
}
