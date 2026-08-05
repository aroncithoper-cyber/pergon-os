import { getPublishedProductBySlug } from "./use-cases/get-published-product";
import { upsertCatalogProduct } from "./use-cases/upsert-catalog-product";
import type { CatalogUnitOfWork } from "./ports";

export function createCatalogServices(uow: CatalogUnitOfWork) {
  return {
    getPublishedProductBySlug: (input: Parameters<typeof getPublishedProductBySlug>[1]) =>
      getPublishedProductBySlug(uow, input),
    upsertCatalogProduct: (input: Parameters<typeof upsertCatalogProduct>[1]) =>
      upsertCatalogProduct(uow, input),
  };
}

export type CatalogServices = ReturnType<typeof createCatalogServices>;

export * from "./ports";
export { getPublishedProductBySlug } from "./use-cases/get-published-product";
export { upsertCatalogProduct } from "./use-cases/upsert-catalog-product";
