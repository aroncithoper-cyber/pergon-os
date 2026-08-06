import { formatZodError } from "@pergon/shared/i18n";
import {
  SessionNotFoundError,
  ValidationFailedError,
  addDurationMs,
  hashIp,
  hashToken,
  newId,
  newToken,
} from "../../domain";
import { refreshSchema } from "../../validation/schemas";
import { createAccessTokenPayload, encodeAccessToken } from "../guards";
import type { AuthUnitOfWork, TokenPair } from "../ports";
import { resolveAuthContext } from "./resolve-context";
import { AUTH_TOKEN_TTL } from "./login";

export async function refreshSession(uow: AuthUnitOfWork, raw: unknown): Promise<TokenPair> {
  const parsed = refreshSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const input = parsed.data;
  const existing = await uow.sessions.findByRefreshTokenHash(hashToken(input.refreshToken));
  if (!existing || existing.status !== "active") {
    throw new SessionNotFoundError();
  }
  if (Date.parse(existing.refreshExpiresAt) <= Date.now()) {
    existing.status = "expired";
    existing.updatedAt = new Date().toISOString();
    await uow.sessions.save(existing);
    await uow.commit();
    throw new SessionNotFoundError();
  }

  const now = new Date().toISOString();
  const refreshToken = newToken();
  const accessJti = newId();
  const accessExpiresAt = addDurationMs(now, AUTH_TOKEN_TTL.ACCESS_TTL_MS);
  const refreshExpiresAt = addDurationMs(now, AUTH_TOKEN_TTL.REFRESH_TTL_MS);

  existing.status = "revoked";
  existing.revokedAt = now;
  existing.updatedAt = now;
  await uow.sessions.save(existing);

  const sessionId = newId();
  await uow.sessions.save({
    id: sessionId,
    userId: existing.userId,
    organizationId: existing.organizationId,
    status: "active",
    refreshTokenHash: hashToken(refreshToken),
    accessTokenJti: accessJti,
    ipHash: hashIp(input.ip) ?? existing.ipHash,
    userAgent: input.userAgent ?? existing.userAgent,
    expiresAt: accessExpiresAt,
    refreshExpiresAt,
    mfaVerifiedAt: existing.mfaVerifiedAt,
    createdAt: now,
    updatedAt: now,
  });

  const context = await resolveAuthContext(uow, {
    userId: existing.userId,
    organizationId: existing.organizationId,
    sessionId,
    mfaVerified: Boolean(existing.mfaVerifiedAt),
  });

  await uow.audit.append({
    id: newId(),
    organizationId: existing.organizationId,
    actorUserId: existing.userId,
    action: "auth:refresh",
    entityType: "session",
    entityId: sessionId,
    metadata: { previousSessionId: existing.id },
    createdAt: now,
  });

  await uow.commit();

  return {
    accessToken: encodeAccessToken(createAccessTokenPayload(context, accessJti, accessExpiresAt)),
    refreshToken,
    accessExpiresAt,
    refreshExpiresAt,
    sessionId,
  };
}
