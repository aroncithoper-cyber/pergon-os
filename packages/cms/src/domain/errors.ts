export class CmsError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "CmsError";
  }
}

export class CmsValidationError extends CmsError {
  constructor(message: string) {
    super(message, "VALIDATION_FAILED");
    this.name = "CmsValidationError";
  }
}

export class CmsNotFoundError extends CmsError {
  constructor(message = "No encontramos el documento del Home en el CMS.") {
    super(message, "NOT_FOUND");
    this.name = "CmsNotFoundError";
  }
}

export class CmsConflictError extends CmsError {
  constructor(message: string) {
    super(message, "CONFLICT");
    this.name = "CmsConflictError";
  }
}

export class CmsPreviewError extends CmsError {
  constructor(message: string) {
    super(message, "PREVIEW_INVALID");
    this.name = "CmsPreviewError";
  }
}
