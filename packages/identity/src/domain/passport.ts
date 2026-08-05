import { canTransition, type PassportState } from "./states";
import { InvalidTransitionError, PassportDeletedError } from "./errors";
import type { ActorRef, PassportRecord } from "./models";

export function assertPassportMutable(passport: PassportRecord): void {
  if (passport.deletedAt) {
    throw new PassportDeletedError(passport.id);
  }
}

export function transitionPassportState(
  passport: PassportRecord,
  to: PassportState,
  _actor: ActorRef,
): PassportRecord {
  assertPassportMutable(passport);

  if (!canTransition(passport.state, to)) {
    throw new InvalidTransitionError(passport.state, to);
  }

  return {
    ...passport,
    state: to,
    version: passport.version + 1,
    eventSeq: passport.eventSeq + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: _actor.id,
  };
}

export function custodyForState(state: PassportState): import("./states").CustodyStage {
  switch (state) {
    case "CREATED":
    case "PRINTED":
    case "FILLED":
    case "QUALITY_CHECK":
    case "READY":
      return "production";
    case "SOLD":
    case "DELIVERED":
      return "distribution";
    case "ACTIVE":
      return "customer";
    case "RETURNED":
    case "WASHING":
    case "REFILLED":
      return "returned";
    case "RETIRED":
    case "BLOCKED":
      return "retired";
    default:
      return "production";
  }
}

export function withCustody(passport: PassportRecord): PassportRecord {
  return {
    ...passport,
    custodyStage: custodyForState(passport.state),
  };
}

export function createPassportPublicSnapshot(passport: PassportRecord): Record<string, unknown> {
  return {
    publicId: passport.publicId,
    state: passport.state,
    custodyStage: passport.custodyStage,
    productId: passport.productId,
    batchId: passport.batchId ?? null,
    version: passport.version,
    issuedAt: passport.issuedAt ?? null,
    expiresAt: passport.expiresAt ?? null,
  };
}
