import {
  CatalogError,
  createCatalogServices,
  createSharedMemoryCatalogUnitOfWork,
} from "@pergon/catalog";
import { logger } from "@pergon/shared/logger";

export function getCatalogServices() {
  const uow = createSharedMemoryCatalogUnitOfWork();
  return createCatalogServices(uow);
}

export function toCatalogErrorResponse(error: unknown) {
  if (error instanceof CatalogError) {
    const status =
      error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION_FAILED" ? 400 : 400;
    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }

  logger.exception("catalog.api_unhandled", error);
  return Response.json({ error: { code: "INTERNAL", message: "Internal error" } }, { status: 500 });
}
