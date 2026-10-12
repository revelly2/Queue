import { listCounters, listModules } from "@/lib/admin/config";
import { listUsers } from "@/lib/admin/users";
import { requireAdmin } from "@/lib/auth/admin";
import CountersAdmin from "./CountersAdmin";

export const instant = false;

export default async function AdminCountersPage() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">Admin access required.</p>
      </main>
    );
  }
  const [counters, modules, users] = await Promise.all([
    listCounters(supabase),
    listModules(supabase),
    listUsers(supabase),
  ]);
  const accounts: Record<string, string> = {};
  for (const u of users) if (u.email) accounts[u.id] = u.email;
  return (
    <CountersAdmin
      initialCounters={counters}
      modules={modules.map((m) => ({ id: m.id, code: m.code, name: m.name }))}
      accounts={accounts}
    />
  );
}
