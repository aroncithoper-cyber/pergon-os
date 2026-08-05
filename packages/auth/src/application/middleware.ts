import type { PermissionKey } from "../domain/catalog";
import type { AuthContext } from "../domain/models";
import { ForbiddenError, UnauthorizedError } from "../domain/errors";
import { requirePermission } from "../domain/policies";
import { extractBearerToken } from "./guards";
import { getSessionFromAccessToken } from "./use-cases/get-session";
import type { AuthUnitOfWork } from "./ports";

export type AuthMiddlewareResult = {
  context: AuthContext;
  accessToken: string;
};

/**
 * Resolve AuthContext from Authorization bearer token.
 * Authorization always validates permissions (never roles alone).
 */
export async function authenticateRequest(
  uow: AuthUnitOfWork,
  request: Request,
): Promise<AuthMiddlewareResult> {
  const accessToken = extractBearerToken(request.headers.get("authorization"));
  if (!accessToken) throw new UnauthorizedError();
  const { context } = await getSessionFromAccessToken(uow, accessToken);
  return { context, accessToken };
}

export async function authorizeRequest(
  uow: AuthUnitOfWork,
  request: Request,
  permission: PermissionKey | string,
): Promise<AuthMiddlewareResult> {
  const result = await authenticateRequest(uow, request);
  requirePermission(result.context, permission);
  return result;
}

export async function authorizeAnyPermission(
  uow: AuthUnitOfWork,
  request: Request,
  permissions: readonly (PermissionKey | string)[],
): Promise<AuthMiddlewareResult> {
  const result = await authenticateRequest(uow, request);
  const ok = permissions.some((p) => result.context.permissions.has(p));
  if (!ok) throw new ForbiddenError(permissions.join("|"));
  return result;
}
