import { formatZodError } from "@pergon/shared/i18n";
import {
  buildPassportEvent,
  createPassportPublicSnapshot,
  custodyForState,
  newId,
  newPublicCode,
  newPublicId,
  withCustody,
} from "../../domain";
import type { PassportRecord, QrCodeRecord } from "../../domain/models";
import { ValidationFailedError } from "../../domain/errors";
import { createPassportSchema } from "../../validation/schemas";
import type { CreatePassportInput, IdentityUnitOfWork } from "../ports";

export async function createPassport(uow: IdentityUnitOfWork, raw: CreatePassportInput) {
  const parsed = createPassportSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(formatZodError(parsed.error));
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const passportId = newId();
  const publicId = (input.publicId ?? newPublicId()).toUpperCase();

  const passport: PassportRecord = withCustody({
    id: passportId,
    organizationId: input.organizationId,
    publicId,
    productId: input.productId,
    batchId: input.batchId,
    state: "CREATED",
    custodyStage: custodyForState("CREATED"),
    version: 1,
    eventSeq: 1,
    issuedAt: now,
    expiresAt: input.expiresAt,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
    createdBy: input.actor.id,
    updatedBy: input.actor.id,
  });

  await uow.passports.save(passport);

  await uow.events.append(
    buildPassportEvent({
      organizationId: passport.organizationId,
      passportId: passport.id,
      seq: 1,
      type: "PASSPORT_CREATED",
      actor: input.actor,
      correlationId: input.correlationId,
      payload: {
        publicId: passport.publicId,
        productId: passport.productId,
        batchId: passport.batchId ?? null,
        state: passport.state,
      },
    }),
  );

  await uow.versions.save({
    id: newId(),
    passportId: passport.id,
    versionNumber: 1,
    snapshot: createPassportPublicSnapshot(passport),
    changeReason: "initial_issue",
    createdAt: now,
    createdBy: input.actor.id,
  });

  await uow.events.append(
    buildPassportEvent({
      organizationId: passport.organizationId,
      passportId: passport.id,
      seq: 2,
      type: "VERSION_SNAPSHOT",
      actor: input.actor,
      correlationId: input.correlationId,
      payload: { versionNumber: 1 },
    }),
  );
  passport.eventSeq = 2;

  let qr: QrCodeRecord | undefined;

  if (input.assignQr) {
    qr = {
      id: newId(),
      organizationId: passport.organizationId,
      passportId: passport.id,
      publicCode: newPublicCode(),
      status: "ACTIVE",
      version: 1,
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await uow.qrCodes.save(qr);
    passport.eventSeq = 3;
    passport.version += 1;
    passport.updatedAt = now;
    await uow.passports.save(passport);
    await uow.events.append(
      buildPassportEvent({
        organizationId: passport.organizationId,
        passportId: passport.id,
        seq: 3,
        type: "QR_ASSIGNED",
        actor: input.actor,
        correlationId: input.correlationId,
        payload: { qrCodeId: qr.id, publicCode: qr.publicCode },
      }),
    );
  } else {
    await uow.passports.save(passport);
  }

  await uow.audit.append({
    id: newId(),
    organizationId: passport.organizationId,
    actor: input.actor,
    action: "passport:issue",
    entityType: "passport",
    entityId: passport.id,
    after: createPassportPublicSnapshot(passport),
    requestId: input.correlationId,
    createdAt: now,
  });

  await uow.commit();

  return { passport, qr };
}
