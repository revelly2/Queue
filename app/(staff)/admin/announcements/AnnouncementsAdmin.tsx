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
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Announcements</h1>
        <p className="mt-0.5 text-xs text-muted">Messages shown in the lobby display ticker.</p>
      </div>

      {notice && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-xs ${notice.ok ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
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
        className="mb-4 flex gap-2"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="New announcement message"
          className="field flex-1"
        />
        <button type="submit" disabled={busy} className="btn btn-accent">Add</button>
      </form>

      {items.length === 0 ? (
        <p className="text-xs text-muted py-8 text-center">No announcements yet.</p>
      ) : (
        <div className="card p-0">
          {items.map((a, i) => (
            <div key={a.id} className={`flex flex-wrap items-center gap-2 px-3.5 py-2.5 ${i < items.length - 1 ? "border-b border-line-dim" : ""}`}>
              <input
                type="number"
                defaultValue={a.sortOrder}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (n !== a.sortOrder) void run(() => updateAnnouncement(supabase, a.id, { sortOrder: n }), "Order updated");
                }}
                className="field w-12 py-1 text-center text-xs"
                title="Sort order"
              />
              <input
                defaultValue={a.message}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== a.message) void run(() => updateAnnouncement(supabase, a.id, { message: v }), "Message updated");
                }}
                className={`field min-w-0 flex-1 text-xs ${a.isActive ? "" : "text-muted line-through"}`}
              />
              <label className="flex items-center gap-1 text-[11px] text-muted">
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
                className="btn btn-danger text-[11px]"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
