import { getIdentityServices, toErrorResponse } from "@/lib/identity";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const afterSeq = url.searchParams.get("afterSeq");
    const services = getIdentityServices();

    const result = await services.getPassportHistory({
      passportId: id,
      limit: limit ? Number(limit) : undefined,
      afterSeq: afterSeq ? Number(afterSeq) : undefined,
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
