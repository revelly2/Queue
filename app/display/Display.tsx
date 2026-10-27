"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type DisplaySnapshot } from "@/lib/display/board";
import { UniversitySeal } from "@/components/illustrations/UniversitySeal";
import { StudentLobbyIllustration } from "@/components/illustrations/StudentLobbyIllustration";
import {
  SpeakerIcon,
  MonitorIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons/Icons";

const servingMap = (snap: DisplaySnapshot) =>
  new Map(snap.counters.map((c) => [c.number, c.serving]));

const spell = (ticket: string) => [...ticket].filter((ch) => ch !== "-").join(" ");

const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

export default function Display({ initial }: { initial: DisplaySnapshot }) {
  const [snap, setSnap] = useState(initial);
  const [soundOn, setSoundOn] = useState(false);
  const [time, setTime] = useState<string>("");

  const prevServing = useRef(servingMap(initial));
  const prevCashierServing = useRef<string | null>(initial.cashier?.nowServing ?? null);
  const soundOnRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Manila",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  function announceCashier(ticket: string) {
    playChime();
    try {
      const u = new SpeechSynthesisUtterance(
        `Ticket ${spell(ticket)}, please proceed to the cashier window for payment clearance.`,
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
        const res = await fetch("/api/display", { cache: "no-store" });
        if (!res.ok) return;
        const next: DisplaySnapshot = await res.json();

        if (soundOnRef.current) {
          // Check counter announcements
          for (const c of next.counters) {
            const prev = prevServing.current.get(c.number);
            if (c.serving && c.serving !== prev) {
              announce(c.serving, c.number);
            }
          }
          // Check cashier announcements
          if (
            next.cashier?.nowServing &&
            next.cashier.nowServing !== prevCashierServing.current
          ) {
            announceCashier(next.cashier.nowServing);
          }
        }

        prevServing.current = servingMap(next);
        prevCashierServing.current = next.cashier?.nowServing ?? null;
        setSnap(next);
      } catch {
        /* keep last snapshot */
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const cashier = snap.cashier ?? {
    status: "OPEN",
    label: "Fee Clearance & Assessment",
    nowServing: null,
    currentAssessed: null,
    currentMaskedName: null,
    pendingCount: 0,
    pendingTickets: [],
  };

  const isCashierBusy = Boolean(cashier.nowServing);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 px-4 sm:px-8 lg:px-10 py-6 flex flex-col justify-between">
      {/* ========================================================
          1. INSTITUTIONAL TOP COMMAND HEADER
         ======================================================== */}
      <div>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface p-5 sm:p-6 rounded-3xl shadow-xs">
          <div className="flex items-center gap-4">
            <UniversitySeal size={56} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#991B1B]">
                  University of Abra
                </span>
                <span className="h-3 w-px bg-line" />
                <span className="text-xs text-muted font-bold">Office of the Registrar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#002776] mt-0.5">
                NOW SERVING
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {time && (
              <div className="text-right hidden sm:block bg-slate-50 px-4 py-2 rounded-2xl border border-line">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold flex items-center gap-1 justify-end">
                  <ClockIcon size={12} className="text-[#0038A8]" />
                  Philippine Standard Time
                </p>
                <p className="text-xl sm:text-2xl font-black text-[#002776] font-mono tracking-tight">{time}</p>
              </div>
            )}

            {!soundOn ? (
              <button
                onClick={enableSound}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm flex items-center gap-2 transition hover:bg-[#7F1D1D] bg-[#991B1B]"
              >
                <SpeakerIcon size={16} />
                <span>Enable Chime & Announcements</span>
              </button>
            ) : (
              <span className="rounded-xl px-3.5 py-2 text-xs font-bold bg-emerald-50 text-[#008837] border border-emerald-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Voice Chime Active
              </span>
            )}

            <Link
              href="/admin"
              className="text-xs font-bold text-slate-500 hover:text-[#002776] transition px-3 py-2 rounded-xl border border-line hover:bg-slate-50"
            >
              Admin Hub
            </Link>
          </div>
        </header>

        {/* ========================================================
            2. SERVICE STATIONS & CASHIER GRID
           ======================================================== */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* CASHIER WINDOW CARD (FEATURED STATION) */}
          <div
            className={`rounded-3xl p-6 transition-all duration-200 relative overflow-hidden bg-surface border shadow-xs ${
              isCashierBusy
                ? "border-amber-400 shadow-md ring-2 ring-amber-400/25 bg-linear-to-b from-amber-50/20 to-white"
                : "border-line hover:border-slate-300"
            }`}
          >
            {isCashierBusy && (
              <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                <span>PAY AT CASHIER</span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-amber-700">
                  <CreditCardIcon size={14} className="text-amber-600" />
                  <span>Cashier Window</span>
                </span>
                <h3 className="mt-0.5 truncate text-sm font-bold text-[#002776]">
                  Fee Clearance & Assessment
                </h3>
              </div>
            </div>

            {/* High Visibility Cashier Ticket Display */}
            <div className="mt-4 mb-2 py-4 px-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col items-center justify-center min-h-[110px]">
              <p
                className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tight font-mono ${
                  isCashierBusy ? "text-amber-800" : "text-slate-300"
                }`}
              >
                {cashier.nowServing ?? "—"}
              </p>
              {isCashierBusy && cashier.currentAssessed !== null && (
                <p className="mt-1 text-xs font-bold text-amber-900 tabular-nums">
                  {peso(cashier.currentAssessed)}
                  {cashier.currentMaskedName ? ` · ${cashier.currentMaskedName}` : ""}
                </p>
              )}
            </div>

            {/* Cashier Bottom Status Bar */}
            <div className="mt-3 pt-3 border-t border-line-dim flex items-center justify-between text-xs">
              <span
                className={`font-semibold flex items-center gap-1.5 ${
                  isCashierBusy ? "text-amber-800" : "text-muted"
                }`}
              >
                {isCashierBusy ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Proceed to Cashier window</span>
                  </>
                ) : (
                  <span>Cashier ready · No pending fees</span>
                )}
              </span>

              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 font-bold border border-amber-200">
                {cashier.pendingCount} to pay
              </span>
            </div>
          </div>

          {/* REGISTRAR SERVICE WINDOWS */}
          {snap.counters.length === 0 ? (
            <div className="col-span-full py-20 text-center rounded-3xl bg-surface border border-line">
              <div className="flex justify-center mb-3">
                <StudentLobbyIllustration size={160} />
              </div>
              <p className="text-lg font-bold text-[#002776]">All registrar counter windows are currently closed.</p>
              <p className="text-xs text-muted mt-1">Please stand by as registrar officers prepare service stations.</p>
            </div>
          ) : (
            snap.counters.map((c) => {
              const isServing = Boolean(c.serving);
              return (
                <div
                  key={c.number}
                  className={`rounded-3xl p-6 transition-all duration-200 relative overflow-hidden bg-surface border shadow-xs ${
                    isServing
                      ? "border-[#991B1B] shadow-md ring-2 ring-red-500/20"
                      : "border-line hover:border-slate-300"
                  }`}
                >
                  {isServing && (
                    <div className="absolute top-0 right-0 bg-[#991B1B] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-bl-2xl shadow-xs">
                      NOW SERVING
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#991B1B]">
                        Window {c.number}
                      </span>
                      <h3 className="mt-0.5 truncate text-sm font-bold text-[#002776]">
                        {c.label}
                      </h3>
                    </div>
                  </div>

                  {/* High Visibility Ticket Display */}
                  <div className="mt-4 mb-2 py-4 px-5 rounded-2xl bg-slate-50/80 border border-line flex items-center justify-center min-h-[110px]">
                    <p
                      className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tight font-mono ${
                        isServing ? "text-[#991B1B]" : "text-slate-300"
                      }`}
                    >
                      {c.serving ?? "—"}
                    </p>
                  </div>

                  {/* Window Bottom Status Bar */}
                  <div className="mt-3 pt-3 border-t border-line-dim flex items-center justify-between text-xs">
                    <span className={`font-semibold flex items-center gap-1.5 ${isServing ? "text-[#008837]" : "text-muted"}`}>
                      {isServing ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Please proceed to window</span>
                        </>
                      ) : (
                        <span>Waiting for ticket call</span>
                      )}
                    </span>

                    {c.status !== "OPEN" && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        {c.status.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* ========================================================
            3. DUAL QUEUE STATUS: CASHIER PAYMENT & REGISTRAR SERVICE
           ======================================================== */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* A. CASHIER PAYMENT QUEUE */}
          <section className="rounded-3xl bg-surface border border-amber-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <CreditCardIcon size={18} />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-800">
                    Cashier Payment Queue · Pay Assessed Fees
                  </h3>
                  <p className="text-xs text-muted">Proceed to Cashier window before registrar counter dispatch</p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full shrink-0">
                {cashier.pendingCount} tickets to pay
              </span>
            </div>

            {cashier.pendingTickets.length === 0 ? (
              <div className="rounded-2xl p-6 bg-amber-50/40 border border-amber-100 text-xs text-amber-800 text-center flex items-center justify-center gap-2">
                <CheckCircleIcon size={16} className="text-[#008837]" />
                <span>All assessed fees cleared. No tickets currently awaiting cashier payment.</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {cashier.pendingTickets.map((t, idx) => (
                  <div
                    key={t.ticketNumber}
                    className={`font-mono rounded-2xl px-4 py-2.5 border-2 text-[#002776] shadow-xs flex items-center gap-2.5 transition ${
                      idx === 0
                        ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300/40"
                        : "bg-white border-amber-200 hover:border-amber-400"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? "bg-amber-600 animate-pulse" : "bg-amber-300"}`} />
                    <div>
                      <span className="text-xl font-black">{t.ticketNumber}</span>
                      <span className="ml-2 text-xs font-bold text-amber-800 tabular-nums">
                        {peso(t.totalAssessed)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* B. REGISTRAR SERVICE WINDOWS QUEUE (NEXT IN LINE) */}
          <section className="rounded-3xl bg-surface border border-line p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-50 text-[#991B1B]">
                  <UsersIcon size={18} />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#991B1B]">
                    Next in Line · Service Windows
                  </h3>
                  <p className="text-xs text-muted">Paid & non-fee tickets ready for Counter 1–3</p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                {snap.nextInLine.length} students queued
              </span>
            </div>

            {snap.nextInLine.length === 0 ? (
              <div className="rounded-2xl p-6 bg-slate-50 border border-line text-xs text-muted text-center flex items-center justify-center gap-2">
                <CheckCircleIcon size={16} className="text-[#008837]" />
                <span>Queue waiting pool is currently empty. All students have been served.</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {snap.nextInLine.map((t) => (
                  <div
                    key={t}
                    className="font-mono rounded-2xl px-5 py-3 text-2xl font-black bg-white border-2 border-red-100 text-[#002776] hover:border-[#991B1B] transition shadow-xs flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#991B1B]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ========================================================
          4. MARQUEE TICKER (COLLEGIATE CRIMSON & CLEAN)
         ======================================================== */}
      {snap.announcements.length > 0 && (
        <footer className="mt-8 overflow-hidden py-3.5 px-4 rounded-2xl border border-red-200 bg-red-50 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#991B1B] text-white px-2.5 py-1 rounded-lg shrink-0">
              Campus Advisory
            </span>
            <div
              className="marquee-track whitespace-nowrap text-xs font-bold text-[#991B1B]"
              style={{ animation: "marquee 32s linear infinite" }}
            >
              {snap.announcements.join("       ◆       ")}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}
