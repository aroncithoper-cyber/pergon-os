import { createBrowserClient, type PergonBrowserClient } from "@pergon/database/client";
import { createServerClient, type PergonServerClient } from "@pergon/database/server";
import { createServiceClient, type PergonServiceClient } from "@pergon/database/service";
import { cookies } from "next/headers";

/** Client Components — anon + RLS. */
export function createSupabaseBrowserClient(): PergonBrowserClient {
  return createBrowserClient();
}

/** Server Components / Route Handlers / Actions — anon + cookies + RLS. */
export async function createSupabaseServerClient(): Promise<PergonServerClient> {
  const cookieStore = await cookies();

  return createServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    set(name, value, options) {
      try {
        cookieStore.set(name, value, options);
      } catch {
        // Read-only cookie context (Server Component).
      }
    },
  });
}

/**
 * Privileged server-only client (service_role). Bypasses RLS.
 * Use for trusted admin jobs / migrations helpers — never expose to the browser.
 */
export function createSupabaseServiceClient(): PergonServiceClient {
  return createServiceClient();
}
