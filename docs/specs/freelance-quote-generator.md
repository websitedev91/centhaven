# Tool spec: Freelance Quote Generator

> **Approved by Puru, 2026-11-18.** Includes Puru's plan additions: local-rules note, no embed, next-number suggestion, invoicing-software affiliate slot.

| Field | Value |
|---|---|
| Slug | `freelance-quote-generator` |
| Category | `freelance` |
| Risk | 🟢 green: adds up the user's own numbers; no rates |
| Main keyword | `freelance quote generator` (10–100/month) |
| Long-tail keywords | `project quote calculator`, `free estimate generator for freelancers`, `freelance project price calculator` |
| Affiliate | `invoicing-software` (disabled until approved; the slot renders nothing) |
| Related tools | from the keyword map: `freelance-invoice-generator`, `website-design-cost-calculator`, `hourly-rate-calculator` (only live ones are shown) |

## What it does
You fill in your details, the client, line items (description × quantity or hours × rate) and optional contingency, discount and tax lines. The tool adds everything up and shows a clean quote document. **Download PDF** opens the browser's print dialog, and a print stylesheet prints only the document (A4 or Letter, whichever the browser uses) so the user can "Save as PDF".

## Shared rules for the quote and invoice generators
1. **Nothing personal in the URL.** GTM/GA4 records page URLs, so names, addresses, line items and bank details are never written to the query string. The Share button is hidden for these two tools.
2. **Local draft.** The form is saved in `localStorage` on this device only. Every read and write is wrapped in try/catch, and the page works the same if storage is blocked. A **Clear form** button deletes the draft. A **Start a new quote** button keeps "Your details" (and, on the invoice, payment details and logo), clears the client and items, and suggests the next number. The Privacy page gets one sentence about this (Puru approves the wording).
3. **Next-number suggestion** (`nextDocNumber`, pure, in `lib/doc-calc.ts`): it increases the last run of digits and keeps zero padding. The number field is always editable.
   - `Q-0001 → Q-0002`, `Q-0099 → Q-0100`, `Q-9999 → Q-10000`, `2026-014 → 2026-015`
   - no digits: `ABC → ABC-2`
   - empty: the default `Q-0001` (invoice `INV-0001`)
4. **No embed.** The "Get embed code" action is hidden and no `/embed/<slug>` page is built for this tool (a flag on the tool, `embed: false`; static params and the actions row respect it; a test checks this).
5. **Local-rules note**, shown next to the Download PDF button and repeated in the FAQ: "This is a simple quote. If you add tax, some countries have rules on how it must be shown (for example GST in India or VAT in the UK/EU). Check your local rules."
6. **Tax is never suggested.** The tax line has a user label (default "Tax") and a % that starts at **0**.
7. **Rounding (needs Puru's approval: an exception to CLAUDE.md rule 3).** A document must add up on paper, so `lib/doc-calc.ts` rounds each line total, and then each of contingency, discount and tax, to 2 decimals with `roundTo` from `lib/format.ts` before summing. Every other tool still rounds only at display.
8. **No CentHaven footer on the document** (proposed). The document stays clean and professional. The page around it carries the brand.
9. Line items: 1–30 rows. Description ≤ 200 characters. Quantity 0 – 100,000 (2 decimals). Rate 0 – 10,000,000 (2 decimals). Rows can be added, removed and moved up/down with buttons, all keyboard-operable and labelled.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| Currency | select | USD | standard list; INR uses Indian grouping |
| Your details | name, email, phone, address (multi-line), tax/business ID | empty; placeholders only | All optional |
| Client | name, company, address, email | empty | |
| Quote number | text | `Q-0001`, or the next number after "Start a new quote" | ≤ 30 characters |
| Issue date | date | today (browser date) | |
| Valid for | days | 30 | 1 – 365 |
| Project title | text | empty | Optional, shown under the heading |
| Line items | rows | 1 example row: "Design and build" · 10 · rate preset | |
| Contingency | % | 0 | 0 – 50. Shown as a line only if above 0. Helper: "Optional extra for unknowns. Many freelancers build this into the line items instead." |
| Discount | % | 0 | 0 – 100. Shown only if above 0 |
| Tax | label + % | "Tax" · 0 | 0 – 100. Shown only if above 0 |
| Notes / terms | multi-line | "Payment terms: 50% to start, 50% on delivery." (example, editable) | ≤ 2,000 characters |

### Currency defaults
The rate of the example line item follows the currency until it is edited (`switchCurrency`). Example values only.

| Currency | Example line rate |
|---|---|
| USD | 75 |
| CAD | 85 |
| AUD | 90 |
| GBP / EUR | 60 |
| INR | 1,500 |

## Outputs
| Output | How it's shown |
|---|---|
| **Quote total** | Main result card above the document |
| Subtotal · Contingency · Discount (−) · Tax · **Total** | Totals block in the document (zero lines hidden) |
| Valid until | `issueDate + validDays` (via `lib/dates.ts addDays`), shown on the document |
| Quote document | `DocumentPreview`: heading "Quote" + number, dates, From / To, items table (description, qty, rate, amount), totals, notes |
| Actions | **Download PDF** (print, GTM event `download_pdf`) · Start a new quote · Clear form; local-rules note beside them |

## Formula
```
line       = roundTo(qty × rate)
subtotal   = Σ line
contingency = roundTo(subtotal × contingency%)
discount   = roundTo((subtotal + contingency) × discount%)
taxable    = subtotal + contingency − discount
tax        = roundTo(taxable × tax%)
total      = taxable + tax
validUntil = issueDate + validDays (calendar days)
```

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | USD · Design 10 × 75 · Development 20 × 75 · Hosting setup 1 × 120 · contingency 10% · discount 5% · tax 0 · issue 2026-11-18 · valid 30 | lines 750.00 / 1,500.00 / 120.00 · subtotal 2,370.00 · contingency 237.00 · discount 130.35 · tax hidden · **total 2,476.65** · valid until **18 December 2026** | Manual |
| 2 | INR · Logo design 1 × 15,000 · Brand guide 1 × 8,000 · Revisions 3 × 1,500 · tax "Tax" 10% | subtotal 27,500.00 · tax 2,750.00 · **total 30,250.00** (₹30,250.00) | Manual |
| 3 | GBP · 1.5 × 33.33 · 2 × 19.99 · discount 10% · tax 20% | lines 50.00 (49.995 rounds up) / 39.98 · subtotal 89.98 · discount 9.00 · taxable 80.98 · tax 16.20 · **total 97.18** | Manual |
| 4 | All rows qty 0, or one empty row | total 0.00, no crash, no NaN | — |
| 5 | Issue 2026-01-31, valid 30 | valid until **2 March 2026** | Manual |
| 6 | `nextDocNumber`: the examples in shared rule 3 | exactly as listed | Manual |
| 7 | Switch USD → INR with the example row unedited | rate 75 → 1,500. An edited rate is kept | Manual |

## Extras
- Chart: none.
- Scenario compare: no.
- Share: hidden (privacy). Print: yes, via Download PDF. Embed: **no**.

## Content notes
- Examples: case 1 (US web project with contingency and a repeat-client discount), case 2 (Indian brand-design quote with a tax line), a short "quote vs estimate" example.
- FAQ (7): the 5 keyword-map questions + "Is my quote saved or sent anywhere?" (no: it stays in this browser) + "Do I need to add tax to a quote?" (carries the local-rules note).
- Tips: break the work into clear deliverables, state what is not included, set a validity date, write down the number of revision rounds, link to the hourly rate and website design cost tools.
- Internal links: from the keyword map.
