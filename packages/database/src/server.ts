import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@pergon/shared/env";

import type { Database } from "./types/database";

export type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type CookieStore = {
  getAll: () => { name: string; value: string }[];
  set?: (name: string, value: string, options?: CookieOptions) => void;
};

/**
 * Server Component / Route Handler / Server Action client.
 * Uses anon key + user cookies. Subject to RLS.
 */
export function createServerClient(cookieStore: CookieStore) {
  const { url, anonKey } = requireSupabasePublicEnv();

  return createSupabaseServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set?.(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies; middleware refreshes session.
        }
      },
    },
  });
}

export type PergonServerClient = ReturnType<typeof createServerClient>;
