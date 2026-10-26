/**
 * Transaction history: every ticket (student transaction) created in a date range,
 * newest first. Staff-readable via RLS (tickets_staff_all).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentStatus, QueueStatus } from "@/lib/db/enums";

export interface HistoryItem {
  name: string;
  quantity: number;
  computedFee: number;
}

export interface HistoryRow {
  ticketNumber: string;
  studentName: string | null;
  studentId: string | null;
  totalAssessed: number;
  paymentStatus: PaymentStatus;
  queueStatus: QueueStatus;
  window: string | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  items: HistoryItem[];
}

interface Row {
  ticket_number: string;
  student_name: string | null;
  student_id: string | null;
  total_assessed: number | string;
  payment_status: PaymentStatus;
  queue_status: QueueStatus;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  counters: { label_name: string } | null;
  ticket_items: Array<{ quantity_pages: number; computed_fee: number | string; services: { name: string } | null }>;
}

export const HISTORY_SELECT =
  "ticket_number,student_name,student_id,total_assessed,payment_status,queue_status," +
  "created_at,paid_at,completed_at,counters(label_name)," +
  "ticket_items(quantity_pages,computed_fee,services(name))";

// shortcut: capped at 1000 rows per range, add pagination if a single range ever exceeds it
const LIMIT = 1000;

export const toHistoryRow = (r: Row): HistoryRow => ({
  ticketNumber: r.ticket_number,
  studentName: r.student_name,
  studentId: r.student_id,
  totalAssessed: Number(r.total_assessed),
  paymentStatus: r.payment_status,
  queueStatus: r.queue_status,
  window: r.counters?.label_name ?? null,
  createdAt: r.created_at,
  paidAt: r.paid_at,
  completedAt: r.completed_at,
  items: r.ticket_items.map((it) => ({
    name: it.services?.name ?? "",
    quantity: it.quantity_pages,
    computedFee: Number(it.computed_fee),
  })),
});

export async function getHistory(sb: SupabaseClient, fromIso: string, toIso: string): Promise<HistoryRow[]> {
  const { data, error } = await sb
    .from("tickets")
    .select(HISTORY_SELECT)
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (error) throw new Error(`Failed to load transaction history: ${error.message}`);
  return (data as unknown as Row[]).map(toHistoryRow);
}

/** Case-insensitive match on student name, student ID, or ticket number. */
export function matchesSearch(row: HistoryRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.studentName, row.studentId, row.ticketNumber].some((v) => v?.toLowerCase().includes(q));
}
