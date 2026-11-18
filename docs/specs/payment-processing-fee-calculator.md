# Tool spec: Payment Processing Fee Calculator

> **Approved by Puru, 2026-11-18** with: category `business`, ₹10 INR fixed-fee example, surcharge-legality FAQ dropped, keyword-map entry from Puru, and Puru's verified test cases (#1, #2, #5, #10, #11). Pure maths: every number comes from the user. Content may say "works for PayPal, Stripe, Square or any provider" but never states any company's rates.

| Field | Value |
|---|---|
| Slug | `payment-processing-fee-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths, the user enters both parts of the fee |
| Main keyword | `payment processing fee calculator` (volume not checked) |
| Long-tail keywords | `credit card processing fee calculator`, `transaction fee calculator`, `merchant fee calculator`, `how much to charge to cover fees` |
| Affiliate | none |
| Related tools | from the keyword map: `upwork-fee-calculator`, `freelance-invoice-generator`, `hourly-rate-calculator` |

## What it calculates
The fee on one card or online payment when the processor charges **a percentage plus a fixed amount**, and what you receive. Or, in reverse, the price to charge so you receive an exact amount ("pass the fee to the customer"). The user enters both parts of the fee from their own processor's pricing. No company or fee is named or suggested.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Mode | segmented | "Customer pays" | "Customer pays" / "I want to receive" | URL key `mode` |
| Currency | select | USD | standard list | Presets below |
| Amount | currency | 100 | 0 – 10,000,000 | Label follows the mode |
| Percentage fee | % input | 3 | 0 – 50 | Help: "Example only. Use the % from your processor's pricing." |
| Fixed fee per payment | currency | 0.30 | 0 – 1,000 | Help: "Example only. Enter 0 if there's no fixed fee." |
| Extra % (optional) | % input | 0 | 0 – 50 | Help: "For example an international-card or currency-conversion surcharge, if your processor charges one." |

Percentage + extra % must stay below 100% (combined error: "The fees add up to 100% or more").

### Currency presets (example inputs, not rates)
| Currency | Amount | Fixed fee |
|---|---|---|
| USD / CAD / AUD / GBP / EUR | 100 | 0.30 |
| INR | 10,000 | 10 |

Puru approved ₹10 for INR (labelled example).

## Outputs
| Output | How it's shown |
|---|---|
| **You receive** (customer pays) / **Price to charge** (I want to receive) | Main result |
| Total fee · percentage part · fixed part · effective rate (fee ÷ price) | Breakdown |
| Fee vs what you receive | `SplitBar` |
| Warning when the fee is more than the amount | Inline, no crash |

## Formula
```
p     = (percentage + extra %) ÷ 100
customer pays:   fee = amount × p + fixed ;  receive = amount − fee
want to receive: price = (target + fixed) ÷ (1 − p) ;  fee = price − target
effective rate = fee ÷ price
```
Display rounds to the cent, so the reverse result can pay out 1 cent under the target. Tip: "Round your price up by a cent if you need the exact amount."

## Rates used
None (pure maths).

## Test cases (must match exactly)
| # | Inputs | Expected output |
|---|---|---|
| 1 | customer pays · $100 · 3% + 0.30 | **receive 96.70** · fee 3.30 · effective rate 3.30% (Puru verified) |
| 2 | want to receive · $100 · 3% + 0.30 | **price 103.40** · fee 3.40 (103.4021 before rounding; Puru verified) |
| 3 | customer pays · $5 · 3% + 0.30 | **receive 4.55** · fee 0.45 · effective rate 9.00% (the fixed fee hurts small payments) |
| 4 | customer pays · $250 · 2.9% + 0.30 + extra 1.5% | **receive 238.70** · fee 11.30 |
| 5 | customer pays · ₹10,000 · 2% + ₹10 | **receive ₹9,790.00** · fee ₹210.00 (Puru verified) |
| 6 | customer pays · $0.20 · 3% + 0.30 | fee 0.31 · receive −0.11, with the warning "The fee is more than the payment" |
| 7 | percentage 60% | validation error "Maximum is 50%" |
| 8 | percentage 50% + extra 50% | validation error "The fees add up to 100% or more", no divide by zero |
| 9 | currency switch USD → INR, untouched | amount 10,000, fixed fee 10; typed values are kept |
| 10 | want to receive · ₹10,000 · 2% + ₹10 | **price ₹10,214.29** · fee ₹214.29 (Puru verified) |
| 11 | percentage 100% (or more) | validation error, no result |

## Extras
- Chart: none. Scenario compare: yes. Plan B = a different % and fixed fee (for comparing two processors from the user's own numbers).
- Share / Print / Embed: yes.

## Content notes
- Examples: a US online shop ($100 at 3% + 0.30), a small $5 sale showing the fixed-fee effect, an Indian freelancer invoicing ₹10,000. All fee numbers are labelled as examples, and no company is named.
- FAQ: the 5 keyword-map questions + "What counts as a fixed fee?" + "How do I compare two payment providers?" No legality question (dropped by Puru). "Should I charge clients for card fees?" stays practical: check your provider's rules, be transparent.

## Keyword map
Entry added to `docs/seo/keyword-map.md` from Puru's wording (2026-11-18).
