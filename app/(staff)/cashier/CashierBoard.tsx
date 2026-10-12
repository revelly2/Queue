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
  // Create the browser client once (lazy init), not on every render.
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

  // Live updates: any ticket change may add/remove from the pending queue.
  useEffect(() => {
    const channel = supabase
      .channel("cashier-pending")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
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
        setNotice({
          ok: true,
          text: `✓ ${result.ticketNumber} marked PAID (${peso(result.totalAssessed)})`,
        });
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
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Cashier — Payment Clearance</h1>
        <p className="text-sm text-muted">Signed in as {cashierLabel}</p>
      </header>

      {/* Rapid clearance by ticket number / scan (FR-2.2) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void clear(manualNumber);
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={manualNumber}
          onChange={(e) => setManualNumber(e.target.value)}
          placeholder="Scan or type ticket no. (e.g. DOC-0001)"
          className="flex-1 rounded-md border border-line px-3 py-2 text-base"
          autoFocus
        />
        <button
          type="submit"
          disabled={busy !== null}
          className="rounded-md bg-blue px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Confirm Payment
        </button>
      </form>

      {notice && (
        <p
          role="status"
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            notice.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
        Awaiting payment ({pending.length})
      </h2>

      {pending.length === 0 ? (
        <p className="rounded-md border border-dashed border-line px-4 py-8 text-center text-muted">
          No tickets awaiting payment.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((t) => (
            <li
              key={t.ticketNumber}
              className="rounded-lg border border-line p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{t.ticketNumber}</p>
                  <p className="text-sm text-muted">
                    {t.studentName ?? "—"}
                    {t.studentId ? ` · ${t.studentId}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{peso(t.totalAssessed)}</p>
                  <button
                    onClick={() => void clear(t.ticketNumber)}
                    disabled={busy !== null}
                    className="mt-1 rounded-md bg-blue px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy === t.ticketNumber ? "…" : "Confirm"}
                  </button>
                </div>
              </div>
              <ul className="mt-3 border-t border-line pt-2 text-sm text-muted">
                {t.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {it.name}
                      {it.quantity > 1 ? ` ×${it.quantity}` : ""}
                    </span>
                    <span>{peso(it.computedFee)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
