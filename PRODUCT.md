# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Student / Client (transactee)** — primary. Comes to the Registrar for documents, enrollment changes, or clearances, often during congested peak periods (enrollment, graduation evaluation, credential requests). Checks in at a kiosk/web, pays if assessed, and tracks their place from their phone or the lobby display.
- **Cashier Officer** — clears assessed fees so a paid ticket enters the registrar serving pool.
- **Registrar Counter Officer** — frontline window staff who call, serve, hold, transfer, complete, or no-show tickets.
- **Counter / station account** — a login bound to a single physical window (one counter = one account), locked to that counter.
- **Registrar Administrator / Department Head** — configures counters, modules, routing, and roles; monitors live state; reviews analytics.
- **System Administrator** — oversees RBAC, accounts, and local hardware/system health.

## Product Purpose

QueUA replaces the University of Abra Office of the Registrar's manual, crowded physical queues with an automated, multi-channel system: self-service check-in → automated fee/documentary-stamp assessment → cashier clearance → dynamic window routing → real-time audio-visual queue tracking → operational analytics. Success is a calmer, faster, fairer registrar: less hallway congestion, a clean cashier↔counter handoff for paid transactions, students who can wait anywhere, and administrators who can see and measure throughput, waits, and bottlenecks.

## Positioning

A registrar-specific queue system, not a generic ticket dispenser. Two things a neighboring product could not truthfully copy as-is:
1. A **synchronized fee engine** tuned to registrar reality — per-page OTR multipliers, documentary stamps, per-copy/per-set/per-request rules — computed at check-in and gating a cashier→counter handoff.
2. **Admin-configurable module/access routing** — admins define *modules* (named groupings of services), assign them to counters, and set a per-counter access level (read / write / full), so the flow and each station's permissions are controlled without code.

## Operating Context

On-campus Registrar office. High-volume peak periods drive the design. Touchpoints: self-service kiosk and web check-in; a cashier station; registrar service windows; a lobby TV display with audio/TTS announcements; students' own phones via a QR mobile tracker. Intended to run on the campus LAN/intranet with offline resilience (ticketing, counter dispatch, and lobby display must keep working if external internet drops). Fees are in Philippine pesos (₱). Thermal-ticket printing is planned (currently abstracted/mocked).

## Capabilities and Constraints

- **Service catalog** across three categories with automated assessment: Credentials (`DOC-`), Enrollment adjustments (`ENR-`), and Administrative forms/clearances (`ADM-`, non-fee). Fee engine handles base fees, ₱30 documentary stamps, and OTR page-count multipliers.
- **Lifecycle:** kiosk check-in → assessed ticket (paid → `PAYMENT_PENDING`, free → `NOT_APPLICABLE`) → cashier clears to `PAID` → counter `Call Next` (payment-gated) → `SERVING` → `COMPLETED`; with recall, hold/resume, transfer, and no-show (after 3 recalls).
- **Module system:** modules group services; counters get modules with `READ`/`WRITE`/`FULL` access; `Call Next` and per-ticket actions are gated by the counter's access for that ticket's module.
- **RBAC (6 roles):** `STUDENT`, `CASHIER`, `COUNTER` (station), `REGISTRAR_OFFICER`, `REGISTRAR_ADMIN`, `SYSTEM_ADMIN`.
- **Real-time** queue/counter state to lobby display, mobile tracker, and dashboards; PRD target ≤400 ms propagation and ≥500 concurrent mobile sessions.
- **Analytics:** transactions by service, Average Queue Wait Time (AQWT) vs Average Service Handling Time (ASHT), no-show rate, peak hours; CSV export (PDF noted as a gap).
- **Technical substrate (existing):** Next.js 16 (App Router) + Supabase (Postgres, Auth, Row-Level Security, Realtime). Server-authoritative fees and queue mutations via SECURITY DEFINER RPCs; station account creation via a server-only service-role action.
- **Terminology to preserve:** ticket prefixes `DOC-`/`ENR-`/`ADM-`; documentary stamp ("docstamp"); OTR; CAV; module; counter/window; AQWT/ASHT.
- **Undecided / open:** real UA fee schedule must be confirmed against the institution's current official rates before any real use (current figures come from the PRD); thermal printer and LAN failover are specified but not yet implemented; PDF report export not yet built.

## Brand Commitments

- **Institution:** University of Abra (UA). Its official name, seal/logo, and official colors are a binding identity future design must honor. **Assets are not yet on hand** — the real UA seal/logo and official color values must be supplied by the user and must not be fabricated or guessed.
- **Product name:** QueUA (a portmanteau of "Queue" + "UA"); keep the capitalization.
- **Language:** English only.
- **Voice:** institutional and trustworthy, with plain, student-facing clarity on public surfaces (kiosk, tracker, lobby).

## Evidence on Hand

- `docs/App_PRD.md` — the full product requirements (users, workflows, the §4 fee schedule, data model, NFRs). Authoritative source for most product truth here.
- The implemented system in this repository — all five PRD modules plus the module/access system, built and verified end-to-end against a live Supabase project this session.
- **Absences (must not be fabricated):** no real UA brand assets (seal/logo/colors) in-repo; no real testimonials, customers, benchmarks, pricing beyond the PRD schedule, or deployment claims — this is an academic/capstone project, not a live production deployment yet.

## Product Principles

1. **Prove the whole lifecycle.** As a capstone, completeness and a verifiable end-to-end run (check-in → pay → serve → track → report) matter more than scale; every state in the flow must be demonstrable.
2. **Fairness and accountability are the product.** Fair service order, auditable actions (who served/cleared, when), and trustworthy analytics are the registrar's core value — never cosmetic.
3. **Operate-mode discipline.** Scanability, consistency, and the real kiosk/counter/lobby usage scene outrank visual expression; the system must stay legible and fast under peak-period load.
4. **Configurable flow without code.** Admins control routing and permissions through modules, counters, and access levels — the registrar owns the flow, not the developer.
5. **Server-authoritative, minimal-PII.** Fees, status transitions, and routing are decided on the server; public surfaces show only masked identifiers.

## Accessibility & Inclusion

- Kiosk: touch-first, high-contrast, large targets, ≤2 taps to select a form.
- Lobby display: readable at ~10 m on a standard 50-inch screen; paired audio/TTS announcements for non-visual access to "now serving".
- Mobile tracker: zero-install, works on a student's own phone.
(Derived from the PRD's non-functional requirements; no formal WCAG level has been committed yet.)
