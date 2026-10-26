import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { HISTORY_SELECT, toHistoryRow } from "@/lib/admin/history";
import type { AppRole } from "@/lib/db/enums";
import PrintButton, { BackButton } from "./PrintButton";

export const instant = false;

// Receipts carry student PII, so only staff may open them (RLS also limits tickets to staff).
const STAFF_ROLES: AppRole[] = ["CASHIER", "COUNTER", "REGISTRAR_OFFICER", "REGISTRAR_ADMIN", "SYSTEM_ADMIN"];

const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });

export default async function ReceiptPage({ params }: { params: Promise<{ ticket: string }> }) {
  await connection();
  const { ticket } = await params;
  const ticketNumber = decodeURIComponent(ticket).toUpperCase();
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const role = profile?.role as AppRole | undefined;
  if (!role || !STAFF_ROLES.includes(role)) {
    return <main className="p-8 text-center text-sm">Staff access required to print receipts.</main>;
  }

  const { data } = await supabase.from("tickets").select(HISTORY_SELECT).eq("ticket_number", ticketNumber).maybeSingle();
  if (!data) {
    return <main className="p-8 text-center text-sm">Ticket {ticketNumber} was not found.</main>;
  }
  const r = toHistoryRow(data as unknown as Parameters<typeof toHistoryRow>[0]);
  const paymentLabel = { NOT_APPLICABLE: "FREE REQUEST", PAYMENT_PENDING: "UNPAID", PAID: "PAID" }[r.paymentStatus];

  return (
    <>
      {/* 80 mm thermal roll: page width matches the paper, height grows with content */}
      <style>{`
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .receipt { margin: 0 !important; box-shadow: none !important; border: 0 !important; }
        }
      `}</style>
      <div className="no-print mx-auto flex max-w-[80mm] items-center justify-between gap-2 px-2 pt-4">
        <BackButton />
        <PrintButton />
      </div>
      <main
        className="receipt mx-auto my-4 w-[80mm] bg-white px-[4mm] py-[5mm] text-black shadow-sm ring-1 ring-black/10"
        style={{ fontFamily: '"Courier New", ui-monospace, monospace', fontSize: "11px", lineHeight: 1.35 }}
      >
        <div className="text-center">
          <div className="font-bold">UNIVERSITY OF ABRA</div>
          <div>Lagangilang Main Campus</div>
          <div>Office of the University Registrar</div>
          <div className="my-2 border-t border-dashed border-black" />
          <div className="font-bold">TRANSACTION RECEIPT</div>
          <div className="my-1 text-2xl font-bold tracking-wider">{r.ticketNumber}</div>
        </div>

        <div className="my-2 border-t border-dashed border-black" />
        <Line label="Date" value={when(r.createdAt)} />
        <Line label="Name" value={r.studentName ?? "—"} />
        {r.studentId && <Line label="Student ID" value={r.studentId} />}
        {r.window && <Line label="Window" value={r.window} />}

        <div className="my-2 border-t border-dashed border-black" />
        {r.items.map((it, i) => (
          <div key={i} className="mb-1">
            <div>{it.name}</div>
            <div className="flex justify-between pl-2">
              <span>× {it.quantity}</span>
              <span>{peso(it.computedFee)}</span>
            </div>
          </div>
        ))}
        <div className="my-2 border-t border-dashed border-black" />
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span>{peso(r.totalAssessed)}</span>
        </div>
        <Line label="Payment" value={paymentLabel} />
        {r.paidAt && <Line label="Paid on" value={when(r.paidAt)} />}
        <Line label="Status" value={r.queueStatus.replace("_", " ")} />

        <div className="my-2 border-t border-dashed border-black" />
        <div className="text-center">
          <div>Printed by: {profile?.full_name ?? user.email}</div>
          <div>{when(new Date().toISOString())}</div>
          <div className="mt-2">This is not an Official Receipt.</div>
          <div>Thank you!</div>
        </div>
      </main>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
