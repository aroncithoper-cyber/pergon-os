export class IdentityError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "IdentityError";
    this.code = code;
  }
}

export class InvalidTransitionError extends IdentityError {
  constructor(from: string, to: string) {
    super("INVALID_TRANSITION", `Cannot transition passport from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export class PassportNotFoundError extends IdentityError {
  constructor(id: string) {
    super("PASSPORT_NOT_FOUND", `Passport not found: ${id}`);
    this.name = "PassportNotFoundError";
  }
}

export class QrNotFoundError extends IdentityError {
  constructor(code: string) {
    super("QR_NOT_FOUND", `QR not found: ${code}`);
    this.name = "QrNotFoundError";
  }
}

export class QrNotActiveError extends IdentityError {
  constructor(code: string, status: string) {
    super("QR_NOT_ACTIVE", `QR ${code} is not active (status=${status})`);
    this.name = "QrNotActiveError";
  }
}

export class PassportDeletedError extends IdentityError {
  constructor(id: string) {
    super("PASSPORT_DELETED", `Passport is soft-deleted: ${id}`);
    this.name = "PassportDeletedError";
  }
}

export class ConcurrencyError extends IdentityError {
  constructor(entity: string, id: string) {
    super("CONCURRENCY_CONFLICT", `Concurrency conflict on ${entity}:${id}`);
    this.name = "ConcurrencyError";
  }
}

export class ValidationFailedError extends IdentityError {
  constructor(message: string) {
    super("VALIDATION_FAILED", message);
    this.name = "ValidationFailedError";
  }
}
