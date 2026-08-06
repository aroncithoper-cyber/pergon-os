import { formatZodError } from "@pergon/shared/i18n";
import {
  InvitationNotFoundError,
  ValidationFailedError,
  hashPassword,
  hashToken,
  newId,
} from "../../domain";
import { acceptInvitationSchema } from "../../validation/schemas";
import type { AuthUnitOfWork } from "../ports";

export async function acceptInvitation(uow: AuthUnitOfWork, raw: unknown) {
  const parsed = acceptInvitationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const input = parsed.data;
  const invitation = await uow.invitations.findByTokenHash(hashToken(input.token));
  if (!invitation || invitation.status !== "pending") {
    throw new InvitationNotFoundError();
  }
  if (Date.parse(invitation.expiresAt) <= Date.now()) {
    invitation.status = "expired";
    await uow.invitations.save(invitation);
    await uow.commit();
    throw new InvitationNotFoundError();
  }

  const now = new Date().toISOString();
  let user = await uow.users.findByEmail(invitation.email);
  if (!user) {
    user = {
      id: newId(),
      email: invitation.email,
      fullName: input.fullName,
      status: "active",
      passwordHash: hashPassword(input.password),
      mfaEnabled: false,
      locale: "es",
      createdAt: now,
      updatedAt: now,
    };
  } else {
    user.fullName = input.fullName;
    user.passwordHash = hashPassword(input.password);
    user.status = "active";
    user.updatedAt = now;
  }
  await uow.users.save(user);

  await uow.memberships.save({
    id: newId(),
    organizationId: invitation.organizationId,
    userId: user.id,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  for (const roleKey of invitation.roleKeys) {
    const role = await uow.roles.findByKey(roleKey);
    if (!role) continue;
    await uow.userRoles.save({
      id: newId(),
      userId: user.id,
      roleId: role.id,
      organizationId: invitation.organizationId,
      createdAt: now,
    });
  }

  invitation.status = "accepted";
  invitation.acceptedAt = now;
  await uow.invitations.save(invitation);

  await uow.audit.append({
    id: newId(),
    organizationId: invitation.organizationId,
    actorUserId: user.id,
    action: "users:accept_invite",
    entityType: "invitation",
    entityId: invitation.id,
    metadata: {},
    createdAt: now,
  });

  await uow.commit();
  return { userId: user.id, organizationId: invitation.organizationId };
}
