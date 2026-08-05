# Supabase Edge Functions

Prepared for PerGon OS. Deploy with Supabase CLI after linking the project:

```bash
supabase link --project-ref hrsxzqdfvwwsiiegbzvg
supabase functions deploy health
```

Invoke from apps via `@pergon/database` → `invokeEdgeFunction({ name: "health" })`.

Do not put service_role keys inside function source. Use Dashboard secrets / `supabase secrets set`.
