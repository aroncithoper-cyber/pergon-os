import type { SupabaseClient } from "@supabase/supabase-js";

import { getStorageBucket } from "@pergon/shared/env";

import type { Database } from "./types/database";

export type StorageBucketName = "media" | "exports" | "avatars" | "documents";

/** Resolve configured bucket id (defaults to the logical name). */
export function resolveStorageBucket(name: StorageBucketName): string {
  return getStorageBucket(name);
}

/** Typed storage accessor for a known bucket. */
export function getStorageBucketClient(
  client: SupabaseClient<Database>,
  name: StorageBucketName,
): ReturnType<SupabaseClient<Database>["storage"]["from"]> {
  return client.storage.from(resolveStorageBucket(name));
}
