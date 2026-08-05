import { createPassport } from "./use-cases/create-passport";
import { transitionPassport } from "./use-cases/transition-passport";
import { rotateQr } from "./use-cases/rotate-qr";
import { verifyCode } from "./use-cases/verify-code";
import { rechargePassport } from "./use-cases/recharge-passport";
import { getPassportHistory } from "./use-cases/get-passport-history";
import { getPublicVerification } from "./use-cases/get-public-verification";
import type { IdentityUnitOfWork } from "./ports";

export function createIdentityServices(uow: IdentityUnitOfWork) {
  return {
    createPassport: (input: Parameters<typeof createPassport>[1]) => createPassport(uow, input),
    transitionPassport: (input: Parameters<typeof transitionPassport>[1]) =>
      transitionPassport(uow, input),
    rotateQr: (input: Parameters<typeof rotateQr>[1]) => rotateQr(uow, input),
    verifyCode: (input: Parameters<typeof verifyCode>[1]) => verifyCode(uow, input),
    rechargePassport: (input: Parameters<typeof rechargePassport>[1]) =>
      rechargePassport(uow, input),
    getPassportHistory: (input: Parameters<typeof getPassportHistory>[1]) =>
      getPassportHistory(uow, input),
    getPublicVerification: (input: Parameters<typeof getPublicVerification>[1]) =>
      getPublicVerification(uow, input),
  };
}

export type IdentityServices = ReturnType<typeof createIdentityServices>;

export * from "./ports";
export { createPassport } from "./use-cases/create-passport";
export { transitionPassport } from "./use-cases/transition-passport";
export { rotateQr } from "./use-cases/rotate-qr";
export { verifyCode } from "./use-cases/verify-code";
export { rechargePassport } from "./use-cases/recharge-passport";
export { getPassportHistory } from "./use-cases/get-passport-history";
export { getPublicVerification } from "./use-cases/get-public-verification";
