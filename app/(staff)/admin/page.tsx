import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getMonitorSnapshot } from "@/lib/admin/monitor";
import { SystemArchitectureIllustration } from "@/components/illustrations/SystemArchitectureIllustration";
import {
  ActivityIcon,
  BarChartIcon,
  BuildingIcon,
  CreditCardIcon,
  MonitorIcon,
  LayersIcon,
  UsersIcon,
  SpeakerIcon,
  ArrowRightIcon,
  ClockIcon,
  TrendingUpIcon,
} from "@/components/icons/Icons";

export const instant = false;

interface AdminModuleCard {
  href: string;
  title: string;
  category: "Analyze" | "Operate" | "Configure";
  desc: string;
  badge?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "blue" | "crimson" | "emerald" | "amber";
}

const MODULES: AdminModuleCard[] = [
  {
    href: "/admin/monitoring",
    title: "Live Monitoring",
    category: "Analyze",
    desc: "Real-time service window states, queue pools, active student sessions, and longest wait alerts.",
    badge: "Real-time Telemetry",
    icon: ActivityIcon,
    tone: "crimson",
  },
  {
    href: "/admin/reports",
    title: "Shift & Daily Reports",
    category: "Analyze",
    desc: "Transaction volumes, no-show rates, AQWT/ASHT service benchmarks, and raw CSV exports.",
    badge: "Analytics & Logs",
    icon: BarChartIcon,
    tone: "blue",
  },
  {
    href: "/counter",
    title: "Counter Console",
    category: "Operate",
    desc: "Interactive window dispatch console for officers to call, transfer, hold, and complete student requests.",
    badge: "Officer Terminal",
    icon: BuildingIcon,
    tone: "blue",
  },
  {
    href: "/cashier",
    title: "Cashier Clearance",
    category: "Operate",
    desc: "Process tuition, OTR, diploma, and certification fees to automatically unblock queues.",
    badge: "Payment Terminal",
    icon: CreditCardIcon,
    tone: "emerald",
  },
  {
    href: "/admin/counters",
    title: "Service Windows",
    category: "Configure",
    desc: "Create and rename physical windows, toggle open/close status, and bind service modules.",
    badge: "Station Setup",
    icon: MonitorIcon,
    tone: "blue",
  },
  {
    href: "/admin/modules",
    title: "Queue Modules",
    category: "Configure",
    desc: "Define service groupings (Enrollment, Clearances, OTR & Records, Cashier) and routing priorities.",
    badge: "Workflow Rules",
    icon: LayersIcon,
    tone: "amber",
  },
  {
    href: "/admin/users",
    title: "Staff & Accounts",
    category: "Configure",
    desc: "Manage personnel access, role assignments (Registrar Admin, Officer, Cashier), and permissions.",
    badge: "Access Control",
    icon: UsersIcon,
    tone: "crimson",
  },
  {
    href: "/admin/announcements",
    title: "Public Announcements",
    category: "Configure",
    desc: "Broadcast urgent advisories and notifications across lobby display screens.",
    badge: "Lobby Broadcast",
    icon: SpeakerIcon,
    tone: "amber",
  },
];

export default async function AdminPage() {
  await connection();
  const { ok, supabase } = await requireAdmin();
  if (!ok) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-[#002776]">Not authorized</h1>
          <p className="mt-1 text-xs text-muted">Administrator credentials required to access this portal.</p>
        </div>
      </div>
    );
  }

  // Pre-fetch live snapshot for instant operational KPIs
  const snap = await getMonitorSnapshot(supabase);
  const openCountersCount = snap.counters.filter((c) => c.status === "OPEN").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ========================================================
          1. HERO EXECUTIVE SUMMARY WITH VECTOR ARTWORK
         ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-red-50/40 border border-line p-6 sm:p-8 shadow-sm">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-[#991B1B]">
                <ActivityIcon size={12} className="text-[#991B1B]" />
                Executive Administration
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                University Intranet Online
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#002776] tracking-tight">
                QueUA Control Hub
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
                Comprehensive queue governance, service counter dispatch, and institutional reporting for the
                <strong> University of Abra (Lagangilang Main Campus)</strong>.
              </p>
            </div>

            {/* Quick Live Telemetry Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-line text-slate-700 shadow-2xs">
                <UsersIcon size={13} className="text-[#0038A8]" />
                <span>Queued Students: <strong className="text-[#002776]">{snap.totals.queued}</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-line text-slate-700 shadow-2xs">
                <MonitorIcon size={13} className="text-[#008837]" />
                <span>Active Windows: <strong className="text-[#008837]">{openCountersCount} of {snap.counters.length}</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-line text-slate-700 shadow-2xs">
                <ClockIcon size={13} className="text-[#991B1B]" />
                <span>Longest Wait: <strong className="text-[#991B1B]">{snap.longestWaitMins === null ? "None" : `${snap.longestWaitMins}m`}</strong></span>
              </div>
            </div>
          </div>

          {/* Dedicated Architecture Vector Graphic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-xs sm:max-w-sm drop-shadow-md">
              <SystemArchitectureIllustration size={320} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. LIVE PULSE & SYSTEM HEALTH OVERVIEW
         ======================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 bg-surface border border-line hover:shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Students in Line</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0038A8]">
              <UsersIcon size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-[#002776]">{snap.totals.queued}</p>
          <p className="text-[11px] text-muted mt-1 font-medium">Waiting for dispatch</p>
        </div>

        <div className="card p-4 bg-surface border border-line hover:shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">In Window Session</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-[#991B1B]">
              <ActivityIcon size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-[#991B1B]">{snap.totals.serving}</p>
          <p className="text-[11px] text-muted mt-1 font-medium">Active counter consultations</p>
        </div>

        <div className="card p-4 bg-surface border border-line hover:shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Cashier Pipeline</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <CreditCardIcon size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-purple-900">{snap.totals.paymentPending}</p>
          <p className="text-[11px] text-muted mt-1 font-medium">Awaiting settlement</p>
        </div>

        <div className="card p-4 bg-surface border border-line hover:shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Station Capacity</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[#008837]">
              <MonitorIcon size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-[#008837]">
            {Math.round((openCountersCount / (snap.counters.length || 1)) * 100)}%
          </p>
          <p className="text-[11px] text-muted mt-1 font-medium">{openCountersCount} of {snap.counters.length} windows active</p>
        </div>
      </section>

      {/* ========================================================
          3. MANAGEMENT MODULES GRID
         ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#002776] tracking-tight">System Modules & Control Surfaces</h2>
            <p className="text-xs text-muted">Direct operational controls, telemetry pipelines, and registrar configuration</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const toneBorder = {
              crimson: "hover:border-[#991B1B]/40 group-hover:text-[#991B1B]",
              blue: "hover:border-[#0038A8]/40 group-hover:text-[#0038A8]",
              emerald: "hover:border-[#008837]/40 group-hover:text-[#008837]",
              amber: "hover:border-amber-500/40 group-hover:text-amber-800",
            }[m.tone];

            const iconBg = {
              crimson: "bg-red-50 text-[#991B1B]",
              blue: "bg-blue-50 text-[#0038A8]",
              emerald: "bg-emerald-50 text-[#008837]",
              amber: "bg-amber-50 text-amber-800",
            }[m.tone];

            return (
              <Link
                key={m.href}
                href={m.href}
                className={`card group p-5 bg-surface border border-line transition duration-200 hover:shadow-md flex flex-col justify-between ${toneBorder}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${iconBg} transition group-hover:scale-105`}>
                      <Icon size={20} />
                    </div>
                    {m.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {m.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#002776] transition flex items-center gap-1.5">
                    <span>{m.title}</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-line-dim flex items-center justify-between text-xs font-bold text-[#0038A8] group-hover:text-[#991B1B] transition">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">{m.category}</span>
                  <div className="flex items-center gap-1">
                    <span>Open Module</span>
                    <ArrowRightIcon size={13} className="transition transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. CAMPUS INTRANET & FAST LAUNCH BAR
         ======================================================== */}
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#002776]">Public Facing Screens & Terminals</h4>
            <p className="text-xs text-muted">
              Live screens connected to this local QueUA instance across the University of Abra Lagangilang Main Campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/display"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black text-white transition flex items-center gap-2 shadow-xs"
            >
              <MonitorIcon size={14} />
              <span>Launch Lobby Screen</span>
              <span className="text-[10px] opacity-70">↗</span>
            </a>

            <a
              href="/book"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white transition flex items-center gap-2 shadow-xs"
            >
              <span>Student Mobile Booking</span>
              <span className="text-[10px] opacity-70">↗</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
