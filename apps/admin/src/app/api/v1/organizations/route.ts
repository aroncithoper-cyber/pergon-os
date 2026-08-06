import { ValidationFailedError } from "@pergon/auth";
import { logger } from "@pergon/shared/logger";

import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices } from "@/lib/cms";

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.PERGON_SETUP_SECRET;
    if (!setupSecret) {
      throw new ValidationFailedError(
        "El bootstrap de organizaci\u00f3n est\u00e1 desactivado. Define PERGON_SETUP_SECRET.",
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const provided =
      request.headers.get("x-pergon-setup-secret") ??
      (typeof body.setupSecret === "string" ? body.setupSecret : null);

    if (provided !== setupSecret) {
      throw new ValidationFailedError("El secreto de configuraci\u00f3n no es v\u00e1lido.");
    }

    const { setupSecret: _s, ...payload } = body;
    void _s;
    const result = await getAuthServices().createOrganizationWithOwner(payload);

    try {
      await getCmsServices().publishHome({
        organizationId: result.organizationId,
        locale: "es",
        note: "Home inicial publicado en bootstrap",
        actorId: result.userId,
      });
    } catch (cmsError) {
      logger.exception("cms.bootstrap_publish_failed", cmsError);
      throw new ValidationFailedError(
        "La organizaci\u00f3n se cre\u00f3, pero no fue posible publicar el Home inicial. Revisa CMS y vuelve a publicar.",
      );
    }

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
