"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { createClient } from "@/utils/supabase/client";
import { assess, type FeeServiceSpec } from "@/lib/fees/calculate";
import { createCheckin, type CheckinResult } from "@/lib/kiosk/checkin";
import { getBookingHoursStatus, BOOKING_SCHEDULE } from "@/lib/kiosk/operatingHours";
import type { ServiceCategory } from "@/lib/db/enums";
import { UniversitySeal } from "@/components/illustrations/UniversitySeal";
import { StudentBookingIllustration } from "@/components/illustrations/StudentBookingIllustration";
import {
  DocumentIcon,
  EditIcon,
  BuildingIcon,
  TicketIcon,
  PhoneIcon,
  CreditCardIcon,
  CheckCircleIcon,
  CopyIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@/components/icons/Icons";

export interface KioskService {
  id: number;
  code: string;
  name: string;
  category: ServiceCategory;
  baseFee: number;
  requiresDocstamp: boolean;
  docstampFee: number;
  isPerPage: boolean;
}

const CATEGORY_INFO: Record<
  ServiceCategory,
  { title: string; desc: string; iconType: "document" | "edit" | "building" }
> = {
  CREDENTIAL_DOCUMENT: {
    title: "Official Credentials & Records",
    desc: "Transcript of Records (OTR), Honorable Dismissal, Diplomas & Certifications",
    iconType: "document",
  },
  ENROLLMENT_CHANGE: {
    title: "Enrollment & Course Adjustments",
    desc: "Adding / Dropping of subjects, Cross-enrollment, Shift of Degree Program",
    iconType: "edit",
  },
  ADMINISTRATIVE_FORM: {
    title: "Clearances & Administrative Forms",
    desc: "Graduation clearance, Non-fee student verification, Good Moral requests",
    iconType: "building",
  },
};

function CategoryIcon({ type }: { type: "document" | "edit" | "building" }) {
  if (type === "document") return <DocumentIcon size={24} className="text-[#0038A8]" />;
  if (type === "edit") return <EditIcon size={24} className="text-[#008837]" />;
  return <BuildingIcon size={24} className="text-[#0038A8]" />;
}

const CATEGORY_ORDER: ServiceCategory[] = [
  "CREDENTIAL_DOCUMENT",
  "ENROLLMENT_CHANGE",
  "ADMINISTRATIVE_FORM",
];

const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

type Step = "category" | "services" | "details" | "ticket";

export default function Kiosk({ services }: { services: KioskService[] }) {
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [hoursStatus, setHoursStatus] = useState(() => getBookingHoursStatus());

  useEffect(() => {
    const tick = () => setHoursStatus(getBookingHoursStatus());
    const timer = setInterval(tick, 10000);
    return () => clearInterval(timer);
  }, []);

  const catServices = useMemo(
    () => (category ? services.filter((s) => s.category === category) : []),
    [services, category],
  );
  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => services.some((s) => s.category === c)),
    [services],
  );

  const selected = catServices.filter((s) => (qty[s.id] ?? 0) > 0);
  const assessment = assess(
    selected.map((s) => {
      const spec: FeeServiceSpec = {
        baseFee: s.baseFee,
        requiresDocstamp: s.requiresDocstamp,
        docstampFee: s.docstampFee,
        isPerPage: s.isPerPage,
      };
      return { service: spec, quantity: qty[s.id] };
    }),
  );

  function reset() {
    setStep("category");
    setCategory(null);
    setQty({});
    setStudentName("");
    setStudentId("");
    setResult(null);
    setQr(null);
    setError(null);
    setCopied(false);
  }

  function setQuantity(id: number, n: number) {
    setQty((prev) => {
      const next = { ...prev };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  async function submit() {
    const current = getBookingHoursStatus();
    if (!current.isOpen) {
      setError(
        `Ticket booking is currently closed. Booking is only available from ${BOOKING_SCHEDULE.LABEL} (Philippine Standard Time).`,
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await createCheckin(supabase, {
        studentName: studentName.trim() || undefined,
        studentId: studentId.trim() || undefined,
        items: selected.map((s) => ({ code: s.code, quantity: qty[s.id] })),
      });
      setResult(res);
      try {
        const url = `${window.location.origin}/track/${res.ticketNumber}`;
        setQr(await QRCode.toDataURL(url, { width: 220, margin: 1 }));
      } catch {
        /* QR is best-effort */
      }
      setStep("ticket");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const copyTrackerLink = () => {
    if (!result) return;
    const url = `${window.location.origin}/track/${result.ticketNumber}`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink flex flex-col justify-between">
      {/* Header with Official Logo */}
      <header className="border-b border-line bg-surface/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <UniversitySeal size={40} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#0038A8]">QueUA</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#991B1B] px-1.5 py-0.5 rounded">
                  Lagangilang Main Campus
                </span>
              </div>
              <p className="text-[11px] text-muted font-medium">University of Abra · Office of the Registrar</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {hoursStatus.isOpen ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#008837] border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Open · {BOOKING_SCHEDULE.LABEL} PST</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Closed · {BOOKING_SCHEDULE.LABEL}</span>
              </span>
            )}

            <Link
              href="/"
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-line text-ink-soft hover:bg-slate-50 transition"
            >
              ← Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Main Flow Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 flex-1">
        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-red-light border border-red/20 px-4 py-3 text-xs text-red font-medium flex items-center gap-2">
            <AlertCircleIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* CLOSED STATE VIEW (outside 7:30 AM - 5:00 PM) */}
        {!hoursStatus.isOpen && step !== "ticket" ? (
          <section className="space-y-6 py-6">
            <div className="rounded-3xl p-8 bg-surface border border-line shadow-xs text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                <ClockIcon size={32} />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Daily Hours: {BOOKING_SCHEDULE.LABEL} (PST)
                </span>
                <h1 className="text-2xl font-black text-[#002776]">
                  Queue Ticket Registration Closed
                </h1>
                <p className="text-xs text-muted leading-relaxed">
                  The University of Abra Office of the Registrar accepts queue ticket bookings from{" "}
                  <strong className="text-ink">7:30 AM to 5:00 PM</strong> (Philippine Standard Time). Ticket booking is unavailable beyond 5:00 PM to ensure all queued students are accommodated before office closing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-line max-w-sm mx-auto text-xs">
                <p className="text-muted font-medium">Philippine Standard Time</p>
                <p className="text-xl font-bold font-mono text-[#002776] mt-0.5">{hoursStatus.currentPstTime}</p>
                <p className="mt-1 text-[11px] font-semibold text-amber-800">
                  {hoursStatus.reason}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/track"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0038A8] text-white hover:bg-[#002776] transition shadow-xs text-center"
                >
                  Track Existing Ticket
                </Link>
                <Link
                  href="/display"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-surface border border-line text-slate-700 hover:bg-slate-50 transition text-center"
                >
                  View Lobby Display
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-muted hover:text-ink transition text-center"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="mb-8 flex items-center justify-between border-b border-line pb-4 text-xs">
              <div className={`flex items-center gap-2 font-bold ${step === "category" ? "text-[#0038A8]" : "text-muted"}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === "category" ? "bg-[#0038A8] text-white" : "bg-line"}`}>1</span>
                <span>Category</span>
              </div>
              <span className="text-faint">―</span>
              <div className={`flex items-center gap-2 font-bold ${step === "services" ? "text-[#0038A8]" : "text-muted"}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === "services" ? "bg-[#0038A8] text-white" : "bg-line"}`}>2</span>
                <span>Services</span>
              </div>
              <span className="text-faint">―</span>
              <div className={`flex items-center gap-2 font-bold ${step === "details" ? "text-[#0038A8]" : "text-muted"}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === "details" ? "bg-[#0038A8] text-white" : "bg-line"}`}>3</span>
                <span>Details</span>
              </div>
              <span className="text-faint">―</span>
              <div className={`flex items-center gap-2 font-bold ${step === "ticket" ? "text-[#0038A8]" : "text-muted"}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === "ticket" ? "bg-[#008837] text-white" : "bg-line"}`}>4</span>
                <span>e-Pass</span>
              </div>
            </div>

            {/* STEP 1: CATEGORY SELECTION */}
            {step === "category" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-red-50/80 border border-red-200">
              <div className="shrink-0">
                <StudentBookingIllustration size={130} />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#991B1B] border border-red-200 shadow-sm">
                  <PhoneIcon size={12} className="text-[#991B1B]" />
                  <span>ONLINE MOBILE BOOKING</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#002776]">
                  Book Your Queue e-Ticket
                </h1>
                <p className="text-xs text-muted leading-relaxed">
                  Select your transaction group below. Your queue ticket is generated directly on this phone — no physical kiosks or printed paper slips needed.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {availableCategories.map((c) => {
                const info = CATEGORY_INFO[c];
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setQty({});
                      setStep("services");
                    }}
                    className="card card-hover group p-5 text-left transition flex items-center justify-between gap-4 border border-line bg-surface hover:border-[#991B1B]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 shrink-0 flex items-center justify-center text-[#991B1B]">
                        <CategoryIcon type={info.iconType} />
                      </div>
                      <div>
                        <span className="text-base font-bold text-[#002776] group-hover:text-[#991B1B] transition">
                          {info.title}
                        </span>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">
                          {info.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-muted group-hover:text-[#991B1B] group-hover:translate-x-1 transition">
                      <ArrowRightIcon size={18} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 2: SERVICE & QUANTITY SELECTION */}
        {step === "services" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("category")}
                className="text-xs font-bold text-[#0038A8] hover:underline flex items-center gap-1 transition"
              >
                <span>←</span>
                <span>Change Category</span>
              </button>
              <span className="text-xs text-muted font-medium">
                {category ? CATEGORY_INFO[category].title : ""}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {catServices.map((s) => {
                const n = qty[s.id] ?? 0;
                return (
                  <div
                    key={s.id}
                    className={`card p-4 transition border ${
                      n > 0 ? "border-[#0038A8] bg-blue-50/40 shadow-sm" : "border-line bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">{s.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {s.baseFee > 0 ? (
                            <span className="font-bold text-[#0038A8]">{peso(s.baseFee)}</span>
                          ) : (
                            <span className="font-bold text-[#008837]">Free / Non-fee</span>
                          )}
                          {s.isPerPage ? " per page" : ""}
                          {s.requiresDocstamp ? (
                            <span className="text-crimson font-semibold"> + {peso(s.docstampFee)} docstamp</span>
                          ) : ""}
                        </p>
                      </div>

                      {n > 0 ? (
                        <div className="flex items-center gap-2 bg-surface border border-line rounded-lg p-1">
                          <button
                            onClick={() => setQuantity(s.id, n - 1)}
                            className="h-7 w-7 rounded flex items-center justify-center font-bold text-ink hover:bg-line transition text-sm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums text-[#0038A8]">
                            {n}
                          </span>
                          <button
                            onClick={() => setQuantity(s.id, n + 1)}
                            className="h-7 w-7 rounded flex items-center justify-center font-bold text-ink hover:bg-line transition text-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setQuantity(s.id, 1)}
                          className="btn px-4 py-2 text-xs font-bold rounded-lg shadow-sm"
                          style={{ backgroundColor: "#0038A8", color: "#FFFFFF" }}
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Preview Box */}
            <div className="card p-4 bg-surface rounded-xl border border-line space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Selected Items:</span>
                <span className="font-semibold text-ink">{selected.length} service(s)</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-2">
                <div>
                  <span className="text-xs font-bold text-[#002776]">Estimated Assessment</span>
                  <p className="text-[10px] text-muted">
                    {assessment.paymentStatus === "NOT_APPLICABLE"
                      ? "Administrative / Non-fee request"
                      : "Payable at Cashier Window"}
                  </p>
                </div>
                <span className="text-xl font-black text-[#0038A8] tabular-nums">
                  {peso(assessment.total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep("details")}
              disabled={selected.length === 0}
              className="w-full btn py-3.5 text-sm font-bold shadow-md rounded-xl flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#991B1B",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(153, 27, 27, 0.35)",
              }}
            >
              <span>Continue to Transactee Info</span>
              <ArrowRightIcon size={15} />
            </button>
          </section>
        )}

        {/* STEP 3: STUDENT DETAILS */}
        {step === "details" && (
          <section className="space-y-4">
            <button
              onClick={() => setStep("services")}
              className="text-xs font-bold text-[#991B1B] hover:underline flex items-center gap-1 transition"
            >
              <span>←</span>
              <span>Back to Services</span>
            </button>

            <div className="card p-6 bg-surface border border-line space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#002776]">Transactee Information</h2>
                <p className="text-xs text-muted mt-0.5">
                  Your name will be associated with your digital e-ticket on the registrar console.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="space-y-4"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="section-label">Full Name (Last, First M.I.)</span>
                  <input
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Dela Cruz, Maria A."
                    className="field text-sm"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="section-label">
                    Student ID Number{" "}
                    <span className="normal-case font-normal text-muted">(Optional for alumni/visitors)</span>
                  </span>
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2024-00123"
                    className="field text-sm font-mono"
                  />
                </label>

                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#991B1B] leading-relaxed flex items-start gap-2.5">
                  <PhoneIcon size={16} className="text-[#991B1B] shrink-0 mt-0.5" />
                  <span>Once generated, your e-Pass stays active in your browser. You can bookmark the tracker link to check your place at any time.</span>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full btn py-3.5 text-sm font-bold shadow-md rounded-xl flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#991B1B",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 14px rgba(153, 27, 27, 0.35)",
                  }}
                >
                  {busy ? (
                    <span>Issuing Digital e-Pass…</span>
                  ) : (
                    <>
                      <TicketIcon size={18} />
                      <span>Issue Mobile e-Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* STEP 4: DIGITAL MOBILE E-PASS */}
        {step === "ticket" && result && (
          <section className="space-y-6">
            {/* Digital Smartphone e-Pass Container with Official Seal */}
            <div className="max-w-sm mx-auto bg-surface border-2 border-[#991B1B] rounded-2xl shadow-xl overflow-hidden relative">
              {/* Top e-Pass Header in Royal Blue with Crimson Accent */}
              <div className="bg-[#0038A8] text-white p-5 text-center space-y-1 relative border-b-4 border-[#991B1B]">
                <div className="flex justify-center mb-1">
                  <UniversitySeal size={44} />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-[#991B1B] text-white mb-0.5 shadow-sm">
                  Official Mobile e-Pass
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-blue-100">University of Abra</p>
                <h2 className="text-xs font-semibold text-blue-200">Lagangilang Main Campus · Office of the Registrar</h2>
              </div>

              {/* Digital Perforation Accent */}
              <div className="relative border-b-2 border-dashed border-line my-1">
                <div className="absolute -left-3 -top-2.5 h-5 w-5 rounded-full bg-[#F8FAFC]" />
                <div className="absolute -right-3 -top-2.5 h-5 w-5 rounded-full bg-[#F8FAFC]" />
              </div>

              {/* Ticket Body */}
              <div className="p-6 text-center space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#991B1B]">Your Booked Ticket</p>
                  <p className="text-5xl font-black text-[#991B1B] font-mono tracking-tight my-1">
                    {result.ticketNumber}
                  </p>
                  <p className="text-xs font-bold text-[#008837]">
                    {result.precedingCount} student(s) ahead of you
                  </p>
                </div>

                {/* Status Callout Banner */}
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2.5 text-left ${
                    result.paymentStatus === "PAYMENT_PENDING"
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {result.paymentStatus === "PAYMENT_PENDING" ? (
                    <>
                      <CreditCardIcon size={18} className="text-crimson shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-red-900">Fee Assessed: {peso(result.totalAssessed)}</span>
                        <p className="text-[11px] font-normal text-red-800 leading-tight">
                          Please pay at the <strong>Cashier Window</strong> upon arriving at the Registrar to unlock counter serving.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={18} className="text-[#008837] shrink-0 mt-0.5" />
                      <span>Free Request. Proceed directly to window when called!</span>
                    </>
                  )}
                </div>

                {/* Service Items Breakdown */}
                <div className="text-left bg-bg p-3.5 rounded-xl border border-line text-xs space-y-1.5">
                  <p className="font-bold text-[#002776] border-b border-line pb-1 text-[11px] uppercase tracking-wider">
                    Booked Services
                  </p>
                  {result.items.map((it, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                      <span className="text-ink">
                        {it.name}
                        {it.quantity > 1 ? ` ×${it.quantity}` : ""}
                      </span>
                      <span className="tabular-nums font-semibold text-[#0038A8]">
                        {peso(it.computedFee)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-line pt-1.5 flex justify-between font-bold text-sm text-[#002776]">
                    <span>Total Assessed</span>
                    <span className="tabular-nums">{peso(result.totalAssessed)}</span>
                  </div>
                </div>

                {/* QR Code for Window Scanning */}
                {qr && (
                  <div className="space-y-1 pt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qr}
                      alt="Digital e-Pass QR Code"
                      className="mx-auto rounded-lg border border-line shadow-sm"
                      width={160}
                      height={160}
                    />
                    <p className="text-[10px] text-muted">
                      Show this QR code at the counter or keep it on your phone
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Mobile User */}
              <div className="p-4 bg-bg border-t border-line space-y-2.5">
                <Link
                  href={`/track/${result.ticketNumber}`}
                  className="w-full btn py-3 text-xs font-bold shadow rounded-xl flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#991B1B",
                    color: "#FFFFFF",
                    boxShadow: "0 3px 10px rgba(153, 27, 27, 0.3)",
                  }}
                >
                  <PhoneIcon size={15} />
                  <span>Open Live Status Tracker</span>
                </Link>

                <button
                  onClick={copyTrackerLink}
                  className="w-full btn py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    borderColor: "#CBD5E1",
                  }}
                >
                  <CopyIcon size={14} />
                  <span>{copied ? "Ticket Link Copied!" : "Copy Ticket Link"}</span>
                </button>

                <button
                  onClick={reset}
                  className="w-full text-center text-[11px] font-semibold text-muted hover:text-ink pt-1"
                >
                  Book another ticket
                </button>
              </div>
            </div>
          </section>
        )}
          </>
        )}
      </main>

      {/* Collegiate Footer */}
      <footer className="border-t border-line bg-[#F1F5F9] py-3 text-center text-xs text-muted">
        <p>University of Abra · Lagangilang Main Campus · Office of the University Registrar · Web-Hosted Queue Booking</p>
      </footer>
    </div>
  );
}
