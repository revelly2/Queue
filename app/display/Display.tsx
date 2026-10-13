"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getDisplaySnapshot, type DisplaySnapshot } from "@/lib/display/board";

const servingMap = (snap: DisplaySnapshot) =>
  new Map(snap.counters.map((c) => [c.number, c.serving]));

const spell = (ticket: string) => [...ticket].filter((ch) => ch !== "-").join(" ");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <main className="min-h-screen px-8 py-7" style={{ background: "#1c1917", color: "#f6f4f1" }}>
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[7px] text-sm font-extrabold" style={{ background: "#c2410c", color: "#fff" }}>Q</span>
          <h1 className="text-3xl font-bold" style={{ letterSpacing: "-0.04em" }}>
            Now Serving
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: "rgba(246,244,241,0.5)" }}>QueUA Registrar</span>
          {!soundOn && (
            <button onClick={enableSound} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "#c2410c", color: "#fff" }}>
              Enable announcements
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {snap.counters.length === 0 ? (
          <p style={{ color: "rgba(246,244,241,0.4)" }}>No open counters.</p>
        ) : (
          snap.counters.map((c) => (
            <div
              key={c.number}
              className="rounded-xl p-5"
              style={{
                border: c.serving ? "1px solid rgba(194,65,12,0.7)" : "1px solid rgba(246,244,241,0.1)",
                background: c.serving ? "rgba(194,65,12,0.08)" : "rgba(246,244,241,0.03)",
              }}
            >
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(246,244,241,0.5)" }}>
                Window {c.number}
              </p>
              <p className="mt-0.5 truncate text-sm" style={{ color: "rgba(246,244,241,0.7)" }}>
                {c.label}
              </p>
              <p
                className="mt-4 text-5xl font-extrabold tabular-nums"
                style={{
                  letterSpacing: "-0.05em",
                  color: c.serving ? "#c2410c" : "rgba(246,244,241,0.2)",
                }}
              >
                {c.serving ?? "—"}
              </p>
              {c.status !== "OPEN" && (
                <p className="mt-2 text-[10px] uppercase tracking-widest" style={{ color: "#f59e0b" }}>
                  {c.status.replace("_", " ")}
                </p>
              )}
            </div>
          ))
        )}
      </section>

      <section className="mt-10">
        <p className="mb-3 text-[10px] uppercase tracking-widest" style={{ color: "rgba(246,244,241,0.5)" }}>
          Next in line
        </p>
        {snap.nextInLine.length === 0 ? (
          <p style={{ color: "rgba(246,244,241,0.35)" }}>Queue is empty.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {snap.nextInLine.map((t) => (
              <span
                key={t}
                className="mono rounded-lg px-4 py-2 text-xl font-semibold"
                style={{ background: "rgba(246,244,241,0.06)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      {snap.announcements.length > 0 && (
        <footer
          className="fixed inset-x-0 bottom-0 overflow-hidden py-3"
          style={{ borderTop: "1px solid rgba(246,244,241,0.1)", background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="marquee-track whitespace-nowrap text-lg"
            style={{ animation: "marquee 32s linear infinite", color: "rgba(246,244,241,0.8)" }}
          >
            {snap.announcements.join("      —      ")}
          </div>
        </footer>
      )}
    </main>
  );
}
