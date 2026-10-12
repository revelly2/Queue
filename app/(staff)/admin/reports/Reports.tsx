"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getReport, reportToCsv, type ReportData } from "@/lib/admin/reports";

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
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
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Reports</h1>
      <p className="mb-4 text-sm text-gray-500">Transaction volumes and service metrics.</p>

      <div className="mb-5 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </label>
        <button onClick={() => void run()} disabled={busy} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Running…" : "Run"}
        </button>
        <button onClick={exportCsv} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold">
          Export CSV
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Total tickets" value={report.total} />
        <Tile label="Completed" value={report.completed} />
        <Tile label="No-show rate" value={`${(report.noShowRate * 100).toFixed(1)}%`} />
        <Tile label="Avg wait (AQWT)" value={report.aqwtMins === null ? "—" : `${report.aqwtMins}m`} />
        <Tile label="Avg handling (ASHT)" value={report.ashtMins === null ? "—" : `${report.ashtMins}m`} />
        <Tile label="Peak hour" value={peak.count > 0 ? `${peak.hour}:00 (${peak.count})` : "—"} />
      </section>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Transactions by service
      </h2>
      {report.byService.length === 0 ? (
        <p className="text-sm text-gray-400">No transactions in this range.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">Service</th>
              <th className="py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {report.byService.map((s) => (
              <tr key={s.code} className="border-b border-gray-100">
                <td className="py-1.5">{s.name}</td>
                <td className="py-1.5 text-right font-semibold tabular-nums">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
