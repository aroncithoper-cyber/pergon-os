import { SessionNotFoundError, UnauthorizedError } from "../../domain";
import { decodeAccessToken } from "../guards";
import type { AuthUnitOfWork, ResolvedAccess } from "../ports";
import { resolveAuthContext } from "./resolve-context";

export async function getSessionFromAccessToken(
  uow: AuthUnitOfWork,
  accessToken: string | null | undefined,
): Promise<ResolvedAccess> {
  if (!accessToken) throw new UnauthorizedError();
  const payload = decodeAccessToken(accessToken);
  if (!payload || Date.parse(payload.exp) <= Date.now()) {
    throw new SessionNotFoundError();
  }

  const session = await uow.sessions.findById(payload.sid);
  if (!session || session.status !== "active") throw new SessionNotFoundError();
  if (session.accessTokenJti !== payload.jti) throw new SessionNotFoundError();

  const user = await uow.users.findById(session.userId);
  if (!user || user.status !== "active" || user.deletedAt) throw new UnauthorizedError();

  const context = await resolveAuthContext(uow, {
    userId: user.id,
    organizationId: session.organizationId,
    sessionId: session.id,
    mfaVerified: Boolean(session.mfaVerifiedAt),
  });

  return { context, session, user };
}
