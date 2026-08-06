import { formatZodError } from "@pergon/shared/i18n";
import {
  buildPassportEvent,
  canTransition,
  createPassportPublicSnapshot,
  newId,
  transitionPassportState,
  withCustody,
} from "../../domain";
import { PassportNotFoundError, ValidationFailedError } from "../../domain/errors";
import { rechargePassportSchema } from "../../validation/schemas";
import type { IdentityUnitOfWork, RechargePassportInput } from "../ports";

export async function rechargePassport(uow: IdentityUnitOfWork, raw: RechargePassportInput) {
  const parsed = rechargePassportSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(formatZodError(parsed.error));
  }

  const input = parsed.data;
  const existingRecharge = await uow.recharges.findByIdempotencyKey(input.idempotencyKey);
  if (existingRecharge) {
    const passport = await uow.passports.findById(existingRecharge.passportId);
    if (!passport) {
      throw new PassportNotFoundError(existingRecharge.passportId);
    }
    return { passport, recharge: existingRecharge, replayed: true as const };
  }

  const passport = await uow.passports.findById(input.passportId);
  if (!passport || passport.deletedAt) {
    throw new PassportNotFoundError(input.passportId);
  }

  const fromExpiresAt = passport.expiresAt;
  const fromState = passport.state;
  const now = new Date().toISOString();

  let next = { ...passport };
  if (input.toExpiresAt) {
    next.expiresAt = input.toExpiresAt;
  }
  if (input.toState) {
    if (!canTransition(next.state, input.toState)) {
      // Prefer domain path WASHING → REFILLED for refill cycles when requested illegally
      throw new ValidationFailedError(
        `No se puede recargar al estado ${input.toState} desde ${next.state}`,
      );
    }
    next = withCustody(transitionPassportState(next, input.toState, input.actor));
  } else if (next.state === "WASHING") {
    next = withCustody(transitionPassportState(next, "REFILLED", input.actor));
  } else {
    next.version += 1;
    next.eventSeq += 1;
  }

  next.updatedAt = now;
  next.updatedBy = input.actor.id;
  await uow.passports.save(next);

  const recharge = {
    id: newId(),
    passportId: next.id,
    organizationId: next.organizationId,
    fromExpiresAt,
    toExpiresAt: next.expiresAt,
    fromState,
    toState: next.state,
    idempotencyKey: input.idempotencyKey,
    reason: input.reason,
    actor: input.actor,
    createdAt: now,
  };

  await uow.recharges.save(recharge);

  await uow.events.append(
    buildPassportEvent({
      organizationId: next.organizationId,
      passportId: next.id,
      seq: next.eventSeq,
      type: "RECHARGE_APPLIED",
      actor: input.actor,
      correlationId: input.correlationId,
      payload: {
        rechargeId: recharge.id,
        fromExpiresAt: fromExpiresAt ?? null,
        toExpiresAt: next.expiresAt ?? null,
        fromState,
        toState: next.state,
        reason: input.reason,
      },
    }),
  );

  await uow.versions.save({
    id: newId(),
    passportId: next.id,
    versionNumber: next.version,
    snapshot: createPassportPublicSnapshot(next),
    changeReason: `recharge:${input.reason}`,
    createdAt: now,
    createdBy: input.actor.id,
  });

  await uow.audit.append({
    id: newId(),
    organizationId: next.organizationId,
    actor: input.actor,
    action: "passport:recharge",
    entityType: "passport",
    entityId: next.id,
    before: { expiresAt: fromExpiresAt, state: fromState },
    after: { expiresAt: next.expiresAt, state: next.state },
    requestId: input.correlationId,
    createdAt: now,
  });

  await uow.commit();
  return { passport: next, recharge, replayed: false as const };
}
