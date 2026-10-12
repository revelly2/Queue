import { requireAdmin } from "@/lib/auth/admin";
import { getMonitorSnapshot } from "@/lib/admin/monitor";
import Monitoring from "./Monitoring";

export const instant = false;

export default async function AdminMonitoringPage() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">Admin access required.</p>
      </main>
    );
  }
  const initial = await getMonitorSnapshot(supabase);
  return <Monitoring initial={initial} />;
}
