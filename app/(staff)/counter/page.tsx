import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { AppRole } from "@/lib/db/enums";
import { listOperableCounters } from "@/lib/counter/console";
import CounterConsole from "./CounterConsole";

export const instant = false;

const REGISTRAR_ROLES: AppRole[] = [
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
  if (!role || !REGISTRAR_ROLES.includes(role)) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-gray-500">
          The Counter Console requires a registrar role.
        </p>
      </main>
    );
  }

  const counters = await listOperableCounters(supabase);
  return <CounterConsole counters={counters} />;
}
