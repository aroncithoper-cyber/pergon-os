import { formatZodError } from "@pergon/shared/i18n";
import { logger } from "@pergon/shared/logger";
import {
  InvalidCredentialsError,
  ValidationFailedError,
  addDurationMs,
  hashIp,
  hashToken,
  newId,
  newToken,
  verifyPasswordDetailed,
} from "../../domain";
import { loginSchema } from "../../validation/schemas";
import { createAccessTokenPayload, encodeAccessToken } from "../guards";
import type { AuthUnitOfWork, LoginResult } from "../ports";
import { resolveAuthContext } from "./resolve-context";

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function isDev() {
  return process.env.NODE_ENV === "development";
}

function rejectCredentials(devReason: string): never {
  if (isDev()) {
    logger.warn("auth.login_rejected", { reason: devReason, table: "public.users" });
    throw new ValidationFailedError(`Login rechazado: ${devReason}`);
  }
  throw new InvalidCredentialsError();
}

export async function login(uow: AuthUnitOfWork, raw: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));

  const input = parsed.data;
  if (isDev()) {
    logger.info("auth.login_start", {
      email: input.email,
      organizationSlug: input.organizationSlug,
      organizationId: input.organizationId,
      lookupTable: "public.users",
    });
  }

  const user = await uow.users.findByEmail(input.email);
  if (!user) {
    rejectCredentials(`usuario no encontrado en public.users para email=${input.email}`);
  }
  if (user.deletedAt) {
    rejectCredentials(`usuario ${user.id} tiene deleted_at`);
  }
  if (user.status === "disabled" || user.status === "locked") {
    rejectCredentials(`usuario ${user.id} status=${user.status}`);
  }

  const passwordCheck = verifyPasswordDetailed(input.password, user.passwordHash);
  if (isDev()) {
    logger.info("auth.login_password_check", {
      userId: user.id,
      algoritmoDetectado: passwordCheck.algo,
      verifyPassword: passwordCheck.ok,
      motivo: passwordCheck.reason ?? "ok",
      verifier: "packages/auth/src/domain/crypto.ts#verifyPasswordDetailed",
      hasher: "packages/auth/src/domain/crypto.ts#hashPassword",
    });
  }
  if (!passwordCheck.ok) {
    rejectCredentials(
      `verifyPassword=false algo=${passwordCheck.algo ?? "null"} motivo=${passwordCheck.reason ?? "desconocido"}`,
    );
  }

  let organizationId = input.organizationId;
  if (!organizationId && input.organizationSlug) {
    const org = await uow.organizations.findBySlug(input.organizationSlug);
    organizationId = org?.id;
    if (isDev()) {
      logger.info("auth.login_org_by_slug", {
        slug: input.organizationSlug,
        found: Boolean(org),
        organizationId,
      });
    }
  }
  if (!organizationId) {
    const memberships = (await uow.memberships.listByUser(user.id)).filter(
      (m) => m.status === "active",
    );
    if (memberships.length === 1) organizationId = memberships[0]!.organizationId;
    if (isDev()) {
      logger.info("auth.login_org_from_memberships", {
        activeCount: memberships.length,
        organizationId,
      });
    }
  }
  if (!organizationId) {
    throw new ValidationFailedError(
      "Se requiere organizationId o el slug de la organizaci\u00f3n.",
    );
  }

  const membership = await uow.memberships.findByUserAndOrg(user.id, organizationId);
  if (!membership || membership.status !== "active") {
    rejectCredentials(
      `sin membership activa en public.memberships userId=${user.id} organizationId=${organizationId}`,
    );
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

  if (isDev()) {
    logger.info("auth.login_ok", { userId: user.id, organizationId, sessionId });
  }

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

export const AUTH_TOKEN_TTL = { ACCESS_TTL_MS, REFRESH_TTL_MS };
