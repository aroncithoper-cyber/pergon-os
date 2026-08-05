export class CatalogError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "CatalogError";
  }
}

export class CatalogValidationError extends CatalogError {
  constructor(message: string) {
    super(message, "VALIDATION_FAILED");
    this.name = "CatalogValidationError";
  }
}

export class CatalogNotFoundError extends CatalogError {
  constructor(slug: string) {
    super(`Product not found: ${slug}`, "NOT_FOUND");
    this.name = "CatalogNotFoundError";
  }
}
