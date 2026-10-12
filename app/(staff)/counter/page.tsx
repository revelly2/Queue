import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { AppRole } from "@/lib/db/enums";
import { listOperableCounters } from "@/lib/counter/console";
import CounterConsole from "./CounterConsole";

export const instant = false;

const CONSOLE_ROLES: AppRole[] = [
  "COUNTER",
  "REGISTRAR_OFFICER",
  "REGISTRAR_ADMIN",
  "SYSTEM_ADMIN",
];

export default async function CounterPage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as AppRole | undefined;
  if (!role || !CONSOLE_ROLES.includes(role)) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">
          The Counter Console requires a registrar or station role.
        </p>
      </main>
    );
  }

  const all = await listOperableCounters(supabase);

  // A COUNTER (station) account is locked to the counter it is bound to.
  if (role === "COUNTER") {
    const { data: bound } = await supabase
      .from("counters")
      .select("id")
      .eq("assigned_staff_id", user.id)
      .maybeSingle();
    const mine = all.filter((c) => c.id === bound?.id);
    if (mine.length === 0) {
      return (
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-bold">No counter assigned</h1>
          <p className="mt-2 text-sm text-muted">
            This station login is not bound to a counter. Ask an administrator.
          </p>
        </main>
      );
    }
    return <CounterConsole counters={mine} locked />;
  }

  return <CounterConsole counters={all} />;
}
