"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getDisplaySnapshot, type DisplaySnapshot } from "@/lib/display/board";

const servingMap = (snap: DisplaySnapshot) =>
  new Map(snap.counters.map((c) => [c.number, c.serving]));

/** "DOC-0005" -> "D O C 0 0 0 5" for clearer text-to-speech. */
const spell = (ticket: string) =>
  [...ticket].filter((ch) => ch !== "-").join(" ");

export default function Display({ initial }: { initial: DisplaySnapshot }) {
  const [supabase] = useState(() => createClient());
  const [snap, setSnap] = useState(initial);
  const [soundOn, setSoundOn] = useState(false);

  const prevServing = useRef(servingMap(initial));
  const soundOnRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  function playChime() {
    const ctx = audioRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t = now + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.start(t);
      o.stop(t + 0.18);
    });
  }

  function announce(ticket: string, windowNumber: number) {
    playChime();
    try {
      const u = new SpeechSynthesisUtterance(
        `Now serving, ${spell(ticket)}, at window ${windowNumber}.`,
      );
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      // Let the chime lead slightly before the voice.
      setTimeout(() => window.speechSynthesis.speak(u), 450);
    } catch {
      /* speech not supported */
    }
  }

  function enableSound() {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioRef.current = new Ctx();
      void audioRef.current.resume();
    } catch {
      /* no audio */
    }
    soundOnRef.current = true;
    setSoundOn(true);
    playChime();
  }

  // Poll every 3s; announce counters whose serving ticket just changed.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const next = await getDisplaySnapshot(supabase);
        if (soundOnRef.current) {
          for (const c of next.counters) {
            const prev = prevServing.current.get(c.number);
            if (c.serving && c.serving !== prev) announce(c.serving, c.number);
          }
        }
        prevServing.current = servingMap(next);
        setSnap(next);
      } catch {
        /* keep last snapshot */
      }
    }, 3000);
    return () => clearInterval(id);
    // announce/playChime are stable within a render and intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-6 text-white">
      <style>{`@keyframes queua-marquee{from{transform:translateX(100%)}to{transform:translateX(-100%)}}`}</style>

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide">
          QueUA <span className="text-slate-400">· Now Serving</span>
        </h1>
        {!soundOn && (
          <button
            onClick={enableSound}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black"
          >
            🔊 Enable announcements
          </button>
        )}
      </header>

      {/* Counter grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {snap.counters.length === 0 ? (
          <p className="text-slate-400">No open counters.</p>
        ) : (
          snap.counters.map((c) => (
            <div
              key={c.number}
              className={`rounded-2xl border p-6 ${
                c.serving ? "border-blue-500 bg-blue-950/40" : "border-slate-700 bg-slate-900"
              }`}
            >
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Window {c.number}
              </p>
              <p className="mt-0.5 truncate text-lg font-medium text-slate-200">
                {c.label}
              </p>
              <p className="mt-4 text-5xl font-extrabold tabular-nums">
                {c.serving ?? <span className="text-slate-600">—</span>}
              </p>
              {c.status !== "OPEN" && (
                <p className="mt-2 text-xs font-semibold uppercase text-amber-400">
                  {c.status.replace("_", " ")}
                </p>
              )}
            </div>
          ))
        )}
      </section>

      {/* Next in line */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Next in line
        </h2>
        {snap.nextInLine.length === 0 ? (
          <p className="text-slate-500">Queue is empty.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {snap.nextInLine.map((t) => (
              <span
                key={t}
                className="rounded-lg bg-slate-800 px-4 py-2 text-2xl font-bold tabular-nums"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Announcement ticker */}
      {snap.announcements.length > 0 && (
        <footer className="fixed inset-x-0 bottom-0 overflow-hidden border-t border-slate-800 bg-slate-900 py-3">
          <div
            className="whitespace-nowrap text-xl text-slate-200"
            style={{ animation: "queua-marquee 30s linear infinite" }}
          >
            {snap.announcements.join("     •     ")}
          </div>
        </footer>
      )}
    </main>
  );
}
