/**
 * Mobile queue tracker data (PRD FR-4.3). Reads the PII-safe public_queue view
 * (anon-readable), so no login is needed.
 *
 * NOTE (v1): "ahead" counts QUEUED tickets created earlier across all
 * categories — a coarse estimate. The full lobby display (Module 4) will
 * refine this per counter/category.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { QueueStatus } from "@/lib/db/enums";

export interface TrackRow {
  ticketNumber: string;
  queueStatus: QueueStatus;
  maskedName: string | null;
  counterId: number | null;
}

export interface TrackSnapshot {
  found: boolean;
  me: TrackRow | null;
  serving: TrackRow[];
  ahead: number;
}

interface Row {
  ticket_number: string;
  queue_status: QueueStatus;
  masked_name: string | null;
  counter_id: number | null;
  created_at: string;
}

export async function getTrackSnapshot(
  sb: SupabaseClient,
  ticketNumber: string,
): Promise<TrackSnapshot> {
  const { data, error } = await sb
    .from("public_queue")
    .select("ticket_number,queue_status,masked_name,counter_id,created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data as Row[]) ?? [];
  const toRow = (r: Row): TrackRow => ({
    ticketNumber: r.ticket_number,
    queueStatus: r.queue_status,
    maskedName: r.masked_name,
    counterId: r.counter_id,
  });

  const meRaw = rows.find((r) => r.ticket_number === ticketNumber) ?? null;
  const serving = rows.filter((r) => r.queue_status === "SERVING").map(toRow);
  let ahead = 0;
  if (meRaw && meRaw.queue_status === "QUEUED") {
    ahead = rows.filter(
      (r) => r.queue_status === "QUEUED" && r.created_at < meRaw.created_at,
    ).length;
  }

  return { found: !!meRaw, me: meRaw ? toRow(meRaw) : null, serving, ahead };
}
