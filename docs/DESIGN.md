# CentHaven — Design System v2 ("Ledger")

Applies to **every page**: header, footer, homepage, category hubs, tool pages, static pages, embed.
Replaces PRD §10. If anything here conflicts with PRD §10, this file wins.

---

## 1. The idea

CentHaven should feel like a **precise financial instrument**: calm, exact and trustworthy, like a well-made banking app or a good accountant's ledger. It should not feel like a flashy startup.

**Premium here comes from typography, spacing, precise numbers and small details. It does not come from effects.**
No gradients-as-decoration, no glassmorphism, no stock photos, no scroll animations, no fake stats or testimonials.

**The one memorable thing:** the **result number**. Big, tabular, crisp, with a brass underline. Every page leads to a number you can trust, and the design spends its boldness there. Everything around it stays quiet.

---

## 2. Colour

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F6F8F7` | Page background (cool, slightly green-grey white, **not** cream) |
| `surface` | `#FFFFFF` | Calculator panels, menus |
| `ink` | `#12302B` | Headings and body text (deep evergreen, instead of black) |
| `ink-muted` | `#4F6661` | Secondary text, helper text |
| `line` | `#D7E2DE` | Borders, dividers, input outlines |
| `haven` | `#0F766E` | Primary: links, buttons, slider fill, focus ring |
| `haven-deep` | `#0B5952` | Button hover/active |
| `mint` | `#E4F2EE` | Result panel background, selected states |
| `brass` | `#B8862B` | **Only** the result underline and a few key highlights (never buttons) |
| `danger` | `#B42318` | Errors |
| `footer-bg` | `#12302B` | Footer background (ink) |

Rules: text contrast AA minimum. Brass is rare; if it's everywhere, it's wrong. No shadows except the open menu/sheet; use borders instead.

---

## 3. Typography

- **One family: "Schibsted Grotesk"** (Google Fonts, variable, via `next/font`, `display: swap`, latin subset only). It's sharp and editorial with confident numerals, and loading one font keeps pages fast.
- **All numbers use `font-variant-numeric: tabular-nums`** so digits line up in results and tables.
- Sentence case everywhere. **No ALL-CAPS labels, no tracked-out eyebrow text above headings, no "→" arrows appended to buttons.**

| Style | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 56/60 desktop, 38/42 mobile | 700, tracking -0.02em | Homepage headline only |
| `h1` | 40/46 desktop, 30/36 mobile | 700, tracking -0.015em | Page titles |
| `h2` | 26/32 | 650 | Section titles |
| `h3` | 19/26 | 650 | Sub-sections, FAQ questions |
| `body` | 17/28 | 400 | Content (max line length **68ch**) |
| `small` | 14/20 | 450 | Helper text, labels |
| `result` | 64/64 desktop, 48/52 mobile | 700, tabular, tracking -0.03em | **The main result number** |
| `figure` | 17/24 | 550, tabular | Numbers in breakdown tables |

---

## 4. Shape, spacing, layout

- **Radius hierarchy** (not one radius on everything): inputs and buttons `6px`, panels `12px`, pills/tags `999px`.
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 72, 112. Sections on long pages are separated by **72–112px**; generous white space is the main "premium" signal.
- Container: max-width **1200px**, side padding 24px (16px mobile).
- Content is **left-aligned**. Centre alignment only for short single lines (e.g. the 404 page).
- Grid: 12 columns desktop, 4 columns mobile.

---

## 5. Components (refine every existing one to this spec)

**Inputs:** 48px tall, `line` border, 6px radius, unit shown inside the field (₹, $, "weeks", "%"). Focus: 2px `haven` ring + 2px offset. Labels above in `small` 550 weight; helper text below in `ink-muted`.

**Sliders:** 4px track in `line`, filled part in `haven`, 20px white thumb with `haven` border; the value is shown next to the label and is editable by typing.

**Result panel:** `mint` background, 12px radius, no shadow. The main number uses the `result` style with a **3px `brass` underline** offset 6px below. Unit and period beside it in `small` ("per hour · INR"). The breakdown is a clean two-column table with `figure` numbers, right-aligned, thin `line` dividers.
On desktop the panel is **sticky** while the inputs scroll. On mobile, a slim sticky bar at the bottom shows the main result.

**Result change motion (the only automatic motion on the site):** when inputs change, the main number does a short 200ms crossfade/slide of the changing digits. Respect `prefers-reduced-motion` (instant change).

**Buttons:** Primary is solid `haven` with white text, 6px radius, 44px tall. Secondary is white with a `line` border. Text-only links are `haven` with an underline on hover. Labels say exactly what happens ("Copy share link", "Print or save as PDF", "Copy embed code").

**Tables (breakdowns, compare):** no zebra stripes; thin `line` row dividers; figures right-aligned, tabular.

**FAQ:** a list with thin dividers (not boxed cards); a plus icon rotates to a minus on open.

**Icons:** inline SVG, 1.75px stroke, 20px. No icon font, no icon library dependency.

---

## 6. Header (all pages)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [¢] CentHaven      Calculators ▾   Methodology   About     [Search ⌘K]│
└──────────────────────────────────────────────────────────────────────┘
```
- 68px tall, `surface` background. Gains a 1px `line` bottom border once scrolled. Sticky.
- **Logo:** a custom wordmark, "CentHaven" in Schibsted Grotesk 700, with a small mark: a cent sign (¢) inside a rounded square in `haven`. Inline SVG; it also becomes the favicon.
- **Calculators ▾** opens a **mega-menu** panel: one column per category that has live tools, listing up to 6 tool names each, plus "All {category} calculators". Built from `lib/registry.ts` (live tools only). Keyboard accessible, closes on Esc.
- **Search** (⌘K / Ctrl+K, or click): a command-palette dialog that searches live tool titles and keywords on the client side (no library; the registry is small). Results go straight to the tool.
- **Mobile:** logo + search icon + menu icon; the menu opens a full-height sheet with categories as an accordion.

---

## 7. Footer (all pages)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [¢] CentHaven                                                       │
│  Smart tools to earn, save and grow.                                 │
│                                                                      │
│  Calculators        Company           Legal                          │
│  Freelance          About             Disclaimer                     │
│  Fees & payments    Methodology       Privacy                        │
│  (live categories)  Contact           Terms                          │
│                                       Affiliate disclosure           │
│  ──────────────────────────────────────────────────────────────────  │
│  For estimates only. Not financial, tax or legal advice.             │
│  © 2026 CentHaven · Rates reviewed regularly, see Methodology.       │
└──────────────────────────────────────────────────────────────────────┘
```
- `footer-bg` (ink) background, white text, `#A9C2BC` for secondary text. Generous padding (72px top).
- Category links come from the registry (live categories only).

---

## 8. Homepage

The hero opens with the most characteristic thing on the site: **a live calculation.**

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Know your numbers                 ┌──────────────────────────────┐  │
│  before you decide.                │ What should you charge        │  │
│                                    │ per hour?                     │  │
│  Free calculators for freelancers  │ Take-home goal [ $60,000   ]  │  │
│  and anyone managing money.        │ Hours a week   [ 40 ]         │  │
│  Every rate checked against        │ ───────────────────────────── │  │
│  official sources.                 │  $62.32 per hour              │  │
│                                    │  ═══════ (brass underline)    │  │
│  [ Browse calculators ]            │  Open full calculator         │  │
│                                    └──────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│  Calculators by category  (an index list, not identical cards)       │
│  Freelance ........ Set your rates, price projects ........ 12 tools │
│  Fees & payments .. See what PayPal, Wise and Upwork take ..  8 tools│
│  (one row per live category, whole row clickable)                    │
├──────────────────────────────────────────────────────────────────────┤
│  Most used calculators: 6 tool links in a 3×2 grid of simple rows    │
├──────────────────────────────────────────────────────────────────────┤
│  How we check every number (a real sequence, so numbering is OK)     │
│  1 Official sources  2 Tested against official calculators           │
│  3 Expert review for tax tools  4 Updated on a published calendar    │
│  [ Read our methodology ]                                            │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                               │
└──────────────────────────────────────────────────────────────────────┘
```
- The hero mini-calculator reuses the hourly-rate `calc.ts` (2 inputs; other values use the defaults) and links to the full tool. Currency follows a simple selector (default USD).
- **No** stock images, no illustrations of people, no "trusted by" logos, no invented user counts. Add real numbers only once they exist.
- Category rows and "most used" come from the registry (live tools only). Before launch they show whatever is live.

---

## 9. Other page types

**Category hub:** H1 + a 2–3 sentence intro, then the tool index as rows (name, one-line description, link), then a 300–500 word guide section about the topic, then FAQ.

**Tool page:** keep the PRD §6 order. Desktop layout: calculator (8 cols) + sticky result (4 cols). Below that, the content column (68ch) on the left and a **right rail** (sticky on desktop) with "On this page" links + related tools. That fills the empty right side.

**Static pages (About, Methodology, legal):** single 68ch column, clear headings, a "Last updated" date. Methodology is a key trust page: give it the same care as the homepage.

**404:** a centred short message plus search and links to the top categories.

**Embed (`/embed/[slug]`):** the calculator + result only, `surface` background, a small "Powered by CentHaven" link at the bottom. No header or footer.

---

## 10. Quality floor (must hold on every page)

- Lighthouse mobile: Performance ≥ 95, Accessibility ≥ 95, SEO 100, Best Practices ≥ 95.
- Initial JS on tool pages under **120 KB gzipped**; homepage under **100 KB**.
- One font file family only; no new dependencies without approval.
- Visible keyboard focus everywhere; menus and dialogs trap focus and close on Esc.
- `prefers-reduced-motion` respected.
- Works at 360px, 768px, 1280px and 1440px with no horizontal scroll.
- Dark mode: **not in v1** (it doubles the design work; revisit later).
