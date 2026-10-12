import { requireAdmin } from "@/lib/auth/admin";
import { listAnnouncements } from "@/lib/admin/announcements";
import AnnouncementsAdmin from "./AnnouncementsAdmin";

export const instant = false;

export default async function AdminAnnouncementsPage() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">Admin access required.</p>
      </main>
    );
  }
  const announcements = await listAnnouncements(supabase);
  return <AnnouncementsAdmin initial={announcements} />;
}
