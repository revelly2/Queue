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
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Users &amp; Roles</h1>
      <p className="mb-4 text-sm text-gray-500">
        Assign roles to staff. New accounts are created in the Supabase
        dashboard (Authentication → Users); they appear here once created.
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

      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{u.email ?? u.id}</p>
              <p className="text-xs text-gray-500">{u.fullName ?? "—"}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => void run(() => setUserRole(supabase, u.id, e.target.value as AppRole), "Role updated")}
              disabled={busy}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              {APP_ROLE.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </main>
  );
}
