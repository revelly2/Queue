---
name: QueUA — The Registrar's Vellum
description: Editorial paper-and-ink registrar queue system with kinetic serif headlines.
colors:
  vellum: "#f4f3ee"
  vellum-dim: "#eceae2"
  ink: "#151513"
  ink-soft: "#2a2a26"
  graphite: "#6d6d66"
  chalk-line: "#d7d6cf"
  acid-lime: "#d6ff3f"
  electric-blue: "#3458f4"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  sm: "3px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.vellum}"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.vellum}"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1rem"
  button-accent:
    backgroundColor: "{colors.electric-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1rem"
  button-acid:
    backgroundColor: "{colors.acid-lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1rem"
  card:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.55rem 0.75rem"
  pill:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1rem 0.6rem"
---

# Design System: QueUA — The Registrar's Vellum

## Overview

**Creative North Star: "The Registrar's Vellum"**

QueUA looks like the records office of a university rendered as a calm editorial object: a warm sheet of vellum, near-black ink, hairline rules, and a kinetic serif headline that reads like the title of a document. It is an Operate system — kiosks, cashier and counter consoles, a lobby board, dashboards — so the interface recedes and the work (the queue, the ticket, the number being served) leads. Authority and calm come first; expression lives in precise typography and the discipline of a single 1px line.

Against that quiet ground, color is used **generously** and purposefully: electric blue carries interaction and wayfinding, acid-lime is the system's signature spark. The pairing keeps the institution legible and fast under peak-period load while still feeling distinct rather than generic-admin. The public lobby display inverts the whole world — ink ground, paper text, acid highlights — so it reads across a room.

The anti-reference is the default SaaS dashboard: cool gray-on-white, drop-shadowed cards, rounded-everything, blue-600 buttons. The Registrar's Vellum rejects that entirely — warm paper instead of white, hairlines instead of shadows, near-square corners instead of pills, serif display instead of another sans headline.

**Key Characteristics:**
- Warm vellum ground (#f4f3ee), never pure white as the page.
- Instrument Serif for display; Geist for UI; Geist Mono for every label, eyebrow, and number.
- Flat by default — structure is drawn with a single hairline rule, not elevation.
- Near-square 3px corners; pills reserved for status only.
- Generous, deliberate accents: electric blue for action, acid-lime as signature.

## Colors

A warm, low-chroma paper-and-ink base carrying two high-energy accents.

### Primary
- **Electric Blue** (#3458f4): The interactive accent. Primary buttons that aren't the ink-filled default, links, "Enter →" affordances, the Call Next action, focus rings, and selected/active wayfinding. Used freely wherever something is actionable.
- **Acid-Lime** (#d6ff3f): The signature spark. Text selection highlight, the "Enable announcements" button and the "Now Serving." accent dot on the lobby display, active-state emphasis. The one color nobody expects in a registrar app, and the thing that makes it ours.

### Neutral
- **Vellum** (#f4f3ee): The page ground on every surface. Warm, slightly aged paper.
- **Vellum Dim** (#eceae2): Hover fills, inset panels, the staff sidebar, and quiet secondary surfaces one step down from the page.
- **Ink** (#151513): Near-black primary text, the filled default button, and the entire lobby-display ground.
- **Ink Soft** (#2a2a26): Hover state for ink-filled buttons.
- **Graphite** (#6d6d66): Secondary and muted text, eyebrows, metadata, de-emphasized labels.
- **Chalk Line** (#d7d6cf): The one hairline. Every border, divider, field stroke, and cell rule is this 1px color.

### Named Rules
**The Paper Ground Rule.** Every page sits on Vellum (#f4f3ee), never on pure white. White (#ffffff) is reserved exclusively for the interior of input fields, so a field reads as a cut-out in the paper.

**The Generous Accent Rule.** Accents are used liberally for affordance and wayfinding, not rationed — electric blue marks anything actionable, acid-lime carries signature and emphasis. What keeps the system calm is the neutral ground doing the heavy lifting, not scarcity of color.

**The Status-Color Exception.** Beyond the brand accents, three semantic status colors are permitted *only* to carry meaning in state: amber for on-hold/awaiting, red for destructive/error, green for success/now-serving confirmation. They never decorate.

## Typography

**Display Font:** Instrument Serif (fallback Georgia, serif)
**Body / UI Font:** Geist (fallback ui-sans-serif, system-ui)
**Label / Mono Font:** Geist Mono (fallback ui-monospace)

**Character:** A high-contrast editorial serif for the few big moments, a clean neutral grotesque for everything operational, and a monospace that stamps labels and numbers like a register. The serif supplies warmth and voice; Geist keeps dense dashboards legible; the mono makes ticket numbers and metrics feel official and tabular.

### Hierarchy
- **Display** (Instrument Serif, 400, clamp(2.25rem → 6rem), line-height 1.02, tracking −0.015em): Page titles and hero moments — "QueUA", "Sign in", the lobby "Now Serving.". Often animated in (see kinetic rule).
- **Headline** (Geist, 700, ~1.5rem): Console/board page headings like "Counter Console", "Cashier — Payment Clearance".
- **Title** (Geist, 600, ~1.125rem): Card titles, ticket numbers in lists, row headers.
- **Body** (Geist, 400, 1rem / 1.5): Default running text and controls.
- **Label** (Geist Mono, 500, 0.6875rem, tracking 0.18em, UPPERCASE): Eyebrows, section kickers ("NOW SERVING", "NEXT IN LINE"), metadata, role chips.

### Named Rules
**The Serif Display Rule.** Only Instrument Serif carries display type. Geist never plays the hero; a second sans headline is a failure of the system.

**The Mono Eyebrow Rule.** Every eyebrow, field label, status chip, and above all every ticket number and metric is Geist Mono, uppercase for labels and tabular-nums for figures. Numbers are register entries, not body text.

## Layout

A centered editorial column, not a full-bleed dashboard. Content surfaces cap at a readable measure (max-width ~48rem / `max-w-3xl` for consoles and admin, narrower for forms and the tracker) and center on the vellum ground with a 16px side gutter on phones. The staff area is a two-pane shell: a fixed 14rem (`w-56`) Vellum-Dim sidebar with a single hairline on its right edge, and a fluid content column. Spacing follows a 4px base rhythm (4/8/16/24/32); sections separate with vertical space and hairline rules rather than boxes-within-boxes. The lobby display breaks the column model: it is full-bleed, dark, and laid out as a responsive card grid (1 → 2 → 3 columns) sized for distance reading. Everything stays single-column and comfortable at phone width; no horizontal scroll.

## Elevation & Depth

Flat by default. The system conveys depth through **tonal layering and a single hairline**, not shadows: the page is Vellum, a surface one step up is near-white/Vellum, a quiet panel steps down to Vellum-Dim, and a 1px Chalk-Line border separates planes. There is no ambient card shadow vocabulary.

### Shadow Vocabulary (the one exception)
- **Focus ring** (`box-shadow: 0 0 0 3px color-mix(in srgb, #3458f4 18%, transparent)` plus a solid blue border): the only "shadow" in the system, used on focused input fields. Keyboard focus elsewhere is a 2px solid Electric Blue outline offset 2px.

### Named Rules
**The Hairline Rule.** Structure is drawn with one 1px Chalk-Line (#d7d6cf) border. Surfaces are flat at rest; if you reach for a drop shadow to separate two things, use a rule or a tonal step instead.

## Shapes

Near-square and editorial. The global corner radius is a barely-there **3px** (`--radius`) applied uniformly to buttons, cards, fields, and panels — enough to avoid a hard CAD edge, far from a friendly rounded-SaaS look. The only full-round shape is the **pill** (999px), reserved exclusively for status chips. Borders are always 1px Chalk-Line. The lobby grid relaxes to a slightly larger soft corner for distance legibility, but the near-square language holds everywhere a user is up close.

## Components

### Buttons
- **Shape:** near-square (3px radius), 1px transparent border by default, padding `0.55rem 1rem`, 0.875rem/weight-500 Geist, `translateY(1px)` on `:active`.
- **Primary (default):** Ink fill (#151513), Vellum text — the quiet authoritative default. Hover → Ink-Soft (#2a2a26).
- **Accent:** Electric Blue fill, white text — the loud call to action (Call Next, Confirm). Hover brightens ~8%.
- **Acid:** Acid-Lime fill, Ink text — the signature button (e.g. "Enable announcements" on the dark board).
- **Ghost:** transparent with a Chalk-Line border and Ink text; hover fills Vellum-Dim. Used for secondary actions (Sign out, Create login).
- **Danger:** transparent, muted-red text and border; hover fills a pale red. Destructive only.

### Chips
- **Status pill:** full-round (999px), Geist Mono, uppercase, 0.08em tracking, 0.6875rem. Tinted by state using the semantic status colors (green OPEN, blue BUSY, amber ON_BREAK, graphite CLOSED). Decorative pills are not allowed.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** Vellum, sitting a hair above the page; the staff sidebar and quiet panels use Vellum-Dim.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px Chalk-Line.
- **Internal Padding:** 16–24px (`md`–`lg`). Grouped lists use a 1px-gap hairline grid (a Chalk-Line background showing through 1px gaps between Vellum cells) for the portal/landing cards.

### Inputs / Fields
- **Style:** white (#ffffff) interior cut into the paper, 1px Chalk-Line stroke, 3px radius, padding `0.55rem 0.75rem`.
- **Focus:** border shifts to Electric Blue + a 3px soft-blue glow ring. No other state uses a glow.
- **Label:** a Geist Mono uppercase eyebrow sits above the field.

### Navigation (staff sidebar)
- **Style:** Vellum-Dim pane, hairline right edge, serif "QueUA" wordmark at top. Links are Geist, 0.875rem, 3px radius.
- **States:** active link is Ink-filled with Vellum text; idle links are Ink text that fill Vellum on hover. The signed-in identity and a Mono role eyebrow sit pinned at the bottom with a Ghost "Sign out".

### Lobby Display (signature surface)
The one inverted world: Ink ground, paper-toned text, Acid-Lime accents. Serif "Now Serving." with an acid period, a responsive grid of counter cards (a serving card is bordered and tinted Acid-Lime), huge Geist Mono ticket numbers for distance reading, and a hairline marquee ticker along the bottom. Sized to be read at ~10 m.

## Do's and Don'ts

### Do:
- **Do** put every surface on the Vellum ground (#f4f3ee) and reserve pure white for input interiors only.
- **Do** set page/hero titles in Instrument Serif and everything operational in Geist; set all labels, eyebrows, ticket numbers, and metrics in Geist Mono (uppercase for labels, tabular-nums for figures).
- **Do** separate planes with a single 1px Chalk-Line (#d7d6cf) border or a tonal step to Vellum-Dim.
- **Do** use Electric Blue for anything actionable and Acid-Lime as the signature accent, freely and purposefully.
- **Do** keep corners near-square (3px); use the 999px pill only for status chips.
- **Do** invert to the Ink ground + Acid-Lime world for the public lobby display, and respect `prefers-reduced-motion` on the kinetic headline and marquee.

### Don't:
- **Don't** use drop shadows to float cards; this system is flat — reach for a rule or a tonal step.
- **Don't** render a second sans-serif headline or let Geist play display; the serif owns that register.
- **Don't** introduce cool grays or pure-white page backgrounds — that is the generic-SaaS anti-reference.
- **Don't** let the semantic status colors (amber/red/green) decorate; they appear only to carry state meaning.
- **Don't** round everything into pills; pills are for status only.
