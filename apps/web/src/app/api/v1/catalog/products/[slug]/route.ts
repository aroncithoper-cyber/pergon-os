import { getCatalogServices, toCatalogErrorResponse } from "@/lib/catalog";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const data = await getCatalogServices().getPublishedProductBySlug({ slug });

    if (!data) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Producto no publicado" } },
        {
          status: 404,
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        },
      );
    }

    return Response.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    return toCatalogErrorResponse(error);
  }
}
