"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AppRole } from "@/lib/db/enums";
import { UniversitySeal } from "@/components/illustrations/UniversitySeal";
import {
  ActivityIcon,
  ClockIcon,
  BarChartIcon,
  BuildingIcon,
  CreditCardIcon,
  MonitorIcon,
  LayersIcon,
  UsersIcon,
  SpeakerIcon,
} from "@/components/icons/Icons";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: AppRole[];
  section: string;
}

const LINKS: NavLink[] = [
  { href: "/admin/monitoring", label: "Live Monitoring", icon: ActivityIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Analyze" },
  { href: "/admin/reports", label: "Shift Reports", icon: BarChartIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Analyze" },
  { href: "/admin/history", label: "Transaction History", icon: ClockIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Analyze" },
  { href: "/counter", label: "Counter Console", icon: BuildingIcon, roles: ["COUNTER", "REGISTRAR_OFFICER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Operate" },
  { href: "/cashier", label: "Cashier Clearance", icon: CreditCardIcon, roles: ["CASHIER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Operate" },
  { href: "/admin/counters", label: "Service Windows", icon: MonitorIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
  { href: "/admin/modules", label: "Queue Modules", icon: LayersIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
  { href: "/admin/users", label: "Staff & Accounts", icon: UsersIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
  { href: "/admin/announcements", label: "Announcements", icon: SpeakerIcon, roles: ["REGISTRAR_ADMIN", "SYSTEM_ADMIN"], section: "Configure" },
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
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-line bg-surface p-4">
      <div className="space-y-5">
        {/* Institutional Branding */}
        <Link
          href="/"
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition"
        >
          <UniversitySeal size={34} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#002776]">QueUA</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#991B1B] px-1.5 py-0.2 rounded">
                Admin
              </span>
            </div>
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase">Univ of Abra</span>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav className="flex flex-col space-y-4 pt-1">
          {sections.map((section) => (
            <div key={section} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#991B1B]">
                {section}
              </div>
              <div className="space-y-0.5">
                {links
                  .filter((l) => l.section === section)
                  .map((l) => {
                    const active = pathname === l.href || pathname.startsWith(l.href + "/");
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          active
                            ? "bg-red-50 text-[#991B1B] font-bold border-l-4 border-[#991B1B] shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={`shrink-0 transition ${
                            active ? "text-[#991B1B]" : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                        <span>{l.label}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Session Profile & Shift Info */}
      <div className="rounded-2xl border border-line bg-slate-50/80 p-3.5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#991B1B] text-white text-xs font-black shadow-xs">
            {label.charAt(0).toUpperCase()}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">{label}</p>
            <p className="truncate text-[10px] font-semibold text-[#991B1B] uppercase tracking-wider">
              {role.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="btn w-full py-1.5 text-xs font-bold bg-white hover:bg-red-50 hover:text-[#991B1B] text-slate-700 border border-line rounded-lg shadow-2xs transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
