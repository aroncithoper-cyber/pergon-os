import { formatZodError } from "@pergon/shared/i18n";
import {
  ValidationFailedError,
  addDurationMs,
  hashPassword,
  hashToken,
  newId,
  newToken,
} from "../../domain";
import { forgotPasswordSchema, resetPasswordSchema } from "../../validation/schemas";
import type { AuthUnitOfWork } from "../ports";

export async function requestPasswordReset(uow: AuthUnitOfWork, raw: unknown) {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const user = await uow.users.findByEmail(parsed.data.email);
  // Always succeed to avoid account enumeration.
  if (!user || user.deletedAt) {
    return { accepted: true as const, token: undefined as string | undefined };
  }

  const now = new Date().toISOString();
  const token = newToken();
  await uow.passwordResets.save({
    id: newId(),
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: addDurationMs(now, 60 * 60 * 1000),
    createdAt: now,
  });

  await uow.audit.append({
    id: newId(),
    actorUserId: user.id,
    action: "auth:password_reset_requested",
    entityType: "user",
    entityId: user.id,
    metadata: {},
    createdAt: now,
  });

  await uow.commit();
  return { accepted: true as const, token };
}

export async function resetPassword(uow: AuthUnitOfWork, raw: unknown) {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const reset = await uow.passwordResets.findByTokenHash(hashToken(parsed.data.token));
  if (!reset || reset.usedAt || Date.parse(reset.expiresAt) <= Date.now()) {
    throw new ValidationFailedError("El token de restablecimiento no es válido o expiró.");
  }

  const user = await uow.users.findById(reset.userId);
  if (!user) throw new ValidationFailedError("El token de restablecimiento no es válido o expiró.");

  const now = new Date().toISOString();
  user.passwordHash = hashPassword(parsed.data.password);
  user.updatedAt = now;
  await uow.users.save(user);

  reset.usedAt = now;
  await uow.passwordResets.save(reset);

  const sessions = await uow.sessions.listByUser(user.id);
  for (const session of sessions) {
    if (session.status === "active") {
      session.status = "revoked";
      session.revokedAt = now;
      session.updatedAt = now;
      await uow.sessions.save(session);
    }
  }

  await uow.audit.append({
    id: newId(),
    actorUserId: user.id,
    action: "auth:password_reset",
    entityType: "user",
    entityId: user.id,
    metadata: {},
    createdAt: now,
  });

  await uow.commit();
  return { userId: user.id };
}
