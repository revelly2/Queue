import Link from "next/link";

const portals = [
  { href: "/kiosk", title: "Check-in Kiosk", desc: "Get a queue ticket", tag: "Students" },
  { href: "/login", title: "Staff Sign In", desc: "Cashier, registrar & admin", tag: "Staff" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-10 px-6">
      <div>
        <p className="eyebrow">Registrar Queue Management</p>
        <h1 className="kinetic mt-2 text-7xl sm:text-8xl">QueUA</h1>
        <p className="mt-3 max-w-md text-muted">
          Automated check-in, dynamic window routing, and real-time queue
          tracking for the Office of the Registrar.
        </p>
      </div>

      <nav className="grid gap-px overflow-hidden rounded-[3px] border border-line bg-line sm:grid-cols-2">
        {portals.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex flex-col justify-between gap-8 bg-paper p-6 transition hover:bg-paper-dim"
          >
            <span className="eyebrow">{p.tag}</span>
            <span>
              <span className="display block text-2xl">{p.title}</span>
              <span className="mt-1 block text-sm text-muted">{p.desc}</span>
              <span className="mt-3 inline-block text-sm text-blue group-hover:translate-x-0.5">
                Enter →
              </span>
            </span>
          </Link>
        ))}
      </nav>

      <p className="mono text-xs text-muted">
        Kiosk · Cashier · Counter Console · Lobby Display · Analytics
      </p>
    </main>
  );
}
