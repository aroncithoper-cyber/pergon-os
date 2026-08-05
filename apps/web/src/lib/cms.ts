import {
  CmsError,
  createCmsServices,
  createDefaultCmsUnitOfWork,
  createSharedMemoryCmsUnitOfWork,
} from "@pergon/cms";
import { hasSupabaseServiceRole } from "@pergon/shared/env";
import { logger } from "@pergon/shared/logger";

export function getCmsServices() {
  const uow = hasSupabaseServiceRole()
    ? createDefaultCmsUnitOfWork()
    : createSharedMemoryCmsUnitOfWork();
  return createCmsServices(uow);
}

export function toCmsErrorResponse(error: unknown) {
  if (error instanceof CmsError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "VALIDATION_FAILED" || error.code === "PREVIEW_INVALID"
          ? 400
          : error.code === "CONFLICT"
            ? 409
            : 400;
    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }
  logger.exception("cms.api_unhandled", error);
  return Response.json({ error: { code: "INTERNAL", message: "Internal error" } }, { status: 500 });
}
