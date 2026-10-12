/**
 * Typed wrapper around the `create_checkin` RPC (supabase/migrations/0002).
 *
 * The kiosk sends only service codes + quantities + student info; the database
 * function computes fees, the ticket number, and statuses authoritatively.
 * Keep this thin — business logic lives in the RPC, not here.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PaymentStatus,
  QueueStatus,
  ServiceCategory,
} from "@/lib/db/enums";

export interface CheckinItemInput {
  /** services.code, e.g. "DOC_OTR". */
  code: string;
  /** Units: pages / copies / sets. Defaults to 1. */
  quantity?: number;
}

export interface CheckinInput {
  studentId?: string;
  studentName?: string;
  items: CheckinItemInput[];
}

export interface CheckinLine {
  code: string;
  name: string;
  quantity: number;
  computedFee: number;
}

export interface CheckinResult {
  ticketId: number;
  ticketNumber: string;
  category: ServiceCategory;
  totalAssessed: number;
  paymentStatus: PaymentStatus;
  queueStatus: QueueStatus;
  precedingCount: number;
  items: CheckinLine[];
}

/** Raw jsonb shape returned by the RPC. */
interface RawCheckinResult {
  ticket_id: number;
  ticket_number: string;
  category: ServiceCategory;
  total_assessed: number | string;
  payment_status: PaymentStatus;
  queue_status: QueueStatus;
  preceding_count: number;
  items: Array<{
    code: string;
    name: string;
    quantity: number;
    computed_fee: number | string;
  }>;
}

function mapResult(raw: RawCheckinResult): CheckinResult {
  return {
    ticketId: raw.ticket_id,
    ticketNumber: raw.ticket_number,
    category: raw.category,
    totalAssessed: Number(raw.total_assessed),
    paymentStatus: raw.payment_status,
    queueStatus: raw.queue_status,
    precedingCount: raw.preceding_count,
    items: raw.items.map((i) => ({
      code: i.code,
      name: i.name,
      quantity: i.quantity,
      computedFee: Number(i.computed_fee),
    })),
  };
}

/**
 * Create a kiosk check-in ticket. Throws on validation/RPC failure (e.g.
 * unknown service code, mixed categories) — surface the message to the kiosk.
 */
export async function createCheckin(
  supabase: SupabaseClient,
  input: CheckinInput,
): Promise<CheckinResult> {
  const { data, error } = await supabase.rpc("create_checkin", {
    p_student_id: input.studentId ?? null,
    p_student_name: input.studentName ?? null,
    p_items: input.items.map((i) => ({
      code: i.code,
      quantity: i.quantity ?? 1,
    })),
  });

  if (error) {
    throw new Error(`Check-in failed: ${error.message}`);
  }
  return mapResult(data as RawCheckinResult);
}
