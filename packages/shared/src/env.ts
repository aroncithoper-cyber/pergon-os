export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServerEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

export function getSupabasePublicEnv(source: NodeJS.ProcessEnv = process.env): SupabasePublicEnv {
  return {
    url: (source.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
    anonKey: (source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim(),
  };
}

export function hasSupabasePublicEnv(env: SupabasePublicEnv = getSupabasePublicEnv()): boolean {
  return Boolean(env.url && env.anonKey);
}

export function requireSupabasePublicEnv(
  source: NodeJS.ProcessEnv = process.env,
): SupabasePublicEnv {
  const env = getSupabasePublicEnv(source);

  if (!hasSupabasePublicEnv(env)) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy apps/<app>/.env.example to .env.local and fill keys from Supabase Dashboard → Settings → API.",
    );
  }

  return env;
}

export function getSupabaseServiceRoleKey(source: NodeJS.ProcessEnv = process.env): string {
  return (source.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
}

export function hasSupabaseServiceRole(source: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(getSupabasePublicEnv(source).url && getSupabaseServiceRoleKey(source));
}

export function requireSupabaseServiceRole(
  source: NodeJS.ProcessEnv = process.env,
): SupabaseServerEnv {
  const pub = requireSupabasePublicEnv(source);
  const serviceRoleKey = getSupabaseServiceRoleKey(source);

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it only to server-side .env.local (never NEXT_PUBLIC_). Dashboard → Settings → API → service_role.",
    );
  }

  return { ...pub, serviceRoleKey };
}

/** Edge Functions base URL for the linked project (no trailing slash). */
export function getSupabaseFunctionsUrl(source: NodeJS.ProcessEnv = process.env): string {
  const { url } = getSupabasePublicEnv(source);
  if (!url) return "";
  return `${url.replace(/\/$/, "")}/functions/v1`;
}

export function getStorageBucket(
  name: "media" | "exports" | "avatars" | "documents",
  source: NodeJS.ProcessEnv = process.env,
): string {
  const map = {
    media: source.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_MEDIA,
    exports: source.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EXPORTS,
    avatars: source.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_AVATARS,
    documents: source.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_DOCUMENTS,
  } as const;
  return (map[name] ?? name).trim() || name;
}

/**
 * Public app origin for SEO, redirects, and absolute URLs.
 * Prefer NEXT_PUBLIC_APP_URL; on Vercel previews fall back to VERCEL_URL.
 * Always returns a `new URL()`-safe origin so metadata never crashes the root layout.
 */
export function getAppUrl(fallback = "http://localhost:3000"): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL?.trim(),
    process.env.VERCEL_URL?.trim(),
    fallback,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = candidate.replace(/\/$/, "");
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      // try next candidate
    }
  }

  return "http://localhost:3000";
}
