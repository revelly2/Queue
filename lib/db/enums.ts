/**
 * TypeScript mirrors of the Postgres enums defined in
 * supabase/migrations/0001_init.sql. Keep these in sync with the migration.
 * (When we wire up `supabase gen types`, these can be replaced by generated
 * Database types — tracked for a later increment.)
 */

export const SERVICE_CATEGORY = [
  "CREDENTIAL_DOCUMENT",
  "ENROLLMENT_CHANGE",
  "ADMINISTRATIVE_FORM",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORY)[number];

export const PAYMENT_STATUS = [
  "NOT_APPLICABLE",
  "PAYMENT_PENDING",
  "PAID",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const QUEUE_STATUS = [
  "QUEUED",
  "SERVING",
  "ON_HOLD",
  "COMPLETED",
  "TRANSFERRED",
  "NO_SHOW",
] as const;
export type QueueStatus = (typeof QUEUE_STATUS)[number];

export const COUNTER_STATUS = ["OPEN", "BUSY", "ON_BREAK", "CLOSED"] as const;
export type CounterStatus = (typeof COUNTER_STATUS)[number];

export const ACCESS_LEVEL = ["READ", "WRITE", "FULL"] as const;
export type AccessLevel = (typeof ACCESS_LEVEL)[number];

export const APP_ROLE = [
  "STUDENT",
  "REGISTRAR_OFFICER",
  "CASHIER",
  "REGISTRAR_ADMIN",
  "SYSTEM_ADMIN",
] as const;
export type AppRole = (typeof APP_ROLE)[number];

/** Ticket-number prefixes per PRD §4, keyed by service category. */
export const TICKET_PREFIX: Record<ServiceCategory, string> = {
  CREDENTIAL_DOCUMENT: "DOC",
  ENROLLMENT_CHANGE: "ENR",
  ADMINISTRATIVE_FORM: "ADM",
};
