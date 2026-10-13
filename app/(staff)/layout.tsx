import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen bg-bg">
      <StaffNav role={role} label={profile?.full_name ?? user.email ?? "Staff"} />
      <main className="min-w-0 flex-1 flex flex-col">
        <div className="h-14 flex items-center gap-3 border-b border-line bg-surface px-5">
          <div className="flex-1" />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[11px] font-bold text-white">
            {(profile?.full_name ?? user.email ?? "S").charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 p-4">{children}</div>
      </main>
    </div>
  );
}
