/**
 * Persistence adapters for Supabase.
 * HTTP clients live in `@pergon/database` (browser / server / service).
 * Domain Unit of Work remains memory until a dedicated Supabase UoW is implemented.
 */
export { createSharedMemoryUnitOfWork as createDefaultOpsUnitOfWork } from "../memory";
