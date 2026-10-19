---
name: QueUA — University of Abra (Lagangilang Main Campus)
description: Official institutional registrar design system aligned with the University of Abra seal — featuring University Royal Blue (#0038A8), Academic Emerald Green (#008837), Collegiate Crimson (#991B1B), and crisp scholastic surfaces.
colors:
  royal-dark: "#002776"
  royal: "#0038a8"
  royal-hover: "#002d85"
  royal-light: "#eef4ff"
  emerald: "#008837"
  emerald-dark: "#00682a"
  emerald-light: "#ecfdf5"
  crimson: "#991b1b"
  crimson-dark: "#7f1d1d"
  crimson-light: "#fef2f2"
  crimson-border: "#fecaca"
  surface: "#ffffff"
  bg-ground: "#f8fafc"
  ink: "#0f172a"
  ink-soft: "#334155"
  muted: "#64748b"
  line: "#e2e8f0"
  display-bg: "#04143a"
typography:
  display:
    fontFamily: "var(--font-jakarta), system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "var(--font-jakarta), system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.025em"
  title:
    fontFamily: "var(--font-jakarta), system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "var(--font-jakarta), system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
---

# Design System: QueUA — University of Abra (Lagangilang Main Campus)

## Identity & Purpose
QueUA is the official Registrar Queue Management System for the **University of Abra (Lagangilang Main Campus)**. The visual system directly reflects the official university seal:
- **Collegiate Crimson (`#991B1B` / `#7F1D1D`)**: Primary action and vitality color derived from the seal's orbital rings and core heraldry — applied to primary CTAs, e-Ticket passes, live tracking numbers, and varsity student apparel (deep, dignified, non-bright red).
- **University Royal Blue (`#0038A8` / `#002776`)**: Authority color for institutional headers, campus badges, and display boards.
- **Academic Emerald Green (`#008837`)**: Secondary institutional color drawn from the core diamond (`INSTRUCTION • RESEARCH • EXTENSION • PRODUCTION`).
- **Scholastic Ground (`#F8FAFC` & `#FFFFFF`)**: Crisp, modern university interface surface.

## Surfaces & Modes
- **Portal (`/`)**: Institutional landing featuring the transparent official University of Abra (Lagangilang Main Campus) logo, student mobile booking, and active counter status.
- **Mobile Web Booking (`/book`, `/kiosk`)**: Online phone-based queue booking with transparent seal, instant fee computation, and digital mobile e-Pass issuance.
- **Tracker (`/track/[ticket]`)**: Student mobile companion with real-time queue position and window directions.
- **Display (`/display`)**: Distance-readable high-contrast lobby board in deep Royal Blue (`#04143A`) with crimson serving accents and chime alerts.
- **Staff Portal (`/login`, `/counter`, `/cashier`, `/admin`)**: Window dispatch console with University of Abra branding.
