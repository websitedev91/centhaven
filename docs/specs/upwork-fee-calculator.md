# Tool spec: Upwork Fee Calculator

> **Approved by Puru, 2026-11-18** (with change 1: USD only).

| Field | Value |
|---|---|
| Slug | `upwork-fee-calculator` |
| Category | `fees` |
| Risk | 🟡 yellow: company-published fee, checked every 3 months |
| Main keyword | `upwork fee calculator` (100–1K/month) |
| Long-tail keywords | `upwork service fee calculator`, `how much does upwork take`, `upwork fees for freelancers` |
| Affiliate | none |
| Related tools | from the keyword map: `upwork-connects-calculator`, `fiverr-fee-calculator`, `hourly-rate-calculator` |

## What it calculates
Upwork's freelancer service fee on a contract and what you take home. Or, in reverse, the amount you need to charge to take home a target. Upwork sets the fee per contract (0–15%), so the user enters the % shown on their proposal or offer.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Mode | segmented | "I'm charging" | "I'm charging" / "I want to take home" | URL key `mode` |
| Amount (USD) | currency, USD only | 1,000 | 0 – 10,000,000 | Label follows the mode: "Contract amount" / "Amount you want to take home" |
| Your service fee % | % input | 10 | 0 – 15 (min/max from `upwork-fees.json`) | Label: "Your service fee % (shown on your proposal/offer)". Help: "Example only. Upwork sets the fee per contract (0–15%). Use the % shown on your proposal." |

USD only: no currency selector. The page says "Upwork and Fiverr prices are in USD."

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
p ≤ 0.15, so there's never a divide by zero.

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| `rates/upwork-fees.json` | The 0–15% range (input limits + content). 10% is an example, not a rate | https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | take-home · target 20 · 10% | **charge 22.22** · fee 2.22 | Upwork's own example |
| 2 | charging · 1,000 · 10% | **take-home 900.00** · fee 100.00 | Manual |
| 3 | charging · 2,000 · 15% | **take-home 1,700.00** · fee 300.00 | Manual |
| 4 | charging · 500 · 0% | **take-home 500.00** · fee 0.00 | Manual |
| 5 | take-home · $850 · 15% | **charge 1,000.00** · fee 150.00 | Manual |
| 6 | fee 16% or −1% | Inline error "Upwork's fee is between 0% and 15%", no crash | — |

## Extras
- Chart: none (the split bar is enough).
- Scenario compare: yes. Plan B = a different fee % (for example 10% vs 5%).
- Share / Print / Embed: yes.

## Content notes
- Examples: US developer, $1,000 fixed-price job at 10%; Indian designer who wants $850 at 15%; Upwork's own $20 → $22.22.
- FAQ: the 5 keyword-map questions + "Why is my Upwork fee different from someone else's?" + "Does the client pay this fee or do I?" Answers say the fee is set per contract (0–15%) and point to the user's proposal. The only other Upwork cost given as a number is the Connect price (from `upwork-connects.json`). Withdrawal fees: "check Upwork's payment methods page" (no number, because there's no source).
- Tips: build the fee into your price from the start, use reverse mode to set an hourly rate, link to the Connects and hourly-rate tools.
