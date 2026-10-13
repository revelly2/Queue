"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getTrackSnapshot, type TrackSnapshot } from "@/lib/track/queue";

export default function Tracker({
  ticketNumber,
  initial,
}: {
  ticketNumber: string;
  initial: TrackSnapshot;
}) {
  const [supabase] = useState(() => createClient());
  const [snap, setSnap] = useState(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        setSnap(await getTrackSnapshot(supabase, ticketNumber));
      } catch {
        /* keep last snapshot on transient errors */
      }
    }, 5000);
    return () => clearInterval(id);
  }, [supabase, ticketNumber]);

  const me = snap.me;

  return (
    <main className="mx-auto min-h-screen max-w-sm px-4 py-10">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="grid h-6 w-6 place-items-center rounded-[5px] bg-accent text-[9px] font-extrabold text-white">Q</span>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Queue Tracker</span>
        </div>
        <p className="data-value text-4xl">{ticketNumber}</p>
      </div>

      {!snap.found ? (
        <div className="card py-6 text-center text-xs text-muted">
          This ticket is not currently in the queue. It may have been completed, transferred, or marked no-show.
        </div>
      ) : me?.queueStatus === "SERVING" ? (
        <div className="rounded-xl bg-green-light px-4 py-6 text-center">
          <p className="text-base font-semibold text-green">
            It&apos;s your turn — please proceed
            {me.counterId ? ` to Window ${me.counterId}` : ""}.
          </p>
        </div>
      ) : me?.queueStatus === "ON_HOLD" ? (
        <div className="rounded-xl bg-amber-light px-4 py-6 text-center">
          <p className="text-sm font-semibold text-amber">
            Your ticket is on hold. Please wait or check with staff.
          </p>
        </div>
      ) : (
        <div className="card py-6 text-center">
          <p className="data-value text-5xl text-accent">{snap.ahead}</p>
          <p className="mt-1 text-xs text-accent font-medium">ahead of you in line</p>
          {snap.ahead <= 3 && (
            <p className="mt-3 text-xs font-semibold text-accent">
              You&apos;re almost up — stay close!
            </p>
          )}
        </div>
      )}

      <section className="mt-6">
        <div className="section-label mb-2">Now serving</div>
        {snap.serving.length === 0 ? (
          <p className="text-xs text-muted">No tickets being served.</p>
        ) : (
          <div className="card p-0">
            {snap.serving.map((t, i) => (
              <div key={t.ticketNumber} className={`flex justify-between px-3.5 py-2 text-xs ${i < snap.serving.length - 1 ? "border-b border-line-dim" : ""}`}>
                <span className="font-semibold">{t.ticketNumber}</span>
                <span className="text-muted">{t.counterId ? `Window ${t.counterId}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-5 text-center text-[10px] text-faint">Updates automatically</p>
    </main>
  );
}
