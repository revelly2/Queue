"use client";

import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { createClient } from "@/utils/supabase/client";
import { assess, type FeeServiceSpec } from "@/lib/fees/calculate";
import { createCheckin, type CheckinResult } from "@/lib/kiosk/checkin";
import type { ServiceCategory } from "@/lib/db/enums";

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

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  CREDENTIAL_DOCUMENT: "Credentials",
  ENROLLMENT_CHANGE: "Enrollment",
  ADMINISTRATIVE_FORM: "Clearances & Forms",
};
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

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-accent text-xs font-extrabold text-white">Q</span>
        <span className="text-lg font-bold" style={{ letterSpacing: "-0.04em" }}>Check-in</span>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-light px-3 py-2 text-xs text-red">{error}</p>
      )}

      {step === "category" && (
        <section>
          <p className="mb-4 text-sm text-muted">What do you need today?</p>
          <div className="grid gap-2.5">
            {availableCategories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setQty({}); setStep("services"); }}
                className="card group p-5 text-left transition hover:border-accent"
              >
                <span className="text-base font-semibold">{CATEGORY_LABEL[c]}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "services" && (
        <section>
          <button onClick={() => setStep("category")} className="mb-3 text-xs font-medium text-accent">← Back</button>
          <h2 className="mb-3 text-base font-semibold">{category ? CATEGORY_LABEL[category] : ""}</h2>
          <div className="flex flex-col gap-1.5">
            {catServices.map((s) => {
              const n = qty[s.id] ?? 0;
              return (
                <div key={s.id} className="card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-[11px] text-muted">
                        {s.baseFee > 0 ? peso(s.baseFee) : "No fee"}
                        {s.isPerPage ? " / page" : ""}
                        {s.requiresDocstamp ? ` + ${peso(s.docstampFee)} docstamp` : ""}
                      </p>
                    </div>
                    {n > 0 ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQuantity(s.id, n - 1)} className="btn btn-ghost h-8 w-8 p-0 text-base">−</button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{n}</span>
                        <button onClick={() => setQuantity(s.id, n + 1)} className="btn btn-ghost h-8 w-8 p-0 text-base">+</button>
                      </div>
                    ) : (
                      <button onClick={() => setQuantity(s.id, 1)} className="btn btn-accent text-xs">Add</button>
                    )}
                  </div>
                  {n > 0 && s.isPerPage && (
                    <p className="mt-1 text-[11px] text-muted">{n} page(s)</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-bg px-4 py-3">
            <span className="text-xs text-muted">
              Estimated total
              {assessment.paymentStatus === "NOT_APPLICABLE" ? " (no payment)" : ""}
            </span>
            <span className="text-base font-bold tabular-nums">{peso(assessment.total)}</span>
          </div>

          <button
            onClick={() => setStep("details")}
            disabled={selected.length === 0}
            className="mt-3 w-full btn btn-accent py-3 text-sm"
          >
            Continue
          </button>
        </section>
      )}

      {step === "details" && (
        <section>
          <button onClick={() => setStep("services")} className="mb-3 text-xs font-medium text-accent">← Back</button>
          <h2 className="mb-3 text-base font-semibold">Your details</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); void submit(); }}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1">
              <span className="section-label">Full name</span>
              <input required value={studentName} onChange={(e) => setStudentName(e.target.value)} className="field" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="section-label">Student ID <span className="normal-case font-normal text-muted">(optional)</span></span>
              <input value={studentId} onChange={(e) => setStudentId(e.target.value)} className="field" />
            </label>
            <button type="submit" disabled={busy} className="btn btn-accent py-3 text-sm">
              {busy ? "Generating…" : "Get Ticket"}
            </button>
          </form>
        </section>
      )}

      {step === "ticket" && result && (
        <section className="text-center">
          <p className="text-xs text-muted">Your ticket number</p>
          <p className="my-2 data-value text-5xl">{result.ticketNumber}</p>

          <div className={`mx-auto mb-4 inline-block pill text-xs ${
            result.paymentStatus === "PAYMENT_PENDING"
              ? "bg-amber-light text-amber border border-accent-border"
              : "bg-green-light text-green"
          }`} style={{ padding: "4px 12px" }}>
            {result.paymentStatus === "PAYMENT_PENDING"
              ? `Pay ${peso(result.totalAssessed)} at the Cashier first`
              : "Proceed to the window when called"}
          </div>

          <div className="mx-auto max-w-sm card p-3.5 text-left">
            <div className="text-xs">
              {result.items.map((it, i) => (
                <div key={i} className="flex justify-between py-0.5">
                  <span>{it.name}{it.quantity > 1 ? ` ×${it.quantity}` : ""}</span>
                  <span className="tabular-nums">{peso(it.computedFee)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-line-dim pt-2 text-sm font-bold">
              <span>Total</span>
              <span className="tabular-nums">{peso(result.totalAssessed)}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted">{result.precedingCount} ahead of you in line</p>

          {qr && (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="Scan to track your queue" className="mx-auto" width={220} height={220} />
              <p className="mt-1 text-[11px] text-muted">Scan to track your place in line</p>
            </div>
          )}

          <button onClick={reset} className="mt-5 w-full btn btn-ghost py-3 text-sm">Done</button>
        </section>
      )}
    </main>
  );
}
