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
  { href: "/counter", label: "Counter Console", roles: ["COUNTER", "REGISTRAR_OFFICER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"] },
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
    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-line bg-paper-dim p-4">
      <div>
        <Link href="/" className="display text-2xl">
          QueUA
        </Link>
        <nav className="mt-8 flex flex-col gap-0.5">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-[3px] px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-ink text-paper" : "text-ink hover:bg-paper"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        <p className="eyebrow mt-0.5">{role.replace(/_/g, " ")}</p>
        <button onClick={signOut} className="btn btn-ghost mt-3 w-full">
          Sign out
        </button>
      </div>
    </aside>
  );
}
