export class AuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export class ValidationFailedError extends AuthError {
  constructor(message: string) {
    super("VALIDATION_FAILED", message);
    this.name = "ValidationFailedError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(permission?: string) {
    super("FORBIDDEN", permission ? `Missing permission: ${permission}` : "Forbidden");
    this.name = "ForbiddenError";
  }
}

export class SessionNotFoundError extends AuthError {
  constructor() {
    super("SESSION_NOT_FOUND", "Session not found or expired");
    this.name = "SessionNotFoundError";
  }
}

export class UserNotFoundError extends AuthError {
  constructor(id: string) {
    super("USER_NOT_FOUND", `User not found: ${id}`);
    this.name = "UserNotFoundError";
  }
}

export class InvitationNotFoundError extends AuthError {
  constructor() {
    super("INVITATION_NOT_FOUND", "Invitation not found or invalid");
    this.name = "InvitationNotFoundError";
  }
}

export class MfaRequiredError extends AuthError {
  readonly challengeId: string;

  constructor(challengeId: string) {
    super("MFA_REQUIRED", "MFA challenge required");
    this.name = "MfaRequiredError";
    this.challengeId = challengeId;
  }
}
