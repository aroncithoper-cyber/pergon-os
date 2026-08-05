import { ValidationFailedError } from "@pergon/auth";

import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.PERGON_SETUP_SECRET;
    if (!setupSecret) {
      throw new ValidationFailedError(
        "Organization bootstrap disabled. Set PERGON_SETUP_SECRET to enable setup.",
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const provided =
      request.headers.get("x-pergon-setup-secret") ??
      (typeof body.setupSecret === "string" ? body.setupSecret : null);

    if (provided !== setupSecret) {
      throw new ValidationFailedError("Invalid setup secret");
    }

    const { setupSecret: _s, ...payload } = body;
    void _s;
    const result = await getAuthServices().createOrganizationWithOwner(payload);
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
