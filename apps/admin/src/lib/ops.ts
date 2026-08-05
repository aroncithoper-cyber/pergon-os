import {
  OpsError,
  createOpsServices,
  createSharedMemoryUnitOfWork,
  mapOpsHttpError,
} from "@pergon/ops";
import { logger } from "@pergon/shared/logger";

export function getOpsServices() {
  return createOpsServices(createSharedMemoryUnitOfWork());
}

export function getOpsUnitOfWork() {
  return createSharedMemoryUnitOfWork();
}

export function toOpsErrorResponse(error: unknown) {
  if (error instanceof OpsError || (error && typeof error === "object" && "code" in error)) {
    const mapped = mapOpsHttpError(error);
    return Response.json(
      { error: { code: mapped.code, message: mapped.message } },
      { status: mapped.status },
    );
  }
  logger.exception("ops.api_unhandled", error);
  return Response.json({ error: { code: "INTERNAL", message: "Internal error" } }, { status: 500 });
}

export function actorFromContext(userId: string) {
  return { type: "user" as const, id: userId };
}
