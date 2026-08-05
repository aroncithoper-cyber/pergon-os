import {
  AuthError,
  authenticateRequest,
  authorizeRequest,
  createAuthServices,
  createSharedMemoryUnitOfWork,
  mapAuthHttpError,
  type AuthContext,
  type PermissionKey,
} from "@pergon/auth";
import { logger } from "@pergon/shared/logger";

export function getAuthServices() {
  const uow = createSharedMemoryUnitOfWork();
  return createAuthServices(uow);
}

export function getAuthUnitOfWork() {
  return createSharedMemoryUnitOfWork();
}

export async function requireAuthContext(request: Request): Promise<AuthContext> {
  const { context } = await authenticateRequest(getAuthUnitOfWork(), request);
  return context;
}

export async function requireApiPermission(
  request: Request,
  permission: PermissionKey | string,
): Promise<AuthContext> {
  const { context } = await authorizeRequest(getAuthUnitOfWork(), request, permission);
  return context;
}

export function toAuthErrorResponse(error: unknown) {
  if (error instanceof AuthError || (error && typeof error === "object" && "code" in error)) {
    const mapped = mapAuthHttpError(error);
    return Response.json(
      { error: { code: mapped.code, message: mapped.message } },
      { status: mapped.status },
    );
  }

  logger.exception("auth.api_unhandled", error);
  return Response.json({ error: { code: "INTERNAL", message: "Internal error" } }, { status: 500 });
}
