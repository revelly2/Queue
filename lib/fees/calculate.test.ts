import { describe, it, expect } from "vitest";
import {
  assess,
  computeLineFee,
  computeTicketTotalCentavos,
  derivePaymentStatus,
  type FeeServiceSpec,
} from "@/lib/fees/calculate";

// Specs transcribed from PRD §4.
const OTR: FeeServiceSpec = { baseFee: 50, requiresDocstamp: true, docstampFee: 30, isPerPage: true };
const DIP_DUP: FeeServiceSpec = { baseFee: 50, requiresDocstamp: true, docstampFee: 30, isPerPage: false };
const CERT: FeeServiceSpec = { baseFee: 25, requiresDocstamp: false, docstampFee: 0, isPerPage: false };
const CAV_APO: FeeServiceSpec = { baseFee: 75, requiresDocstamp: false, docstampFee: 0, isPerPage: false };
const F137: FeeServiceSpec = { baseFee: 50, requiresDocstamp: false, docstampFee: 0, isPerPage: false };
const ENR_CAD: FeeServiceSpec = { baseFee: 50, requiresDocstamp: false, docstampFee: 0, isPerPage: false };
const ADM_LOA: FeeServiceSpec = { baseFee: 0, requiresDocstamp: false, docstampFee: 0, isPerPage: false };

describe("computeLineFee — PRD §4 examples", () => {
  it("OTR: (pages × ₱50) + ₱30 docstamp", () => {
    expect(computeLineFee({ service: OTR, quantity: 1 })).toBe(80);
    expect(computeLineFee({ service: OTR, quantity: 3 })).toBe(180);
    expect(computeLineFee({ service: OTR, quantity: 10 })).toBe(530);
  });

  it("2nd Copy of Diploma: fixed ₱50 + ₱30 docstamp", () => {
    expect(computeLineFee({ service: DIP_DUP, quantity: 1 })).toBe(80);
  });

  it("Certifications: ₱25 per copy", () => {
    expect(computeLineFee({ service: CERT, quantity: 1 })).toBe(25);
    expect(computeLineFee({ service: CERT, quantity: 4 })).toBe(100);
  });

  it("CAV (Apostille): ₱75 per request", () => {
    expect(computeLineFee({ service: CAV_APO, quantity: 1 })).toBe(75);
  });

  it("Form 137: fixed ₱50, no docstamp", () => {
    expect(computeLineFee({ service: F137, quantity: 1 })).toBe(50);
  });

  it("ENR CAD: ₱50, no docstamp", () => {
    expect(computeLineFee({ service: ENR_CAD, quantity: 1 })).toBe(50);
  });

  it("ADM form: ₱0", () => {
    expect(computeLineFee({ service: ADM_LOA, quantity: 1 })).toBe(0);
  });
});

describe("docstamp is charged once per item, not per page", () => {
  it("OTR 5 pages = 5×50 + 30 (single docstamp)", () => {
    expect(computeLineFee({ service: OTR, quantity: 5 })).toBe(280);
  });
});

describe("assess — multi-line ticket", () => {
  it("mixes paid + docstamp + free lines and sets PAYMENT_PENDING", () => {
    const result = assess([
      { service: OTR, quantity: 2 }, // 130
      { service: CERT, quantity: 2 }, // 50
      { service: ADM_LOA, quantity: 1 }, // 0
    ]);
    expect(result.total).toBe(180);
    expect(result.totalCentavos).toBe(18000);
    expect(result.paymentStatus).toBe("PAYMENT_PENDING");
    expect(result.lines).toHaveLength(3);
    expect(result.lines[0]).toMatchObject({ baseCentavos: 10000, docstampCentavos: 3000, lineCentavos: 13000 });
  });

  it("all-free ticket routes to NOT_APPLICABLE", () => {
    const result = assess([{ service: ADM_LOA, quantity: 1 }]);
    expect(result.total).toBe(0);
    expect(result.paymentStatus).toBe("NOT_APPLICABLE");
  });

  it("empty ticket totals zero", () => {
    expect(assess([]).total).toBe(0);
  });
});

describe("derivePaymentStatus", () => {
  it("positive → PAYMENT_PENDING, zero → NOT_APPLICABLE", () => {
    expect(derivePaymentStatus(1)).toBe("PAYMENT_PENDING");
    expect(derivePaymentStatus(0)).toBe("NOT_APPLICABLE");
  });
});

describe("float safety (centavo arithmetic)", () => {
  it("fractional-peso fees do not drift", () => {
    const spec: FeeServiceSpec = { baseFee: 0.1, requiresDocstamp: true, docstampFee: 0.2, isPerPage: false };
    // 0.1 × 3 + 0.2 = 0.5 exactly, not 0.5000000000000001
    expect(computeLineFee({ service: spec, quantity: 3 })).toBe(0.5);
    expect(computeTicketTotalCentavos([{ service: spec, quantity: 3 }])).toBe(50);
  });
});

describe("input validation", () => {
  it("rejects quantity < 1 and non-integers", () => {
    expect(() => computeLineFee({ service: OTR, quantity: 0 })).toThrow(RangeError);
    expect(() => computeLineFee({ service: OTR, quantity: -2 })).toThrow(RangeError);
    expect(() => computeLineFee({ service: OTR, quantity: 1.5 })).toThrow(RangeError);
  });

  it("rejects negative fees", () => {
    const bad: FeeServiceSpec = { baseFee: -1, requiresDocstamp: false, docstampFee: 0, isPerPage: false };
    expect(() => computeLineFee({ service: bad, quantity: 1 })).toThrow(RangeError);
  });
});
