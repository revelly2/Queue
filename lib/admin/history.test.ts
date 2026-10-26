import { describe, expect, it } from "vitest";
import { matchesSearch, toHistoryRow, type HistoryRow } from "./history";

const row: HistoryRow = toHistoryRow({
  ticket_number: "DOC-0006",
  student_name: "Dela Cruz, Juan P.",
  student_id: "2023-01452",
  total_assessed: "205.00",
  payment_status: "PAID",
  queue_status: "COMPLETED",
  created_at: "2026-10-19T06:30:00Z",
  paid_at: null,
  completed_at: null,
  counters: { label_name: "Window 1" },
  ticket_items: [{ quantity_pages: 3, computed_fee: "180.00", services: { name: "OTR" } }],
});

describe("history", () => {
  it("maps numeric strings and the window label", () => {
    expect(row.totalAssessed).toBe(205);
    expect(row.items[0]).toEqual({ name: "OTR", quantity: 3, computedFee: 180 });
    expect(row.window).toBe("Window 1");
  });

  it("matches name, student ID, or ticket number case-insensitively", () => {
    expect(matchesSearch(row, "")).toBe(true);
    expect(matchesSearch(row, "juan")).toBe(true);
    expect(matchesSearch(row, "2023-014")).toBe(true);
    expect(matchesSearch(row, "doc-0006")).toBe(true);
    expect(matchesSearch(row, "maria")).toBe(false);
  });

  it("does not crash on a ticket without a name or ID", () => {
    expect(matchesSearch({ ...row, studentName: null, studentId: null }, "juan")).toBe(false);
  });
});
