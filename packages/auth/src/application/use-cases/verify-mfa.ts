import {
  SessionNotFoundError,
  ValidationFailedError,
  addDurationMs,
  hashIp,
  hashToken,
  newId,
  newToken,
} from "../../domain";
import { verifyMfaSchema } from "../../validation/schemas";
import { createAccessTokenPayload, encodeAccessToken } from "../guards";
import type { AuthUnitOfWork, LoginResult } from "../ports";
import { AUTH_TOKEN_TTL } from "./login";
import { resolveAuthContext } from "./resolve-context";

/**
 * MFA verification is prepared for TOTP providers.
 * Stub accepts any 6-digit code when the challenge is valid and user has MFA enabled.
 * Replace `verifyTotpCode` before production.
 */
export function verifyTotpCode(_secretEncrypted: string | undefined, code: string): boolean {
  return /^\d{6}$/.test(code);
}

export async function verifyMfaChallenge(uow: AuthUnitOfWork, raw: unknown): Promise<LoginResult> {
  const parsed = verifyMfaSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);

  const input = parsed.data;
  const challenge = await uow.mfaChallenges.findById(input.challengeId);
  if (!challenge || challenge.status !== "pending") {
    throw new SessionNotFoundError();
  }
  if (Date.parse(challenge.expiresAt) <= Date.now()) {
    challenge.status = "expired";
    await uow.mfaChallenges.save(challenge);
    await uow.commit();
    throw new SessionNotFoundError();
  }

  const user = await uow.users.findById(challenge.userId);
  if (!user || !user.mfaEnabled || user.status !== "active") {
    throw new SessionNotFoundError();
  }
  if (!verifyTotpCode(user.mfaSecretEncrypted, input.code)) {
    throw new ValidationFailedError("Invalid MFA code");
  }

  const now = new Date().toISOString();
  challenge.status = "consumed";
  await uow.mfaChallenges.save(challenge);

  const sessionId = newId();
  const refreshToken = newToken();
  const accessJti = newId();
  const accessExpiresAt = addDurationMs(now, AUTH_TOKEN_TTL.ACCESS_TTL_MS);
  const refreshExpiresAt = addDurationMs(now, AUTH_TOKEN_TTL.REFRESH_TTL_MS);

  const context = await resolveAuthContext(uow, {
    userId: user.id,
    organizationId: challenge.organizationId,
    sessionId,
    mfaVerified: true,
  });

  await uow.sessions.save({
    id: sessionId,
    userId: user.id,
    organizationId: challenge.organizationId,
    status: "active",
    refreshTokenHash: hashToken(refreshToken),
    accessTokenJti: accessJti,
    ipHash: hashIp(input.ip),
    userAgent: input.userAgent,
    expiresAt: accessExpiresAt,
    refreshExpiresAt,
    mfaVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  user.lastLoginAt = now;
  user.updatedAt = now;
  await uow.users.save(user);

  await uow.audit.append({
    id: newId(),
    organizationId: challenge.organizationId,
    actorUserId: user.id,
    action: "auth:mfa_verified",
    entityType: "session",
    entityId: sessionId,
    metadata: { challengeId: challenge.id },
    createdAt: now,
  });

  await uow.commit();

  return {
    status: "authenticated",
    context,
    tokens: {
      accessToken: encodeAccessToken(createAccessTokenPayload(context, accessJti, accessExpiresAt)),
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      sessionId,
    },
  };
}
