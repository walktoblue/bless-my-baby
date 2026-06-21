import { createClient } from '@supabase/supabase-js'

// Use SUPABASE_URL (server-only, no NEXT_PUBLIC_ prefix) so it is read from
// the real runtime process.env rather than being inlined at build time.
// NEXT_PUBLIC_ vars are replaced by Turbopack during compilation — if the build
// cache was created before the var was set, the inlined value is undefined.

let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabaseAdmin
}
