import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/db/enums";

export interface StaffUser {
  id: string;
  email: string | null;
  fullName: string | null;
  role: AppRole;
  createdAt: string;
}

export async function listUsers(sb: SupabaseClient): Promise<StaffUser[]> {
  const { data, error } = await sb.rpc("admin_list_users");
  if (error) throw new Error(`Failed to load users: ${error.message}`);
  return (
    (data as Array<{ id: string; email: string | null; full_name: string | null; role: AppRole; created_at: string }>) ?? []
  ).map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    createdAt: r.created_at,
  }));
}

export async function setUserRole(sb: SupabaseClient, userId: string, role: AppRole) {
  const { error } = await sb.rpc("admin_set_user_role", { p_user_id: userId, p_role: role });
  if (error) throw new Error(error.message);
}
