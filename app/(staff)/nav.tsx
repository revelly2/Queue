"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AppRole } from "@/lib/db/enums";

interface NavLink {
  href: string;
  label: string;
  roles: AppRole[];
}

const LINKS: NavLink[] = [
  { href: "/cashier", label: "Cashier", roles: ["CASHIER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"] },
  { href: "/counter", label: "Counter Console", roles: ["REGISTRAR_OFFICER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"] },
  { href: "/admin", label: "Admin", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"] },
];

export default function StaffNav({
  role,
  label,
}: {
  role: AppRole;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const links = LINKS.filter((l) => l.roles.includes(role));

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <Link href="/" className="text-lg font-bold">
          QueUA
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-xs text-gray-500">
        <p className="truncate font-medium">{label}</p>
        <p className="mt-0.5">{role.replace(/_/g, " ").toLowerCase()}</p>
        <button
          onClick={signOut}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
