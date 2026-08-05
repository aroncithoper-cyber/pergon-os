import {
  ForbiddenError,
  UnauthorizedError,
  requireAuth,
  requirePermission,
  type AuthContext,
  type PermissionKey,
} from "../domain";

export {
  hasPermission,
  hasAnyPermission,
  requireAuth,
  requirePermission,
  requireAllPermissions,
  requireOrganization,
  policies,
} from "../domain/policies";

export type Guard = (ctx: AuthContext | null | undefined) => AuthContext;

export function guardAuthenticated(): Guard {
  return (ctx) => requireAuth(ctx);
}

export function guardPermission(permission: PermissionKey | string): Guard {
  return (ctx) => requirePermission(ctx, permission);
}

export function assertGuard(guard: Guard, ctx: AuthContext | null | undefined): AuthContext {
  return guard(ctx);
}

export function createAccessTokenPayload(ctx: AuthContext, jti: string, expiresAt: string) {
  return {
    sub: ctx.userId,
    org: ctx.organizationId,
    sid: ctx.sessionId,
    jti,
    perms: [...ctx.permissions],
    roles: [...ctx.roleKeys],
    mfa: ctx.mfaVerified,
    exp: expiresAt,
  };
}

export function encodeAccessToken(payload: ReturnType<typeof createAccessTokenPayload>): string {
  // Opaque signed-style token for Phase 2 (replace with JWT provider later).
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeAccessToken(
  token: string,
): ReturnType<typeof createAccessTokenPayload> | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(json) as ReturnType<typeof createAccessTokenPayload>;
  } catch {
    return null;
  }
}

export function contextFromAccessToken(token: string | null | undefined): AuthContext | null {
  if (!token) return null;
  const payload = decodeAccessToken(token);
  if (!payload) return null;
  if (Date.parse(payload.exp) <= Date.now()) return null;
  return {
    userId: payload.sub,
    organizationId: payload.org,
    sessionId: payload.sid,
    permissions: new Set(payload.perms),
    roleKeys: payload.roles,
    mfaVerified: payload.mfa,
  };
}

export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function mapAuthHttpError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  if (error instanceof UnauthorizedError) {
    return { status: 401, code: error.code, message: error.message };
  }
  if (error instanceof ForbiddenError) {
    return { status: 403, code: error.code, message: error.message };
  }
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const e = error as { code: string; message: string; name?: string };
    const status =
      e.code === "VALIDATION_FAILED"
        ? 400
        : e.code === "INVALID_CREDENTIALS" || e.code === "SESSION_NOT_FOUND"
          ? 401
          : e.code === "MFA_REQUIRED"
            ? 401
            : e.code === "USER_NOT_FOUND" || e.code === "INVITATION_NOT_FOUND"
              ? 404
              : 400;
    return { status, code: e.code, message: e.message };
  }
  return { status: 500, code: "INTERNAL", message: "Internal error" };
}
