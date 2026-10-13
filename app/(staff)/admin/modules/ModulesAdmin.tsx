"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { ServiceCategory } from "@/lib/db/enums";
import {
  createModule,
  deleteModule,
  listModules,
  setModuleServices,
  updateModule,
  type AdminModule,
  type AdminService,
} from "@/lib/admin/config";

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  CREDENTIAL_DOCUMENT: "Credentials",
  ENROLLMENT_CHANGE: "Enrollment",
  ADMINISTRATIVE_FORM: "Administrative",
};

export default function ModulesAdmin({
  initialModules,
  services,
}: {
  initialModules: AdminModule[];
  services: AdminService[];
}) {
  const [supabase] = useState(() => createClient());
  const [modules, setModules] = useState(initialModules);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({ code: "", name: "", description: "" });

  const run = useCallback(
    async (action: () => Promise<unknown>, okText: string) => {
      setBusy(true);
      setNotice(null);
      try {
        await action();
        setModules(await listModules(supabase));
        setNotice({ ok: true, text: okText });
      } catch (e) {
        setNotice({ ok: false, text: (e as Error).message });
      } finally {
        setBusy(false);
      }
    },
    [supabase],
  );

  const categories = [...new Set(services.map((s) => s.category))] as ServiceCategory[];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Modules</h1>
        <p className="mt-0.5 text-xs text-muted">Group services into modules. Assign modules to counters on the Counters page.</p>
      </div>

      {notice && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-xs ${notice.ok ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
          {notice.text}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const code = form.code.trim().toUpperCase();
          if (!code || !form.name.trim()) return;
          void run(
            () => createModule(supabase, code, form.name.trim(), form.description.trim()),
            "Module created",
          ).then(() => setForm({ code: "", name: "", description: "" }));
        }}
        className="mb-4 flex flex-wrap items-end gap-2 card p-3.5"
      >
        <label className="flex flex-col gap-1">
          <span className="section-label">Code</span>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="APPLICATIONS" className="field w-36 text-xs" />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="section-label">Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field text-xs" />
        </label>
        <button type="submit" disabled={busy} className="btn btn-accent">Add module</button>
      </form>

      <div className="flex flex-col gap-2.5">
        {modules.map((m) => {
          const assigned = new Set(m.serviceIds);
          return (
            <div key={m.id} className="card p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill bg-bg text-muted text-[10px] font-mono">{m.code}</span>
                <input
                  defaultValue={m.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== m.name) void run(() => updateModule(supabase, m.id, { name: v }), "Module renamed");
                  }}
                  className="field min-w-0 flex-1 text-xs font-medium"
                />
                <label className="flex items-center gap-1 text-[11px] text-muted">
                  <input
                    type="checkbox"
                    defaultChecked={m.isActive}
                    onChange={(e) => void run(() => updateModule(supabase, m.id, { isActive: e.target.checked }), "Module updated")}
                    disabled={busy}
                  />
                  Active
                </label>
                <button
                  onClick={() => {
                    if (confirm(`Delete module "${m.name}"? It is removed from all counters.`)) {
                      void run(() => deleteModule(supabase, m.id), "Module deleted");
                    }
                  }}
                  disabled={busy}
                  className="btn btn-danger text-[11px]"
                >
                  Delete
                </button>
              </div>

              <details className="mt-3 border-t border-line-dim pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-accent">
                  Services ({m.serviceIds.length})
                </summary>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const ids = new FormData(e.currentTarget)
                      .getAll("svc")
                      .map((v) => Number(v));
                    void run(() => setModuleServices(supabase, m.id, ids), "Services updated");
                  }}
                  className="mt-2"
                >
                  {categories.map((cat) => (
                    <fieldset key={cat} className="mb-2">
                      <legend className="section-label">{CATEGORY_LABEL[cat]}</legend>
                      <div className="mt-1 flex flex-col gap-1">
                        {services
                          .filter((s) => s.category === cat)
                          .map((s) => (
                            <label key={s.id} className="flex items-center gap-2 text-xs">
                              <input type="checkbox" name="svc" value={s.id} defaultChecked={assigned.has(s.id)} />
                              {s.name}
                            </label>
                          ))}
                      </div>
                    </fieldset>
                  ))}
                  <button type="submit" disabled={busy} className="btn btn-primary mt-1 text-[11px]">
                    Save services
                  </button>
                </form>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
