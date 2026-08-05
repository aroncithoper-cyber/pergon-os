import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { hasSupabasePublicEnv, requireSupabasePublicEnv } from "@pergon/shared/env";

import type { Database } from "./types/database";

export type MiddlewareRequestLike = {
  cookies: {
    getAll: () => { name: string; value: string }[];
    set: (name: string, value: string) => void;
  };
};

export type MiddlewareResponseLike = {
  cookies: {
    set: (name: string, value: string, options?: CookieOptions) => void;
  };
};

/**
 * Refresh Supabase Auth session cookies in edge/Node middleware.
 * No-ops when public env is missing (builds/dev without secrets).
 */
export async function updateSession<
  Req extends MiddlewareRequestLike,
  Res extends MiddlewareResponseLike,
>(request: Req, createResponse: (request: Req) => Res): Promise<Res> {
  let response = createResponse(request);

  if (!hasSupabasePublicEnv()) {
    return response;
  }

  const { url, anonKey } = requireSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = createResponse(request);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
