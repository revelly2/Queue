"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getTrackSnapshot, type TrackSnapshot } from "@/lib/track/queue";
import { UniversitySeal } from "@/components/illustrations/UniversitySeal";
import { StudentTrackerIllustration } from "@/components/illustrations/StudentTrackerIllustration";
import {
  BellIcon,
  ClockIcon,
  DocumentIcon,
  AlertCircleIcon,
} from "@/components/icons/Icons";

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
    }, 4000);
    return () => clearInterval(id);
  }, [supabase, ticketNumber]);

  const me = snap.me;

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-ink flex flex-col justify-between border-t-4 border-[#991B1B]">
      {/* Top Academic Ribbon */}
      <header className="border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <UniversitySeal size={32} />
            <div>
              <p className="font-extrabold text-xs text-royal-dark">QueUA Mobile</p>
              <p className="text-[10px] text-muted">University of Abra</p>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-[#991B1B] border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
            Live Sync
          </span>
        </div>
      </header>

      {/* Main Tracking Card */}
      <main className="max-w-md w-full mx-auto px-4 py-6 flex-1 space-y-5">
        {/* Ticket Header Banner */}
        <div className="card p-6 text-center bg-surface border border-line shadow-sm space-y-3">
          <p className="section-label text-crimson">Official Queue Slip</p>
          <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200 inline-block mx-auto">
            <p className="text-4xl sm:text-5xl font-black text-[#991B1B] font-mono tracking-tight">
              {ticketNumber}
            </p>
          </div>
          <p className="text-xs text-muted">
            University of Abra · Office of the Registrar
          </p>
        </div>

        {/* State Banner & Vector Student Companion */}
        {!snap.found ? (
          <div className="card p-6 text-center text-xs text-muted space-y-2.5">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <DocumentIcon size={20} />
            </div>
            <p className="font-bold text-ink">Ticket Not in Active Queue</p>
            <p>
              This ticket may have already been completed, transferred, or marked as no-show. Please inquire at Window 1 if you have questions.
            </p>
          </div>
        ) : me?.queueStatus === "SERVING" ? (
          <div className="card p-6 text-center bg-emerald-50 border-2 border-emerald-600 shadow-lg space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-emerald-900 animate-pulse">
              <BellIcon size={26} />
            </div>
            <h2 className="text-xl font-black text-emerald-800">
              IT&apos;S YOUR TURN NOW!
            </h2>
            <p className="text-sm font-bold text-emerald-900">
              Please proceed immediately to{" "}
              <span className="underline decoration-2 text-crimson font-black">
                {me.counterId ? `Window ${me.counterId}` : "the designated Window"}
              </span>.
            </p>
            <p className="text-[11px] text-emerald-700">
              Have your student ID and requirements ready on hand.
            </p>
          </div>
        ) : me?.queueStatus === "ON_HOLD" ? (
          <div className="card p-6 text-center bg-crimson-light border border-crimson/30 shadow-sm space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-crimson">
              <ClockIcon size={20} />
            </div>
            <h2 className="text-base font-bold text-crimson">Ticket Currently On Hold</h2>
            <p className="text-xs text-muted">
              Your transaction is paused (e.g. pending cashier payment or document verification). Please check with staff.
            </p>
          </div>
        ) : (
          <div className="card p-6 text-center bg-surface border border-line shadow-sm space-y-4">
            <div className="flex justify-center -my-2">
              <StudentTrackerIllustration size={140} />
            </div>

            <div>
              <p className="text-5xl font-black text-crimson font-mono tabular-nums">
                {snap.ahead}
              </p>
              <p className="mt-1 text-xs font-bold text-royal uppercase tracking-wider">
                {snap.ahead === 1 ? "student ahead of you" : "students ahead of you"}
              </p>
            </div>

            {snap.ahead <= 2 ? (
              <div className="p-2.5 rounded-lg bg-crimson-light border border-crimson/30 text-xs font-bold text-crimson flex items-center justify-center gap-1.5">
                <AlertCircleIcon size={14} />
                <span>You&apos;re next in line! Please stand near the registrar lobby.</span>
              </div>
            ) : (
              <p className="text-xs text-muted leading-relaxed">
                Feel free to relax anywhere on campus. This page refreshes automatically when windows advance.
              </p>
            )}
          </div>
        )}

        {/* Live Serving Windows on Campus */}
        <section className="card p-4 bg-surface border border-line space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-label text-royal">Currently Being Served</p>
            <span className="text-[10px] text-muted">Live Counters</span>
          </div>

          {snap.serving.length === 0 ? (
            <p className="text-xs text-muted py-2 text-center">No counters currently serving tickets.</p>
          ) : (
            <div className="divide-y divide-line-dim">
              {snap.serving.map((t) => (
                <div key={t.ticketNumber} className="flex items-center justify-between py-2 text-xs">
                  <span className="font-mono font-bold text-royal-dark">{t.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-royal-light text-royal-dark font-semibold text-[11px]">
                    {t.counterId ? `Window ${t.counterId}` : "In Session"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-royal hover:underline">
            ← Back to Campus Portal
          </Link>
        </div>
      </main>

      <footer className="border-t border-line bg-[#F4F1EA] py-3 text-center text-[10px] text-muted">
        QueUA Real-time Queue Tracking · University of Abra
      </footer>
    </div>
  );
}
