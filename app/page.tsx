import Link from "next/link";

const portals = [
  { href: "/cashier", title: "Cashier", desc: "Clear assessed payments (staff)" },
  { href: "/login", title: "Staff Sign In", desc: "Cashier & registrar login" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-4">
      <div>
        <h1 className="text-3xl font-bold">QueUA</h1>
        <p className="mt-1 text-gray-500">
          Registrar Queue Management &amp; Monitoring System
        </p>
      </div>
      <nav className="grid gap-4 sm:grid-cols-2">
        {portals.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-lg border border-gray-200 p-5 shadow-sm transition hover:border-blue-400 hover:shadow"
          >
            <p className="text-lg font-semibold">{p.title}</p>
            <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
          </Link>
        ))}
      </nav>
      <p className="text-xs text-gray-400">
        Kiosk check-in, registrar console, lobby display &amp; analytics — coming
        in later phases.
      </p>
    </main>
  );
}
