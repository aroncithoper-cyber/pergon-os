import { formatZodError } from "@pergon/shared/i18n";
import {
  UserNotFoundError,
  ValidationFailedError,
  newId,
  requirePermission,
  type AuthContext,
} from "../../domain";
import { assignRolesSchema } from "../../validation/schemas";
import type { AuthUnitOfWork } from "../ports";

export async function assignRoles(uow: AuthUnitOfWork, ctx: AuthContext, raw: unknown) {
  requirePermission(ctx, "roles:assign");
  const parsed = assignRolesSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const input = parsed.data;
  if (input.organizationId !== ctx.organizationId) {
    requirePermission(ctx, "roles:manage");
  }

  const user = await uow.users.findById(input.userId);
  if (!user) throw new UserNotFoundError(input.userId);

  const existing = await uow.userRoles.listByUserAndOrg(input.userId, input.organizationId);
  for (const link of existing) {
    await uow.userRoles.remove(link.id);
  }

  const now = new Date().toISOString();
  for (const roleKey of input.roleKeys) {
    const role = await uow.roles.findByKey(roleKey);
    if (!role) continue;
    await uow.userRoles.save({
      id: newId(),
      userId: input.userId,
      roleId: role.id,
      organizationId: input.organizationId,
      createdAt: now,
    });
  }

  await uow.audit.append({
    id: newId(),
    organizationId: input.organizationId,
    actorUserId: ctx.userId,
    action: "roles:assign",
    entityType: "user",
    entityId: input.userId,
    metadata: { roleKeys: input.roleKeys },
    createdAt: now,
  });

  await uow.commit();
  return { userId: input.userId, roleKeys: input.roleKeys };
}
