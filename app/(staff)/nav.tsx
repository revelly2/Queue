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
  section?: string;
}

const LINKS: NavLink[] = [
  { href: "/admin/monitoring", label: "Monitoring", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Analyze" },
  { href: "/admin/reports", label: "Reports", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Analyze" },
  { href: "/counter", label: "Counter Console", roles: ["COUNTER", "REGISTRAR_OFFICER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Operate" },
  { href: "/cashier", label: "Cashier", roles: ["CASHIER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Operate" },
  { href: "/admin/counters", label: "Counters", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
  { href: "/admin/modules", label: "Modules", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
  { href: "/admin/users", label: "Users & Roles", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
  { href: "/admin/announcements", label: "Announcements", roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
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
  const sections = [...new Set(links.map((l) => l.section))];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-line bg-surface" style={{ padding: "20px 12px 14px" }}>
      <div>
        <Link href="/" className="flex items-center gap-2.5 px-2 pb-2.5" style={{ fontWeight: 750, letterSpacing: "-0.04em", fontSize: "16px" }}>
          <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-accent text-[12px] font-extrabold text-white">Q</span>
          QueUA
        </Link>

        <div className="mx-1 mb-4 rounded-lg bg-bg px-2.5 py-2 text-xs text-muted">
          {label} ▾
        </div>

        <nav className="flex flex-col">
          {sections.map((section) => (
            <div key={section} className="mb-3.5">
              <div className="section-label px-2 py-1.5">{section}</div>
              {links
                .filter((l) => l.section === section)
                .map((l) => {
                  const active = pathname === l.href || pathname.startsWith(l.href + "/");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`nav-item ${active ? "active" : ""}`}
                    >
                      <span className="nav-dot" />
                      {l.label}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
      </div>

      <div className="rounded-[10px] bg-bg p-2.5 text-xs text-ink-soft">
        <div className="font-bold">{label}</div>
        <div className="mt-0.5 text-muted">{role.replace(/_/g, " ")}</div>
        <button onClick={signOut} className="btn btn-ghost mt-2 w-full text-xs">
          Sign out
        </button>
      </div>
    </aside>
  );
}
