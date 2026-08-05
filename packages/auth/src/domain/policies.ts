import type { PermissionKey } from "./catalog";
import { ForbiddenError, UnauthorizedError } from "./errors";
import type { AuthContext } from "./models";

export function hasPermission(
  ctx: AuthContext | null | undefined,
  permission: PermissionKey | string,
): boolean {
  if (!ctx) return false;
  return ctx.permissions.has(permission);
}

export function hasAnyPermission(
  ctx: AuthContext | null | undefined,
  permissions: readonly (PermissionKey | string)[],
): boolean {
  if (!ctx) return false;
  return permissions.some((p) => ctx.permissions.has(p));
}

export function requireAuth(ctx: AuthContext | null | undefined): AuthContext {
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}

export function requirePermission(
  ctx: AuthContext | null | undefined,
  permission: PermissionKey | string,
): AuthContext {
  const auth = requireAuth(ctx);
  if (!auth.permissions.has(permission)) {
    throw new ForbiddenError(permission);
  }
  return auth;
}

export function requireAllPermissions(
  ctx: AuthContext | null | undefined,
  permissions: readonly (PermissionKey | string)[],
): AuthContext {
  const auth = requireAuth(ctx);
  for (const permission of permissions) {
    if (!auth.permissions.has(permission)) {
      throw new ForbiddenError(permission);
    }
  }
  return auth;
}

export function requireOrganization(
  ctx: AuthContext | null | undefined,
  organizationId: string,
): AuthContext {
  const auth = requireAuth(ctx);
  if (auth.organizationId !== organizationId) {
    throw new ForbiddenError("org:scope");
  }
  return auth;
}

/** Policy helpers for common domains — always permission-based. */
export const policies = {
  canInviteUsers: (ctx: AuthContext | null | undefined) => hasPermission(ctx, "users:invite"),
  canAssignRoles: (ctx: AuthContext | null | undefined) => hasPermission(ctx, "roles:assign"),
  canRevokeSessions: (ctx: AuthContext | null | undefined) => hasPermission(ctx, "sessions:revoke"),
  canIssuePassports: (ctx: AuthContext | null | undefined) => hasPermission(ctx, "passports:issue"),
  canReadAudit: (ctx: AuthContext | null | undefined) => hasPermission(ctx, "audit:read"),
};
