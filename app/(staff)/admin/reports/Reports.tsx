"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getReport, reportToCsv, type ReportData } from "@/lib/admin/reports";

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export default function Reports({
  initial,
  fromDate,
  toDate,
}: {
  initial: ReportData;
  fromDate: string;
  toDate: string;
}) {
  const [supabase] = useState(() => createClient());
  const [report, setReport] = useState(initial);
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [range, setRange] = useState({ from: fromDate, to: toDate });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const fromIso = new Date(`${from}T00:00:00`).toISOString();
      const toIso = new Date(`${to}T23:59:59`).toISOString();
      setReport(await getReport(supabase, fromIso, toIso));
      setRange({ from, to });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const csv = reportToCsv(report, range.from, range.to);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `queua-report-${range.from}_to_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const peak = report.byHour.reduce((best, h) => (h.count > best.count ? h : best), { hour: 0, count: 0 });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold">Reports</h1>
          <p className="mt-0.5 text-xs text-muted">Transaction volumes and service metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill border border-line bg-surface text-ink text-xs">{range.from} — {range.to}</span>
          <button onClick={exportCsv} className="btn btn-ghost">Export</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="section-label">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field text-xs" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="section-label">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field text-xs" />
        </label>
        <button onClick={() => void run()} disabled={busy} className="btn btn-accent">
          {busy ? "Running…" : "Run"}
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-light px-3 py-2 text-xs text-red">{error}</p>}

      <section className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Total tickets" value={report.total} />
        <MetricCard label="Completed" value={report.completed} />
        <MetricCard label="No-show rate" value={`${(report.noShowRate * 100).toFixed(1)}%`} />
        <MetricCard label="Avg wait" value={report.aqwtMins === null ? "—" : `${report.aqwtMins}m`} />
        <MetricCard label="Avg handling" value={report.ashtMins === null ? "—" : `${report.ashtMins}m`} />
        <MetricCard label="Peak hour" value={peak.count > 0 ? `${peak.hour}:00` : "—"} />
      </section>

      <section className="card p-3.5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold">By service</span>
          <span className="text-xs text-muted">{report.byService.length} services</span>
        </div>
        {report.byService.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">No transactions in this range.</p>
        ) : (
          <div className="text-xs">
            {report.byService.map((s) => (
              <div key={s.code} className="grid grid-cols-[1fr_48px] gap-2 items-center border-b border-line-dim py-1.5">
                <span>{s.name}</span>
                <span className="text-right font-semibold tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
