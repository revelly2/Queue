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

  // Poll every 5s (anon can't subscribe to the RLS-protected tickets table).
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
      <h1 className="text-center text-sm font-medium uppercase tracking-wide text-muted">
        QueUA — Queue Tracker
      </h1>
      <p className="mt-2 text-center text-4xl font-extrabold">{ticketNumber}</p>

      {!snap.found ? (
        <p className="mt-8 rounded-lg bg-paper-dim px-4 py-6 text-center text-muted">
          This ticket is not currently in the queue. It may have been completed,
          transferred, or marked no-show.
        </p>
      ) : me?.queueStatus === "SERVING" ? (
        <p className="mt-8 rounded-lg bg-green-50 px-4 py-6 text-center text-lg font-semibold text-green-700">
          It&apos;s your turn — please proceed
          {me.counterId ? ` to Window ${me.counterId}` : ""}.
        </p>
      ) : me?.queueStatus === "ON_HOLD" ? (
        <p className="mt-8 rounded-lg bg-amber-50 px-4 py-6 text-center font-semibold text-amber-700">
          Your ticket is on hold. Please wait or check with staff.
        </p>
      ) : (
        <div className="mt-8 rounded-lg bg-paper-dim px-4 py-6 text-center">
          <p className="text-5xl font-extrabold text-blue">{snap.ahead}</p>
          <p className="mt-1 text-blue">ahead of you in line</p>
          {snap.ahead <= 3 && (
            <p className="mt-3 text-sm font-semibold text-blue">
              You&apos;re almost up — stay close!
            </p>
          )}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Now serving
        </h2>
        {snap.serving.length === 0 ? (
          <p className="text-sm text-muted">No tickets being served.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {snap.serving.map((t) => (
              <li key={t.ticketNumber} className="flex justify-between rounded-md border border-line px-3 py-2">
                <span className="font-semibold">{t.ticketNumber}</span>
                <span className="text-muted">
                  {t.counterId ? `Window ${t.counterId}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-muted">Updates automatically</p>
    </main>
  );
}
