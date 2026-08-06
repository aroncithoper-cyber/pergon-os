import { formatZodError } from "@pergon/shared/i18n";
import {
  InvalidCredentialsError,
  ValidationFailedError,
  addDurationMs,
  hashIp,
  hashToken,
  newId,
  newToken,
  verifyPassword,
} from "../../domain";
import { loginSchema } from "../../validation/schemas";
import { createAccessTokenPayload, encodeAccessToken } from "../guards";
import type { AuthUnitOfWork, LoginResult } from "../ports";
import { resolveAuthContext } from "./resolve-context";

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function login(uow: AuthUnitOfWork, raw: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const input = parsed.data;
  const user = await uow.users.findByEmail(input.email);
  if (!user || user.deletedAt || user.status === "disabled" || user.status === "locked") {
    throw new InvalidCredentialsError();
  }
  if (!verifyPassword(input.password, user.passwordHash)) {
    throw new InvalidCredentialsError();
  }

  let organizationId = input.organizationId;
  if (!organizationId && input.organizationSlug) {
    const org = await uow.organizations.findBySlug(input.organizationSlug);
    organizationId = org?.id;
  }
  if (!organizationId) {
    const memberships = (await uow.memberships.listByUser(user.id)).filter(
      (m) => m.status === "active",
    );
    if (memberships.length === 1) organizationId = memberships[0]!.organizationId;
  }
  if (!organizationId) {
    throw new ValidationFailedError("Se requiere organizationId o el slug de la organización.");
  }

  const membership = await uow.memberships.findByUserAndOrg(user.id, organizationId);
  if (!membership || membership.status !== "active") {
    throw new InvalidCredentialsError();
  }

  const now = new Date().toISOString();

  if (user.mfaEnabled) {
    const challengeId = newId();
    await uow.mfaChallenges.save({
      id: challengeId,
      userId: user.id,
      organizationId,
      status: "pending",
      expiresAt: addDurationMs(now, 10 * 60 * 1000),
      createdAt: now,
    });
    await uow.audit.append({
      id: newId(),
      organizationId,
      actorUserId: user.id,
      action: "auth:mfa_challenge",
      entityType: "user",
      entityId: user.id,
      metadata: { challengeId },
      createdAt: now,
    });
    await uow.commit();
    return { status: "mfa_required", challengeId, userId: user.id, organizationId };
  }

  const sessionId = newId();
  const refreshToken = newToken();
  const accessJti = newId();
  const accessExpiresAt = addDurationMs(now, ACCESS_TTL_MS);
  const refreshExpiresAt = addDurationMs(now, REFRESH_TTL_MS);

  const context = await resolveAuthContext(uow, {
    userId: user.id,
    organizationId,
    sessionId,
    mfaVerified: false,
  });

  await uow.sessions.save({
    id: sessionId,
    userId: user.id,
    organizationId,
    status: "active",
    refreshTokenHash: hashToken(refreshToken),
    accessTokenJti: accessJti,
    ipHash: hashIp(input.ip),
    userAgent: input.userAgent,
    expiresAt: accessExpiresAt,
    refreshExpiresAt,
    createdAt: now,
    updatedAt: now,
  });

  user.lastLoginAt = now;
  user.updatedAt = now;
  await uow.users.save(user);

  await uow.audit.append({
    id: newId(),
    organizationId,
    actorUserId: user.id,
    action: "auth:login",
    entityType: "session",
    entityId: sessionId,
    metadata: {},
    createdAt: now,
  });

  await uow.commit();

  const accessToken = encodeAccessToken(
    createAccessTokenPayload(context, accessJti, accessExpiresAt),
  );

  return {
    status: "authenticated",
    context,
    tokens: {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      sessionId,
    },
  };
}

// re-export constants for tests/docs
export const AUTH_TOKEN_TTL = { ACCESS_TTL_MS, REFRESH_TTL_MS };
