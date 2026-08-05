import { createSharedMemoryCatalogUnitOfWork } from "../memory";

/** Placeholder until dedicated Supabase UoW lands. */
export function createDefaultCatalogUnitOfWork() {
  return createSharedMemoryCatalogUnitOfWork();
}

export { createSharedMemoryCatalogUnitOfWork, createMemoryCatalogUnitOfWork } from "../memory";
