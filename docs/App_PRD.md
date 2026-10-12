# Product Requirements Document (PRD): Registrar Queue Management & Monitoring System (QueUA)

---

## 1. Executive Summary & Purpose

The **Registrar Queue Management & Monitoring System (QueUA)** is a specialized queue management, ticket routing, and operational analytics solution engineered for the Office of the Registrar. 

The system modernizes traditional registrar operations by replacing manual, crowded physical queues with an automated multi-channel check-in, dynamic window assignment, automated fee calculation, and real-time audio-visual tracking platform. By bridging the operational touchpoints between the Registrar, the Cashier, and the student body, QueUA minimizes hallway congestion, streamlines assessed payments, ensures fair service order, and provides administrators with verifiable operational analytics.

---

## 2. Problem Statement & Strategic Objectives

### Problem Statement
* **Lobby & Hallway Congestion:** High-volume operational periods (e.g., enrollment, graduation evaluations, credential requests) lead to severe corridor crowding and disordered queues.
* **Payment Assessment Friction:** Transactions that require payments (such as OTR, CAV, and certifications) frequently stall window lines because students must step away to pay at the Cashier before returning to complete their requests[cite: 1].
* **Lack of Queue Transparency:** Students have no real-time visibility into their position in line, estimated wait durations, or document readiness, forcing them to remain physically clustered outside counters.
* **Absence of Administrative Telemetry:** Registrar supervisors lack quantifiable metrics regarding service processing speed, counter idle duration, peak bottleneck hours, and form-specific transaction volumes.

### Strategic Objectives
* **Queue Latency Reduction:** Reduce average student wait times by at least 40% through category-based routing and automated pre-assessment.
* **Synchronized Fee Assessment:** Automate fee and documentary stamp calculations directly upon ticket generation, facilitating seamless handoff between Cashier payment clearance and counter processing[cite: 1].
* **Remote Queue Tracking:** Provide a zero-install mobile queue tracker accessible via ticket QR code, allowing students to wait comfortably in open or remote campus areas.
* **Operational Accountability:** Furnish live counter-state dashboards and historical reporting covering counter throughput, peak-load schedules, and transaction turnaround times.

---

## 3. User Roles & Stakeholder Personas

* **Student / Client (Transactee):** Initiates requests, receives tickets (physical or digital), tracks position in queue via mobile or lobby display, pays fees, and receives documents.
* **Registrar Counter Officer:** Frontline window personnel who call tickets, verify submitted documents, process academic forms, and log completions.
* **Cashier Officer:** Validates and marks assessed queue ticket fees as paid, releasing the ticket to the active registrar processing queue.
* **Registrar Administrator / Department Head:** Manages counter allocations, edits the service catalog and pricing, monitors real-time counter metrics, and reviews analytical reports.
* **System Administrator:** Oversees role-based access control, system health, local hardware integrations (kiosks, thermal printers, display screens), and database backups.

---

## 4. Service Catalog & Automated Fee Engine

Transactions handled by the Registrar are split into three functional processing categories, integrating the institutional schedule of fees and available application forms:

### Category A: Paid Document Requests & Authentications (Ticket Prefix: `DOC-`)
Transactions requiring automated fee computation, documentary stamps, and cashier payment clearance prior to release.

| Service / Document Code | Transaction Name | Unit Base Fee | Docstamp Fee | Multiplier Logic |
| :--- | :--- | :--- | :--- | :--- |
| `DOC_CERT` | Certifications (Enrollment, Grades, GWA, Graduation, Medium of Instruction, Transfer, Units Earned) | ₱25.00[cite: 1] | None | Per certificate copy |
| `DOC_AUTH_SET` | Authentication (Set – OTR / Diploma) | ₱25.00[cite: 1] | None | Per set |
| `DOC_AUTH_CERT` | Authentication (Certifications, etc.) | ₱25.00[cite: 1] | None | Per document |
| `DOC_CAV_LOC` | CAV (Local) | ₱25.00[cite: 1] | None | Per request |
| `DOC_CAV_APO` | CAV (Apostille) | ₱75.00[cite: 1] | None | Per request |
| `DOC_DIP_DUP` | 2nd Copy of Diploma | ₱50.00[cite: 1] | ₱30.00[cite: 1] | Fixed fee + ₱30.00 docstamp[cite: 1] |
| `DOC_F137` | Permanent Record (Form 137 / 137-A)[cite: 1, 2] | ₱50.00[cite: 1] | None | Fixed fee |
| `DOC_OTR` | Official Transcript of Record (OTR)[cite: 1, 2] | ₱50.00[cite: 1] | ₱30.00[cite: 1] | (Page Count $\times$ ₱50.00) + ₱30.00 docstamp[cite: 1] |

---

### Category B: Paid Academic & Enrollment Adjustments (Ticket Prefix: `ENR-`)
Forms that require processing fees alongside academic evaluation.

| Service Code | Transaction Name | Fee | Prerequisite Workflow |
| :--- | :--- | :--- | :--- |
| `ENR_CAD` | Changing, Adding, Dropping Form[cite: 1, 2] | ₱50.00[cite: 1] | Program Chair / Dean endorsement |
| `ENR_COMP` | Completion Form[cite: 1, 2] | ₱50.00[cite: 1] | Instructor grade entry & signature |
| `ENR_SPEC_EX` | Special Examination Permit[cite: 1, 2] | ₱50.00[cite: 1] | Dean approval verification |

---

### Category C: Non-Fee Academic Submissions & Evaluations (Ticket Prefix: `ADM-`)
Administrative forms, clearances, and evaluations routed directly to review windows without cashier intervention.

* Application for Correction of Entries in School Records[cite: 2]
* Application for Graduation[cite: 2]
* Application for Leave of Absence (LOA)[cite: 2]
* Application for Opening of Subjects[cite: 2]
* Application for Overloading of Units[cite: 2]
* Application for Shifting / Program Change[cite: 2]
* Application for Substitution of Subjects[cite: 2]
* Application for Taking Simultaneously Pre-requisite and Advance Subject[cite: 2]
* Complaints and Grievance Form[cite: 2]
* Equivalency Application Form[cite: 2]
* Final Clearance[cite: 2]
* Permit to Cross Enroll[cite: 2]
* Withdrawal of Registration Form[cite: 2]

---

## 5. End-to-End System Workflows

### Workflow 1: Paid Transactions (`DOC-` and `ENR-`)
```
[Self-Service Kiosk / Web]
       │
       ▼ Select Services & Enter Parameters (e.g., OTR page count)
[Assessment Engine] ───► Calculates Base Fee + Docstamps
       │
       ▼ Ticket Generated (Status: PAYMENT_PENDING)
[Cashier Counter]
       │
       ▼ Cashier Validates Payment ──► Ticket Marked: PAID
[Registrar Window Queue]
       │
       ▼ Window Officer Calls Ticket via Dashboard (Status: SERVING)
[Processing & Verification]
       │
       ▼ Window Officer Finalizes Hand-off
[Status: COMPLETED]
```

### Workflow 2: Free Academic & Administrative Evaluation (`ADM-`)
```
[Self-Service Kiosk / Web]
       │
       ▼ Select Service (e.g., Shifting, LOA, Clearance)
[Ticket Generated] ───► Status: QUEUED (Immediate Registrar routing)
       │
       ▼ Window Officer Calls Next Available Ticket
[Registrar Window] ───► Verifies signatures, updates student record
       │
       ▼ Complete / Transfer to Specialist Desk
[Status: COMPLETED / FOR_ESCALATION]
```

---

## 6. Functional Requirements (FRD)

### Module 1: Self-Service Kiosk & Check-in
* **FR-1.1 Service Selection:** Touch-friendly catalog structured by primary transaction category: Credentials, Enrollment Modifications, and Clearances/Forms.
* **FR-1.2 Dynamic Input Capture:** Collect Student ID number, student name, and specific transaction attributes (e.g., estimated page counts for OTR requests)[cite: 1].
* **FR-1.3 Automated Assessment Slip:** Instantly compute total fees, including base service charges and mandatory ₱30.00 documentary stamps for applicable records[cite: 1].
* **FR-1.4 Ticket Dispatch:** Print an automated thermal ticket (or display on-screen QR code for paperless check-in) containing:
  * Alphanumeric Ticket Number (e.g., `DOC-1024`, `ENR-0412`, `ADM-0881`)
  * Selected Service Names and Assessed Breakdown
  * Static QR Code linking directly to the real-time mobile tracking view
  * Timestamp and preceding queue count

### Module 2: Cashier Integration Module
* **FR-2.1 Payment Queue View:** Dedicated Cashier UI listing all tickets flagged as `PAYMENT_PENDING`.
* **FR-2.2 Rapid Clearance:** Cashier inputs the ticket number or scans the ticket barcode/QR code, verifies cash/receipt details, and clicks **Confirm Payment**.
* **FR-2.3 Queue Handoff:** Once cleared, the system transitions ticket status from `PAYMENT_PENDING` to `PAID`, automatically transferring the ticket into the active Registrar Counter pool.

### Module 3: Registrar Counter Management Console
* **FR-3.1 Next Ticket Dispatch:** "Call Next" button automatically pulls the highest-priority ticket assigned to that window's service profile.
* **FR-3.2 Queue State Controls:** Counter officers can:
  * **Call / Recall:** Trigger an audio announcement chime and flash the ticket on public screens.
  * **Hold:** Place a student on temporary hold (e.g., missing documentary attachment or pending signatures) without discarding the ticket.
  * **Transfer:** Route a ticket to another designated window (e.g., transferring from Records Evaluation to Clearance).
  * **Complete:** Mark the request as fulfilled and clear the counter.
  * **No-Show:** Cancel ticket if the student does not report after a configurable number of recalls (default: 3 recalls).

### Module 4: Audio-Visual Lobby Display & Mobile Queue Tracker
* **FR-4.1 Lobby TV Display Layout:**
  * Grid showing active counters (e.g., *Window 1: OTR & Diplomas*, *Window 2: Enrollment Forms*, *Window 3: Clearances & Records*).
  * Prominent display of "Now Serving" ticket numbers matched to specific window numbers.
  * Running list of upcoming tickets ("Next in Line").
  * Scrolling ticker for university announcements and registrar reminders.
* **FR-4.2 Automated Sound Alerts:** Multi-tone chime accompanied by synthetic Voice/Text-to-Speech (TTS) (e.g., *"Now serving: Ticket D-O-C 1 0 2 4 at Window 1"*).
* **FR-4.3 Mobile Web Queue Viewer:** Zero-install web page loaded via ticket QR code featuring:
  * Current ticket being served vs. student's personal ticket number.
  * Live number of people ahead in line.
  * Visual push banner when student is within the top 3 spots in line.

### Module 5: Administrative Dashboard & Analytics
* **FR-5.1 Live Monitoring:** Real-time visibility into active window statuses (Online, Busy, Paused, Idle), total queued students, and longest waiting times.
* **FR-5.2 Dynamic Routing Management:** Ability to assign or re-assign specific service categories to different counters on the fly (e.g., during enrollment peaks, assign Windows 1, 2, and 3 entirely to `ENR_CAD`).
* **FR-5.3 Performance Reporting:** Exportable reports (CSV, PDF) detailing:
  * Total transactions processed broken down by form/service code.
  * Average Queue Wait Time (AQWT) vs. Average Service Handling Time (ASHT).
  * Peak traffic volume hours and days across the semester.
  * Counter agent resolution rate and abandonment/no-show rate.

---

## 7. Data Architecture & Entity Design

### Relational Schema Blueprint

```
       ┌────────────────────────┐
       │        services        │
       ├────────────────────────┤
       │ id (PK)                │
       │ code (VARCHAR)         │
       │ name (VARCHAR)         │
       │ category (ENUM)        │
       │ base_fee (DECIMAL)     │
       │ requires_docstamp(BOOL)│
       │ docstamp_fee (DECIMAL) │
       │ is_per_page (BOOL)     │
       └───────────┬────────────┘
                   │ 1
                   │
                   │ N
       ┌───────────┴────────────┐            ┌────────────────────────┐
       │      ticket_items      │            │        tickets         │
       ├────────────────────────┤            ├────────────────────────┤
       │ id (PK)                │ N        1 │ id (PK)                │
       │ ticket_id (FK) ────────┼────────────┤ ticket_number (VARCHAR)│
       │ service_id (FK)        │            │ student_id (VARCHAR)   │
       │ quantity_pages (INT)   │            │ student_name (VARCHAR) │
       │ computed_fee (DECIMAL) │            │ total_assessed(DECIMAL)│
       └────────────────────────┘            │ payment_status (ENUM)  │
                                             │ queue_status (ENUM)    │
                                             │ counter_id (FK)        │
                                             │ created_at (TIMESTAMP) │
                                             │ called_at (TIMESTAMP)  │
                                             │ completed_at(TIMESTAMP)│
                                             └───────────┬────────────┘
                                                         │ N
                                                         │
                                                         │ 1
                                             ┌───────────┴────────────┐
                                             │        counters        │
                                             ├────────────────────────┤
                                             │ id (PK)                │
                                             │ counter_number (INT)   │
                                             │ label_name (VARCHAR)   │
                                             │ assigned_staff_id (FK) │
                                             │ status (ENUM)          │
                                             │ allowed_categories(ARR)│
                                             └────────────────────────┘
```

### Key Field Enums
* `services.category`: `['CREDENTIAL_DOCUMENT', 'ENROLLMENT_CHANGE', 'ADMINISTRATIVE_FORM']`
* `tickets.payment_status`: `['NOT_APPLICABLE', 'PAYMENT_PENDING', 'PAID']`
* `tickets.queue_status`: `['QUEUED', 'SERVING', 'ON_HOLD', 'COMPLETED', 'TRANSFERRED', 'NO_SHOW']`
* `counters.status`: `['OPEN', 'BUSY', 'ON_BREAK', 'CLOSED']`

---

## 8. Non-Functional Requirements (NFR)

* **Performance & Real-Time Sync:**
  * Queue status state updates must propagate from counter consoles to public displays and mobile views within $\le 400\text{ ms}$ over WebSockets.
  * Support concurrent load of at least 500 active mobile tracking sessions without UI latency degradation.
* **Offline Resilience:**
  * Local Area Network (LAN) fallback capability: If external internet connectivity drops, ticket printing, counter dispatch, and lobby displays must continue functioning uninterrupted via local intranet server hosting.
* **Usability & Accessibility:**
  * Kiosk touch interface must feature clear typography, high-contrast layouts, and minimal navigation levels ($\le 2\text{ taps}$ to select a form).
  * Display monitor text must be readable from a distance of at least 10 meters on standard 50-inch screens.
* **Security & Compliance:**
  * Minimal PII retention: Display screens and public URLs must display masked names or ticket identifiers only (e.g., `DOC-1024 - Mark C.`).
  * Role-based access control (RBAC) enforced on administrative and configuration portals.

---

## 9. Rollout Phases & Project Roadmap

```
Phase 1: Foundation (Weeks 1-3)
├── Setup centralized relational database and service catalog schema
├── Build core queue logic, ticket numbering state engine, and counter console
└── Implement local thermal printer integration and touch kiosk layout

Phase 2: Cashier Integration & Displays (Weeks 4-6)
├── Deploy automated fee calculation engine (Docstamps, OTR multipliers)
├── Build Cashier verification and payment handoff view
└── Develop Lobby TV dashboard with WebSocket event synchronization and audio chime

Phase 3: Remote Mobile Tracking & Pilot Testing (Weeks 7-9)
├── Build lightweight QR-code mobile web queue tracker
├── Conduct load testing under simulated enrollment peak volumes
└── End-to-end pilot run at the Registrar Office for mid-term credential releases

Phase 4: Analytics, Hardening & Institutional Rollout (Weeks 10-12)
├── Deploy Administrative analytics dashboard and historical reporting
├── Implement LAN failover configuration for zero-downtime operation
└── Staff training and full deployment for general semester enrollment
```