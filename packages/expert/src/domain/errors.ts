export class ExpertError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "ExpertError";
  }
}

export class ExpertValidationError extends ExpertError {
  constructor(message: string) {
    super(message, "VALIDATION_FAILED");
    this.name = "ExpertValidationError";
  }
}

export class ExpertRateLimitedError extends ExpertError {
  constructor(message = "Daily Expert limit reached") {
    super(message, "RATE_LIMITED");
    this.name = "ExpertRateLimitedError";
  }
}

export class ExpertNotFoundError extends ExpertError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "ExpertNotFoundError";
  }
}
