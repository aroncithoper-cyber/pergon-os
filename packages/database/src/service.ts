import { createClient } from "@supabase/supabase-js";

import { requireSupabaseServiceRole } from "@pergon/shared/env";

import type { Database } from "./types/database";

/**
 * Privileged server-only client (service_role).
 * Bypasses RLS. NEVER import from Client Components or expose to the browser.
 */
export function createServiceClient() {
  const { url, serviceRoleKey } = requireSupabaseServiceRole();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export type PergonServiceClient = ReturnType<typeof createServiceClient>;
