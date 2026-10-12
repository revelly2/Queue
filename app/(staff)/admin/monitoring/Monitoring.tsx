"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getMonitorSnapshot, type MonitorSnapshot } from "@/lib/admin/monitor";

function Tile({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

export default function Monitoring({ initial }: { initial: MonitorSnapshot }) {
  const [supabase] = useState(() => createClient());
  const [snap, setSnap] = useState(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        setSnap(await getMonitorSnapshot(supabase));
      } catch {
        /* keep last snapshot */
      }
    }, 5000);
    return () => clearInterval(id);
  }, [supabase]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Live Monitoring</h1>
      <p className="mb-4 text-sm text-muted">Updates every 5 seconds.</p>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Queued" value={snap.totals.queued} />
        <Tile label="Serving" value={snap.totals.serving} accent="text-blue" />
        <Tile label="On hold" value={snap.totals.onHold} accent="text-amber-600" />
        <Tile label="Awaiting payment" value={snap.totals.paymentPending} />
        <Tile
          label="Longest wait"
          value={snap.longestWaitMins === null ? "—" : `${snap.longestWaitMins}m`}
          accent={snap.longestWaitMins !== null && snap.longestWaitMins >= 15 ? "text-red-600" : ""}
        />
      </section>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
        Counters
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {snap.counters.map((c) => (
          <li key={c.number} className="rounded-lg border border-line p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Window {c.number} <span className="font-normal text-muted">· {c.label}</span>
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  c.status === "OPEN"
                    ? "bg-green-100 text-green-700"
                    : c.status === "BUSY"
                      ? "bg-paper-dim text-blue"
                      : c.status === "ON_BREAK"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-paper-dim text-muted"
                }`}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Now serving:{" "}
              <span className="font-bold">{c.serving ?? "—"}</span>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
