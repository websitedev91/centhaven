# Tool spec: Upwork Fee Calculator

> **Approved by Puru, 2026-11-18** (USD only). **Revised 2026-11-18 for the new scope rule:** pure maths, fee range 0–50%, no /rates file, and no Upwork fee range stated anywhere.

| Field | Value |
|---|---|
| Slug | `upwork-fee-calculator` |
| Category | `fees` |
| Risk | 🟢 green: pure maths, the fee % comes from the user |
| Main keyword | `upwork fee calculator` (100–1K/month) |
| Long-tail keywords | `upwork service fee calculator`, `how much does upwork take`, `upwork fees for freelancers` |
| Affiliate | none |
| Related tools | from the keyword map: `hourly-rate-calculator`, `rate-increase-calculator`, `freelance-invoice-generator` |

## What it calculates
Upwork's freelancer service fee on a contract and what you take home. Or, in reverse, the amount you need to charge to take home a target. The user enters the fee % shown on their proposal or offer.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Mode | segmented | "I'm charging" | "I'm charging" / "I want to take home" | URL key `mode` |
| Amount (USD) | currency, USD only | 1,000 | 0 – 10,000,000 | Label follows the mode: "Contract amount" / "Amount you want to take home" |
| Your service fee % | % input | 10 | 0 – 50 | Label: "Your service fee % (shown on your proposal/offer)". Help: "Example only, use the % on your proposal." |

USD only: no currency selector. Amount help: "Enter the amount in US dollars."

## Outputs
| Output | How it's shown |
|---|---|
| **Take-home** (charging mode) / **Amount to charge** (take-home mode) | Main result |
| Service fee amount · fee % used | Breakdown |
| Fee vs take-home | `SplitBar` |

## Formula
```
p          = feePercent ÷ 100
charging:  fee = amount × p ;  takeHome = amount − fee
take-home: charge = target ÷ (1 − p) ;  fee = charge − target
```
p ≤ 0.5, so there's never a divide by zero.

## Rates used
None (pure maths).

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | take-home · target 20 · 10% | **charge 22.22** · fee 2.22 | Puru's required test |
| 2 | charging · 1,000 · 10% | **take-home 900.00** · fee 100.00 | Manual |
| 3 | charging · 2,000 · 15% | **take-home 1,700.00** · fee 300.00 | Manual |
| 4 | charging · 500 · 0% | **take-home 500.00** · fee 0.00 | Manual |
| 5 | take-home · $850 · 15% | **charge 1,000.00** · fee 150.00 | Manual |
| 6 | fee 51% or −1% | Inline error "Enter a fee between 0% and 50%", no crash | — |

## Extras
- Chart: none (the split bar is enough).
- Scenario compare: yes. Plan B = a different fee % (for example 10% vs 5%).
- Share / Print / Embed: yes.

## Content notes
- Examples (made-up fee %s, stated as such): US developer, $1,000 at 10%; Indian designer who wants $850 at 15%; $20/hour at 10% → $22.22.
- No Upwork fee, fee range, Connect price or withdrawal fee anywhere. FAQ answers point to the fee shown on the user's proposal.
- Tips: price from take-home, check each proposal, count proposal and withdrawal costs from your own account, link to hourly-rate, rate-increase and invoice tools.
