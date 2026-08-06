import { formatZodError } from "@pergon/shared/i18n";
import { buildPassportEvent, newId, newPublicCode, nextQrStatusAfterRotate } from "../../domain";
import { PassportNotFoundError, ValidationFailedError } from "../../domain/errors";
import { rotateQrSchema } from "../../validation/schemas";
import type { IdentityUnitOfWork, RotateQrInput } from "../ports";

export async function rotateQr(uow: IdentityUnitOfWork, raw: RotateQrInput) {
  const parsed = rotateQrSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(formatZodError(parsed.error));
  }

  const input = parsed.data;
  const passport = await uow.passports.findById(input.passportId);
  if (!passport || passport.deletedAt) {
    throw new PassportNotFoundError(input.passportId);
  }

  const current = await uow.qrCodes.findActiveByPassportId(passport.id);
  const now = new Date().toISOString();

  if (current) {
    const rotatedStatus = nextQrStatusAfterRotate(current.status);
    await uow.qrCodes.save({
      ...current,
      status: rotatedStatus,
      version: current.version + 1,
      updatedAt: now,
    });
  }

  const qr = {
    id: newId(),
    organizationId: passport.organizationId,
    passportId: passport.id,
    publicCode: newPublicCode(),
    status: "ACTIVE" as const,
    version: 1,
    rotatedFromId: current?.id,
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await uow.qrCodes.save(qr);

  const nextSeq = passport.eventSeq + 1;
  passport.eventSeq = nextSeq;
  passport.version += 1;
  passport.updatedAt = now;
  passport.updatedBy = input.actor.id;
  await uow.passports.save(passport);

  await uow.events.append(
    buildPassportEvent({
      organizationId: passport.organizationId,
      passportId: passport.id,
      seq: nextSeq,
      type: "QR_ROTATED",
      actor: input.actor,
      correlationId: input.correlationId,
      payload: {
        previousQrCodeId: current?.id ?? null,
        newQrCodeId: qr.id,
        publicCode: qr.publicCode,
        reason: input.reason,
      },
    }),
  );

  await uow.audit.append({
    id: newId(),
    organizationId: passport.organizationId,
    actor: input.actor,
    action: "qr:rotate",
    entityType: "qr_code",
    entityId: qr.id,
    after: { publicCode: qr.publicCode, passportId: passport.id },
    requestId: input.correlationId,
    createdAt: now,
  });

  await uow.commit();
  return { passport, qr, previous: current };
}
