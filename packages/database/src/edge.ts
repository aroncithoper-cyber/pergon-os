import { getSupabaseFunctionsUrl, requireSupabasePublicEnv } from "@pergon/shared/env";

export type EdgeFunctionInvokeOptions = {
  /** Function slug under supabase/functions/<name> */
  name: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Bearer token (user JWT or anon). Defaults to anon key. */
  accessToken?: string;
  headers?: Record<string, string>;
};

/**
 * Invoke a Supabase Edge Function by HTTP.
 * Prepared for deploy under `supabase/functions/*`.
 */
export async function invokeEdgeFunction<T = unknown>(
  options: EdgeFunctionInvokeOptions,
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { anonKey } = requireSupabasePublicEnv();
  const base = getSupabaseFunctionsUrl();
  if (!base) {
    return { data: null, error: "Supabase URL not configured", status: 0 };
  }

  const response = await fetch(`${base}/${options.name}`, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.accessToken ?? anonKey}`,
      apikey: anonKey,
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = text as unknown as T;
  }

  if (!response.ok) {
    return {
      data,
      error:
        typeof data === "object" && data && "error" in data
          ? String((data as { error: unknown }).error)
          : text || response.statusText,
      status: response.status,
    };
  }

  return { data, error: null, status: response.status };
}

export { getSupabaseFunctionsUrl };
