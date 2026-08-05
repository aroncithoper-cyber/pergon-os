import { SessionNotFoundError, ValidationFailedError, hashToken, newId } from "../../domain";
import { logoutSchema } from "../../validation/schemas";
import { decodeAccessToken } from "../guards";
import type { AuthUnitOfWork } from "../ports";

export async function logout(uow: AuthUnitOfWork, raw: unknown): Promise<{ revoked: number }> {
  const parsed = logoutSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);

  const input = parsed.data;
  const now = new Date().toISOString();
  let revoked = 0;

  let session =
    (input.refreshToken
      ? await uow.sessions.findByRefreshTokenHash(hashToken(input.refreshToken))
      : null) ?? null;

  if (!session && input.accessToken) {
    const payload = decodeAccessToken(input.accessToken);
    if (payload?.sid) session = await uow.sessions.findById(payload.sid);
  }

  if (!session) throw new SessionNotFoundError();

  if (input.allSessions) {
    const sessions = await uow.sessions.listByUser(session.userId);
    for (const s of sessions) {
      if (s.status === "active") {
        s.status = "revoked";
        s.revokedAt = now;
        s.updatedAt = now;
        await uow.sessions.save(s);
        revoked += 1;
      }
    }
  } else if (session.status === "active") {
    session.status = "revoked";
    session.revokedAt = now;
    session.updatedAt = now;
    await uow.sessions.save(session);
    revoked = 1;
  }

  await uow.audit.append({
    id: newId(),
    organizationId: session.organizationId,
    actorUserId: session.userId,
    action: input.allSessions ? "auth:logout_all" : "auth:logout",
    entityType: "session",
    entityId: session.id,
    metadata: { revoked },
    createdAt: now,
  });

  await uow.commit();
  return { revoked };
}
