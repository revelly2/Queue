import type { SupabaseClient } from "@supabase/supabase-js";
import type { CounterStatus } from "@/lib/db/enums";

export interface MonitorCounter {
  number: number;
  label: string;
  status: CounterStatus;
  serving: string | null;
}

export interface MonitorSnapshot {
  counters: MonitorCounter[];
  totals: { queued: number; serving: number; onHold: number; paymentPending: number };
  longestWaitMins: number | null;
}

interface CounterRow {
  id: number;
  counter_number: number;
  label_name: string;
  status: CounterStatus;
}
interface TicketRow {
  queue_status: string;
  payment_status: string;
  counter_id: number | null;
  ticket_number: string;
  created_at: string;
}

export async function getMonitorSnapshot(sb: SupabaseClient): Promise<MonitorSnapshot> {
  const [countersRes, ticketsRes] = await Promise.all([
    sb.from("counters").select("id,counter_number,label_name,status").order("counter_number"),
    sb
      .from("tickets")
      .select("queue_status,payment_status,counter_id,ticket_number,created_at")
      .in("queue_status", ["QUEUED", "SERVING", "ON_HOLD"]),
  ]);

  const counters = (countersRes.data as CounterRow[]) ?? [];
  const tickets = (ticketsRes.data as TicketRow[]) ?? [];

  const serving = new Map<number, string>();
  let queued = 0,
    servingCount = 0,
    onHold = 0,
    paymentPending = 0;
  let oldestQueued: number | null = null;
  const now = Date.now();

  for (const t of tickets) {
    if (t.queue_status === "SERVING") {
      servingCount++;
      if (t.counter_id != null) serving.set(t.counter_id, t.ticket_number);
    } else if (t.queue_status === "ON_HOLD") {
      onHold++;
    } else if (t.queue_status === "QUEUED") {
      queued++;
      const waited = now - new Date(t.created_at).getTime();
      if (oldestQueued === null || waited > oldestQueued) oldestQueued = waited;
    }
    if (t.payment_status === "PAYMENT_PENDING") paymentPending++;
  }

  return {
    counters: counters.map((c) => ({
      number: c.counter_number,
      label: c.label_name,
      status: c.status,
      serving: serving.get(c.id) ?? null,
    })),
    totals: { queued, serving: servingCount, onHold, paymentPending },
    longestWaitMins: oldestQueued === null ? null : Math.floor(oldestQueued / 60000),
  };
}
