import { requirePermission, type AuthContext } from "../../domain";
import type { AuthUnitOfWork } from "../ports";

export async function listSessions(uow: AuthUnitOfWork, ctx: AuthContext) {
  requirePermission(ctx, "sessions:read");
  const sessions = await uow.sessions.listByUser(ctx.userId);
  return sessions
    .filter((s) => s.organizationId === ctx.organizationId)
    .map((s) => ({
      id: s.id,
      status: s.status,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      refreshExpiresAt: s.refreshExpiresAt,
      revokedAt: s.revokedAt,
      mfaVerifiedAt: s.mfaVerifiedAt,
      userAgent: s.userAgent,
      current: s.id === ctx.sessionId,
    }));
}
