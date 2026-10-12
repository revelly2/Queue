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
}: {
  counters: OperableCounter[];
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

  // Restore last-used counter on mount.
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

  // Load board + subscribe to live updates when the selected counter changes.
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
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">
        No counters are configured. Ask an administrator to create one.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Counter Console</h1>
          <p className="text-sm text-gray-500">
            {counter.modules.map((m) => m.name).join(", ") || "No modules assigned"}
            {counter.maxAccess ? ` · ${counter.maxAccess.toLowerCase()} access` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={counter.id}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={counter.status}
            onChange={(e) => void changeStatus(e.target.value as CounterStatus)}
            disabled={busy}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            title="Counter status"
          >
            {COUNTER_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </header>

      <button
        onClick={() =>
          void run(() => callNext(supabase, counter.id), "Called next ticket")
        }
        disabled={busy || !canWrite || counter.status === "CLOSED"}
        className="mb-4 w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
      >
        Call Next
      </button>

      {notice && (
        <p
          role="status"
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            notice.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Now serving ({board.serving.length})
        </h2>
        {board.serving.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-gray-400">
            Nothing being served.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
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
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Next in line ({board.waiting.length})
        </h2>
        {board.waiting.length === 0 ? (
          <p className="text-sm text-gray-400">Queue is empty.</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm">
            {board.waiting.map((t, i) => (
              <li
                key={t.id}
                className="flex justify-between rounded-md border border-gray-200 px-3 py-2"
              >
                <span>
                  <span className="font-semibold">{i + 1}. {t.ticketNumber}</span>{" "}
                  <span className="text-gray-500">{t.studentName ?? "—"}</span>
                </span>
                <span className="text-gray-400">
                  {t.items.map((it) => it.name).join(", ")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
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
    <li className="rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold">{t.ticketNumber}</p>
          <p className="text-sm text-gray-500">
            {t.studentName ?? "—"}
            {t.studentId ? ` · ${t.studentId}` : ""}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {t.items.map((it) => it.name + (it.quantity > 1 ? ` ×${it.quantity}` : "")).join(", ")}
          </p>
          {onHold && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              ON HOLD{t.holdReason ? ` — ${t.holdReason}` : ""}
            </p>
          )}
          {t.recallCount > 0 && (
            <p className="mt-1 text-xs text-gray-400">Recalls: {t.recallCount}</p>
          )}
        </div>
      </div>

      {canWrite && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => void run(() => recall(supabase, t.id), `${t.ticketNumber} recalled`)}
            disabled={busy}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            Recall
          </button>
          {onHold ? (
            <button
              onClick={() => void run(() => resume(supabase, t.id), `${t.ticketNumber} resumed`)}
              disabled={busy}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={() => {
                const reason = window.prompt("Hold reason (optional):") ?? "";
                void run(() => hold(supabase, t.id, reason), `${t.ticketNumber} on hold`);
              }}
              disabled={busy}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              Hold
            </button>
          )}
          <button
            onClick={() => void run(() => complete(supabase, t.id), `${t.ticketNumber} completed`)}
            disabled={busy}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Complete
          </button>

          {canFull && (
            <>
              <button
                onClick={() => void run(() => noShow(supabase, t.id), `${t.ticketNumber} marked no-show`)}
                disabled={busy || t.recallCount < 3}
                title={t.recallCount < 3 ? "Requires 3 recalls" : undefined}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-40"
              >
                No-Show
              </button>
              <select
                defaultValue=""
                onChange={(e) => {
                  const target = Number(e.target.value);
                  if (target) {
                    void run(
                      () => transfer(supabase, t.id, target),
                      `${t.ticketNumber} transferred`,
                    );
                  }
                  e.target.value = "";
                }}
                disabled={busy}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">Transfer to…</option>
                {counters
                  .filter((c) => c.id !== currentCounterId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </>
          )}
        </div>
      )}
    </li>
  );
}
