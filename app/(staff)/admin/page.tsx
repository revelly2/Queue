import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export const instant = false;

const sections = [
  { href: "/admin/monitoring", title: "Live Monitoring", desc: "Window states, queue totals, longest waits", accent: true },
  { href: "/admin/reports", title: "Reports", desc: "Volume metrics, wait times, CSV export", accent: false },
  { href: "/admin/counters", title: "Counters", desc: "Add, rename, assign modules & access levels", accent: false },
  { href: "/admin/modules", title: "Modules", desc: "Service groupings for counter routing", accent: false },
  { href: "/admin/users", title: "Users & Roles", desc: "Assign staff roles to accounts", accent: false },
  { href: "/admin/announcements", title: "Announcements", desc: "Manage lobby display ticker", accent: false },
];

export default async function AdminPage() {
  const { ok } = await requireAdmin();
  if (!ok) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold">Not authorized</h1>
          <p className="mt-1 text-xs text-muted">Admin access required.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-0.5 text-xs text-muted">Registrar queue administration</p>
      </div>
      <nav className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`card group p-4 transition hover:border-accent ${s.accent ? "border-accent-border bg-accent-light" : ""}`}
          >
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs text-muted">{s.desc}</p>
          </Link>
        ))}
      </nav>
    </div>
  );
}
