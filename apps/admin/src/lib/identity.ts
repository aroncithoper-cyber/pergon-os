import {
  createIdentityServices,
  createSharedMemoryUnitOfWork,
  IdentityError,
} from "@pergon/identity";
import { logger } from "@pergon/shared/logger";

export function getIdentityServices() {
  const uow = createSharedMemoryUnitOfWork();
  return createIdentityServices(uow);
}

export function toErrorResponse(error: unknown) {
  if (error instanceof IdentityError) {
    const status =
      error.code === "VALIDATION_FAILED"
        ? 400
        : error.code === "PASSPORT_NOT_FOUND" || error.code === "QR_NOT_FOUND"
          ? 404
          : error.code === "INVALID_TRANSITION" || error.code === "QR_NOT_ACTIVE"
            ? 409
            : 400;

    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }

  logger.exception("identity.api_unhandled", error);
  return Response.json({ error: { code: "INTERNAL", message: "Internal error" } }, { status: 500 });
}
