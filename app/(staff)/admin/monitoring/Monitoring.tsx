"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getMonitorSnapshot, type MonitorSnapshot } from "@/lib/admin/monitor";

function MetricCard({ label, value, delta }: { label: string; value: string | number; delta?: { text: string; up?: boolean } }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && (
        <div className={`metric-delta ${delta.up ? "up" : ""}`}>{delta.text}</div>
      )}
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold">Live Monitoring</h1>
          <p className="mt-0.5 text-xs text-muted">Auto-refreshes every 5 seconds</p>
        </div>
        <span className="pill bg-green-light text-green text-[10px]">● Live</span>
      </div>

      <section className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        <MetricCard label="Queued" value={snap.totals.queued} />
        <MetricCard label="Serving" value={snap.totals.serving} delta={{ text: "active", up: true }} />
        <MetricCard label="On hold" value={snap.totals.onHold} />
        <MetricCard label="Awaiting payment" value={snap.totals.paymentPending} />
        <MetricCard
          label="Longest wait"
          value={snap.longestWaitMins === null ? "—" : `${snap.longestWaitMins}m`}
        />
      </section>

      <section className="card p-3.5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold">Counters</span>
          <span className="text-xs text-muted">{snap.counters.length} windows</span>
        </div>
        {snap.counters.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">No counters configured.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {snap.counters.map((c) => (
              <div key={c.number} className="flex items-center justify-between rounded-lg border border-line-dim p-3">
                <div>
                  <p className="text-sm font-semibold">
                    Window {c.number} <span className="font-normal text-muted">· {c.label}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Now serving: <span className="font-bold text-ink">{c.serving ?? "—"}</span>
                  </p>
                </div>
                <span
                  className={`pill text-[10px] ${
                    c.status === "OPEN"
                      ? "bg-green-light text-green"
                      : c.status === "BUSY"
                        ? "bg-accent-light text-accent"
                        : c.status === "ON_BREAK"
                          ? "bg-amber-light text-amber"
                          : "bg-bg text-muted"
                  }`}
                >
                  {c.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
