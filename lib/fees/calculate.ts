/**
 * QueUA automated fee engine (PRD App_PRD.md §4, FR-1.3).
 *
 * Pure, side-effect-free computation of assessment slips for kiosk check-in.
 * This is the CLIENT-SIDE PREVIEW engine; the authoritative computation will
 * live in the secure kiosk RPC (Postgres) and is pinned to the same test
 * cases so the two can never silently diverge.
 *
 * Money is handled in integer centavos throughout to avoid binary-float drift
 * (e.g. 0.1 + 0.2 !== 0.3). Pesos are only produced at the boundary.
 *
 * Fee model (unified across every §4 row):
 *   line total = base_fee × quantity + (requires_docstamp ? docstamp_fee : 0)
 *   ticket total = Σ line totals
 *
 * `quantity` is the generic unit count — pages (OTR), copies (certifications),
 * sets (authentication), or 1 for fixed-fee / per-request services. The
 * `is_per_page` flag is only a UI hint (prompt for page count vs. default 1);
 * the arithmetic does not branch on it.
 */

import type { PaymentStatus } from "@/lib/db/enums";

export interface FeeServiceSpec {
  /** Base fee in pesos (services.base_fee). */
  baseFee: number;
  /** Whether a documentary stamp applies (services.requires_docstamp). */
  requiresDocstamp: boolean;
  /** Documentary stamp fee in pesos (services.docstamp_fee). */
  docstampFee: number;
  /** UI hint only — true means prompt for a page count (services.is_per_page). */
  isPerPage: boolean;
}

export interface LineFeeInput {
  service: FeeServiceSpec;
  /** Generic unit count (pages/copies/sets). Must be an integer ≥ 1. */
  quantity: number;
}

export interface LineFeeBreakdown {
  baseCentavos: number;
  docstampCentavos: number;
  lineCentavos: number;
  /** lineCentavos expressed in pesos. */
  lineTotal: number;
}

export interface Assessment {
  lines: LineFeeBreakdown[];
  totalCentavos: number;
  /** totalCentavos expressed in pesos. */
  total: number;
  paymentStatus: PaymentStatus;
}

const toCentavos = (pesos: number): number => Math.round(pesos * 100);
const toPesos = (centavos: number): number => centavos / 100;

function assertValid({ service, quantity }: LineFeeInput): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(`quantity must be an integer >= 1 (got ${quantity})`);
  }
  if (service.baseFee < 0 || service.docstampFee < 0) {
    throw new RangeError("fees must be non-negative");
  }
}

/** Full centavo breakdown for a single ticket line. */
export function computeLineBreakdown(input: LineFeeInput): LineFeeBreakdown {
  assertValid(input);
  const { service, quantity } = input;
  const baseCentavos = toCentavos(service.baseFee) * quantity;
  const docstampCentavos = service.requiresDocstamp
    ? toCentavos(service.docstampFee)
    : 0;
  const lineCentavos = baseCentavos + docstampCentavos;
  return {
    baseCentavos,
    docstampCentavos,
    lineCentavos,
    lineTotal: toPesos(lineCentavos),
  };
}

/** Line fee in pesos. */
export function computeLineFee(input: LineFeeInput): number {
  return computeLineBreakdown(input).lineTotal;
}

/** Ticket total in centavos (authoritative integer form). */
export function computeTicketTotalCentavos(items: LineFeeInput[]): number {
  return items.reduce(
    (sum, item) => sum + computeLineBreakdown(item).lineCentavos,
    0,
  );
}

/**
 * Derive payment status from an assessed total (centavos).
 * Zero-fee items (Category C / ADM) route straight to the queue
 * (PRD Workflow 2), paid items wait on the cashier (Workflow 1).
 */
export function derivePaymentStatus(totalCentavos: number): PaymentStatus {
  return totalCentavos > 0 ? "PAYMENT_PENDING" : "NOT_APPLICABLE";
}

/** Produce a full assessment slip for a set of requested services. */
export function assess(items: LineFeeInput[]): Assessment {
  const lines = items.map(computeLineBreakdown);
  const totalCentavos = lines.reduce((sum, l) => sum + l.lineCentavos, 0);
  return {
    lines,
    totalCentavos,
    total: toPesos(totalCentavos),
    paymentStatus: derivePaymentStatus(totalCentavos),
  };
}
