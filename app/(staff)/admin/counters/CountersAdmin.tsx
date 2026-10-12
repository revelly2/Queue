"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ACCESS_LEVEL, COUNTER_STATUS, type AccessLevel, type CounterStatus } from "@/lib/db/enums";
import {
  assignModule,
  createCounter,
  deleteCounter,
  listCounters,
  removeAssignment,
  updateAssignment,
  updateCounter,
  type AdminCounter,
} from "@/lib/admin/config";

interface ModuleOpt {
  id: number;
  code: string;
  name: string;
}

export default function CountersAdmin({
  initialCounters,
  modules,
}: {
  initialCounters: AdminCounter[];
  modules: ModuleOpt[];
}) {
  const [supabase] = useState(() => createClient());
  const [counters, setCounters] = useState(initialCounters);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [newNumber, setNewNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const run = useCallback(
    async (action: () => Promise<unknown>, okText: string) => {
      setBusy(true);
      setNotice(null);
      try {
        await action();
        setCounters(await listCounters(supabase));
        setNotice({ ok: true, text: okText });
      } catch (e) {
        setNotice({ ok: false, text: (e as Error).message });
      } finally {
        setBusy(false);
      }
    },
    [supabase],
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Counters</h1>
      <p className="mb-4 text-sm text-muted">
        Add and rename counters, set status, and assign modules with access
        levels.
      </p>

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

      {/* Create counter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const num = Number(newNumber);
          if (!num || !newLabel.trim()) return;
          void run(() => createCounter(supabase, num, newLabel.trim()), "Counter created").then(() => {
            setNewNumber("");
            setNewLabel("");
          });
        }}
        className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-line p-4"
      >
        <label className="flex flex-col gap-1 text-xs font-medium">
          Number
          <input
            type="number"
            min={1}
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="w-20 rounded-md border border-line px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium">
          Label
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Counter 1 (Application Counter)"
            className="rounded-md border border-line px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add counter
        </button>
      </form>

      <ul className="flex flex-col gap-4">
        {counters.map((c) => {
          const assignedIds = new Set(c.assignments.map((a) => a.moduleId));
          const available = modules.filter((m) => !assignedIds.has(m.id));
          return (
            <li key={c.id} className="rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  defaultValue={c.number}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (n && n !== c.number) void run(() => updateCounter(supabase, c.id, { number: n }), "Number updated");
                  }}
                  className="w-16 rounded-md border border-line px-2 py-1.5 text-sm"
                />
                <input
                  defaultValue={c.label}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== c.label) void run(() => updateCounter(supabase, c.id, { label: v }), "Label updated");
                  }}
                  className="min-w-0 flex-1 rounded-md border border-line px-2 py-1.5 text-sm"
                />
                <select
                  value={c.status}
                  onChange={(e) => void run(() => updateCounter(supabase, c.id, { status: e.target.value as CounterStatus }), "Status updated")}
                  disabled={busy}
                  className="rounded-md border border-line px-2 py-1.5 text-sm"
                >
                  {COUNTER_STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${c.label}"? Its assignments are removed too.`)) {
                      void run(() => deleteCounter(supabase, c.id), "Counter deleted");
                    }
                  }}
                  disabled={busy}
                  className="rounded-md border border-red-300 px-2 py-1.5 text-sm text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              {/* Assignments */}
              <div className="mt-3 border-t border-line pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Modules
                </p>
                {c.assignments.length === 0 ? (
                  <p className="text-sm text-muted">No modules assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {c.assignments.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 text-sm">
                        <span className="flex-1">{a.moduleName}</span>
                        <select
                          value={a.accessLevel}
                          onChange={(e) => void run(() => updateAssignment(supabase, a.id, e.target.value as AccessLevel), "Access updated")}
                          disabled={busy}
                          className="rounded-md border border-line px-2 py-1 text-sm"
                        >
                          {ACCESS_LEVEL.map((lvl) => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => void run(() => removeAssignment(supabase, a.id), "Module removed")}
                          disabled={busy}
                          className="rounded-md border border-line px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {available.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const mid = Number(e.target.value);
                      if (mid) void run(() => assignModule(supabase, c.id, mid, "WRITE"), "Module assigned");
                      e.target.value = "";
                    }}
                    disabled={busy}
                    className="mt-2 rounded-md border border-line px-2 py-1.5 text-sm"
                  >
                    <option value="">+ Assign module…</option>
                    {available.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
