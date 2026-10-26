"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getHistory, matchesSearch, type HistoryRow } from "@/lib/admin/history";

const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

const PAYMENT_LABEL: Record<HistoryRow["paymentStatus"], string> = {
  NOT_APPLICABLE: "Free",
  PAYMENT_PENDING: "Unpaid",
  PAID: "Paid",
};

export default function History({
  initial,
  fromDate,
  toDate,
}: {
  initial: HistoryRow[];
  fromDate: string;
  toDate: string;
}) {
  const [supabase] = useState(() => createClient());
  const [rows, setRows] = useState(initial);
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const fromIso = new Date(`${from}T00:00:00`).toISOString();
      const toIso = new Date(`${to}T23:59:59`).toISOString();
      setRows(await getHistory(supabase, fromIso, toIso));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const shown = rows.filter((r) => matchesSearch(r, query));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Transaction History</h1>
        <p className="mt-0.5 text-xs text-muted">Every student transaction booked in the selected range</p>
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
          {busy ? "Loading…" : "Load"}
        </button>
        <label className="ml-auto flex flex-col gap-1">
          <span className="section-label">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, student ID, or ticket no."
            className="field w-64 text-xs"
          />
        </label>
      </div>

      {error && <p role="alert" className="mb-3 rounded-lg bg-red-light px-3 py-2 text-xs text-red">{error}</p>}

      <div className="mb-2 text-xs text-muted">
        {shown.length} of {rows.length} transaction{rows.length === 1 ? "" : "s"}
      </div>

      <section className="card overflow-x-auto p-0">
        {shown.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">No transactions found.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-bg text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Ticket</th>
                <th className="px-3 py-2 font-semibold">Student</th>
                <th className="px-3 py-2 font-semibold">Services</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Payment</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold"><span className="sr-only">Receipt</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.ticketNumber} className="border-b border-line-dim align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-muted">{when(r.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold">{r.ticketNumber}</td>
                  <td className="px-3 py-2">
                    <div>{r.studentName ?? "—"}</div>
                    {r.studentId && <div className="text-muted">{r.studentId}</div>}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {r.items.map((it) => it.name + (it.quantity > 1 ? ` ×${it.quantity}` : "")).join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{peso(r.totalAssessed)}</td>
                  <td className="px-3 py-2">{PAYMENT_LABEL[r.paymentStatus]}</td>
                  <td className="px-3 py-2">
                    <div>{r.queueStatus.replace("_", " ")}</div>
                    {r.window && <div className="text-muted">{r.window}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={`/receipt/${encodeURIComponent(r.ticketNumber)}`}
                      target="_blank"
                      rel="noopener"
                      className="whitespace-nowrap font-semibold text-accent hover:underline"
                    >
                      Receipt
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
