"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getDisplaySnapshot, type DisplaySnapshot } from "@/lib/display/board";

const servingMap = (snap: DisplaySnapshot) =>
  new Map(snap.counters.map((c) => [c.number, c.serving]));

/** "DOC-0005" -> "D O C 0 0 0 5" for clearer text-to-speech. */
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
    <main className="min-h-screen px-8 py-7 text-paper" style={{ background: "var(--ink)" }}>
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="display text-5xl">
          Now Serving<span className="text-acid">.</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="eyebrow" style={{ color: "rgba(244,243,238,0.6)" }}>
            QueUA Registrar
          </span>
          {!soundOn && (
            <button onClick={enableSound} className="btn btn-acid text-sm">
              🔊 Enable announcements
            </button>
          )}
        </div>
      </header>

      {/* Counter grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {snap.counters.length === 0 ? (
          <p style={{ color: "rgba(244,243,238,0.5)" }}>No open counters.</p>
        ) : (
          snap.counters.map((c) => (
            <div
              key={c.number}
              className="rounded-[3px] p-6"
              style={{
                border: c.serving ? "1px solid var(--acid)" : "1px solid rgba(244,243,238,0.14)",
                background: c.serving ? "rgba(214,255,63,0.06)" : "rgba(244,243,238,0.03)",
              }}
            >
              <p className="eyebrow" style={{ color: "rgba(244,243,238,0.55)" }}>
                Window {c.number}
              </p>
              <p className="mt-0.5 truncate text-lg" style={{ color: "rgba(244,243,238,0.8)" }}>
                {c.label}
              </p>
              <p className={`mono mt-5 text-6xl font-semibold ${c.serving ? "text-acid" : ""}`}
                 style={c.serving ? undefined : { color: "rgba(244,243,238,0.25)" }}>
                {c.serving ?? "—"}
              </p>
              {c.status !== "OPEN" && (
                <p className="eyebrow mt-2 text-amber-300">{c.status.replace("_", " ")}</p>
              )}
            </div>
          ))
        )}
      </section>

      {/* Next in line */}
      <section className="mt-10">
        <p className="eyebrow mb-3" style={{ color: "rgba(244,243,238,0.55)" }}>
          Next in line
        </p>
        {snap.nextInLine.length === 0 ? (
          <p style={{ color: "rgba(244,243,238,0.4)" }}>Queue is empty.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {snap.nextInLine.map((t) => (
              <span
                key={t}
                className="mono rounded-[3px] px-4 py-2 text-2xl font-semibold"
                style={{ background: "rgba(244,243,238,0.08)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Ticker */}
      {snap.announcements.length > 0 && (
        <footer
          className="fixed inset-x-0 bottom-0 overflow-hidden py-3"
          style={{ borderTop: "1px solid rgba(244,243,238,0.14)", background: "rgba(0,0,0,0.3)" }}
        >
          <div
            className="marquee-track whitespace-nowrap text-xl"
            style={{ animation: "marquee 32s linear infinite", color: "rgba(244,243,238,0.85)" }}
          >
            {snap.announcements.join("      —      ")}
          </div>
        </footer>
      )}
    </main>
  );
}
