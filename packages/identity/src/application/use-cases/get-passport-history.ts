import { formatZodError } from "@pergon/shared/i18n";
import { PassportNotFoundError, ValidationFailedError } from "../../domain/errors";
import { getHistorySchema } from "../../validation/schemas";
import type { IdentityUnitOfWork } from "../ports";

export async function getPassportHistory(
  uow: IdentityUnitOfWork,
  raw: { passportId: string; limit?: number; afterSeq?: number },
) {
  const parsed = getHistorySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationFailedError(formatZodError(parsed.error));
  }

  const passport = await uow.passports.findById(parsed.data.passportId);
  if (!passport) {
    throw new PassportNotFoundError(parsed.data.passportId);
  }

  const events = await uow.events.listByPassportId(passport.id, {
    limit: parsed.data.limit,
    afterSeq: parsed.data.afterSeq,
  });

  const versions = await uow.versions.listByPassportId(passport.id);

  return { passport, events, versions };
}
