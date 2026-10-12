import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { AppRole } from "@/lib/db/enums";
import StaffNav from "./nav";

// The whole staff area reads auth cookies, so it is dynamic (blocking) rather
// than prerendered — required under cacheComponents.
export const instant = false;

const STAFF_ROLES: AppRole[] = [
  "CASHIER",
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
        <p className="text-sm text-muted">
          {user.email} has no staff role assigned. Ask an administrator for
          access.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <StaffNav role={role} label={profile?.full_name ?? user.email ?? "Staff"} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
