/**
 * Cashier payment-clearance data layer (PRD FR-2.x).
 *
 * Reads use RLS (staff-only SELECT on tickets/ticket_items); the write goes
 * through the confirm_payment RPC (migration 0003) so only the valid
 * PAYMENT_PENDING -> PAID transition is possible.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentStatus, ServiceCategory } from "@/lib/db/enums";

export interface PendingPaymentItem {
  code: string;
  name: string;
  quantity: number;
  computedFee: number;
}

export interface PendingPaymentTicket {
  ticketNumber: string;
  studentId: string | null;
  studentName: string | null;
  category: ServiceCategory | null;
  totalAssessed: number;
  createdAt: string;
  items: PendingPaymentItem[];
}

export interface ConfirmPaymentResult {
  ticketId: number;
  ticketNumber: string;
  paymentStatus: PaymentStatus;
  paidAt: string;
  totalAssessed: number;
}

/** Shape returned by the nested PostgREST select below. */
interface PendingRow {
  ticket_number: string;
  student_id: string | null;
  student_name: string | null;
  category: ServiceCategory | null;
  total_assessed: number | string;
  created_at: string;
  ticket_items: Array<{
    quantity_pages: number;
    computed_fee: number | string;
    services: { code: string; name: string } | null;
  }>;
}

/**
 * List tickets awaiting payment, oldest first (fair service order),
 * with their line items. Requires an authenticated staff session.
 */
export async function listPendingPayments(
  supabase: SupabaseClient,
): Promise<PendingPaymentTicket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "ticket_number,student_id,student_name,category,total_assessed,created_at," +
        "ticket_items(quantity_pages,computed_fee,services(code,name))",
    )
    .eq("payment_status", "PAYMENT_PENDING")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load payment queue: ${error.message}`);
  }

  return (data as unknown as PendingRow[]).map((row) => ({
    ticketNumber: row.ticket_number,
    studentId: row.student_id,
    studentName: row.student_name,
    category: row.category,
    totalAssessed: Number(row.total_assessed),
    createdAt: row.created_at,
    items: row.ticket_items.map((it) => ({
      code: it.services?.code ?? "",
      name: it.services?.name ?? "",
      quantity: it.quantity_pages,
      computedFee: Number(it.computed_fee),
    })),
  }));
}

/**
 * Clear a ticket's payment (FR-2.2/FR-2.3). Throws on invalid transition,
 * missing ticket, or insufficient role — surface the message to the cashier.
 */
export async function confirmPayment(
  supabase: SupabaseClient,
  ticketNumber: string,
): Promise<ConfirmPaymentResult> {
  const { data, error } = await supabase.rpc("confirm_payment", {
    p_ticket_number: ticketNumber,
  });

  if (error) {
    throw new Error(error.message);
  }

  const raw = data as {
    ticket_id: number;
    ticket_number: string;
    payment_status: PaymentStatus;
    paid_at: string;
    total_assessed: number | string;
  };
  return {
    ticketId: raw.ticket_id,
    ticketNumber: raw.ticket_number,
    paymentStatus: raw.payment_status,
    paidAt: raw.paid_at,
    totalAssessed: Number(raw.total_assessed),
  };
}
