/**
 * Lobby display data (PRD FR-4.1). Reads counter status, active tickets,
 * cashier clearance queue, and announcements.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CounterStatus } from "@/lib/db/enums";

export interface DisplayCounter {
  number: number;
  label: string;
  status: CounterStatus;
  serving: string | null;
}

export interface DisplayCashierTicket {
  ticketNumber: string;
  maskedName: string | null;
  totalAssessed: number;
  createdAt: string;
}

export interface DisplayCashierSection {
  status: "OPEN" | "BUSY";
  label: string;
  nowServing: string | null;
  currentAssessed: number | null;
  currentMaskedName: string | null;
  pendingCount: number;
  pendingTickets: DisplayCashierTicket[];
}

export interface DisplaySnapshot {
  counters: DisplayCounter[];
  cashier: DisplayCashierSection;
  nextInLine: string[];
  announcements: string[];
}

interface CounterRow {
  id: number;
  counter_number: number;
  label_name: string;
  status: CounterStatus;
}

interface TicketRow {
  ticket_number: string;
  queue_status: string;
  payment_status: string;
  counter_id: number | null;
  student_name: string | null;
  total_assessed: number | string | null;
  created_at: string;
}

function maskName(name: string | null): string | null {
  if (!name || !name.trim()) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[1][0]?.toUpperCase() ?? "";
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

export async function getDisplaySnapshot(sb: SupabaseClient): Promise<DisplaySnapshot> {
  // 1. Fetch counters and announcements
  const [countersRes, annRes] = await Promise.all([
    sb
      .from("counters")
      .select("id,counter_number,label_name,status")
      .neq("status", "CLOSED")
      .order("counter_number"),
    sb.from("announcements").select("message").order("sort_order"),
  ]);

  const counters = (countersRes.data as CounterRow[]) ?? [];
  const announcements = ((annRes.data as { message: string }[]) ?? []).map((a) => a.message);

  // 2. Attempt to query tickets with payment_status (works via service-role / authenticated staff)
  const ticketsRes = await sb
    .from("tickets")
    .select("ticket_number,queue_status,payment_status,counter_id,student_name,total_assessed,created_at")
    .in("queue_status", ["QUEUED", "SERVING", "ON_HOLD"])
    .order("created_at", { ascending: true });

  if (!ticketsRes.error && ticketsRes.data) {
    const tickets = ticketsRes.data as TicketRow[];

    // Counters serving map
    const serving = new Map<number, string>();
    for (const t of tickets) {
      if (t.queue_status === "SERVING" && t.counter_id != null) {
        serving.set(t.counter_id, t.ticket_number);
      }
    }

    // Cashier queue: tickets awaiting fee clearance
    const cashierPending = tickets.filter((t) => t.payment_status === "PAYMENT_PENDING");
    const topCashier = cashierPending[0] ?? null;

    const cashier: DisplayCashierSection = {
      status: cashierPending.length > 0 ? "BUSY" : "OPEN",
      label: "Fee Clearance & Assessment",
      nowServing: topCashier?.ticket_number ?? null,
      currentAssessed: topCashier?.total_assessed != null ? Number(topCashier.total_assessed) : null,
      currentMaskedName: maskName(topCashier?.student_name ?? null),
      pendingCount: cashierPending.length,
      pendingTickets: cashierPending.slice(0, 8).map((t) => ({
        ticketNumber: t.ticket_number,
        maskedName: maskName(t.student_name),
        totalAssessed: Number(t.total_assessed ?? 0),
        createdAt: t.created_at,
      })),
    };

    // Registrar window waiting pool: tickets queued AND already paid or free (not blocked by cashier)
    const nextInLine = tickets
      .filter((t) => t.queue_status === "QUEUED" && t.payment_status !== "PAYMENT_PENDING")
      .slice(0, 10)
      .map((t) => t.ticket_number);

    return {
      counters: counters.map((c) => ({
        number: c.counter_number,
        label: c.label_name,
        status: c.status,
        serving: serving.get(c.id) ?? null,
      })),
      cashier,
      nextInLine,
      announcements,
    };
  }

  // Fallback for anonymous client reading public_queue view
  const queueRes = await sb
    .from("public_queue")
    .select("ticket_number,queue_status,counter_id,created_at");

  const queue = (queueRes.data as Array<{ ticket_number: string; queue_status: string; counter_id: number | null; created_at: string }>) ?? [];
  const serving = new Map<number, string>();
  for (const q of queue) {
    if (q.queue_status === "SERVING" && q.counter_id != null) {
      serving.set(q.counter_id, q.ticket_number);
    }
  }

  const nextInLine = queue
    .filter((q) => q.queue_status === "QUEUED")
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
    .slice(0, 10)
    .map((q) => q.ticket_number);

  return {
    counters: counters.map((c) => ({
      number: c.counter_number,
      label: c.label_name,
      status: c.status,
      serving: serving.get(c.id) ?? null,
    })),
    cashier: {
      status: "OPEN",
      label: "Fee Clearance & Assessment",
      nowServing: null,
      currentAssessed: null,
      currentMaskedName: null,
      pendingCount: 0,
      pendingTickets: [],
    },
    nextInLine,
    announcements,
  };
}
