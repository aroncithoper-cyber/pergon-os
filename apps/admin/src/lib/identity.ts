import {
  IdentityError,
  createIdentityServices,
  createSharedMemoryUnitOfWork,
} from "@pergon/identity";
import { AuthError, mapAuthHttpError } from "@pergon/auth";
import { logger } from "@pergon/shared/logger";

export function getIdentityServices() {
  const uow = createSharedMemoryUnitOfWork();
  return createIdentityServices(uow);
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    const mapped = mapAuthHttpError(error);
    return Response.json(
      { error: { code: mapped.code, message: mapped.message } },
      { status: mapped.status },
    );
  }

  if (error instanceof IdentityError) {
    const status =
      error.code === "VALIDATION_FAILED"
        ? 400
        : error.code === "PASSPORT_NOT_FOUND" ||
            error.code === "QR_NOT_FOUND" ||
            error.code === "PASSPORT_DELETED"
          ? 404
          : error.code === "INVALID_TRANSITION" ||
              error.code === "QR_NOT_ACTIVE" ||
              error.code === "CONCURRENCY_CONFLICT"
            ? 409
            : 400;

    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }

  logger.exception("identity.api_unhandled", error);
  return Response.json(
    {
      error: {
        code: "INTERNAL",
        message: "Ocurrió un problema interno. Intenta nuevamente.",
      },
    },
    { status: 500 },
  );
}
