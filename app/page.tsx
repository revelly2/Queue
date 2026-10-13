import Link from "next/link";

const portals = [
  { href: "/kiosk", title: "Check-in Kiosk", desc: "Get a queue ticket for services", tag: "Students" },
  { href: "/display", title: "Lobby Display", desc: "Live queue board with announcements", tag: "Display" },
  { href: "/login", title: "Staff Portal", desc: "Cashier, registrar & admin dashboard", tag: "Staff" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-8 px-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-accent text-sm font-extrabold text-white">Q</span>
          <span className="text-xl font-bold" style={{ letterSpacing: "-0.04em" }}>QueUA</span>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-sm">
          Registrar Queue Management & Monitoring System.
          Automated check-in, dynamic window routing, and real-time tracking.
        </p>
      </div>

      <nav className="flex flex-col gap-2.5">
        {portals.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="card group flex items-center justify-between gap-4 p-4 transition hover:border-accent"
          >
            <div>
              <div className="section-label mb-1">{p.tag}</div>
              <span className="text-sm font-semibold text-ink">{p.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{p.desc}</span>
            </div>
            <span className="text-faint transition group-hover:text-accent group-hover:translate-x-0.5">→</span>
          </Link>
        ))}
      </nav>

      <p className="text-xs text-faint">
        University of Abra · Office of the Registrar
      </p>
    </main>
  );
}
