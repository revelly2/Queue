import { requireAdmin } from "@/lib/auth/admin";
import { getReport } from "@/lib/admin/reports";
import Reports from "./Reports";

export const instant = false;

export default async function AdminReportsPage() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">Admin access required.</p>
      </main>
    );
  }

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  from.setHours(0, 0, 0, 0);

  const initial = await getReport(supabase, from.toISOString(), to.toISOString());
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  return <Reports initial={initial} fromDate={ymd(from)} toDate={ymd(to)} />;
}
