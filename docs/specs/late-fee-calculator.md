# Tool spec: Invoice Late Fee Calculator

> **Draft — waiting for Puru's review.** Pure maths on the fee the user agreed with their client. **Never mention legal or statutory late-payment rates** (Puru, 2026-11-18).

| Field | Value |
|---|---|
| Slug | `late-fee-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths (content must avoid legal topics) |
| Main keyword | `late fee calculator` |
| Long-tail keywords | `invoice late fee calculator`, `late payment fee calculator`, `how to charge a late fee on an invoice` |
| Affiliate | `invoicing-software` (disabled) |
| Related tools | from the keyword map: `freelance-invoice-generator`, `freelance-quote-generator`, `retainer-fee-calculator` |

## What it calculates
The late fee on an overdue invoice and the new total, from the fee the user agreed: a **flat fee**, a **one-off %**, or a **% per 30 days** charged by the day. Optional grace period.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Presets below |
| Invoice amount | currency | 2,000 | 0 – 100,000,000 | |
| Days late | number | 45 | 0 – 3,650 | Days after the due date |
| Fee type | segmented | % per 30 days | Flat fee / One-off % / % per 30 days | |
| Fee % | % input | 2 | 0 – 100 | One-off and per-30-days. Help: "Example only. Use the fee in your contract or invoice terms." |
| Flat fee | currency | 25 | 0 – 1,000,000 | Flat type |
| Grace period (optional) | number | 0 | 0 – 365 | Days before a fee applies |

### Currency presets (example values)
| Currency | Invoice | Flat fee |
|---|---|---|
| USD / CAD / AUD | 2,000 | 25 |
| GBP / EUR | 2,000 | 20 |
| INR | 50,000 | 500 |

## Outputs
**Late fee** · new total due · chargeable days (after grace) · fee per day (per-30-days type).

## Formula
```
chargeableDays = max(0, daysLate − grace)
flat:          fee = chargeableDays > 0 ? flatFee : 0
one-off %:     fee = chargeableDays > 0 ? amount × p : 0
% per 30 days: fee = amount × p × chargeableDays ÷ 30
total = amount + fee
```

## Test cases
| # | Inputs | Expected |
|---|---|---|
| 1 | $2,000 · 45 days · 2% per 30 days | **fee $60.00** · total $2,060.00 |
| 2 | $2,000 · 45 days · 2% per 30 days · grace 15 | 30 chargeable days → **fee $40.00** |
| 3 | $1,500 · 30 days · flat $25 | **fee $25.00** · total $1,525.00 |
| 4 | £1,200 · 10 days · one-off 5% | **fee £60.00** · total £1,260.00 |
| 5 | ₹50,000 · 60 days · 1.5% per 30 days | **fee ₹1,500.00** · total ₹51,500.00 |

## Edge cases
- Days late 0, or days ≤ grace → fee 0 with "No late fee yet".
- Negative amount, days, fee or grace → field error. Fee % > 100 → field error.
- Amount 0 → fee 0 for % types; flat fee still applies (shown as is).

## Content rules
- Say: "Use the late fee you agreed in your contract or invoice terms." Tips: state the fee on every invoice, send a reminder before charging, keep it simple.
- **Never** mention legal, statutory or government late-payment rates or interest, and no FAQ about whether a fee is allowed. (The keyword map's FAQ avoids that question.)
- Link to the invoice generator for adding the fee as a line.

## Extras
Scenario compare: no (one fee at a time). Share / print / embed: yes.
