# Tool spec: Free Invoice Generator for Freelancers

> **Approved by Puru, 2026-11-18.** Built after the quote generator and reuses its shared pieces (`lib/doc-calc.ts`, `components/doc/*`).

| Field | Value |
|---|---|
| Slug | `freelance-invoice-generator` |
| Category | `freelance` |
| Risk | 🟢 green: adds up the user's own numbers; no rates |
| Main keyword | `free invoice generator for freelancers` (10–100/month) |
| Long-tail keywords | `freelance invoice template`, `multi currency invoice generator`, `invoice generator with gst` |
| Affiliate | `invoicing-software` (disabled until approved; the slot renders nothing) |
| Related tools | from the keyword map: `freelance-quote-generator`, `payoneer-vs-wise-fees`, `hourly-rate-calculator` (only live ones are shown) |

## What it does
It creates a professional invoice in any of the standard currencies, with an optional logo, a tax line, payment details and an "amount paid" line. **Download PDF** opens the print dialog, and only the invoice prints.

## Shared rules
All **shared rules 1–9 in `docs/specs/freelance-quote-generator.md`** apply (nothing personal in the URL, local draft, next-number suggestion, no embed, tax never suggested, per-line rounding, no CentHaven footer, line-item limits). The invoice versions are:

- Default number `INV-0001`, then `INV-0002`, … after **Start a new invoice**. "Start a new invoice" keeps your details, payment details and logo.
- **Local-rules note** next to Download PDF and in the FAQ (Puru's exact wording): "This is a simple invoice. Some countries require extra details on tax invoices (for example GST in India or VAT in the UK/EU). Check your local rules."
- No contingency line on invoices.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| Currency | select | USD | standard list |
| Logo | image file | none | PNG, JPG or SVG, ≤ 500 KB. Read in the browser as a data URL and kept only in the local draft, never uploaded. Remove button |
| Your details | name, email, phone, address, tax/business ID | empty | Optional |
| Bill to | name, company, address, email, client tax ID | empty | |
| Invoice number | text | `INV-0001` / next number | ≤ 30 characters |
| PO / reference | text | empty | Optional |
| Issue date | date | today (browser date) | |
| Payment terms | select | Net 14 | Due on receipt (0) · Net 7 · Net 14 · Net 30 · Net 60 · Custom (0 – 365 days) |
| Line items | rows | 1 example row: "Design and build" · 10 · rate preset | Same editor as the quote |
| Discount | % | 0 | 0 – 100 |
| Tax | label + % | "Tax" · 0 | 0 – 100 |
| Amount already paid | currency | 0 | 0 – total. Above the total → inline error "Amount paid is more than the total" |
| Payment details | multi-line | empty; placeholder "Bank name, account number, IBAN/SWIFT, or your PayPal / Wise email" | ≤ 1,000 characters |
| Notes | multi-line | "Thank you for your business." | ≤ 2,000 characters |

### Currency defaults
The same as the quote (the rate of the example line follows the currency until edited): USD 75 · CAD 85 · AUD 90 · GBP/EUR 60 · INR 1,500.

## Outputs
| Output | How it's shown |
|---|---|
| **Balance due** | Main result card ("Paid in full" when it is 0.00) |
| Subtotal · Discount (−) · Tax · **Total** · Amount paid (−) · **Balance due** | Totals block in the document (zero lines hidden, except Total and Balance due) |
| Due date | `issueDate + termDays` (`addDays`). "Due on receipt" shows the issue date |
| Invoice document | heading "Invoice" + number, logo, dates, terms, From / Bill to, items table, totals, payment details, notes |
| Actions | **Download PDF** · Start a new invoice · Clear form; local-rules note beside them |

## Formula
```
line     = roundTo(qty × rate)
subtotal = Σ line
discount = roundTo(subtotal × discount%)
taxable  = subtotal − discount
tax      = roundTo(taxable × tax%)
total    = taxable + tax
balance  = total − paid          (paid ≤ total, else validation error)
dueDate  = issueDate + termDays
```

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | USD · Website build 1 × 2,400 · Extra pages 3 × 150 · no discount, no tax · paid 1,000 · issue 2026-11-18 · Net 14 | subtotal 2,850.00 · **total 2,850.00** · paid 1,000.00 · **balance 1,850.00** · due **2 Dec 2026** | Manual |
| 2 | GBP · Consulting 12.5 × 80 · Travel 1 × 45.60 · tax "Tax" 20% · paid 0 · Due on receipt | subtotal 1,045.60 · tax 209.12 · **total 1,254.72** · balance 1,254.72 · due = issue date | Manual |
| 3 | INR · 2 × 25,000 · discount 10% · tax 5% · paid 47,250 · issue 2026-12-15 · Net 30 | discount 5,000.00 · taxable 45,000.00 · tax 2,250.00 · **total 47,250.00** · **balance 0.00 → "Paid in full"** · due **14 Jan 2027** | Manual |
| 4 | Paid 3,000 on a 2,850.00 total | Inline error, no negative balance | — |
| 5 | `nextDocNumber('INV-0001')` / `('INV-0099')` | `INV-0002` / `INV-0100` | Manual |
| 6 | Logo file of 600 KB, or a non-image | Friendly error, no logo stored | — |

## Extras
- Chart: none.
- Scenario compare: no.
- Share: hidden (privacy). Print: yes, via Download PDF. Embed: **no**.

## Content notes
- Examples: case 1 (US web designer billing the rest of a project after a deposit), case 2 (UK consultant with a tax line), case 3 (Indian developer, invoice paid in full).
- FAQ (8): the 5 keyword-map questions + "Is my invoice saved or sent anywhere?" + "Can I add my logo?" + "What's the difference between an invoice and a tax invoice?" (carries the local-rules note). The answer to "Do I need to add tax to my invoice?" also carries the note and names no rates.
- Tips: number invoices in order, state the due date as a date, put the payment details on the invoice, invoice in the client's currency only when you can receive it cheaply (link to Payoneer vs Wise fees once live).
- Internal links: from the keyword map.
