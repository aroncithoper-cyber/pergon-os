import {
  getAppUrl,
  getStorageBucket,
  getSupabaseFunctionsUrl,
  getSupabasePublicEnv,
  hasSupabasePublicEnv,
  hasSupabaseServiceRole,
} from "@pergon/shared/env";

export const env = {
  appUrl: getAppUrl("http://localhost:3000"),
  supabase: getSupabasePublicEnv(),
  isSupabaseConfigured: hasSupabasePublicEnv(),
  hasServiceRole: hasSupabaseServiceRole(),
  functionsUrl: getSupabaseFunctionsUrl(),
  buckets: {
    media: getStorageBucket("media"),
    exports: getStorageBucket("exports"),
    avatars: getStorageBucket("avatars"),
    documents: getStorageBucket("documents"),
  },
} as const;
