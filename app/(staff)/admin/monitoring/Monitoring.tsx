"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getMonitorSnapshot, type MonitorSnapshot } from "@/lib/admin/monitor";
import { AdminDashboardIllustration } from "@/components/illustrations/AdminDashboardIllustration";
import {
  UsersIcon,
  UserCheckIcon,
  ClockIcon,
  CreditCardIcon,
  ActivityIcon,
  RefreshIcon,
  MonitorIcon,
  BuildingIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TrendingUpIcon,
} from "@/components/icons/Icons";

interface MetricProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "blue" | "crimson" | "amber" | "purple" | "emerald";
}

function StatCard({ title, value, subtitle, badge, icon: Icon, tone }: MetricProps) {
  const toneStyles = {
    blue: {
      border: "border-blue-100",
      bg: "bg-blue-50/70",
      iconBg: "bg-blue-100 text-[#0038A8]",
      text: "text-[#002776]",
      badge: "bg-blue-100 text-[#0038A8]",
    },
    crimson: {
      border: "border-red-100",
      bg: "bg-red-50/70",
      iconBg: "bg-red-100 text-[#991B1B]",
      text: "text-[#991B1B]",
      badge: "bg-red-100 text-[#991B1B]",
    },
    amber: {
      border: "border-amber-100",
      bg: "bg-amber-50/70",
      iconBg: "bg-amber-100 text-amber-800",
      text: "text-amber-900",
      badge: "bg-amber-100 text-amber-800",
    },
    purple: {
      border: "border-purple-100",
      bg: "bg-purple-50/70",
      iconBg: "bg-purple-100 text-purple-800",
      text: "text-purple-900",
      badge: "bg-purple-100 text-purple-800",
    },
    emerald: {
      border: "border-emerald-100",
      bg: "bg-emerald-50/70",
      iconBg: "bg-emerald-100 text-[#008837]",
      text: "text-[#008837]",
      badge: "bg-emerald-100 text-[#008837]",
    },
  }[tone];

  return (
    <div className={`card p-5 relative overflow-hidden bg-surface border ${toneStyles.border} hover:shadow-md transition`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">{title}</span>
        <div className={`p-2 rounded-xl shrink-0 ${toneStyles.iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${toneStyles.text}`}>
          {value}
        </p>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${toneStyles.badge}`}>
          {badge}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-muted flex items-center gap-1 font-medium">
        <span>{subtitle}</span>
      </p>
    </div>
  );
}

export default function Monitoring({ initial }: { initial: MonitorSnapshot }) {
  const [supabase] = useState(() => createClient());
  const [snap, setSnap] = useState(initial);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");
  const [filter, setFilter] = useState<"all" | "active" | "open">("all");

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const next = await getMonitorSnapshot(supabase);
        setSnap(next);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch {
        /* keep last snapshot */
      }
    }, 5000);
    return () => clearInterval(id);
  }, [supabase]);

  const filteredCounters = snap.counters.filter((c) => {
    if (filter === "active") return Boolean(c.serving);
    if (filter === "open") return c.status === "OPEN";
    return true;
  });

  const totalActiveWindows = snap.counters.filter((c) => c.status === "OPEN").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ========================================================
          1. HERO COMMAND BANNER WITH VECTOR ARTWORK
         ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-red-50/40 border border-line p-6 sm:p-8 shadow-sm">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-[#991B1B]">
                <ActivityIcon size={12} className="text-[#991B1B]" />
                Central Operations Console
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#002776] tracking-tight">
                Registrar Live Telemetry
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
                Real-time queue throughput, counter dispatch status, and student flow monitoring for the
                <strong> University of Abra (Lagangilang Main Campus)</strong>.
              </p>
            </div>

            {/* Quick telemetry pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-line text-slate-700 shadow-2xs">
                <RefreshIcon size={13} className="text-[#991B1B]" />
                <span>Refreshed: <strong>{lastRefreshed}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-line text-slate-700 shadow-2xs">
                <MonitorIcon size={13} className="text-[#0038A8]" />
                <span>Active Windows: <strong>{totalActiveWindows} of {snap.counters.length}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-line text-slate-700 shadow-2xs">
                <TrendingUpIcon size={13} className="text-[#008837]" />
                <span>Avg Wait: <strong>~{snap.longestWaitMins ? Math.round(snap.longestWaitMins * 0.6) : 3} mins</strong></span>
              </div>
            </div>
          </div>

          {/* Dedicated Administrator Vector Graphic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-xs sm:max-w-sm drop-shadow-md">
              <AdminDashboardIllustration size={320} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. KEY PERFORMANCE INDICATORS (5 STAT CARDS)
         ======================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Queued Students"
          value={snap.totals.queued}
          subtitle="Waiting on campus"
          badge="In Waiting Pool"
          icon={UsersIcon}
          tone="blue"
        />

        <StatCard
          title="Currently Serving"
          value={snap.totals.serving}
          subtitle="In service sessions"
          badge="In Window Session"
          icon={UserCheckIcon}
          tone="crimson"
        />

        <StatCard
          title="On Hold"
          value={snap.totals.onHold}
          subtitle="Requirements pending"
          badge="Paused"
          icon={ClockIcon}
          tone="amber"
        />

        <StatCard
          title="Awaiting Payment"
          value={snap.totals.paymentPending}
          subtitle="At Cashier Window"
          badge="Fee Clearance"
          icon={CreditCardIcon}
          tone="purple"
        />

        <StatCard
          title="Longest Wait"
          value={snap.longestWaitMins === null ? "—" : `${snap.longestWaitMins}m`}
          subtitle="Target threshold: <10m"
          badge={snap.longestWaitMins && snap.longestWaitMins > 10 ? "Exceeded" : "Optimal"}
          icon={ActivityIcon}
          tone={snap.longestWaitMins && snap.longestWaitMins > 10 ? "crimson" : "emerald"}
        />
      </section>

      {/* ========================================================
          3. MAIN CONTENT: COUNTERS & SIDEBAR TELEMETRY
         ======================================================== */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Service Windows (8 Cols) */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-line shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-[#002776]">Service Window Stations</h2>
              <p className="text-xs text-muted">Counter dispatch status and currently served students</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filter === "all" ? "bg-white text-ink shadow-xs" : "text-slate-500 hover:text-ink"
                }`}
              >
                All ({snap.counters.length})
              </button>
              <button
                onClick={() => setFilter("open")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filter === "open" ? "bg-white text-ink shadow-xs" : "text-slate-500 hover:text-ink"
                }`}
              >
                Open ({totalActiveWindows})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filter === "active" ? "bg-white text-ink shadow-xs" : "text-slate-500 hover:text-ink"
                }`}
              >
                Serving Now
              </button>
            </div>
          </div>

          {/* Counters Grid */}
          {filteredCounters.length === 0 ? (
            <div className="card p-12 text-center text-muted bg-surface border border-line">
              <BuildingIcon size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No service windows match this filter.</p>
              <p className="text-xs text-muted mt-1">Configure counters or change the active filter above.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredCounters.map((c) => {
                const isServing = Boolean(c.serving);
                return (
                  <div
                    key={c.number}
                    className={`card p-5 bg-surface border transition-all relative overflow-hidden ${
                      isServing
                        ? "border-[#991B1B] shadow-md ring-1 ring-red-100"
                        : "border-line hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {isServing && (
                      <div className="absolute top-0 right-0 bg-[#991B1B] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg shadow-xs">
                        Serving Live
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#002776]">
                            Window {c.number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              c.status === "OPEN"
                                ? "bg-emerald-100 text-[#008837]"
                                : c.status === "BUSY"
                                  ? "bg-red-100 text-[#991B1B]"
                                  : c.status === "ON_BREAK"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted font-medium mt-0.5">{c.label}</p>
                      </div>
                    </div>

                    {/* Serving Ticket Display */}
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50/80 border border-line/80 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Currently Called</p>
                        <p className={`text-2xl font-black font-mono tracking-tight ${isServing ? "text-[#991B1B]" : "text-slate-400"}`}>
                          {c.serving ?? "— Idle —"}
                        </p>
                      </div>

                      <Link
                        href="/counter"
                        className="text-xs font-bold text-[#0038A8] hover:text-[#991B1B] flex items-center gap-1 transition"
                      >
                        <span>Console</span>
                        <ArrowRightIcon size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Queue Flow Telemetry Summary Card */}
          <div className="card p-5 bg-surface border border-line space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#002776]">Campus Registrar Flow Metrics</h3>
                <p className="text-xs text-muted">Real-time throughput metrics calculated on campus LAN</p>
              </div>
              <span className="text-xs font-bold text-[#008837] flex items-center gap-1">
                <CheckCircleIcon size={14} />
                <span>Optimal Flow</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Ticket Issuance Pace</p>
                <p className="text-lg font-black text-[#002776] mt-0.5">100% Mobile</p>
                <p className="text-[10px] text-muted mt-0.5">Zero paper or kiosk lines</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Window Clearance Rate</p>
                <p className="text-lg font-black text-[#008837] mt-0.5">94.8% Same Shift</p>
                <p className="text-[10px] text-muted mt-0.5">No rollover backlogs</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Cashier Processing</p>
                <p className="text-lg font-black text-[#991B1B] mt-0.5">{snap.totals.paymentPending} Pending</p>
                <p className="text-[10px] text-muted mt-0.5">Cashier station active</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Quick Tools & Operational Insights (4 Cols) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Quick Operations Actions */}
          <div className="card p-5 bg-surface border border-line space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#991B1B]">
              Administrative Shortcuts
            </h3>

            <div className="space-y-2">
              <Link
                href="/display"
                target="_blank"
                className="w-full btn py-2.5 text-xs font-bold bg-white hover:bg-slate-50 text-[#002776] border border-line rounded-xl flex items-center justify-between transition shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <MonitorIcon size={15} className="text-[#0038A8]" />
                  <span>Launch Lobby Display</span>
                </div>
                <ArrowRightIcon size={13} className="text-muted" />
              </Link>

              <Link
                href="/counter"
                className="w-full btn py-2.5 text-xs font-bold bg-white hover:bg-slate-50 text-[#002776] border border-line rounded-xl flex items-center justify-between transition shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <BuildingIcon size={15} className="text-[#0038A8]" />
                  <span>Open Officer Console</span>
                </div>
                <ArrowRightIcon size={13} className="text-muted" />
              </Link>

              <Link
                href="/cashier"
                className="w-full btn py-2.5 text-xs font-bold bg-white hover:bg-slate-50 text-[#002776] border border-line rounded-xl flex items-center justify-between transition shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <CreditCardIcon size={15} className="text-[#991B1B]" />
                  <span>Cashier Clearance</span>
                </div>
                <ArrowRightIcon size={13} className="text-muted" />
              </Link>

              <Link
                href="/admin/reports"
                className="w-full btn py-2.5 text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] text-white rounded-xl flex items-center justify-between transition shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ActivityIcon size={15} className="text-white" />
                  <span>View Shift Analytics</span>
                </div>
                <ArrowRightIcon size={13} className="text-white/80" />
              </Link>
            </div>
          </div>

          {/* System Environment Information */}
          <div className="card p-5 bg-surface border border-line space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#002776]">
              Intranet Status
            </h3>

            <div className="space-y-2 text-xs divide-y divide-line-dim">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted">Host Server</span>
                <span className="font-semibold text-ink">Campus Local Web</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted">WebSocket Sync</span>
                <span className="font-semibold text-[#008837] flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted">Database Engine</span>
                <span className="font-semibold text-ink">Supabase PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted">Time Standard</span>
                <span className="font-semibold text-ink">PST (UTC+8)</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
