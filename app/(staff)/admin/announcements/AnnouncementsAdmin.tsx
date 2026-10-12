"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  type Announcement,
} from "@/lib/admin/announcements";

export default function AnnouncementsAdmin({ initial }: { initial: Announcement[] }) {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const run = useCallback(
    async (action: () => Promise<unknown>, okText: string) => {
      setBusy(true);
      setNotice(null);
      try {
        await action();
        setItems(await listAnnouncements(supabase));
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
      <h1 className="mb-1 text-2xl font-bold">Announcements</h1>
      <p className="mb-4 text-sm text-gray-500">
        Messages shown in the lobby display ticker. Only active ones appear.
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const msg = newMessage.trim();
          if (!msg) return;
          const nextOrder = items.reduce((m, a) => Math.max(m, a.sortOrder), 0) + 1;
          void run(() => createAnnouncement(supabase, msg, nextOrder), "Announcement added").then(() =>
            setNewMessage(""),
          );
        }}
        className="mb-6 flex gap-2 rounded-lg border border-gray-200 p-4"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="New announcement message"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No announcements yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3">
              <input
                type="number"
                defaultValue={a.sortOrder}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (n !== a.sortOrder) void run(() => updateAnnouncement(supabase, a.id, { sortOrder: n }), "Order updated");
                }}
                className="w-14 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                title="Sort order"
              />
              <input
                defaultValue={a.message}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== a.message) void run(() => updateAnnouncement(supabase, a.id, { message: v }), "Message updated");
                }}
                className={`min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm ${
                  a.isActive ? "" : "text-gray-400 line-through"
                }`}
              />
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  defaultChecked={a.isActive}
                  onChange={(e) => void run(() => updateAnnouncement(supabase, a.id, { isActive: e.target.checked }), "Updated")}
                  disabled={busy}
                />
                Active
              </label>
              <button
                onClick={() => {
                  if (confirm("Delete this announcement?")) {
                    void run(() => deleteAnnouncement(supabase, a.id), "Deleted");
                  }
                }}
                disabled={busy}
                className="rounded-md border border-red-300 px-2 py-1.5 text-sm text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
