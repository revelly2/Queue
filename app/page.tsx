"use client";

import Link from "next/link";
import { UniversitySeal } from "@/components/illustrations/UniversitySeal";
import { StudentHeroIllustration } from "@/components/illustrations/StudentHeroIllustration";
import { StudentBookingIllustration } from "@/components/illustrations/StudentBookingIllustration";
import { StudentLobbyIllustration } from "@/components/illustrations/StudentLobbyIllustration";
import { StudentTrackerIllustration } from "@/components/illustrations/StudentTrackerIllustration";
import { StaffDeskIllustration } from "@/components/illustrations/StaffDeskIllustration";
import {
  PhoneIcon,
  TicketIcon,
  MonitorIcon,
  SearchIcon,
  ArrowRightIcon,
} from "@/components/icons/Icons";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-ink border-t-4 border-[#991B1B] selection:bg-red-100 selection:text-[#991B1B]">
      {/* Top Academic Ribbon with Official University Logo */}
      <header className="border-b border-line bg-surface/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UniversitySeal size={50} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-[#0038A8] font-sans">
                  QueUA
                </span>
                <span className="hidden sm:inline-block h-3.5 w-px bg-line" />
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-white bg-[#991B1B] px-2 py-0.5 rounded shadow-sm">
                  Lagangilang Main Campus
                </span>
              </div>
              <p className="text-[11px] text-muted font-medium mt-0.5">
                University of Abra · Office of the University Registrar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[#991B1B] bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008837] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008837]"></span>
              </span>
              <span>Web-Hosted · Book from Any Phone</span>
            </div>

            <Link
              href="/login"
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg border border-line text-ink-soft hover:bg-slate-50 transition"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Hero Section with Vectorized Students on Mobile */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#991B1B] text-xs font-bold">
              <PhoneIcon size={14} className="text-[#991B1B]" />
              <span>Online Mobile Queue Booking — No Physical Kiosks</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#002776] leading-[1.15]">
              Book Your Queue Slip Directly on Your <span className="text-[#991B1B]">Phone</span>.
            </h1>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-xl">
              100% web-hosted for the <strong>University of Abra (Lagangilang Main Campus)</strong>. No standing in line at physical
              kiosks or dealing with thermal paper slips. Book your e-ticket from your dorm,
              classroom, or campus grounds, and get alerted when your window is ready.
            </p>

            {/* HIGH-VISIBILITY OFFICIAL COLOR BUTTONS */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/book"
                className="btn text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2.5 font-bold tracking-wide transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#991B1B",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 14px rgba(153, 27, 27, 0.35)",
                }}
              >
                <TicketIcon size={18} />
                <span>Book e-Ticket Now</span>
                <ArrowRightIcon size={15} />
              </Link>

              <Link
                href="/display"
                className="btn text-sm px-5 py-3.5 rounded-xl border flex items-center gap-2 font-bold transition hover:bg-slate-50"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#0038A8",
                  borderColor: "#CBD5E1",
                }}
              >
                <MonitorIcon size={17} className="text-[#0038A8]" />
                <span>View Lobby Display</span>
              </Link>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-line/80 max-w-lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Service Windows</p>
                <p className="text-xl font-extrabold text-[#991B1B] mt-0.5">Counter 1–6</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Serving Pace</p>
                <p className="text-xl font-extrabold text-[#008837] mt-0.5">~4.2 min</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Booking Hours</p>
                <p className="text-lg sm:text-xl font-extrabold text-[#0038A8] mt-0.5">7:30a–5:00p</p>
              </div>
            </div>
          </div>

          {/* Student Vector Illustration Showcase */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-lg lg:max-w-none">
              <StudentHeroIllustration />
            </div>
          </div>
        </section>

        {/* Portal Gateway Cards Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="section-label">Mobile Services & Stations</p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#002776]">
                Registrar Online Access Points
              </h2>
            </div>
            <p className="text-xs text-muted">
              Everything runs directly in your phone browser — zero app installation needed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Mobile Web Booking (Featured Action) */}
            <Link
              href="/book"
              className="card card-hover group flex flex-col justify-between p-5 relative overflow-hidden bg-surface border-2 border-red-200/80 hover:border-[#991B1B]"
            >
              <div className="space-y-3">
                <div className="h-32 w-full flex items-center justify-center bg-red-50/80 rounded-xl border border-red-100 p-2 group-hover:scale-[1.02] transition">
                  <StudentBookingIllustration size={130} />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-[#991B1B]">
                      Phone Booking
                    </span>
                    <span className="text-[10px] font-bold text-muted">7:30 AM – 5:00 PM</span>
                  </div>
                  <h3 className="text-base font-bold text-[#002776] group-hover:text-[#991B1B] transition">
                    Book Queue e-Ticket
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Book Transcript of Records (OTR), enrollment adjustments, or clearances right from your browser.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-[#991B1B]">
                <span>Book on Phone</span>
                <span className="group-hover:translate-x-1 transition text-[#991B1B]">→</span>
              </div>
            </Link>

            {/* Card 2: Mobile Live Tracker */}
            <div className="card card-hover group flex flex-col justify-between p-5 relative overflow-hidden bg-surface">
              <div className="space-y-3">
                <div className="h-32 w-full flex items-center justify-center bg-emerald-50/70 rounded-xl border border-emerald-100 p-2 group-hover:scale-[1.02] transition">
                  <StudentTrackerIllustration size={130} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#008837] mb-1">
                    Live Status
                  </span>
                  <h3 className="text-base font-bold text-[#002776]">
                    Track My Ticket
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Check your position in line, how many students are ahead, and get alerted when your window calls.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-line">
                <form
                  action={(formData) => {
                    const ticket = formData.get("ticket")?.toString().trim();
                    if (ticket) {
                      window.location.href = `/track/${encodeURIComponent(ticket)}`;
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    name="ticket"
                    placeholder="e.g. A-024"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-line uppercase font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="btn px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition hover:bg-red-800"
                    style={{ backgroundColor: "#991B1B", color: "#FFFFFF" }}
                  >
                    <SearchIcon size={13} />
                    <span>Track</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Card 3: Lobby Display */}
            <Link
              href="/display"
              className="card card-hover group flex flex-col justify-between p-5 relative overflow-hidden bg-surface"
            >
              <div className="space-y-3">
                <div className="h-32 w-full flex items-center justify-center bg-blue-50/70 rounded-xl border border-blue-100 p-2 group-hover:scale-[1.02] transition">
                  <StudentLobbyIllustration size={130} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-[#0038A8] mb-1">
                    Public Screen
                  </span>
                  <h3 className="text-base font-bold text-[#002776] group-hover:text-[#0038A8] transition">
                    Lobby TV Display
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    For registrar lobby monitors: real-time window call board with audible chime and voice alerts.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-[#0038A8]">
                <span>Open Screen</span>
                <span className="group-hover:translate-x-1 transition text-[#0038A8]">→</span>
              </div>
            </Link>

            {/* Card 4: Staff Portal */}
            <Link
              href="/login"
              className="card card-hover group flex flex-col justify-between p-5 relative overflow-hidden bg-surface"
            >
              <div className="space-y-3">
                <div className="h-32 w-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-2 group-hover:scale-[1.02] transition">
                  <StaffDeskIllustration size={130} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 mb-1">
                    Window Personnel
                  </span>
                  <h3 className="text-base font-bold text-[#002776] group-hover:text-[#0038A8] transition">
                    Staff Portal
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Secure window console for Registrar Officers to call tickets, clear cashier payments, and manage services.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-[#0038A8]">
                <span>Sign in</span>
                <span className="group-hover:translate-x-1 transition text-[#0038A8]">→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* 3-Step Phone Booking Walkthrough */}
        <section className="card p-6 sm:p-8 bg-surface rounded-2xl border border-line">
          <div className="mb-6 text-center sm:text-left">
            <span className="section-label">Mobile-First Convenience</span>
            <h2 className="text-lg sm:text-xl font-bold text-[#002776] mt-0.5">
              How Phone Queue Booking Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#991B1B] font-bold text-sm">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-[#991B1B] font-extrabold text-xs">
                  1
                </span>
                <span>Select & Book on Phone</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Open QueUA on your phone browser. Choose your document or transaction and provide your name. Your <strong>digital e-Ticket</strong> is generated instantly.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#008837] font-bold text-sm">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-[#008837] font-extrabold text-xs">
                  2
                </span>
                <span>Wait Anywhere on Campus</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Keep the tracker tab open or save your ticket link. Study at the library or hang out at the canteen while the queue progresses.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#991B1B] font-bold text-sm">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-[#991B1B] font-extrabold text-xs">
                  3
                </span>
                <span>Walk to Window When Called</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                When your ticket number is called on the board and your phone screen updates, simply proceed to your assigned service window!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Collegiate Academic Footer with Official Logo */}
      <footer className="border-t border-line bg-[#F1F5F9] py-8 text-xs text-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UniversitySeal size={38} />
            <div>
              <p className="font-extrabold text-[#002776]">University of Abra · Lagangilang Main Campus</p>
              <p className="text-[11px] text-muted">
                Office of the University Registrar · Lagangilang, Abra, Philippines
              </p>
            </div>
          </div>

          <p className="text-[11px] text-center sm:text-right text-muted">
            QueUA Mobile Queue System · Academic Year 2026–2027<br />
            100% Web-hosted · Official Institutional Registrar System
          </p>
        </div>
      </footer>
    </div>
  );
}
