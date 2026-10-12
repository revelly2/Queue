import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { listPendingPayments } from "@/lib/cashier/payments";
import type { AppRole } from "@/lib/db/enums";
import CashierBoard from "./CashierBoard";

// This route reads cookies()/auth on every request, so it cannot be
// prerendered. With cacheComponents enabled, `instant = false` marks it as a
// blocking (fully dynamic) route — the Next 16 replacement for force-dynamic.
export const instant = false;

const STAFF_ROLES: AppRole[] = ["CASHIER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"];

export default async function CashierPage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role as AppRole | undefined;
  if (!role || !STAFF_ROLES.includes(role)) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="text-sm text-muted">
          This account ({user.email}) does not have cashier access. Ask an
          administrator to grant the <code>CASHIER</code> role.
        </p>
        <Link href="/login" className="text-blue underline">
          Switch account
        </Link>
      </main>
    );
  }

  const initialPending = await listPendingPayments(supabase);

  return (
    <CashierBoard
      initialPending={initialPending}
      cashierLabel={profile?.full_name ?? user.email ?? "Cashier"}
    />
  );
}
