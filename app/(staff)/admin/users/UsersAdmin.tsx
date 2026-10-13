"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { APP_ROLE, type AppRole } from "@/lib/db/enums";
import { listUsers, setUserRole, type StaffUser } from "@/lib/admin/users";

export default function UsersAdmin({ initialUsers }: { initialUsers: StaffUser[] }) {
  const [supabase] = useState(() => createClient());
  const [users, setUsers] = useState(initialUsers);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const run = useCallback(
    async (action: () => Promise<unknown>, okText: string) => {
      setBusy(true);
      setNotice(null);
      try {
        await action();
        setUsers(await listUsers(supabase));
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
        <h1 className="text-xl font-bold">Users & Roles</h1>
        <p className="mt-0.5 text-xs text-muted">
          Assign roles to staff accounts. New accounts are created in the Supabase dashboard.
        </p>
      </div>

      {notice && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-xs ${notice.ok ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
          {notice.text}
        </p>
      )}

      <div className="card p-0">
        {users.map((u, i) => (
          <div
            key={u.id}
            className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 ${i < users.length - 1 ? "border-b border-line-dim" : ""}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{u.email ?? u.id}</p>
              <p className="text-[11px] text-muted">{u.fullName ?? "—"}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => void run(() => setUserRole(supabase, u.id, e.target.value as AppRole), "Role updated")}
              disabled={busy}
              className="field text-xs py-1.5"
            >
              {APP_ROLE.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
