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
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Modules</h1>
      <p className="mb-4 text-sm text-muted">
        Group services into modules. Assign modules to counters on the Counters
        page.
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

      {/* Create module */}
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
        className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-line p-4"
      >
        <label className="flex flex-col gap-1 text-xs font-medium">
          Code
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="APPLICATIONS"
            className="w-36 rounded-md border border-line px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium">
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-line px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add module
        </button>
      </form>

      <ul className="flex flex-col gap-4">
        {modules.map((m) => {
          const assigned = new Set(m.serviceIds);
          return (
            <li key={m.id} className="rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-paper-dim px-2 py-0.5 font-mono text-xs text-muted">
                  {m.code}
                </span>
                <input
                  defaultValue={m.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== m.name) void run(() => updateModule(supabase, m.id, { name: v }), "Module renamed");
                  }}
                  className="min-w-0 flex-1 rounded-md border border-line px-2 py-1.5 text-sm font-medium"
                />
                <label className="flex items-center gap-1 text-xs text-muted">
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
                  className="rounded-md border border-red-300 px-2 py-1.5 text-sm text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <details className="mt-3 border-t border-line pt-3">
                <summary className="cursor-pointer text-sm font-medium text-blue">
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
                      <legend className="text-xs font-semibold uppercase text-muted">
                        {CATEGORY_LABEL[cat]}
                      </legend>
                      <div className="mt-1 flex flex-col gap-1">
                        {services
                          .filter((s) => s.category === cat)
                          .map((s) => (
                            <label key={s.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                name="svc"
                                value={s.id}
                                defaultChecked={assigned.has(s.id)}
                              />
                              {s.name}
                            </label>
                          ))}
                      </div>
                    </fieldset>
                  ))}
                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Save services
                  </button>
                </form>
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
