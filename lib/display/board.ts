/**
 * Lobby display data (PRD FR-4.1). Reads anon-visible sources only: counters,
 * the PII-safe public_queue view, and active announcements.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CounterStatus } from "@/lib/db/enums";

export interface DisplayCounter {
  number: number;
  label: string;
  status: CounterStatus;
  serving: string | null;
}

export interface DisplaySnapshot {
  counters: DisplayCounter[];
  nextInLine: string[];
  announcements: string[];
}

interface CounterRow {
  id: number;
  counter_number: number;
  label_name: string;
  status: CounterStatus;
}
interface QueueRow {
  ticket_number: string;
  queue_status: string;
  counter_id: number | null;
  created_at: string;
}

export async function getDisplaySnapshot(sb: SupabaseClient): Promise<DisplaySnapshot> {
  const [countersRes, queueRes, annRes] = await Promise.all([
    sb.from("counters").select("id,counter_number,label_name,status").neq("status", "CLOSED").order("counter_number"),
    sb.from("public_queue").select("ticket_number,queue_status,counter_id,created_at"),
    sb.from("announcements").select("message").order("sort_order"),
  ]);

  const counters = (countersRes.data as CounterRow[]) ?? [];
  const queue = (queueRes.data as QueueRow[]) ?? [];

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
    nextInLine,
    announcements: ((annRes.data as { message: string }[]) ?? []).map((a) => a.message),
  };
}
