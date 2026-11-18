# Tool spec: Fiverr Fee Calculator

> **Draft — waiting for Puru's approval. Not publishable until the official Fiverr line is in (Puru, 2026-11-18).**

| Field | Value |
|---|---|
| Slug | `fiverr-fee-calculator` |
| Category | `fees` |
| Risk | 🟡 yellow (for now the user enters the fee %, so it's pure maths) |
| Main keyword | `fiverr fee calculator` (10–100/month) |
| Long-tail keywords | `fiverr seller fee calculator`, `fiverr earnings after fees`, `how much does fiverr take` |
| Affiliate | none |
| Related tools | from the keyword map: `upwork-fee-calculator`, `hourly-rate-calculator`, `payoneer-vs-wise-fees` (not live yet, left out for now) |

## What it calculates
Fiverr's seller fee on a gig price and what you earn. Or, in reverse, the gig price you need to earn a target. **No fee % is published on the page**: the user enters their own, with "Check your fee in Fiverr's official terms."

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Mode | segmented | "My gig price" | "My gig price" / "I want to earn" | |
| Currency | select | USD | standard list | |
| Amount | currency | 100 | 0 – 10,000,000 | |
| Fiverr's fee % | % input | **empty** | 0 – 99 | Help: "Check your fee in Fiverr's official terms." Until it's filled, the result says "Enter your fee % to see your earnings" |

### Currency defaults
| Currency | Amount |
|---|---|
| USD / CAD / AUD | 100 |
| GBP / EUR | 80 |
| INR | 8,000 |

## Formula
```
p = feePercent ÷ 100
gig price:   fee = price × p ;  earn = price − fee
want to earn: price = target ÷ (1 − p) ;  fee = price − target
```

## Rates used
None yet. When Puru supplies the official line: add `rates/fiverr-fees.json`, use its value as the default, list it in sources.md and update this spec.

## Test cases (the fee % is typed in by the test, not a rate)
| # | Inputs | Expected output |
|---|---|---|
| 1 | gig 100 · 20% | **earn 80.00** · fee 20.00 |
| 2 | want to earn 80 · 20% | **gig price 100.00** · fee 20.00 |
| 3 | gig ₹8,000 · 15% | **earn ₹6,800.00** · fee ₹1,200.00 |
| 4 | fee empty | no result, prompt shown, no crash |
| 5 | fee above 99% | inline error, no divide by zero |
| 6 | currency switch | an untouched amount follows the currency; a typed amount is kept |

## Content notes
- No Fiverr percentages or withdrawal fees in the content until they're sourced. FAQ answers explain where to find your fee and how the maths works.
- Status stays `draft` (not `ready`) until the source is in.
