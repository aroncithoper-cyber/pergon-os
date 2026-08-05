import {
  buildPassportEvent,
  createPassportPublicSnapshot,
  newId,
  transitionPassportState,
  withCustody,
} from "../../domain";
import { PassportNotFoundError, ValidationFailedError } from "../../domain/errors";
import { transitionPassportSchema } from "../../validation/schemas";
import type { IdentityUnitOfWork, TransitionPassportInput } from "../ports";

export async function transitionPassport(uow: IdentityUnitOfWork, raw: TransitionPassportInput) {
  const parsed = transitionPassportSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(parsed.error.message);
  }

  const input = parsed.data;
  const existing = await uow.passports.findById(input.passportId);
  if (!existing) {
    throw new PassportNotFoundError(input.passportId);
  }

  const before = { ...existing };
  const next = withCustody(transitionPassportState(existing, input.toState, input.actor));
  const now = new Date().toISOString();
  next.updatedAt = now;

  await uow.passports.save(next);
  await uow.events.append(
    buildPassportEvent({
      organizationId: next.organizationId,
      passportId: next.id,
      seq: next.eventSeq,
      type: "STATE_CHANGED",
      actor: input.actor,
      correlationId: input.correlationId,
      payload: {
        from: before.state,
        to: next.state,
        reason: input.reason,
        custodyStage: next.custodyStage,
      },
    }),
  );

  await uow.versions.save({
    id: newId(),
    passportId: next.id,
    versionNumber: next.version,
    snapshot: createPassportPublicSnapshot(next),
    changeReason: input.reason,
    createdAt: now,
    createdBy: input.actor.id,
  });

  await uow.events.append(
    buildPassportEvent({
      organizationId: next.organizationId,
      passportId: next.id,
      seq: next.eventSeq + 1,
      type: "VERSION_SNAPSHOT",
      actor: input.actor,
      correlationId: input.correlationId,
      payload: { versionNumber: next.version },
    }),
  );

  next.eventSeq += 1;
  await uow.passports.save(next);

  await uow.audit.append({
    id: newId(),
    organizationId: next.organizationId,
    actor: input.actor,
    action: "passport:transition",
    entityType: "passport",
    entityId: next.id,
    before: { state: before.state },
    after: { state: next.state },
    requestId: input.correlationId,
    createdAt: now,
  });

  await uow.commit();
  return next;
}
