import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@pergon/shared/env";

import type { Database } from "./types/database";

/** Browser / Client Component Supabase client (anon key + RLS). */
export function createBrowserClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createSupabaseBrowserClient<Database>(url, anonKey);
}

export type PergonBrowserClient = ReturnType<typeof createBrowserClient>;
