import {
  ValidationFailedError,
  addDurationMs,
  hashToken,
  newId,
  newToken,
  requirePermission,
  type AuthContext,
} from "../../domain";
import { inviteUserSchema } from "../../validation/schemas";
import type { AuthUnitOfWork } from "../ports";

export async function inviteUser(uow: AuthUnitOfWork, ctx: AuthContext, raw: unknown) {
  requirePermission(ctx, "users:invite");
  const parsed = inviteUserSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);

  const input = parsed.data;
  if (input.organizationId !== ctx.organizationId) {
    requirePermission(ctx, "org:update");
  }

  const now = new Date().toISOString();
  const token = newToken();
  const invitation = {
    id: newId(),
    organizationId: input.organizationId,
    email: input.email,
    roleKeys: input.roleKeys,
    tokenHash: hashToken(token),
    status: "pending" as const,
    invitedBy: input.invitedBy ?? ctx.userId,
    expiresAt: addDurationMs(now, input.expiresInHours * 60 * 60 * 1000),
    createdAt: now,
  };

  await uow.invitations.save(invitation);
  await uow.audit.append({
    id: newId(),
    organizationId: input.organizationId,
    actorUserId: ctx.userId,
    action: "users:invite",
    entityType: "invitation",
    entityId: invitation.id,
    metadata: { email: input.email, roleKeys: input.roleKeys },
    createdAt: now,
  });
  await uow.commit();

  return { invitation, token };
}
