"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { COUNTER_STATUS, type CounterStatus } from "@/lib/db/enums";
import {
  callNext,
  complete,
  getCounterBoard,
  hold,
  noShow,
  recall,
  resume,
  setCounterStatus,
  transfer,
  type CounterBoard,
  type ConsoleTicket,
  type OperableCounter,
} from "@/lib/counter/console";

const RANK = { READ: 1, WRITE: 2, FULL: 3 } as const;
const EMPTY: CounterBoard = { serving: [], waiting: [] };
const LS_KEY = "queua.counter.selected";

export default function CounterConsole({
  counters: initialCounters,
  locked = false,
}: {
  counters: OperableCounter[];
  locked?: boolean;
}) {
  const [supabase] = useState(() => createClient());
  const [counters, setCounters] = useState(initialCounters);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialCounters[0]?.id ?? null,
  );
  const [board, setBoard] = useState<CounterBoard>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const counter = counters.find((c) => c.id === selectedId) ?? null;
  const canWrite = counter?.maxAccess
    ? RANK[counter.maxAccess] >= RANK.WRITE
    : false;
  const canFull = counter?.maxAccess === "FULL";
  const moduleIds = useMemo(
    () => counter?.modules.map((m) => m.moduleId) ?? [],
    [counter],
  );

  const load = useCallback(async () => {
    if (selectedId == null) return;
    try {
      setBoard(await getCounterBoard(supabase, selectedId, moduleIds));
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }, [supabase, selectedId, moduleIds]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && counters.some((c) => c.id === Number(saved))) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedId(Number(saved));
      }
    } catch {
      /* ignore */
    }
  }, [counters]);

  useEffect(() => {
    if (selectedId == null) return;
    try {
      localStorage.setItem(LS_KEY, String(selectedId));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const channel = supabase
      .channel(`counter-${selectedId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, selectedId, load]);

  const run = useCallback(
    async (action: () => Promise<unknown>, okText: string) => {
      setBusy(true);
      setNotice(null);
      try {
        await action();
        setNotice({ ok: true, text: okText });
        await load();
      } catch (e) {
        setNotice({ ok: false, text: (e as Error).message });
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  async function changeStatus(status: CounterStatus) {
    if (!counter) return;
    await run(
      () => setCounterStatus(supabase, counter.id, status),
      `Counter set to ${status}`,
    );
    setCounters((prev) =>
      prev.map((c) => (c.id === counter.id ? { ...c, status } : c)),
    );
  }

  if (!counter) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-xs text-muted">
        No counters are configured. Ask an administrator to create one.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            {locked ? counter.label : "Counter Console"}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {counter.modules.map((m) => m.name).join(", ") || "No modules assigned"}
            {counter.maxAccess ? ` · ${counter.maxAccess.toLowerCase()} access` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!locked && (
            <select
              value={counter.id}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="field text-xs py-1.5"
            >
              {counters.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}
          <select
            value={counter.status}
            onChange={(e) => void changeStatus(e.target.value as CounterStatus)}
            disabled={busy}
            className="field text-xs py-1.5"
            title="Counter status"
          >
            {COUNTER_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      <button
        onClick={() =>
          void run(() => callNext(supabase, counter.id), "Called next ticket")
        }
        disabled={busy || !canWrite || counter.status === "CLOSED"}
        className="mb-4 w-full btn btn-accent py-3 text-sm"
      >
        Call Next
      </button>

      {notice && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-xs ${notice.ok ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
          {notice.text}
        </p>
      )}

      <section className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="section-label">Now serving ({board.serving.length})</span>
        </div>
        {board.serving.length === 0 ? (
          <div className="card py-8 text-center text-xs text-muted">
            Nothing being served.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {board.serving.map((t) => (
              <ServingCard
                key={t.id}
                ticket={t}
                counters={counters}
                currentCounterId={counter.id}
                canWrite={canWrite}
                canFull={canFull}
                busy={busy}
                run={run}
                supabase={supabase}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <span className="section-label">Next in line ({board.waiting.length})</span>
        </div>
        {board.waiting.length === 0 ? (
          <p className="text-xs text-muted">Queue is empty.</p>
        ) : (
          <div className="card p-0">
            {board.waiting.map((t, i) => (
              <div
                key={t.id}
                className={`flex justify-between px-3.5 py-2 text-xs ${i < board.waiting.length - 1 ? "border-b border-line-dim" : ""}`}
              >
                <span>
                  <span className="font-semibold">{i + 1}. {t.ticketNumber}</span>{" "}
                  <span className="text-muted">{t.studentName ?? "—"}</span>
                </span>
                <span className="text-muted">
                  {t.items.map((it) => it.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ServingCard({
  ticket: t,
  counters,
  currentCounterId,
  canWrite,
  canFull,
  busy,
  run,
  supabase,
}: {
  ticket: ConsoleTicket;
  counters: OperableCounter[];
  currentCounterId: number;
  canWrite: boolean;
  canFull: boolean;
  busy: boolean;
  run: (action: () => Promise<unknown>, okText: string) => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}) {
  const onHold = t.queueStatus === "ON_HOLD";
  return (
    <div className="card p-3.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold" style={{ letterSpacing: "-0.04em" }}>{t.ticketNumber}</p>
          <p className="text-xs text-muted">
            {t.studentName ?? "—"}
            {t.studentId ? ` · ${t.studentId}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t.items.map((it) => it.name + (it.quantity > 1 ? ` ×${it.quantity}` : "")).join(", ")}
          </p>
          {onHold && (
            <p className="mt-1 text-[11px] font-medium text-amber">
              ON HOLD{t.holdReason ? ` — ${t.holdReason}` : ""}
            </p>
          )}
          {t.recallCount > 0 && (
            <p className="mt-1 text-[11px] text-muted">Recalls: {t.recallCount}</p>
          )}
        </div>
      </div>

      {canWrite && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line-dim pt-3">
          <button onClick={() => void run(() => recall(supabase, t.id), `${t.ticketNumber} recalled`)} disabled={busy} className="btn btn-ghost text-[11px]">Recall</button>
          {onHold ? (
            <button onClick={() => void run(() => resume(supabase, t.id), `${t.ticketNumber} resumed`)} disabled={busy} className="btn btn-ghost text-[11px]">Resume</button>
          ) : (
            <button
              onClick={() => {
                const reason = window.prompt("Hold reason (optional):") ?? "";
                void run(() => hold(supabase, t.id, reason), `${t.ticketNumber} on hold`);
              }}
              disabled={busy}
              className="btn btn-ghost text-[11px]"
            >
              Hold
            </button>
          )}
          <button onClick={() => void run(() => complete(supabase, t.id), `${t.ticketNumber} completed`)} disabled={busy} className="btn btn-accent text-[11px]">Complete</button>
          {canFull && (
            <>
              <button
                onClick={() => void run(() => noShow(supabase, t.id), `${t.ticketNumber} marked no-show`)}
                disabled={busy || t.recallCount < 3}
                title={t.recallCount < 3 ? "Requires 3 recalls" : undefined}
                className="btn btn-danger text-[11px]"
              >
                No-Show
              </button>
              <select
                defaultValue=""
                onChange={(e) => {
                  const target = Number(e.target.value);
                  if (target) void run(() => transfer(supabase, t.id, target), `${t.ticketNumber} transferred`);
                  e.target.value = "";
                }}
                disabled={busy}
                className="field py-1 text-[11px]"
              >
                <option value="">Transfer to…</option>
                {counters
                  .filter((c) => c.id !== currentCounterId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
              </select>
            </>
          )}
        </div>
      )}
    </div>
  );
}
