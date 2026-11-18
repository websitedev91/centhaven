# Tool spec: Runway Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `runway-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `runway calculator` (also targets `burn rate calculator`) |
| Long-tail keywords | `cash runway calculator`, `startup runway calculator`, `how long will my cash last` |
| Affiliate | `accounting-software` (disabled) |
| Related tools | from the keyword map: `break-even-calculator`, `emergency-fund-calculator`, `utilization-rate-calculator` |

## What it calculates
How many months your cash lasts: **cash ÷ monthly net burn**, where net burn = monthly costs − optional monthly revenue. Shows gross and net burn, the month cash runs out ("around {Month YYYY}", browser date), and with an optional target the spending cut needed to reach it.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Presets below |
| Cash in the bank | currency | 120,000 | 0 – 10,000,000,000 | |
| Monthly costs (gross burn) | currency | 25,000 | 0 – 10,000,000,000 | Help: "Everything you spend in a typical month." |
| Monthly revenue (optional) | currency | 10,000 | 0 – 10,000,000,000 | Leave at 0 for gross-burn runway |
| Target runway (optional) | number | 0 | 0 – 120 months | 0 = off |

### Currency presets (example values)
| Currency | Cash | Costs | Revenue |
|---|---|---|---|
| USD / GBP / EUR / CAD / AUD | 120,000 | 25,000 | 10,000 |
| INR | 50,00,000 | 8,00,000 | 3,00,000 |

## Outputs
**Runway in months** (1 decimal, plus "about X months and Y days") · gross burn · net burn · cash runs out around {Month YYYY} · runway on gross burn alone (when revenue > 0) · with target: max net burn and the cut per month needed.

## Formula
```
netBurn = costs − revenue
runway  = cash ÷ netBurn                  (netBurn > 0)
grossRunway = cash ÷ costs                (costs > 0)
target: maxBurn = cash ÷ target ; cutNeeded = max(0, netBurn − maxBurn)
days part = (runway − floor(runway)) × 30  (shown as "about")
```

## Test cases
| # | Inputs | Expected |
|---|---|---|
| 1 | cash $120,000 · costs $25,000 · revenue $10,000 | net burn $15,000.00 · **runway 8.0 months** · gross-burn runway 4.8 months |
| 2 | case 1 + target 12 months | max burn $10,000.00 · **cut $5,000.00 a month** |
| 3 | cash $50,000 · costs $10,000 · revenue 0 | **5.0 months** |
| 4 | cash $100,000 · costs $30,000 · revenue 0 | **3.3 months** ("about 3 months and 10 days") |
| 5 | ₹50,00,000 · costs ₹8,00,000 · revenue ₹3,00,000 | net burn ₹5,00,000.00 · **10.0 months** |

## Edge cases
- Revenue ≥ costs (net burn ≤ 0) → "You're not burning cash: revenue covers your costs." No runway number, no crash.
- Cash 0 → runway 0 months, "out of cash now".
- Costs 0 → no burn (same message as above).
- Negative inputs → field error. Target already met → "Your runway already meets the target."

## Extras
Chart: cash balance falling month by month to 0 (lazy Recharts, ≤ 60 points). Scenario compare: Plan B = different costs/revenue. Share / print / embed: yes.

## Content notes
Explain gross vs net burn simply. No statistics on "how many months startups need". Link to break-even and emergency fund tools.
