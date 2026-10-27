import { describe, expect, it } from "vitest";
import {
  isWithinBookingHours,
  getBookingHoursStatus,
  formatPSTTime,
  getPSTParts,
} from "./operatingHours";

describe("operatingHours", () => {
  // Helper: creates a Date corresponding to UTC equivalent of specified Asia/Manila (UTC+8) time
  function makePSTDate(hour: number, minute: number, second = 0): Date {
    // In UTC, hour is hour - 8
    const d = new Date(Date.UTC(2026, 9, 27, hour - 8, minute, second));
    return d;
  }

  it("correctly extracts PST time parts", () => {
    const d = makePSTDate(7, 30, 0);
    const parts = getPSTParts(d);
    expect(parts.hour).toBe(7);
    expect(parts.minute).toBe(30);
  });

  it("rejects booking before 7:30 AM PST", () => {
    expect(isWithinBookingHours(makePSTDate(6, 0))).toBe(false);
    expect(isWithinBookingHours(makePSTDate(7, 0))).toBe(false);
    expect(isWithinBookingHours(makePSTDate(7, 29))).toBe(false);
  });

  it("allows booking starting exactly at 7:30 AM PST", () => {
    expect(isWithinBookingHours(makePSTDate(7, 30))).toBe(true);
    expect(isWithinBookingHours(makePSTDate(7, 31))).toBe(true);
  });

  it("allows booking during regular office hours", () => {
    expect(isWithinBookingHours(makePSTDate(8, 0))).toBe(true);
    expect(isWithinBookingHours(makePSTDate(11, 45))).toBe(true);
    expect(isWithinBookingHours(makePSTDate(12, 0))).toBe(true);
    expect(isWithinBookingHours(makePSTDate(14, 30))).toBe(true);
    expect(isWithinBookingHours(makePSTDate(16, 59))).toBe(true);
  });

  it("rejects booking at and beyond 5:00 PM PST", () => {
    expect(isWithinBookingHours(makePSTDate(17, 0))).toBe(false);
    expect(isWithinBookingHours(makePSTDate(17, 1))).toBe(false);
    expect(isWithinBookingHours(makePSTDate(18, 0))).toBe(false);
    expect(isWithinBookingHours(makePSTDate(23, 59))).toBe(false);
    expect(isWithinBookingHours(makePSTDate(0, 30))).toBe(false);
  });

  it("provides helpful status messages when closed", () => {
    const morningEarly = getBookingHoursStatus(makePSTDate(7, 15));
    expect(morningEarly.isOpen).toBe(false);
    expect(morningEarly.reason).toContain("7:30 AM");

    const eveningClosed = getBookingHoursStatus(makePSTDate(17, 30));
    expect(eveningClosed.isOpen).toBe(false);
    expect(eveningClosed.reason).toContain("5:00 PM");

    const middayOpen = getBookingHoursStatus(makePSTDate(10, 0));
    expect(middayOpen.isOpen).toBe(true);
    expect(middayOpen.reason).toBeNull();
  });
});
