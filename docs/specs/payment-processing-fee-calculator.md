# Tool spec: Payment Processing Fee Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user (scope rule, 2026-11-18). Not built yet.
> **No keyword-map entry yet.** CLAUDE.md says to stop and ask when a page has no map entry, so a proposed entry is at the end. Puru adds it to the map (or approves this one) before any build.

| Field | Value |
|---|---|
| Slug | `payment-processing-fee-calculator` (proposed) |
| Category | `fees` |
| Risk | 🟢 green: pure maths, the user enters both parts of the fee |
| Main keyword | `payment processing fee calculator` (proposed; volume not checked) |
| Long-tail keywords | `credit card processing fee calculator`, `card fee calculator`, `how to pass card fees to customers` (proposed) |
| Affiliate | none |
| Related tools | `upwork-fee-calculator`, `freelance-invoice-generator`, `hourly-rate-calculator` (proposed) |

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

**To confirm:** you set the default as 3% + 0.30. I kept 0.30 for every currency except INR, where 0.30 rupees would look odd (proposed ₹10). Untouched fields follow the currency, and typed values are kept (`switchCurrency` + `currencyVariant`).

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
| 1 | customer pays · $100 · 3% + 0.30 | **receive 96.70** · fee 3.30 · effective rate 3.30% |
| 2 | want to receive · $100 · 3% + 0.30 | **price 103.40** · fee 3.40 (103.4021 before rounding) |
| 3 | customer pays · $5 · 3% + 0.30 | **receive 4.55** · fee 0.45 · effective rate 9.00% (the fixed fee hurts small payments) |
| 4 | customer pays · $250 · 2.9% + 0.30 + extra 1.5% | **receive 238.70** · fee 11.30 |
| 5 | customer pays · ₹10,000 · 2% + ₹10 | **receive ₹9,790.00** · fee ₹210.00 |
| 6 | customer pays · $0.20 · 3% + 0.30 | fee 0.31 · receive −0.11, with the warning "The fee is more than the payment" |
| 7 | percentage 60% | validation error "Maximum is 50%" |
| 8 | percentage 50% + extra 50% | validation error "The fees add up to 100% or more", no divide by zero |
| 9 | currency switch USD → INR, untouched | amount 10,000, fixed fee 10; typed values are kept |

## Extras
- Chart: none. Scenario compare: yes. Plan B = a different % and fixed fee (for comparing two processors from the user's own numbers).
- Share / Print / Embed: yes.

## Content notes
- Examples: a US online shop ($100 at 3% + 0.30), a small $5 sale showing the fixed-fee effect, an Indian freelancer invoicing ₹10,000. All fee numbers are labelled as examples, and no company is named.
- FAQ ideas: "How are payment processing fees calculated?", "How do I pass card fees on to customers?", "Why do small payments cost more in fees?", "What is an effective rate?", "Is it legal to add a card surcharge?" **The last one is a legal question, so I propose to drop it** (scope rule).

## Proposed keyword-map entry (for Puru to approve or replace)
```
## /fees/payment-processing-fee-calculator
- Primary keyword: payment processing fee calculator (volume: to check)
- Secondary keywords: credit card processing fee calculator, card fee calculator, how to pass card fees to customers
- Title (51 chars): Payment Processing Fee Calculator – Fees and Payout
- Meta description (157 chars): Work out card and payment processing fees from your own rate: a percentage plus a fixed fee. See your payout, or the price to charge to receive a set amount.
- H1: Payment Processing Fee Calculator
- FAQ questions: How are payment processing fees calculated? · How do I pass card fees on to customers? · Why do small payments cost more in fees? · What is an effective processing rate? · Should I charge clients for card fees?
- Internal links to: /fees/upwork-fee-calculator, /freelance/freelance-invoice-generator, /freelance/hourly-rate-calculator
```
