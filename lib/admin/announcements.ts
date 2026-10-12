import type { SupabaseClient } from "@supabase/supabase-js";

export interface Announcement {
  id: number;
  message: string;
  isActive: boolean;
  sortOrder: number;
}

function check<T>({ data, error }: { data: T; error: { message: string } | null }, what: string): T {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

export async function listAnnouncements(sb: SupabaseClient): Promise<Announcement[]> {
  // Admins see all rows (incl. inactive) via the admin RLS policy.
  const data = check(
    await sb.from("announcements").select("id,message,is_active,sort_order").order("sort_order"),
    "load announcements",
  ) as Array<{ id: number; message: string; is_active: boolean; sort_order: number }>;
  return data.map((a) => ({
    id: a.id,
    message: a.message,
    isActive: a.is_active,
    sortOrder: a.sort_order,
  }));
}

export async function createAnnouncement(sb: SupabaseClient, message: string, sortOrder: number) {
  check(await sb.from("announcements").insert({ message, sort_order: sortOrder }), "create announcement");
}

export async function updateAnnouncement(
  sb: SupabaseClient,
  id: number,
  patch: { message?: string; isActive?: boolean; sortOrder?: number },
) {
  const row: Record<string, unknown> = {};
  if (patch.message !== undefined) row.message = patch.message;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
  check(await sb.from("announcements").update(row).eq("id", id), "update announcement");
}

export async function deleteAnnouncement(sb: SupabaseClient, id: number) {
  check(await sb.from("announcements").delete().eq("id", id), "delete announcement");
}
