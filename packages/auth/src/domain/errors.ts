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
    super("INVALID_CREDENTIALS", "El correo electrónico o la contraseña no son correctos.");
    this.name = "InvalidCredentialsError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Debes iniciar sesión.") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(permission?: string) {
    super(
      "FORBIDDEN",
      permission
        ? "No tienes permisos para realizar esta acción."
        : "No tienes permisos para realizar esta acción.",
    );
    this.name = "ForbiddenError";
  }
}

export class SessionNotFoundError extends AuthError {
  constructor() {
    super("SESSION_NOT_FOUND", "Tu sesión expiró o no es válida. Inicia sesión de nuevo.");
    this.name = "SessionNotFoundError";
  }
}

export class UserNotFoundError extends AuthError {
  constructor(id: string) {
    super("USER_NOT_FOUND", "No encontramos ese usuario.");
    this.name = "UserNotFoundError";
    void id;
  }
}

export class InvitationNotFoundError extends AuthError {
  constructor() {
    super("INVITATION_NOT_FOUND", "La invitación no es válida o ya no está disponible.");
    this.name = "InvitationNotFoundError";
  }
}

export class MfaRequiredError extends AuthError {
  readonly challengeId: string;

  constructor(challengeId: string) {
    super("MFA_REQUIRED", "Se requiere verificación en dos pasos.");
    this.name = "MfaRequiredError";
    this.challengeId = challengeId;
  }
}
