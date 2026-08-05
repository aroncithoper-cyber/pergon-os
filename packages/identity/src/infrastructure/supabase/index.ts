/**
 * Persistence adapters for Supabase.
 * HTTP clients live in `@pergon/database` (browser / server / service).
 * Domain Unit of Work remains memory until a dedicated Supabase UoW is implemented.
 * Prefer `createSupabaseServerClient` / `createSupabaseServiceClient` from each app `lib/supabase.ts`.
 */
export { createSharedMemoryUnitOfWork as createDefaultIdentityUnitOfWork } from "../memory";
