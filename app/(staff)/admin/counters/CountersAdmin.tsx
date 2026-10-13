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
import { createCounterAccount, removeCounterAccount } from "./actions";

interface ModuleOpt {
  id: number;
  code: string;
  name: string;
}

export default function CountersAdmin({
  initialCounters,
  modules,
  accounts,
}: {
  initialCounters: AdminCounter[];
  modules: ModuleOpt[];
  accounts: Record<string, string>;
}) {
  const [supabase] = useState(() => createClient());
  const [counters, setCounters] = useState(initialCounters);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [newNumber, setNewNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [localEmails, setLocalEmails] = useState<Record<number, string>>({});

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
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Counters</h1>
        <p className="mt-0.5 text-xs text-muted">Add counters, set status, assign modules with access levels.</p>
      </div>

      {notice && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-xs ${notice.ok ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
          {notice.text}
        </p>
      )}

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
        className="mb-4 flex flex-wrap items-end gap-2 card p-3.5"
      >
        <label className="flex flex-col gap-1">
          <span className="section-label">Number</span>
          <input type="number" min={1} value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className="field w-20 text-xs" />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="section-label">Label</span>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Counter 1 (Applications)" className="field text-xs" />
        </label>
        <button type="submit" disabled={busy} className="btn btn-accent">Add counter</button>
      </form>

      <div className="flex flex-col gap-2.5">
        {counters.map((c) => {
          const assignedIds = new Set(c.assignments.map((a) => a.moduleId));
          const available = modules.filter((m) => !assignedIds.has(m.id));
          return (
            <div key={c.id} className="card p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  defaultValue={c.number}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (n && n !== c.number) void run(() => updateCounter(supabase, c.id, { number: n }), "Number updated");
                  }}
                  className="field w-16 text-xs"
                />
                <input
                  defaultValue={c.label}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== c.label) void run(() => updateCounter(supabase, c.id, { label: v }), "Label updated");
                  }}
                  className="field min-w-0 flex-1 text-xs font-medium"
                />
                <select
                  value={c.status}
                  onChange={(e) => void run(() => updateCounter(supabase, c.id, { status: e.target.value as CounterStatus }), "Status updated")}
                  disabled={busy}
                  className="field text-xs py-1.5"
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
                  className="btn btn-danger text-[11px]"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 border-t border-line-dim pt-3">
                <p className="section-label mb-2">Modules</p>
                {c.assignments.length === 0 ? (
                  <p className="text-xs text-muted">No modules assigned.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {c.assignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-xs">
                        <span className="flex-1">{a.moduleName}</span>
                        <select
                          value={a.accessLevel}
                          onChange={(e) => void run(() => updateAssignment(supabase, a.id, e.target.value as AccessLevel), "Access updated")}
                          disabled={busy}
                          className="field py-1 text-[11px]"
                        >
                          {ACCESS_LEVEL.map((lvl) => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => void run(() => removeAssignment(supabase, a.id), "Module removed")}
                          disabled={busy}
                          className="btn btn-ghost text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
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
                    className="field mt-2 text-xs py-1.5"
                  >
                    <option value="">+ Assign module…</option>
                    {available.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-3 border-t border-line-dim pt-3">
                <p className="section-label mb-2">Station login</p>
                {c.assignedStaffId ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="mono flex-1 truncate text-muted">
                      {accounts[c.assignedStaffId] ?? localEmails[c.id] ?? "login set"}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Remove this station login? The account is deleted.")) {
                          void run(async () => {
                            const r = await removeCounterAccount({ counterId: c.id, deleteUser: true });
                            if (!r.ok) throw new Error(r.error);
                          }, "Station login removed");
                        }
                      }}
                      disabled={busy}
                      className="btn btn-danger text-[11px]"
                    >
                      Remove login
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const fd = new FormData(form);
                      const email = String(fd.get("email") ?? "").trim();
                      const password = String(fd.get("password") ?? "");
                      if (!email || !password) return;
                      void run(async () => {
                        const r = await createCounterAccount({ counterId: c.id, email, password });
                        if (!r.ok) throw new Error(r.error);
                        setLocalEmails((m) => ({ ...m, [c.id]: email }));
                        form.reset();
                      }, "Station login created");
                    }}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <input name="email" type="email" placeholder="counter1@station.local" className="field flex-1 text-xs" />
                    <input name="password" type="text" placeholder="password (8+ chars)" className="field text-xs" />
                    <button type="submit" disabled={busy} className="btn btn-ghost text-xs">Create login</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
