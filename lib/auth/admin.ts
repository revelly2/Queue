import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import type { AppRole } from "@/lib/db/enums";

export const ADMIN_ROLES: AppRole[] = ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"];

/**
 * Server-side admin gate for /admin pages. Redirects anonymous users to login;
 * returns the authed server client, the caller's role, and whether they are an
 * admin (callers render a "not authorized" view when `ok` is false).
 */
export async function requireAdmin(): Promise<{
  supabase: SupabaseClient;
  role: AppRole | undefined;
  ok: boolean;
}> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role as AppRole | undefined;
  return { supabase, role, ok: !!role && ADMIN_ROLES.includes(role) };
}
