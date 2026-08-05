import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await getAuthServices().createOrganizationWithOwner(body);
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
