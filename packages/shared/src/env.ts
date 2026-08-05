import { z } from "zod";

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

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_MEDIA: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EXPORTS: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_AVATARS: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_DOCUMENTS: z.string().optional(),
});

export function getAppUrl(fallback = "http://localhost:3000"): string {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  return value && value.length > 0 ? value : fallback;
}
