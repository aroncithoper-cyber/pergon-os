import { login } from "./use-cases/login";
import { refreshSession } from "./use-cases/refresh-session";
import { logout } from "./use-cases/logout";
import { inviteUser } from "./use-cases/invite-user";
import { acceptInvitation } from "./use-cases/accept-invitation";
import { requestPasswordReset, resetPassword } from "./use-cases/password-reset";
import { bootstrapSystemCatalog, createOrganizationWithOwner } from "./use-cases/bootstrap";
import { getSessionFromAccessToken } from "./use-cases/get-session";
import { assignRoles } from "./use-cases/assign-roles";
import { verifyMfaChallenge } from "./use-cases/verify-mfa";
import { listSessions } from "./use-cases/list-sessions";
import type { AuthUnitOfWork } from "./ports";
import type { AuthContext } from "../domain/models";

export function createAuthServices(uow: AuthUnitOfWork) {
  return {
    bootstrapSystemCatalog: () => bootstrapSystemCatalog(uow),
    createOrganizationWithOwner: (input: unknown) => createOrganizationWithOwner(uow, input),
    login: (input: unknown) => login(uow, input),
    refreshSession: (input: unknown) => refreshSession(uow, input),
    logout: (input: unknown) => logout(uow, input),
    inviteUser: (ctx: AuthContext, input: unknown) => inviteUser(uow, ctx, input),
    acceptInvitation: (input: unknown) => acceptInvitation(uow, input),
    requestPasswordReset: (input: unknown) => requestPasswordReset(uow, input),
    resetPassword: (input: unknown) => resetPassword(uow, input),
    getSessionFromAccessToken: (token: string | null | undefined) =>
      getSessionFromAccessToken(uow, token),
    assignRoles: (ctx: AuthContext, input: unknown) => assignRoles(uow, ctx, input),
    verifyMfaChallenge: (input: unknown) => verifyMfaChallenge(uow, input),
    listSessions: (ctx: AuthContext) => listSessions(uow, ctx),
  };
}

export type AuthServices = ReturnType<typeof createAuthServices>;

export type { AuthUnitOfWork, TokenPair, LoginResult, ResolvedAccess } from "./ports";
export type { AuthContext } from "../domain/models";
export * from "./guards";
export * from "./middleware";
export { login } from "./use-cases/login";
export { refreshSession } from "./use-cases/refresh-session";
export { logout } from "./use-cases/logout";
export { inviteUser } from "./use-cases/invite-user";
export { acceptInvitation } from "./use-cases/accept-invitation";
export { requestPasswordReset, resetPassword } from "./use-cases/password-reset";
export { bootstrapSystemCatalog, createOrganizationWithOwner } from "./use-cases/bootstrap";
export { getSessionFromAccessToken } from "./use-cases/get-session";
export { assignRoles } from "./use-cases/assign-roles";
export { verifyMfaChallenge, verifyTotpCode } from "./use-cases/verify-mfa";
export { listSessions } from "./use-cases/list-sessions";
