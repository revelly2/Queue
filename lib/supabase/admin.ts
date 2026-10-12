import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY — it bypasses RLS. Never import
 * this from a Client Component; only from "use server" actions / route
 * handlers. The key comes from SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client not configured (missing service-role key)");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
