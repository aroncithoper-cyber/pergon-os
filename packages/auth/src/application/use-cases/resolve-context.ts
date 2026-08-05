import type { AuthContext } from "../../domain/models";
import type { AuthUnitOfWork } from "../ports";

export async function resolveAuthContext(
  uow: AuthUnitOfWork,
  input: {
    userId: string;
    organizationId: string;
    sessionId: string;
    mfaVerified: boolean;
  },
): Promise<AuthContext> {
  const userRoles = await uow.userRoles.listByUserAndOrg(input.userId, input.organizationId);
  const roleIds = userRoles.map((r) => r.roleId);
  const roleKeys: string[] = [];

  for (const roleId of roleIds) {
    const role = await uow.roles.findById(roleId);
    if (role) roleKeys.push(role.key);
  }

  const permissionKeys = await uow.rolePermissions.listPermissionKeysByRoleIds(roleIds);

  return {
    userId: input.userId,
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    permissions: new Set(permissionKeys),
    roleKeys,
    mfaVerified: input.mfaVerified,
  };
}
