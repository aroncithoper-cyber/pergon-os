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
    super("INVALID_TRANSITION", `No se puede cambiar el estado del pasaporte de ${from} a ${to}.`);
    this.name = "InvalidTransitionError";
  }
}

export class PassportNotFoundError extends IdentityError {
  constructor(id: string) {
    super("PASSPORT_NOT_FOUND", "No encontramos ese pasaporte.");
    this.name = "PassportNotFoundError";
    void id;
  }
}

export class QrNotFoundError extends IdentityError {
  constructor(code: string) {
    super("QR_NOT_FOUND", "No encontramos ese código QR.");
    this.name = "QrNotFoundError";
    void code;
  }
}

export class QrNotActiveError extends IdentityError {
  constructor(code: string, status: string) {
    super("QR_NOT_ACTIVE", `El código QR no está activo (estado: ${status}).`);
    this.name = "QrNotActiveError";
    void code;
  }
}

export class PassportDeletedError extends IdentityError {
  constructor(id: string) {
    super("PASSPORT_DELETED", "Este pasaporte fue eliminado.");
    this.name = "PassportDeletedError";
    void id;
  }
}

export class ConcurrencyError extends IdentityError {
  constructor(entity: string, id: string) {
    super(
      "CONCURRENCY_CONFLICT",
      "Otro cambio se aplicó al mismo tiempo. Actualiza e intenta de nuevo.",
    );
    this.name = "ConcurrencyError";
    void entity;
    void id;
  }
}

export class ValidationFailedError extends IdentityError {
  constructor(message: string) {
    super("VALIDATION_FAILED", message);
    this.name = "ValidationFailedError";
  }
}
