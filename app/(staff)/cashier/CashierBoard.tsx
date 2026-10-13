"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  confirmPayment,
  listPendingPayments,
  type PendingPaymentTicket,
} from "@/lib/cashier/payments";

const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

interface Props {
  initialPending: PendingPaymentTicket[];
  cashierLabel: string;
}

export default function CashierBoard({ initialPending, cashierLabel }: Props) {
  const [supabase] = useState(() => createClient());
  const [pending, setPending] = useState<PendingPaymentTicket[]>(initialPending);
  const [manualNumber, setManualNumber] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPending(await listPendingPayments(supabase));
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("cashier-pending")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => { void refresh(); },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, refresh]);

  const clear = useCallback(
    async (ticketNumber: string) => {
      const num = ticketNumber.trim().toUpperCase();
      if (!num) return;
      setBusy(num);
      setNotice(null);
      try {
        const result = await confirmPayment(supabase, num);
        setPending((prev) => prev.filter((t) => t.ticketNumber !== num));
        setNotice({ ok: true, text: `${result.ticketNumber} marked PAID (${peso(result.totalAssessed)})` });
        setManualNumber("");
      } catch (e) {
        setNotice({ ok: false, text: (e as Error).message });
      } finally {
        setBusy(null);
      }
    },
    [supabase],
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Payment Clearance</h1>
        <p className="mt-0.5 text-xs text-muted">Signed in as {cashierLabel}</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void clear(manualNumber); }}
        className="mb-4 flex gap-2"
      >
        <input
          value={manualNumber}
          onChange={(e) => setManualNumber(e.target.value)}
          placeholder="Scan or type ticket no. (e.g. DOC-0001)"
          className="field flex-1"
          autoFocus
        />
        <button type="submit" disabled={busy !== null} className="btn btn-accent">Confirm Payment</button>
      </form>

      {notice && (
        <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-xs ${notice.ok ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
          {notice.text}
        </p>
      )}

      <div className="flex items-baseline justify-between mb-2">
        <span className="section-label">Awaiting payment ({pending.length})</span>
      </div>

      {pending.length === 0 ? (
        <div className="card py-8 text-center text-xs text-muted">
          No tickets awaiting payment.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.map((t) => (
            <div key={t.ticketNumber} className="card p-3.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold" style={{ letterSpacing: "-0.04em" }}>{t.ticketNumber}</p>
                  <p className="text-xs text-muted">
                    {t.studentName ?? "—"}
                    {t.studentId ? ` · ${t.studentId}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums" style={{ letterSpacing: "-0.04em" }}>{peso(t.totalAssessed)}</p>
                  <button
                    onClick={() => void clear(t.ticketNumber)}
                    disabled={busy !== null}
                    className="btn btn-accent mt-1 text-[11px]"
                  >
                    {busy === t.ticketNumber ? "…" : "Confirm"}
                  </button>
                </div>
              </div>
              <div className="mt-2 border-t border-line-dim pt-2 text-xs text-muted">
                {t.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.name}{it.quantity > 1 ? ` ×${it.quantity}` : ""}</span>
                    <span className="tabular-nums">{peso(it.computedFee)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
