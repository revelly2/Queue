import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export const instant = false;

const sections = [
  { href: "/admin/counters", title: "Counters", desc: "Add, rename, set status, and assign modules with access levels" },
  { href: "/admin/modules", title: "Modules", desc: "Create feature groupings and choose which services belong to each" },
];

export default async function AdminPage() {
  const { ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-gray-500">Admin access required.</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Admin</h1>
      <nav className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-gray-200 p-5 shadow-sm transition hover:border-blue-400"
          >
            <p className="text-lg font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </nav>
      <p className="mt-6 text-xs text-gray-400">
        Dynamic routing, users &amp; roles, live monitoring, and reports come in
        later phases.
      </p>
    </main>
  );
}
