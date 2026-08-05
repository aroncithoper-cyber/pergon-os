/**
 * Prepared Edge Function: health
 * Deploy: `supabase functions deploy health --project-ref hrsxzqdfvwwsiiegbzvg`
 *
 * Does not contain secrets. Returns OK for connectivity checks.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "pergon-os",
      function: "health",
      ts: new Date().toISOString(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
    },
  );
});
