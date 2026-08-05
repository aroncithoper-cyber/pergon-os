import { newId } from "../../domain";
import type { ScanResult } from "../../domain/states";
import { ValidationFailedError } from "../../domain/errors";
import { verifyCodeSchema } from "../../validation/schemas";
import type { IdentityUnitOfWork, VerifyCodeInput, VerifyCodeResult } from "../ports";

const BURST_WINDOW_MS = 60_000;
const BURST_THRESHOLD = 30;
const PASSPORT_BURST_THRESHOLD = 20;

function mapStateToScanResult(state: string): ScanResult {
  if (state === "BLOCKED") return "blocked";
  if (state === "RETIRED") return "retired";
  return "valid";
}

export async function verifyCode(
  uow: IdentityUnitOfWork,
  raw: VerifyCodeInput,
): Promise<VerifyCodeResult> {
  const parsed = verifyCodeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(parsed.error.message);
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const since = new Date(Date.now() - BURST_WINDOW_MS).toISOString();
  let riskScore = 0;
  let trustSignalId: string | undefined;

  if (input.ipHash) {
    const ipCount = await uow.scans.countRecentByIpHash(input.ipHash, since);
    if (ipCount >= BURST_THRESHOLD) {
      riskScore = Math.max(riskScore, 80);
    }
  }

  const qr = await uow.qrCodes.findByPublicCode(input.publicCode);

  if (!qr || qr.deletedAt) {
    const scanId = newId();
    await uow.scans.append({
      id: scanId,
      publicCodeAttempt: input.publicCode,
      result: riskScore >= 80 ? "rate_limited" : "invalid",
      channel: input.channel,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      geo: input.geo,
      riskScore,
      createdAt: now,
    });
    await uow.commit();
    return { result: riskScore >= 80 ? "rate_limited" : "invalid", riskScore, scanId };
  }

  if (qr.status === "ROTATED") {
    const scanId = newId();
    await uow.scans.append({
      id: scanId,
      organizationId: qr.organizationId,
      qrCodeId: qr.id,
      passportId: qr.passportId,
      publicCodeAttempt: input.publicCode,
      result: "rotated",
      channel: input.channel,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      geo: input.geo,
      riskScore: Math.max(riskScore, 40),
      createdAt: now,
    });
    await uow.commit();
    return { result: "rotated", riskScore: Math.max(riskScore, 40), scanId };
  }

  if (qr.status === "SUSPENDED") {
    const scanId = newId();
    await uow.scans.append({
      id: scanId,
      organizationId: qr.organizationId,
      qrCodeId: qr.id,
      passportId: qr.passportId,
      publicCodeAttempt: input.publicCode,
      result: "suspended",
      channel: input.channel,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      geo: input.geo,
      riskScore: Math.max(riskScore, 50),
      createdAt: now,
    });
    await uow.commit();
    return { result: "suspended", riskScore: Math.max(riskScore, 50), scanId };
  }

  if (qr.status !== "ACTIVE") {
    const scanId = newId();
    await uow.scans.append({
      id: scanId,
      organizationId: qr.organizationId,
      qrCodeId: qr.id,
      passportId: qr.passportId,
      publicCodeAttempt: input.publicCode,
      result: "invalid",
      channel: input.channel,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      geo: input.geo,
      riskScore,
      createdAt: now,
    });
    await uow.commit();
    return { result: "invalid", riskScore, scanId };
  }

  const passport = await uow.passports.findById(qr.passportId);
  if (!passport || passport.deletedAt) {
    const scanId = newId();
    await uow.scans.append({
      id: scanId,
      organizationId: qr.organizationId,
      qrCodeId: qr.id,
      passportId: qr.passportId,
      publicCodeAttempt: input.publicCode,
      result: "invalid",
      channel: input.channel,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      geo: input.geo,
      riskScore,
      createdAt: now,
    });
    await uow.commit();
    return { result: "invalid", riskScore, scanId };
  }

  if (passport.expiresAt && Date.parse(passport.expiresAt) < Date.now()) {
    const scanId = newId();
    await uow.scans.append({
      id: scanId,
      organizationId: passport.organizationId,
      qrCodeId: qr.id,
      passportId: passport.id,
      publicCodeAttempt: input.publicCode,
      result: "expired",
      channel: input.channel,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      geo: input.geo,
      riskScore,
      createdAt: now,
    });
    await uow.commit();
    return { result: "expired", riskScore, scanId };
  }

  const passportBurst = await uow.scans.countRecentByPassport(passport.id, since);
  if (passportBurst >= PASSPORT_BURST_THRESHOLD) {
    riskScore = Math.max(riskScore, 90);
    trustSignalId = newId();
    await uow.trust.save({
      id: trustSignalId,
      organizationId: passport.organizationId,
      passportId: passport.id,
      qrCodeId: qr.id,
      type: "CLONE_SUSPECTED",
      severity: "critical",
      status: "open",
      payload: {
        reason: "scan_burst_on_single_passport",
        windowMs: BURST_WINDOW_MS,
        count: passportBurst + 1,
        channel: input.channel,
      },
      createdAt: now,
    });
  }

  const result = riskScore >= 90 ? "suspicious" : mapStateToScanResult(passport.state);
  const scanId = newId();

  await uow.scans.append({
    id: scanId,
    organizationId: passport.organizationId,
    qrCodeId: qr.id,
    passportId: passport.id,
    publicCodeAttempt: input.publicCode,
    result,
    channel: input.channel,
    ipHash: input.ipHash,
    userAgent: input.userAgent,
    geo: input.geo,
    riskScore,
    createdAt: now,
  });

  await uow.commit();

  return {
    result,
    riskScore,
    scanId,
    trustSignalId,
    passport:
      result === "valid" || result === "suspicious"
        ? {
            publicId: passport.publicId,
            state: passport.state,
            custodyStage: passport.custodyStage,
            productId: passport.productId,
            version: passport.version,
            expiresAt: passport.expiresAt,
          }
        : undefined,
  };
}
