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
  // Cheap pure computation — no memo needed.
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
      <h1 className="mb-6 text-center text-3xl font-bold">QueUA Check-in</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "category" && (
        <section>
          <p className="mb-4 text-center text-muted">What do you need today?</p>
          <div className="grid gap-4">
            {availableCategories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setQty({});
                  setStep("services");
                }}
                className="rounded-xl border-2 border-line px-6 py-8 text-xl font-semibold transition hover:border-blue hover:bg-paper-dim"
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "services" && (
        <section>
          <button onClick={() => setStep("category")} className="mb-4 text-sm text-blue">
            ← Back
          </button>
          <h2 className="mb-4 text-xl font-semibold">
            {category ? CATEGORY_LABEL[category] : ""}
          </h2>
          <ul className="flex flex-col gap-2">
            {catServices.map((s) => {
              const n = qty[s.id] ?? 0;
              return (
                <li key={s.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted">
                        {s.baseFee > 0 ? peso(s.baseFee) : "No fee"}
                        {s.isPerPage ? " / page" : ""}
                        {s.requiresDocstamp ? ` + ${peso(s.docstampFee)} docstamp` : ""}
                      </p>
                    </div>
                    {n > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(s.id, n - 1)}
                          className="h-9 w-9 rounded-md border border-line text-lg"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">{n}</span>
                        <button
                          onClick={() => setQuantity(s.id, n + 1)}
                          className="h-9 w-9 rounded-md border border-line text-lg"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setQuantity(s.id, 1)}
                        className="rounded-md bg-blue px-4 py-2 text-sm font-semibold text-white"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  {n > 0 && s.isPerPage && (
                    <p className="mt-1 text-xs text-muted">{n} page(s)</p>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex items-center justify-between rounded-lg bg-paper-dim px-4 py-3">
            <span className="text-sm text-muted">
              Estimated total
              {assessment.paymentStatus === "NOT_APPLICABLE" ? " (no payment)" : ""}
            </span>
            <span className="text-lg font-bold">{peso(assessment.total)}</span>
          </div>

          <button
            onClick={() => setStep("details")}
            disabled={selected.length === 0}
            className="mt-4 w-full rounded-md bg-blue px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
          >
            Continue
          </button>
        </section>
      )}

      {step === "details" && (
        <section>
          <button onClick={() => setStep("services")} className="mb-4 text-sm text-blue">
            ← Back
          </button>
          <h2 className="mb-4 text-xl font-semibold">Your details</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1 text-sm font-medium">
              Full name
              <input
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="rounded-md border border-line px-3 py-3 text-base"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Student ID <span className="font-normal text-muted">(optional)</span>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="rounded-md border border-line px-3 py-3 text-base"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-blue px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Generating…" : "Get Ticket"}
            </button>
          </form>
        </section>
      )}

      {step === "ticket" && result && (
        <section className="text-center">
          <p className="text-sm text-muted">Your ticket number</p>
          <p className="my-2 text-5xl font-extrabold tracking-wide">{result.ticketNumber}</p>

          <div
            className={`mx-auto mb-4 inline-block rounded-full px-4 py-1 text-sm font-semibold ${
              result.paymentStatus === "PAYMENT_PENDING"
                ? "bg-amber-100 text-amber-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {result.paymentStatus === "PAYMENT_PENDING"
              ? `Pay ${peso(result.totalAssessed)} at the Cashier first`
              : "Proceed to the window when called"}
          </div>

          <div className="mx-auto max-w-sm rounded-lg border border-line p-4 text-left">
            <ul className="text-sm">
              {result.items.map((it, i) => (
                <li key={i} className="flex justify-between py-0.5">
                  <span>
                    {it.name}
                    {it.quantity > 1 ? ` ×${it.quantity}` : ""}
                  </span>
                  <span>{peso(it.computedFee)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold">
              <span>Total</span>
              <span>{peso(result.totalAssessed)}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted">
            {result.precedingCount} ahead of you in line
          </p>

          {qr && (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="Scan to track your queue" className="mx-auto" width={220} height={220} />
              <p className="mt-1 text-xs text-muted">Scan to track your place in line</p>
            </div>
          )}

          <button
            onClick={reset}
            className="mt-6 w-full rounded-md border border-line px-4 py-3 text-base font-semibold"
          >
            Done
          </button>
        </section>
      )}
    </main>
  );
}
