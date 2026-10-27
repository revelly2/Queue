/**
 * Operating Hours Enforcement for University of Abra Registrar Queue System.
 *
 * Operational schedule:
 * - Start: 7:30 AM (07:30:00)
 * - Cutoff: 5:00 PM (17:00:00)
 * - Timezone: Philippine Standard Time (PST, UTC+8 / Asia/Manila)
 *
 * Tickets cannot be booked before 7:30 AM or at/after 5:00 PM.
 */

export const BOOKING_SCHEDULE = {
  OPEN_HOUR: 7,
  OPEN_MINUTE: 30,
  CLOSE_HOUR: 17,
  CLOSE_MINUTE: 0,
  TIMEZONE: "Asia/Manila",
  LABEL: "7:30 AM – 5:00 PM",
} as const;

export interface BookingHoursStatus {
  isOpen: boolean;
  scheduleLabel: string;
  currentPstTime: string;
  reason: string | null;
  opensAtLabel: string;
}

/**
 * Get current hour and minute in Philippine Standard Time (Asia/Manila, UTC+8).
 */
export function getPSTParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  // Use Intl.DateTimeFormat to reliably extract parts in Asia/Manila regardless of host server timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_SCHEDULE.TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      partMap[part.type] = parseInt(part.value, 10);
    }
  }

  return {
    year: partMap.year ?? date.getUTCFullYear(),
    month: partMap.month ?? date.getUTCMonth() + 1,
    day: partMap.day ?? date.getUTCDate(),
    hour: partMap.hour ?? 0,
    minute: partMap.minute ?? 0,
    second: partMap.second ?? 0,
  };
}

/**
 * Returns true if the given date is within the allowed booking window:
 * 7:30 AM (inclusive) to 5:00 PM (exclusive of 17:00:00 and beyond).
 */
export function isWithinBookingHours(date: Date = new Date()): boolean {
  const { hour, minute } = getPSTParts(date);
  const totalMinutes = hour * 60 + minute;
  const openMinutes = BOOKING_SCHEDULE.OPEN_HOUR * 60 + BOOKING_SCHEDULE.OPEN_MINUTE; // 7*60 + 30 = 450
  const closeMinutes = BOOKING_SCHEDULE.CLOSE_HOUR * 60 + BOOKING_SCHEDULE.CLOSE_MINUTE; // 17*60 = 1020

  return totalMinutes >= openMinutes && totalMinutes < closeMinutes;
}

/**
 * Format a Date into a human-readable Philippine Standard Time string (e.g. "8:45 AM").
 */
export function formatPSTTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: BOOKING_SCHEDULE.TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Get detailed booking hours status and user-facing messages.
 */
export function getBookingHoursStatus(date: Date = new Date()): BookingHoursStatus {
  const isOpen = isWithinBookingHours(date);
  const currentPstTime = formatPSTTime(date);
  const { hour, minute } = getPSTParts(date);
  const totalMinutes = hour * 60 + minute;
  const openMinutes = BOOKING_SCHEDULE.OPEN_HOUR * 60 + BOOKING_SCHEDULE.OPEN_MINUTE;

  let reason: string | null = null;
  if (!isOpen) {
    if (totalMinutes < openMinutes) {
      reason = "Queue booking opens at 7:30 AM today.";
    } else {
      reason = "Queue booking for today closed at 5:00 PM. Service resumes at 7:30 AM.";
    }
  }

  return {
    isOpen,
    scheduleLabel: BOOKING_SCHEDULE.LABEL,
    currentPstTime,
    reason,
    opensAtLabel: "7:30 AM",
  };
}
