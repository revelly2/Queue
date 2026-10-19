import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { AppRole } from "@/lib/db/enums";
import StaffNav from "./nav";

export const instant = false;

const STAFF_ROLES: AppRole[] = [
  "CASHIER",
  "COUNTER",
  "REGISTRAR_OFFICER",
  "REGISTRAR_ADMIN",
  "SYSTEM_ADMIN",
];

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
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
        <p className="text-xs text-muted">
          {user.email} has no staff role assigned. Ask an administrator for access.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StaffNav role={role} label={profile?.full_name ?? user.email ?? "Staff"} />
      <main className="min-w-0 flex-1 flex flex-col">
        {/* Top Operational Command Bar */}
        <header className="h-16 flex items-center justify-between border-b border-line bg-surface px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#002776]">University Registrar Console</span>
            <span className="h-3 w-px bg-line" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Intranet Sync Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/display"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-line text-slate-700 hover:bg-slate-50 hover:text-[#0038A8] transition flex items-center gap-1.5"
            >
              <span>Lobby Screen</span>
              <span className="text-[10px]">↗</span>
            </a>

            <a
              href="/book"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-[#991B1B] hover:bg-red-100 transition flex items-center gap-1.5"
            >
              <span>Student Booking</span>
              <span className="text-[10px]">↗</span>
            </a>

            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#991B1B] text-xs font-black text-white shadow-2xs">
              {(profile?.full_name ?? user.email ?? "S").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
