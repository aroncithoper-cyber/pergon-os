import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types/database";

export type RealtimeChangeEvent = "*" | "INSERT" | "UPDATE" | "DELETE";

/**
 * Subscribe to postgres_changes on a public table.
 * Enable Realtime for the table in Dashboard or via publication migration.
 */
export function subscribeToTableChanges(
  client: SupabaseClient<Database>,
  options: {
    channel: string;
    table: string;
    event?: RealtimeChangeEvent;
    filter?: string;
    onChange: (payload: unknown) => void;
  },
): RealtimeChannel {
  return client
    .channel(options.channel)
    .on(
      "postgres_changes",
      {
        event: options.event ?? "*",
        schema: "public",
        table: options.table,
        ...(options.filter ? { filter: options.filter } : {}),
      },
      options.onChange,
    )
    .subscribe();
}

export async function removeRealtimeChannel(
  client: SupabaseClient<Database>,
  channel: RealtimeChannel,
) {
  return client.removeChannel(channel);
}
