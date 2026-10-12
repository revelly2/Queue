/**
 * Counter console data layer (PRD FR-3.x).
 *
 * Reads use staff RLS; all mutations go through the SECURITY DEFINER RPCs in
 * migration 0007, which enforce role + per-counter module access. UI gating by
 * access level is convenience only — the database is the source of truth.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccessLevel, CounterStatus, QueueStatus } from "@/lib/db/enums";

const RANK: Record<AccessLevel, number> = { READ: 1, WRITE: 2, FULL: 3 };

export interface CounterModuleInfo {
  moduleId: number;
  code: string;
  name: string;
  accessLevel: AccessLevel;
}

export interface OperableCounter {
  id: number;
  number: number;
  label: string;
  status: CounterStatus;
  modules: CounterModuleInfo[];
  maxAccess: AccessLevel | null;
}

export interface ConsoleTicket {
  id: number;
  ticketNumber: string;
  studentName: string | null;
  studentId: string | null;
  queueStatus: QueueStatus;
  recallCount: number;
  holdReason: string | null;
  items: { name: string; quantity: number }[];
}

export interface CounterBoard {
  serving: ConsoleTicket[];
  waiting: ConsoleTicket[];
}

interface CounterRow {
  id: number;
  counter_number: number;
  label_name: string;
  status: CounterStatus;
  counter_modules: Array<{
    access_level: AccessLevel;
    module_id: number;
    modules: { code: string; name: string } | null;
  }>;
}

export async function listOperableCounters(
  sb: SupabaseClient,
): Promise<OperableCounter[]> {
  const { data, error } = await sb
    .from("counters")
    .select(
      "id,counter_number,label_name,status,counter_modules(access_level,module_id,modules(code,name))",
    )
    .order("counter_number");
  if (error) throw new Error(`Failed to load counters: ${error.message}`);

  return (data as unknown as CounterRow[]).map((c) => {
    const modules: CounterModuleInfo[] = c.counter_modules.map((cm) => ({
      moduleId: cm.module_id,
      code: cm.modules?.code ?? "",
      name: cm.modules?.name ?? "",
      accessLevel: cm.access_level,
    }));
    const maxAccess = modules.reduce<AccessLevel | null>(
      (best, m) => (!best || RANK[m.accessLevel] > RANK[best] ? m.accessLevel : best),
      null,
    );
    return {
      id: c.id,
      number: c.counter_number,
      label: c.label_name,
      status: c.status,
      modules,
      maxAccess,
    };
  });
}

interface TicketRow {
  id: number;
  ticket_number: string;
  student_name: string | null;
  student_id: string | null;
  queue_status: QueueStatus;
  recall_count: number;
  hold_reason: string | null;
  ticket_items: Array<{
    quantity_pages: number;
    service_id: number;
    services: { name: string } | null;
  }>;
}

const mapTicket = (t: TicketRow): ConsoleTicket => ({
  id: t.id,
  ticketNumber: t.ticket_number,
  studentName: t.student_name,
  studentId: t.student_id,
  queueStatus: t.queue_status,
  recallCount: t.recall_count,
  holdReason: t.hold_reason,
  items: t.ticket_items.map((it) => ({
    name: it.services?.name ?? "",
    quantity: it.quantity_pages,
  })),
});

const SELECT_TICKET =
  "id,ticket_number,student_name,student_id,queue_status,recall_count,hold_reason," +
  "ticket_items(quantity_pages,service_id,services(name))";

/**
 * Load a counter's board: tickets it is currently serving/holding, plus the
 * waiting queue it is eligible to call (QUEUED, paid/free, service in one of
 * the counter's modules).
 */
export async function getCounterBoard(
  sb: SupabaseClient,
  counterId: number,
  moduleIds: number[],
): Promise<CounterBoard> {
  // Which service ids can this counter serve?
  let serviceableIds: number[] = [];
  if (moduleIds.length) {
    const { data: ms } = await sb
      .from("module_services")
      .select("service_id")
      .in("module_id", moduleIds);
    serviceableIds = [...new Set((ms ?? []).map((r) => r.service_id as number))];
  }

  const { data: serv, error: servErr } = await sb
    .from("tickets")
    .select(SELECT_TICKET)
    .eq("counter_id", counterId)
    .in("queue_status", ["SERVING", "ON_HOLD"])
    .order("called_at", { ascending: true });
  if (servErr) throw new Error(`Failed to load serving tickets: ${servErr.message}`);

  let waiting: TicketRow[] = [];
  if (serviceableIds.length) {
    const { data: wait, error: waitErr } = await sb
      .from("tickets")
      .select(SELECT_TICKET)
      .eq("queue_status", "QUEUED")
      .neq("payment_status", "PAYMENT_PENDING")
      .order("created_at", { ascending: true });
    if (waitErr) throw new Error(`Failed to load queue: ${waitErr.message}`);
    waiting = (wait as unknown as TicketRow[]).filter((t) =>
      t.ticket_items.some((it) => serviceableIds.includes(it.service_id)),
    );
  }

  return {
    serving: (serv as unknown as TicketRow[]).map(mapTicket),
    waiting: waiting.map(mapTicket),
  };
}

// --- Action wrappers (thin; business rules live in the RPCs) --------------

const rpc = async (sb: SupabaseClient, fn: string, args: Record<string, unknown>) => {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
};

export const callNext = (sb: SupabaseClient, counterId: number) =>
  rpc(sb, "call_next_ticket", { p_counter_id: counterId });
export const recall = (sb: SupabaseClient, ticketId: number) =>
  rpc(sb, "recall_ticket", { p_ticket_id: ticketId });
export const hold = (sb: SupabaseClient, ticketId: number, reason: string) =>
  rpc(sb, "hold_ticket", { p_ticket_id: ticketId, p_reason: reason });
export const resume = (sb: SupabaseClient, ticketId: number) =>
  rpc(sb, "resume_ticket", { p_ticket_id: ticketId });
export const complete = (sb: SupabaseClient, ticketId: number) =>
  rpc(sb, "complete_ticket", { p_ticket_id: ticketId });
export const transfer = (sb: SupabaseClient, ticketId: number, targetId: number) =>
  rpc(sb, "transfer_ticket", { p_ticket_id: ticketId, p_target_counter_id: targetId });
export const noShow = (sb: SupabaseClient, ticketId: number) =>
  rpc(sb, "mark_no_show", { p_ticket_id: ticketId });
export const setCounterStatus = (
  sb: SupabaseClient,
  counterId: number,
  status: CounterStatus,
) => rpc(sb, "set_counter_status", { p_counter_id: counterId, p_status: status });
